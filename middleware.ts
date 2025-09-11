import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";

const PROTECTED_PREFIXES = ["/dashboard", "/api/tenant", "/api/sync", "/api/metrics"];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
    if (!isProtected) return NextResponse.next();

    const token = request.cookies.get("auth")?.value;
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    const claims = await verifyJwt(token);
    if (!claims) return NextResponse.redirect(new URL("/login", request.url));
    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/api/tenant/:path*", "/api/sync/:path*", "/api/metrics"],
};


