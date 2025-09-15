import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { cleanShopDomain } from "@/lib/shopify-utils";
import { cacheDel } from "@/lib/redis";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password, tenantName, shopDomain, accessToken } = body as {
    email: string;
    password: string;
    tenantName: string;
    shopDomain: string;
    accessToken?: string;
  };

  if (!email || !password || !tenantName || !shopDomain || !accessToken) {
    return NextResponse.json({ error: "Missing fields (access token is required)" }, { status: 400 });
  }

  // Clean and validate the shop domain (remove https:// if present)
  let cleanShopDomainValue: string;
  try {
    cleanShopDomainValue = cleanShopDomain(shopDomain);
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Invalid shop domain format" 
    }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    // Prevent duplicate user upfront
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 409 });
    }

    let message = "Account created successfully";

    await prisma.$transaction(async (tx) => {
      // Reuse existing tenant if shopDomain is already connected (using cleaned domain)
      let tenant = await tx.tenant.findUnique({ where: { shopDomain: cleanShopDomainValue } });
      if (!tenant) {
        tenant = await tx.tenant.create({
          data: { name: tenantName, shopDomain: cleanShopDomainValue, accessToken },
        });
      } else {
        message = "Joined existing workspace";
        // Update token on existing tenant to the newly provided one
        await tx.tenant.update({ where: { id: tenant.id }, data: { accessToken } });
      }

      await tx.user.create({
        data: {
          email,
          passwordHash,
          tenantId: tenant.id,
        },
      });
    });

    // Clear any existing cache for this shop domain to ensure fresh data for new user
    try {
      await cacheDel(`products:${cleanShopDomainValue}:*`);
      console.log(`🧹 Cleared cache for new user registration: ${cleanShopDomainValue}`);
    } catch (cacheError) {
      console.warn("Failed to clear cache during registration:", cacheError);
      // Don't fail registration if cache clearing fails
    }

    return NextResponse.json({ ok: true, message }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof PrismaClientKnownRequestError && err.code === "P2002") {
      const target = (err.meta?.target as string[] | undefined)?.join(", ") ?? "";
      if (target.includes("email")) {
        return NextResponse.json({ error: "Email is already registered" }, { status: 409 });
      }
      return NextResponse.json({ error: "Duplicate value violates a unique constraint" }, { status: 409 });
    }
    return NextResponse.json({ error: "Registration failed" }, { status: 400 });
  }
}


