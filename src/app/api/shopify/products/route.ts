import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/auth";
import { cacheGet, cacheSet } from "@/lib/redis";
import { ensureSyncCron } from "@/lib/cron";

export const dynamic = "force-dynamic";

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withDbRetry<T>(operation: () => Promise<T>, maxAttempts = 3, baseDelayMs = 500): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await operation();
    } catch (err) {
      const code = (err as { code?: string }).code;
      attempt += 1;
      if (code === "P1001" && attempt < maxAttempts) {
        const delay = baseDelayMs * attempt;
        console.error(`DB unreachable (P1001). Retry ${attempt}/${maxAttempts - 1} in ${delay}ms`);
        await sleep(delay);
        continue;
      }
      throw err;
    }
  }
}

export async function GET(request: NextRequest) {
  // Start background periodic sync (best effort) on first use
  ensureSyncCron();
  // Resolve tenant from auth cookie
  const auth = request.cookies.get("auth")?.value || "";
  const payload = auth ? await verifyJwt<{ tenantId: string }>(auth) : null;
  const params = request.nextUrl.searchParams;
  const queryTenantId = params.get("tenantId") || undefined;
  const queryShop = params.get("shop") || undefined;

  let shopDomain = process.env.SHOPIFY_SHOP_DOMAIN || "xeno-assignment-store.myshopify.com";
  let accessToken: string | undefined = process.env.SHOPIFY_ACCESS_TOKEN || undefined;
  let usingFallback = true;
  let tenantId: string | undefined = undefined;

  // 1) Auth cookie → use that tenant
  if (payload?.tenantId) {
    try {
      const tenant = await withDbRetry(() => 
        prisma.tenant.findUnique({ where: { id: payload.tenantId } })
      );
      if (tenant?.shopDomain && tenant?.accessToken) {
        shopDomain = tenant.shopDomain;
        accessToken = tenant.accessToken || undefined;
        usingFallback = false;
        tenantId = tenant.id;
      }
    } catch (error) {
      console.error('Failed to fetch tenant from auth:', error);
      // Continue with fallback
    }
  }

  // 2) Query param overrides for dev/tests: ?tenantId= or ?shop=
  if (usingFallback && (queryTenantId || queryShop)) {
    try {
      const tenant = queryTenantId
        ? await withDbRetry(() => prisma.tenant.findUnique({ where: { id: queryTenantId } }))
        : await withDbRetry(() => prisma.tenant.findUnique({ where: { shopDomain: String(queryShop) } }));
      if (tenant?.shopDomain && tenant?.accessToken) {
        shopDomain = tenant.shopDomain;
        accessToken = tenant.accessToken || undefined;
        usingFallback = false;
        tenantId = tenant.id;
      }
    } catch (error) {
      console.error('Failed to fetch tenant from query params:', error);
      // Continue with fallback
    }
  }

  // 3) Single-tenant convenience: if exactly one tenant has a token, use it
  if (usingFallback) {
    try {
      const tenantsWithToken = await withDbRetry(() => 
        prisma.tenant.findMany({ where: { accessToken: { not: null } } })
      );
      if (tenantsWithToken.length === 1) {
        const t = tenantsWithToken[0];
        shopDomain = t.shopDomain;
        accessToken = t.accessToken || undefined;
        usingFallback = false;
        tenantId = t.id;
      }
    } catch (error) {
      console.error('Failed to fetch tenants with tokens:', error);
      // Continue with fallback
    }
  }

  try {
    const cacheKey = `products:${shopDomain}`;
    const cached = await cacheGet<{ products: unknown[] }>(cacheKey);

    // Helper: upsert minimal product data into Prisma
    async function upsertProducts(tenant: string, products: Array<{ id: number | string; title?: string; variants?: Array<{ price?: string | number }> }>) {
      if (!tenant) return;
      for (const p of products) {
        const price = Number(p?.variants?.[0]?.price ?? 0);
        try {
          await withDbRetry(() => prisma.product.upsert({
            where: { tenantId_shopId: { tenantId: tenant, shopId: String(p.id) } },
            update: { title: p.title ?? "", price },
            create: { tenantId: tenant, shopId: String(p.id), title: p.title ?? "", price },
          }));
        } catch (error) {
          console.error(`Failed to upsert product ${p.id}:`, error);
          // Continue with next product
        }
      }
    }

    // Helper: build a minimal Shopify-like payload from DB to serve quickly on cache miss
    async function buildDbPayload(tenant: string | undefined) {
      if (!tenant) return { products: [] as Array<unknown> };
      let db;
      try {
        db = await withDbRetry(() => prisma.product.findMany({
          where: { tenantId: tenant },
          select: { shopId: true, title: true, price: true, createdAt: true, updatedAt: true },
          take: 1000,
        }));
      } catch (error) {
        console.error('Failed to fetch products from DB:', error);
        return { products: [] as Array<unknown> };
      }

      const products = db.map((p: Record<string, unknown>) => ({
        id: p.shopId,
        title: p.title,
        // Minimal shape used by the dashboard
        variants: [{ price: (p.price as number).toString() }],
        status: "active",
        vendor: "Unknown",
        product_type: "General",
        handle: ((p.title as string) || "").toLowerCase().replace(/\s+/g, "-"),
        body_html: "",
        image: null,
        images: [],
        options: [],
        created_at: (p.createdAt as Date).toISOString(),
      }));

      return { products };
    }

    // If cached, return immediately and revalidate in background
    if (cached && !usingFallback) {
      (async () => {
        try {
          if (!accessToken) return; // cannot revalidate without token
          const res = await fetch(`https://${shopDomain}/admin/api/2025-07/products.json`, {
            headers: { "X-Shopify-Access-Token": accessToken as string },
            cache: "no-store",
          });
          if (!res.ok) return;
          const fresh = await res.json();
          await cacheSet(cacheKey, fresh, 300);
          if (tenantId && Array.isArray(fresh?.products)) {
            await upsertProducts(tenantId, fresh.products as Array<{ id: number | string; title?: string; variants?: Array<{ price?: string | number }> }>);
          }
        } catch {
          // ignore background errors
        }
      })();
      return NextResponse.json({ ...cached, __cached: true, __stale: true, __fallback: false }, { status: 200 });
    }

    // No cache → return fast from DB if available, and refresh in background
    const dbPayload = await buildDbPayload(tenantId);

    // Kick off background refresh to Shopify if we have a token
    (async () => {
      try {
        if (!accessToken) return;
        const res = await fetch(`https://${shopDomain}/admin/api/2025-07/products.json`, {
          headers: { "X-Shopify-Access-Token": accessToken as string },
          cache: "no-store",
        });
        if (!res.ok) return;
        const fresh = await res.json();
        await cacheSet(cacheKey, fresh, 300);
        if (tenantId && Array.isArray(fresh?.products)) {
          await upsertProducts(tenantId, fresh.products as Array<{ id: number | string; title?: string; variants?: Array<{ price?: string | number }> }>);
        }
      } catch {
        // ignore background errors
      }
    })();

    const status = dbPayload.products.length ? 200 : 200;
    return NextResponse.json({ ...dbPayload, __cached: false, __stale: true, __fallback: usingFallback, __source: "db" }, { status });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}


