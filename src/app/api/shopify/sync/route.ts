import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import { cacheDel } from "@/lib/redis";


type ShopifyProduct = { id: number | string; title: string; variants?: Array<{ price?: string | number }> };
type ShopifyCustomer = { id: number | string; email?: string | null; first_name?: string | null; last_name?: string | null; total_spent?: string | number | null };
type ShopifyOrder = { id: number | string; total_price?: string | number | null; currency?: string | null; processed_at?: string | null; created_at?: string | null };

export const dynamic = "force-dynamic";

async function upsertProducts(tenantId: string, products: ShopifyProduct[]) {
  for (const p of products) {
    const price = Number(p?.variants?.[0]?.price ?? 0);
    await prisma.product.upsert({
      where: { tenantId_shopId: { tenantId, shopId: String(p.id) } },
      update: { title: p.title, price },
      create: { tenantId, shopId: String(p.id), title: p.title, price },
    });
  }
}

async function upsertCustomers(tenantId: string, customers: ShopifyCustomer[]) {
  for (const c of customers) {
    await prisma.customer.upsert({
      where: { tenantId_shopId: { tenantId, shopId: String(c.id) } },
      update: {
        email: c.email ?? null,
        firstName: c.first_name ?? null,
        lastName: c.last_name ?? null,
        totalSpend: Number(c.total_spent ?? 0),
      },
      create: {
        tenantId,
        shopId: String(c.id),
        email: c.email ?? null,
        firstName: c.first_name ?? null,
        lastName: c.last_name ?? null,
        totalSpend: Number(c.total_spent ?? 0),
      },
    });
  }
}

async function upsertOrders(tenantId: string, orders: ShopifyOrder[]) {
  for (const o of orders) {
    await prisma.order.upsert({
      where: { tenantId_shopId: { tenantId, shopId: String(o.id) } },
      update: {
        totalAmount: Number(o.total_price ?? 0),
        currency: o.currency ?? "INR",
        processedAt: new Date(o.processed_at ?? o.created_at ?? Date.now()),
      },
      create: {
        tenantId,
        shopId: String(o.id),
        totalAmount: Number(o.total_price ?? 0),
        currency: o.currency ?? "INR",
        processedAt: new Date(o.processed_at ?? o.created_at ?? Date.now()),
      },
    });
  }
}

async function fetchAllBySinceId<T extends { id: number | string }>(baseUrl: string, headers: Record<string, string>, resourcePath: string): Promise<T[]> {
  const results: T[] = [];
  let sinceId = 0;
  while (true) {
    const url = `${baseUrl}/${resourcePath}${resourcePath.includes("?") ? "&" : "?"}limit=250${sinceId ? `&since_id=${sinceId}` : ""}`;
    const res = await fetch(url, { headers, cache: "no-store" });
    if (!res.ok) break;
    const json = await res.json();
    const arr = (json.products || json.orders || json.customers || []) as T[];
    if (!arr.length) break;
    results.push(...arr);
    const last = arr[arr.length - 1];
    sinceId = Number(last?.id ?? 0);
    if (arr.length < 250) break;
  }
  return results;
}

export async function POST() {
  const cookieStore = await cookies();
  const auth = cookieStore.get("auth")?.value || "";
  const payload = await verifyJwt<{ tenantId: string }>(auth);
  if (!payload) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const tenant = await prisma.tenant.findUnique({ where: { id: payload.tenantId } });
  if (!tenant) return NextResponse.json({ error: "tenant not found" }, { status: 404 });

  const shop = tenant.shopDomain || process.env.SHOPIFY_SHOP_DOMAIN || "";
  const token = tenant.accessToken || process.env.SHOPIFY_ACCESS_TOKEN || "";
  if (!shop || !token) return NextResponse.json({ error: "missing shop or token" }, { status: 400 });

  const apiVersion = process.env.SHOPIFY_API_VERSION || "2025-07";
  const base = `https://${shop}/admin/api/${apiVersion}`;
  const headers: Record<string, string> = { "Content-Type": "application/json", "X-Shopify-Access-Token": token };

  const started = Date.now();
  try {
    // Fetch
    const [products, customers, orders] = await Promise.all([
      fetchAllBySinceId<ShopifyProduct>(base, headers, "products.json"),
      fetchAllBySinceId<ShopifyCustomer>(base, headers, "customers.json"),
      fetchAllBySinceId<ShopifyOrder>(base, headers, "orders.json?status=any"),
    ]);

    // Upsert
    await upsertProducts(tenant.id, products);
    await upsertCustomers(tenant.id, customers);
    await upsertOrders(tenant.id, orders);

    await prisma.syncLog.create({
      data: {
        tenantId: tenant.id,
        type: "manual_sync",
        status: "success",
        message: `P:${products.length} C:${customers.length} O:${orders.length} in ${Math.round((Date.now() - started) / 1000)}s`,
      },
    });

    // Invalidate cached products for this tenant
    await cacheDel(`products:${shop}`);

    return NextResponse.json({ ok: true, products: products.length, customers: customers.length, orders: orders.length });
  } catch (e: unknown) {
    await prisma.syncLog.create({ data: { tenantId: tenant.id, type: "manual_sync", status: "error", message: String(e) } });
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}


