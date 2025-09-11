import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("auth")?.value || "";
  const claims = await verifyJwt(token);
  if (!claims) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { shopDomain, accessToken, apiKey, apiSecret } = body as {
    shopDomain?: string;
    accessToken?: string;
    apiKey?: string;
    apiSecret?: string;
  };

  const fallbackShop = process.env.SHOP_DOMAIN;
  const domain = shopDomain || fallbackShop;
  if (!domain) return NextResponse.json({ error: "Missing shopDomain" }, { status: 400 });

  const tokenToUse = accessToken || process.env.SHOPIFY_ACCESS_TOKEN || undefined;
  const apiKeyToUse = apiKey || process.env.SHOPIFY_API_KEY || undefined;
  const apiSecretToUse = apiSecret || process.env.SHOPIFY_API_SECRET || undefined;

  await prisma.tenant.update({
    where: { id: (claims as any).tenantId },
    data: { shopDomain: domain, accessToken: tokenToUse, apiKey: apiKeyToUse, apiSecret: apiSecretToUse },
  });

  return NextResponse.json({ ok: true, usingEnv: !accessToken && (!!apiKeyToUse || !!tokenToUse) });
}


