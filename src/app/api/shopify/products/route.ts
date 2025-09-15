import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/auth";
import { ensureSyncCron } from "@/lib/cron";
import { cacheGet, cacheSet, tryLock, unlock } from "@/lib/redis";

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
  const payload = auth ? await verifyJwt(auth) : null;
  const params = request.nextUrl.searchParams;
  const queryTenantId = params.get("tenantId") || undefined;
  const queryShop = params.get("shop") || undefined;
  const startDate = params.get("startDate") || undefined;
  const endDate = params.get("endDate") || undefined;

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

  const dateFilter = startDate || endDate ? `:${startDate || 'all'}:${endDate || 'all'}` : '';
  // Include userId and email in cache key to ensure user isolation
  const userKey = payload?.userId && payload?.email ? `:user:${payload.userId}:email:${payload.email}` : '';
  const cacheKey = `products:${shopDomain}${userKey}${dateFilter}`;
  const lockKey = `lock:${cacheKey}`;

  try {
    // Check cache first
    const cached = await cacheGet<{ products: Record<string, unknown>[] }>(cacheKey);
    
    if (cached) {
      console.log(`✅ Returning cached products for ${shopDomain} (user: ${payload?.email || 'unknown'})`);
      
      // Start background refresh (non-blocking)
      (async () => {
        const lockAcquired = await tryLock(lockKey, 30); // 30 second lock
        if (lockAcquired) {
          try {
            console.log(`🔄 Background refresh: fetching fresh data for ${shopDomain}`);
            const apiUrl = new URL(`https://${shopDomain}/admin/api/2025-07/products.json`);
            if (startDate) apiUrl.searchParams.set('created_at_min', startDate);
            if (endDate) apiUrl.searchParams.set('created_at_max', endDate);
            
            const res = await fetch(apiUrl.toString(), {
              headers: { "X-Shopify-Access-Token": accessToken },
              cache: "no-store",
            });

            if (res.ok) {
              const fresh = await res.json();
              await cacheSet(cacheKey, fresh, 300); // 5 minutes
              console.log(`💾 Background refresh: updated cache for ${shopDomain}`);
              
              // Store in database in background
              if (tenantId && Array.isArray(fresh?.products)) {
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
                      console.error(`Background refresh: Failed to upsert product ${p.id}:`, error);
                    }
                  }
                  console.log(`✅ Background refresh: stored ${fresh.products.length} products in database`);
                } catch (dbError) {
                  console.error("Background refresh: Database unavailable:", dbError);
                }
              }
            }
      } catch (error) {
            console.error(`Background refresh failed for ${shopDomain}:`, error);
          } finally {
            await unlock(lockKey);
          }
        }
      })().catch(console.error);
      
      return NextResponse.json({
        ...cached,
        __cached: true,
        __stale: false,
        __fallback: false,
        __source: "redis-cache",
        __shopDomain: shopDomain,
        __userId: payload?.userId || 'unknown',
        __email: payload?.email || 'unknown',
        __timestamp: new Date().toISOString(),
        __dataSource: "Redis Cache (Background refresh in progress)"
      }, { status: 200 });
    }

    // Cache miss - fetch from Shopify API immediately
    console.log(`🔄 Cache miss - fetching fresh data from Shopify for ${shopDomain} (user: ${payload?.email || 'unknown'})`);
    const apiUrl = new URL(`https://${shopDomain}/admin/api/2025-07/products.json`);
    if (startDate) apiUrl.searchParams.set('created_at_min', startDate);
    if (endDate) apiUrl.searchParams.set('created_at_max', endDate);
    
    const res = await fetch(apiUrl.toString(), {
      headers: { "X-Shopify-Access-Token": accessToken },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Shopify API error: ${res.statusText}` }, { status: res.status });
    }

          const fresh = await res.json();
    
    // Cache the fresh data for 5 minutes (300 seconds)
          await cacheSet(cacheKey, fresh, 300);
    console.log(`💾 Cached fresh products data for ${shopDomain} (user: ${payload?.email || 'unknown'})`);

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

    // ✅ Return exact Shopify payload to frontend with source info
    return NextResponse.json({ 
      ...fresh, 
      __cached: false, 
      __stale: false, 
      __fallback: false,
      __source: "shopify",
      __shopDomain: shopDomain,
      __userId: payload?.userId || 'unknown',
      __email: payload?.email || 'unknown',
      __timestamp: new Date().toISOString(),
      __databaseStored: tenantId ? "attempted" : "skipped",
      __dataSource: "Live Shopify API (Fresh)"
    }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    
    // Try database fallback if available
    if (tenantId) {
      try {
        console.log("🔄 Attempting database fallback...");
        
        // Build date filter for database query
        const dateFilter: { gte?: Date; lte?: Date } = {};
        if (startDate) {
          dateFilter.gte = new Date(startDate);
        }
        if (endDate) {
          dateFilter.lte = new Date(endDate);
        }
        
        const dbProducts = await withDbRetry(() => 
          prisma.product.findMany({
            where: { 
              tenantId,
              ...(Object.keys(dateFilter).length > 0 && { shopCreatedAt: dateFilter })
            },
            select: {
              shopId: true,
              title: true,
              price: true,
              bodyHtml: true,
              vendor: true,
              productType: true,
              status: true,
              tags: true,
              publishedAt: true,
              templateSuffix: true,
              publishedScope: true,
              adminGraphqlApiId: true,
              imageUrl: true,
              imageAlt: true,
              imageId: true,
              imageWidth: true,
              imageHeight: true,
              imagesData: true,
              variantsData: true,
              optionsData: true,
              createdAt: true,
              updatedAt: true,
              shopCreatedAt: true,
              shopUpdatedAt: true,
            },
            take: 1000,
            orderBy: { updatedAt: 'desc' },
          })
        );

        // Convert to Shopify format
        const products = dbProducts.map((p: Record<string, unknown>) => ({
          id: Number(p.shopId),
          title: p.title || "Unknown Product",
          handle: String(p.title || "").toLowerCase().replace(/\s+/g, "-") || "unknown-product",
          body_html: p.bodyHtml || "",
          vendor: p.vendor || "Unknown",
          product_type: p.productType || "",
          status: p.status || "active",
          tags: p.tags || "",
          published_at: p.publishedAt ? (p.publishedAt as Date).toISOString() : null,
          published_scope: p.publishedScope || "global",
          template_suffix: p.templateSuffix || "",
          admin_graphql_api_id: p.adminGraphqlApiId || "",
          variants: Array.isArray(p.variantsData) ? p.variantsData : [{
            id: 0,
            product_id: Number(p.shopId),
            title: "Default Title",
            price: String(p.price),
            position: 1,
            option1: "Default Title"
          }],
          options: Array.isArray(p.optionsData) ? p.optionsData : [],
          images: Array.isArray(p.imagesData) ? p.imagesData : [],
          image: p.imageUrl ? {
            id: p.imageId ? Number(p.imageId) : 0,
            alt: p.imageAlt,
            position: 1,
            product_id: Number(p.shopId),
            src: p.imageUrl,
            width: p.imageWidth || undefined,
            height: p.imageHeight || undefined,
            variant_ids: []
          } : null,
          created_at: ((p.shopCreatedAt || p.createdAt) as Date).toISOString(),
          updated_at: ((p.shopUpdatedAt || p.updatedAt) as Date).toISOString(),
        }));

        console.log(`✅ Database fallback: fetched ${products.length} products`);
        
        return NextResponse.json({ 
          products,
          __cached: false, 
          __stale: true, 
          __fallback: true,
          __source: "database",
          __shopDomain: shopDomain,
          __timestamp: new Date().toISOString(),
          __databaseStored: "retrieved",
          __dataSource: "Database Fallback (Cache & Shopify failed)"
        }, { status: 200 });

      } catch (dbError) {
        console.error("Database fallback also failed:", dbError);
      }
    }
    
    return NextResponse.json({ 
      error: String(error),
      products: [],
      __cached: false, 
      __stale: true, 
      __fallback: true,
      __source: "none",
      __shopDomain: shopDomain,
      __timestamp: new Date().toISOString(),
      __dataSource: "No Data Available (All sources failed)"
    }, { status: 500 });
  }
}