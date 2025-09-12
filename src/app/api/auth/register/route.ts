import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

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

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    // Prevent duplicate user upfront
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 409 });
    }

    let message = "Account created successfully";

    await prisma.$transaction(async (tx: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      // Reuse existing tenant if shopDomain is already connected
      let tenant = await tx.tenant.findUnique({ where: { shopDomain } });
      if (!tenant) {
        tenant = await tx.tenant.create({
          data: { name: tenantName, shopDomain, accessToken },
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


