import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import { createShopifyClient } from "@/lib/shopify";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("auth")?.value || "";
  const claims = await verifyJwt(token);
  if (!claims) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tenantId = (claims as any).tenantId as string;
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant || !tenant.shopDomain || !tenant.accessToken) {
    return NextResponse.json({ error: "Tenant not configured" }, { status: 400 });
  }

  const shopify = createShopifyClient(tenant.shopDomain, tenant.accessToken, { apiKey: tenant.apiKey, apiSecret: tenant.apiSecret });

  try {
    const [products, customers, orders] = await Promise.all([
      shopify.getProducts(),
      shopify.getCustomers(),
      shopify.getOrders(),
    ]);

    // Upsert products
    for (const p of products) {
      const price = Number(p.variants?.[0]?.price ?? 0);
      await prisma.product.upsert({
        where: { tenantId_shopId: { tenantId, shopId: String(p.id) } },
        update: { title: p.title, price },
        create: { tenantId, shopId: String(p.id), title: p.title, price },
      });
    }

    // Upsert customers
    for (const c of customers) {
      await prisma.customer.upsert({
        where: { tenantId_shopId: { tenantId, shopId: String(c.id) } },
        update: {
          email: c.email ?? null,
          firstName: c.first_name ?? null,
          lastName: c.last_name ?? null,
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

    // Upsert orders
    for (const o of orders) {
      let customerRecordId: string | undefined = undefined;
      const shopCustomerId = o.customer?.id ? String(o.customer.id) : undefined;
      if (shopCustomerId) {
        const cust = await prisma.customer.findUnique({ where: { tenantId_shopId: { tenantId, shopId: shopCustomerId } }, select: { id: true } });
        if (cust) customerRecordId = cust.id;
      }
      await prisma.order.upsert({
        where: { tenantId_shopId: { tenantId, shopId: String(o.id) } },
        update: {
          totalAmount: Number(o.total_price ?? 0),
          currency: o.currency ?? "INR",
          processedAt: new Date(o.processed_at ?? o.created_at ?? Date.now()),
          customerId: customerRecordId,
        },
        create: {
          tenantId,
          shopId: String(o.id),
          totalAmount: Number(o.total_price ?? 0),
          currency: o.currency ?? "INR",
          processedAt: new Date(o.processed_at ?? o.created_at ?? Date.now()),
          customerId: customerRecordId,
        },
      });
    }

    await prisma.syncLog.create({
      data: { tenantId, type: "manual", status: "success" },
    });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    await prisma.syncLog.create({
      data: { tenantId, type: "manual", status: "error", message: String(error) },
    });
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}


