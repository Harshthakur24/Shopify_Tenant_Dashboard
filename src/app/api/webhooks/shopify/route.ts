import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyShopifyWebhookHmac } from "@/lib/shopify";

export async function POST(request: NextRequest) {
  const raw = await request.text();
  const hmac = request.headers.get("x-shopify-hmac-sha256") || undefined;
  const ok = verifyShopifyWebhookHmac(raw, hmac);
  if (!ok) return NextResponse.json({ error: "invalid hmac" }, { status: 401 });

  const shop = request.headers.get("x-shopify-shop-domain");
  const topic = request.headers.get("x-shopify-topic") || "unknown";
  if (!shop) return NextResponse.json({ error: "missing shop" }, { status: 400 });

  const tenant = await prisma.tenant.findUnique({ where: { shopDomain: shop } });
  if (!tenant) return NextResponse.json({ error: "tenant not found" }, { status: 404 });

  const payload = JSON.parse(raw);

  await prisma.event.create({
    data: { tenantId: tenant.id, topic, payload },
  });

  // Optional: map selected topics into core tables quickly
  if (topic.startsWith("orders/")) {
    const o = payload;
    await prisma.order.upsert({
      where: { tenantId_shopId: { tenantId: tenant.id, shopId: String(o.id) } },
      update: {
        totalAmount: Number(o.total_price ?? 0),
        currency: o.currency ?? "INR",
        processedAt: new Date(o.processed_at ?? o.created_at ?? Date.now()),
      },
      create: {
        tenantId: tenant.id,
        shopId: String(o.id),
        totalAmount: Number(o.total_price ?? 0),
        currency: o.currency ?? "INR",
        processedAt: new Date(o.processed_at ?? o.created_at ?? Date.now()),
      },
    });
  }

  if (topic.startsWith("customers/")) {
    const c = payload;
    await prisma.customer.upsert({
      where: { tenantId_shopId: { tenantId: tenant.id, shopId: String(c.id) } },
      update: {
        email: c.email ?? null,
        firstName: c.first_name ?? null,
        lastName: c.last_name ?? null,
      },
      create: {
        tenantId: tenant.id,
        shopId: String(c.id),
        email: c.email ?? null,
        firstName: c.first_name ?? null,
        lastName: c.last_name ?? null,
        totalSpend: Number(c.total_spent ?? 0),
      },
    });
  }

  if (topic.startsWith("products/")) {
    const p = payload;
    const price = Number(p.variants?.[0]?.price ?? 0);
    await prisma.product.upsert({
      where: { tenantId_shopId: { tenantId: tenant.id, shopId: String(p.id) } },
      update: { title: p.title, price },
      create: { tenantId: tenant.id, shopId: String(p.id), title: p.title, price },
    });
  }

  return NextResponse.json({ ok: true });
}


