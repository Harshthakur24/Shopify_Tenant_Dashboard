import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/auth";
import { ensureSyncCron } from "@/lib/cron";

export const dynamic = "force-dynamic";

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
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      // If max attempts reached for P1001, throw a more specific error
      if (code === "P1001") {
        throw new Error(`Database unreachable after ${maxAttempts} attempts`);
      }
      throw err;
    }
  }
}

export async function GET(request: NextRequest) {
  ensureSyncCron();

  const auth = request.cookies.get("auth")?.value || "";
  const payload = auth ? await verifyJwt<{ tenantId: string }>(auth) : null;
  const params = request.nextUrl.searchParams;
  const queryTenantId = params.get("tenantId") || undefined;
  const queryShop = params.get("shop") || undefined;

  let shopDomain = process.env.SHOPIFY_SHOP_DOMAIN || "xeno-assignjjment-store.myshopify.com";
  let accessToken: string | undefined = process.env.SHOPIFY_ACCESS_TOKEN || undefined;
  let tenantId: string | undefined = undefined;

  // Resolve tenant from DB if provided (with fallback to env vars)
  if (payload?.tenantId || queryTenantId || queryShop) {
    try {
      const tenant = queryTenantId
        ? await withDbRetry(() => prisma.tenant.findUnique({ where: { id: queryTenantId } }))
        : queryShop
        ? await withDbRetry(() => prisma.tenant.findUnique({ where: { shopDomain: String(queryShop) } }))
        : await withDbRetry(() => prisma.tenant.findUnique({ where: { id: payload!.tenantId } }));

      if (tenant?.shopDomain && tenant?.accessToken) {
        shopDomain = tenant.shopDomain;
        accessToken = tenant.accessToken;
        tenantId = tenant.id;
      }
    } catch (error) {
      console.error("Failed to resolve tenant from DB, using environment fallback:", error);
      // Continue with environment variables as fallback
    }
  }

  if (!accessToken) {
    return NextResponse.json({ error: "No access token available" }, { status: 401 });
  }

  try {
    // Fetch directly from Shopify API
    const res = await fetch(`https://${shopDomain}/admin/api/2025-07/products.json`, {
      headers: { "X-Shopify-Access-Token": accessToken },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Shopify API error: ${res.statusText}` }, { status: res.status });
    }

    const fresh = await res.json();

    // Upsert products into DB (only if database is available)
    if (tenantId && Array.isArray(fresh?.products)) {
      // Try to store in database, but don't fail if DB is unavailable
      try {
        for (const p of fresh.products) {
          try {
            await withDbRetry(() =>
              prisma.product.upsert({
                where: { tenantId_shopId: { tenantId, shopId: String(p.id) } },
                update: {
                  title: p.title,
                  bodyHtml: p.body_html,
                  vendor: p.vendor,
                  productType: p.product_type,
                  status: p.status,
                  tags: p.tags,
                  publishedAt: p.published_at ? new Date(p.published_at) : null,
                  templateSuffix: p.template_suffix,
                  publishedScope: p.published_scope,
                  adminGraphqlApiId: p.admin_graphql_api_id,
                  imageUrl: p.image?.src ?? null,
                  imageAlt: p.image?.alt ?? null,
                  imageId: p.image?.id ? String(p.image.id) : null,
                  imageWidth: p.image?.width ?? null,
                  imageHeight: p.image?.height ?? null,
                  imagesData: p.images ?? [],
                  variantsData: p.variants ?? [],
                  optionsData: p.options ?? [],
                  shopCreatedAt: p.created_at ? new Date(p.created_at) : null,
                  shopUpdatedAt: p.updated_at ? new Date(p.updated_at) : null,
                  price: Number(p?.variants?.[0]?.price ?? 0),
                },
                create: {
                  tenantId,
                  shopId: String(p.id),
                  title: p.title,
                  bodyHtml: p.body_html,
                  vendor: p.vendor,
                  productType: p.product_type,
                  status: p.status,
                  tags: p.tags,
                  publishedAt: p.published_at ? new Date(p.published_at) : null,
                  templateSuffix: p.template_suffix,
                  publishedScope: p.published_scope,
                  adminGraphqlApiId: p.admin_graphql_api_id,
                  imageUrl: p.image?.src ?? null,
                  imageAlt: p.image?.alt ?? null,
                  imageId: p.image?.id ? String(p.image.id) : null,
                  imageWidth: p.image?.width ?? null,
                  imageHeight: p.image?.height ?? null,
                  imagesData: p.images ?? [],
                  variantsData: p.variants ?? [],
                  optionsData: p.options ?? [],
                  shopCreatedAt: p.created_at ? new Date(p.created_at) : null,
                  shopUpdatedAt: p.updated_at ? new Date(p.updated_at) : null,
                  price: Number(p?.variants?.[0]?.price ?? 0),
                },
              })
            );
          } catch (error) {
            console.error(`Failed to upsert product ${p.id}:`, error);
          }
        }
        console.log(`✅ Stored ${fresh.products.length} products in database`);
      } catch (dbError) {
        console.error("Database unavailable, skipping product storage:", dbError);
        // Continue without storing in database
      }
    }

    // ✅ Return exact Shopify payload to frontend
    return NextResponse.json({ ...fresh, __cached: false, __stale: false, __fallback: false }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}