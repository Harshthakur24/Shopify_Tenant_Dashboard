import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = process.env.SHOPIFY_ACCESS_TOKEN;
  if (!token) return NextResponse.json({ error: "SHOPIFY_ACCESS_TOKEN missing" }, { status: 500 });

  try {
    const res = await fetch(
      "https://xeno-assignment-store.myshopify.com/admin/api/2025-07/products.json",
      {
        headers: { "X-Shopify-Access-Token": token },
        cache: "no-store",
      }
    );
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}


