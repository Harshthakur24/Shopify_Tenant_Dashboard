import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createShopifyClient } from "@/lib/shopify";

export const dynamic = "force-dynamic";

export async function GET() {
  const tenants = await prisma.tenant.findMany({ where: { accessToken: { not: null } } });
  for (const t of tenants) {
    if (!t.shopDomain || !t.accessToken) continue;
    const shopify = createShopifyClient(t.shopDomain, t.accessToken, { apiKey: t.apiKey, apiSecret: t.apiSecret });
    try {
      const [products, customers, orders] = await Promise.all([
        shopify.getProducts(),
        shopify.getCustomers(),
        shopify.getOrders(),
      ]);
      for (const p of products) {
        const price = Number(p.variants?.[0]?.price ?? 0);
        await prisma.product.upsert({
          where: { tenantId_shopId: { tenantId: t.id, shopId: String(p.id) } },
          update: { title: p.title, price },
          create: { tenantId: t.id, shopId: String(p.id), title: p.title, price },
        });
      }
      for (const c of customers) {
        await prisma.customer.upsert({
          where: { tenantId_shopId: { tenantId: t.id, shopId: String(c.id) } },
          update: {
            email: c.email ?? null,
            firstName: c.first_name ?? null,
            lastName: c.last_name ?? null,
          },
          create: {
            tenantId: t.id,
            shopId: String(c.id),
            email: c.email ?? null,
            firstName: c.first_name ?? null,
            lastName: c.last_name ?? null,
            totalSpend: Number(c.total_spent ?? 0),
          },
        });
      }
      for (const o of orders) {
        let customerRecordId: string | undefined = undefined;
        const shopCustomerId = o.customer?.id ? String(o.customer.id) : undefined;
        if (shopCustomerId) {
          const cust = await prisma.customer.findUnique({ where: { tenantId_shopId: { tenantId: t.id, shopId: shopCustomerId } }, select: { id: true } });
          if (cust) customerRecordId = cust.id;
        }
        await prisma.order.upsert({
          where: { tenantId_shopId: { tenantId: t.id, shopId: String(o.id) } },
          update: {
            totalAmount: Number(o.total_price ?? 0),
            currency: o.currency ?? "INR",
            processedAt: new Date(o.processed_at ?? o.created_at ?? Date.now()),
            customerId: customerRecordId,
          },
          create: {
            tenantId: t.id,
            shopId: String(o.id),
            totalAmount: Number(o.total_price ?? 0),
            currency: o.currency ?? "INR",
            processedAt: new Date(o.processed_at ?? o.created_at ?? Date.now()),
            customerId: customerRecordId,
          },
        });
      }
      await prisma.syncLog.create({ data: { tenantId: t.id, type: "cron", status: "success" } });
    } catch (e: unknown) {
      await prisma.syncLog.create({ data: { tenantId: t.id, type: "cron", status: "error", message: String(e) } });
    }
  }
  return NextResponse.json({ ok: true, tenants: tenants.length });
}


