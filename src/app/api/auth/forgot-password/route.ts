import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body as { email: string };

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // For build compatibility, we'll implement the actual functionality later
    // This prevents build failures while maintaining the API structure
    console.log(`Password reset requested for: ${email}`);

    // Always return success message (security best practice)
    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, we've sent you a password reset link.",
      note: "Password reset functionality will be implemented after successful deployment"
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({
      error: "An unexpected error occurred. Please try again later."
    }, { status: 500 });
  }
}
