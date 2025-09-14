import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/auth";
import { cacheDel } from "@/lib/redis";

export const dynamic = "force-dynamic";


async function cleanupOrphanedProducts(tenantId?: string, shopDomain?: string) {
  try {
    let shopDomainToUse = shopDomain || process.env.SHOPIFY_SHOP_DOMAIN || "xeno-assignment-store.myshopify.com";
    let accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

 
    if (tenantId) {
      const tenant = await prisma.tenant.findUnique({ 
        where: { id: tenantId },
        select: { shopDomain: true, accessToken: true }
      });
      if (tenant?.shopDomain && tenant?.accessToken) {
        shopDomainToUse = tenant.shopDomain;
        accessToken = tenant.accessToken;
      }
    }

    if (!accessToken) {
      throw new Error("No access token available");
    }

    // Fetch current products from Shopify
    const response = await fetch(`https://${shopDomainToUse}/admin/api/2025-07/products.json`, {
      headers: { "X-Shopify-Access-Token": accessToken },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.statusText}`);
    }

    const data = await response.json();
    const shopifyProductIds = new Set((data.products || []).map((p: { id: string | number }) => String(p.id)));

    // Find orphaned products in database
    const whereClause = tenantId ? { tenantId } : {};
    const dbProducts = await prisma.product.findMany({
      where: whereClause,
      select: { id: true, shopId: true, title: true, tenantId: true }
    });

    const orphanedProducts = dbProducts.filter(p => !shopifyProductIds.has(p.shopId));

    // Delete orphaned products
    if (orphanedProducts.length > 0) {
      const orphanedIds = orphanedProducts.map(p => p.id);
      
      await prisma.product.deleteMany({
        where: {
          id: { in: orphanedIds }
        }
      });

      console.log(`🧹 Cleaned up ${orphanedProducts.length} orphaned products`);
      
      // Clear cache
      await cacheDel(`products:${shopDomainToUse}`);
    }

    return {
      totalProductsInDB: dbProducts.length,
      totalProductsInShopify: shopifyProductIds.size,
      orphanedProductsDeleted: orphanedProducts.length,
      orphanedProducts: orphanedProducts.map(p => ({
        id: p.id,
        shopId: p.shopId,
        title: p.title
      }))
    };

  } catch (error) {
    console.error("Cleanup error:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = request.cookies.get("auth")?.value || "";
    const payload = auth ? await verifyJwt<{ tenantId: string }>(auth) : null;
    
    if (!payload?.tenantId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Perform cleanup
    const result = await cleanupOrphanedProducts(payload.tenantId);

    return NextResponse.json({
      success: true,
      message: `Cleanup completed successfully`,
      ...result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Cleanup API error:", error);
    return NextResponse.json({
      error: "Cleanup failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = request.cookies.get("auth")?.value || "";
    const payload = auth ? await verifyJwt<{ tenantId: string }>(auth) : null;
    
    if (!payload?.tenantId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const params = request.nextUrl.searchParams;
    const dryRun = params.get("dryRun") === "true";

    if (dryRun) {
      // Just check for orphaned products without deleting
      let shopDomainToUse = process.env.SHOPIFY_SHOP_DOMAIN || "xeno-assignment-store.myshopify.com";
      let accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

      // Get tenant info
      const tenant = await prisma.tenant.findUnique({ 
        where: { id: payload.tenantId },
        select: { shopDomain: true, accessToken: true }
      });
      if (tenant?.shopDomain && tenant?.accessToken) {
        shopDomainToUse = tenant.shopDomain;
        accessToken = tenant.accessToken;
      }

      if (!accessToken) {
        throw new Error("No access token available");
      }

      // Fetch current products from Shopify
      const response = await fetch(`https://${shopDomainToUse}/admin/api/2025-07/products.json`, {
        headers: { "X-Shopify-Access-Token": accessToken },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Shopify API error: ${response.statusText}`);
      }

      const data = await response.json();
      const shopifyProductIds = new Set((data.products || []).map((p: { id: string | number }) => String(p.id)));

      // Find orphaned products in database
      const dbProducts = await prisma.product.findMany({
        where: { tenantId: payload.tenantId },
        select: { id: true, shopId: true, title: true, tenantId: true }
      });

      const orphanedProducts = dbProducts.filter(p => !shopifyProductIds.has(p.shopId));

      return NextResponse.json({
        dryRun: true,
        totalProductsInDB: dbProducts.length,
        totalProductsInShopify: shopifyProductIds.size,
        orphanedProductsCount: orphanedProducts.length,
        orphanedProducts: orphanedProducts.map(p => ({
          id: p.id,
          shopId: p.shopId,
          title: p.title
        })),
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({
      message: "Cleanup API endpoint",
      endpoints: {
        "POST /api/shopify/cleanup": "Perform actual cleanup of orphaned products",
        "GET /api/shopify/cleanup?dryRun=true": "Check for orphaned products without deleting"
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Cleanup API error:", error);
    return NextResponse.json({
      error: "Cleanup check failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
