import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password, tenantName, shopDomain } = body as {
    email: string;
    password: string;
    tenantName: string;
    shopDomain: string;
  };

  if (!email || !password || !tenantName || !shopDomain) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const tenant = await prisma.tenant.create({
      data: { name: tenantName, shopDomain },
    });

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        tenantId: tenant.id,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Registration failed" }, { status: 400 });
  }
}


