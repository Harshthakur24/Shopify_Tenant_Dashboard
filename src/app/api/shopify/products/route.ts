import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/auth";
import { cacheGet, cacheSet } from "@/lib/redis";
import { ensureSyncCron } from "@/lib/cron";

export const dynamic = "force-dynamic";

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
  let accessToken: string | undefined = undefined;
  let usingFallback = true;
  let tenantId: string | undefined = undefined;

  // 1) Auth cookie → use that tenant
  if (payload?.tenantId) {
    const tenant = await prisma.tenant.findUnique({ where: { id: payload.tenantId } });
    if (tenant?.shopDomain && tenant?.accessToken) {
      shopDomain = tenant.shopDomain;
      accessToken = tenant.accessToken || undefined;
      usingFallback = false;
      tenantId = tenant.id;
    }
  }

  // 2) Query param overrides for dev/tests: ?tenantId= or ?shop=
  if (usingFallback && (queryTenantId || queryShop)) {
    const tenant = queryTenantId
      ? await prisma.tenant.findUnique({ where: { id: queryTenantId } })
      : await prisma.tenant.findUnique({ where: { shopDomain: String(queryShop) } });
    if (tenant?.shopDomain && tenant?.accessToken) {
      shopDomain = tenant.shopDomain;
      accessToken = tenant.accessToken || undefined;
      usingFallback = false;
      tenantId = tenant.id;
    }
  }

  // 3) Single-tenant convenience: if exactly one tenant has a token, use it
  if (usingFallback) {
    const tenantsWithToken = await prisma.tenant.findMany({ where: { accessToken: { not: null } } });
    if (tenantsWithToken.length === 1) {
      const t = tenantsWithToken[0];
      shopDomain = t.shopDomain;
      accessToken = t.accessToken || undefined;
      usingFallback = false;
      tenantId = t.id;
    }
  }

  // No env fallback: token must come from tenant configuration
  if (!accessToken) {
    return NextResponse.json({ error: "No Shopify access token configured for this tenant" }, { status: 400 });
  }

  try {
    const cacheKey = `products:${shopDomain}`;
    const cached = await cacheGet<{ products: unknown[] }>(cacheKey);

    // Helper: upsert minimal product data into Prisma
    async function upsertProducts(tenant: string, products: Array<{ id: number | string; title?: string; variants?: Array<{ price?: string | number }> }>) {
      if (!tenant) return;
      for (const p of products) {
        const price = Number(p?.variants?.[0]?.price ?? 0);
        await prisma.product.upsert({
          where: { tenantId_shopId: { tenantId: tenant, shopId: String(p.id) } },
          update: { title: p.title ?? "", price },
          create: { tenantId: tenant, shopId: String(p.id), title: p.title ?? "", price },
        });
      }
    }

    // If cached, return immediately and revalidate in background
    if (cached && !usingFallback) {
      (async () => {
        try {
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

    // No cache → fetch now, then cache and upsert
    const res = await fetch(`https://${shopDomain}/admin/api/2025-07/products.json`, {
      headers: { "X-Shopify-Access-Token": accessToken as string },
      cache: "no-store",
    });
    const json = await res.json();
    if (res.ok && !usingFallback) {
      await cacheSet(cacheKey, json, 300);
      if (tenantId && Array.isArray(json?.products)) {
        await upsertProducts(tenantId, json.products as Array<{ id: number | string; title?: string; variants?: Array<{ price?: string | number }> }>);
      }
    }
    return NextResponse.json({ ...json, __fallback: usingFallback }, { status: res.status });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}


