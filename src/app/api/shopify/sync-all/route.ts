import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cacheDel, tryLock, unlock } from "@/lib/redis";

type ShopifyProduct = { id: number | string; title: string; variants?: Array<{ price?: string | number }> };
type ShopifyCustomer = { id: number | string; email?: string | null; first_name?: string | null; last_name?: string | null; total_spent?: string | number | null };
type ShopifyOrder = { id: number | string; total_price?: string | number | null; currency?: string | null; processed_at?: string | null; created_at?: string | null };

export const dynamic = "force-dynamic";

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getTenantsWithRetry(maxAttempts = 4, baseDelayMs = 800) {
  let attempt = 0;
  while (true) {
    try {
      return await prisma.tenant.findMany({});
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

export async function POST(request: NextRequest) {
  // Optional simple auth for cron
  const apiKey = request.headers.get("x-cron-key");
  if (process.env.CRON_SECRET && apiKey !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const lockKey = "sync_all_lock";
  const locked = await tryLock(lockKey, 60 * 10); // 10 minutes lock
  if (!locked) return NextResponse.json({ error: "already running" }, { status: 429 });

  // Ensure DB configuration exists
  if (!process.env.DATABASE_URL) {
    await unlock(lockKey);
    return NextResponse.json({ error: "database not configured" }, { status: 500 });
  }

  let tenants;
  try {
    tenants = await getTenantsWithRetry(4, 800);
  } catch (err) {
    const code = (err as { code?: string }).code;
    const msg = String(err);
    if (code === "P1001") {
      await unlock(lockKey);
      return NextResponse.json({ error: "database unreachable", code }, { status: 503, headers: { "Retry-After": "30" } });
    }
    await unlock(lockKey);
    return NextResponse.json({ error: "failed to load tenants", details: msg }, { status: 500 });
  }

  const results: Array<{ tenantId: string; ok: boolean; msg: string }> = [];

  try {
    const apiVersion = process.env.SHOPIFY_API_VERSION || "2025-07";
    for (const t of tenants) {
      if (!t.shopDomain || !t.accessToken) {
        results.push({ tenantId: t.id, ok: false, msg: "missing creds" });
        continue;
      }
      const base = `https://${t.shopDomain}/admin/api/${apiVersion}`;
      const headers: Record<string, string> = { "Content-Type": "application/json", "X-Shopify-Access-Token": t.accessToken };
      try {
        const [products, customers, orders] = await Promise.all([
          fetchAllBySinceId<ShopifyProduct>(base, headers, "products.json"),
          fetchAllBySinceId<ShopifyCustomer>(base, headers, "customers.json"),
          fetchAllBySinceId<ShopifyOrder>(base, headers, "orders.json?status=any"),
        ]);

        // Upsert
        for (const p of products) {
          const price = Number(p?.variants?.[0]?.price ?? 0);
          await prisma.product.upsert({
            where: { tenantId_shopId: { tenantId: t.id, shopId: String(p.id) } },
            update: { title: p.title, price },
            create: { tenantId: t.id, shopId: String(p.id), title: p.title, price },
          });
        }
        for (const c of customers) {
          await prisma.customer.upsert({
            where: { tenantId_shopId: { tenantId: t.id, shopId: String(c.id) } },
            update: { email: c.email ?? null, firstName: c.first_name ?? null, lastName: c.last_name ?? null, totalSpend: Number(c.total_spent ?? 0) },
            create: { tenantId: t.id, shopId: String(c.id), email: c.email ?? null, firstName: c.first_name ?? null, lastName: c.last_name ?? null, totalSpend: Number(c.total_spent ?? 0) },
          });
        }
        for (const o of orders) {
          await prisma.order.upsert({
            where: { tenantId_shopId: { tenantId: t.id, shopId: String(o.id) } },
            update: { totalAmount: Number(o.total_price ?? 0), currency: o.currency ?? "INR", processedAt: new Date(o.processed_at ?? o.created_at ?? Date.now()) },
            create: { tenantId: t.id, shopId: String(o.id), totalAmount: Number(o.total_price ?? 0), currency: o.currency ?? "INR", processedAt: new Date(o.processed_at ?? o.created_at ?? Date.now()) },
          });
        }

        await prisma.syncLog.create({ data: { tenantId: t.id, type: "cron_sync", status: "success", message: `P:${products.length} C:${customers.length} O:${orders.length}` } });
        await cacheDel(`products:${t.shopDomain}`);
        results.push({ tenantId: t.id, ok: true, msg: "ok" });
        // small delay to reduce rate-limit pressure across tenants
        await new Promise((r) => setTimeout(r, Number(process.env.SYNC_ALL_TENANT_PAUSE_MS || 300)));
      } catch (e: unknown) {
        await prisma.syncLog.create({ data: { tenantId: t.id, type: "cron_sync", status: "error", message: String(e) } });
        results.push({ tenantId: t.id, ok: false, msg: String(e) });
      }
    }
  } finally {
    await unlock(lockKey);
  }

  return NextResponse.json({ ok: true, results });
}


