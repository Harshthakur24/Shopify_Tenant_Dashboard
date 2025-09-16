import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { cleanShopDomain } from "@/lib/shopify-utils";
import { cacheDel } from "@/lib/redis";
import { createJwt } from "@/lib/auth";

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
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 409 });
    }

    let message = "Account created successfully";

    await prisma.$transaction(async (tx) => {

      let tenant = await tx.tenant.findUnique({ where: { shopDomain: cleanShopDomainValue } });
      if (!tenant) {
        tenant = await tx.tenant.create({
          data: { name: tenantName, shopDomain: cleanShopDomainValue, accessToken },
        });
      } else {
        message = "Joined existing workspace";

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


    const newUser = await prisma.user.findUnique({ 
      where: { email },
      include: { tenant: true }
    });

    if (!newUser) {
      throw new Error("User creation failed");
    }


    const token = await createJwt({ 
      userId: newUser.id, 
      tenantId: newUser.tenantId, 
      email: newUser.email 
    });


    try {
      await cacheDel(`products:${cleanShopDomainValue}:*`);
      console.log(`🧹 Cleared cache for new user registration: ${cleanShopDomainValue}`);
    } catch (cacheError) {
      console.warn("Failed to clear cache during registration:", cacheError);

    }


    const res = NextResponse.json({ ok: true, message }, { status: 201 });
    res.cookies.set("auth", token, { httpOnly: true, sameSite: "lax", secure: false, path: "/", maxAge: 60 * 60 * 24 * 7 });
    return res;
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


