import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body as { token: string; password: string };

    if (!token || !password) {
      return NextResponse.json({ 
        error: "Token and password are required" 
      }, { status: 400 });
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json({ 
        error: "Password must be at least 8 characters long" 
      }, { status: 400 });
    }

    // Find and validate reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!resetToken) {
      return NextResponse.json({
        error: "Invalid or expired reset token"
      }, { status: 400 });
    }

    if (resetToken.used) {
      return NextResponse.json({
        error: "Reset token has already been used"
      }, { status: 400 });
    }

    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json({
        error: "Reset token has expired"
      }, { status: 400 });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update user password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash }
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true }
      })
    ]);

    console.log(`Password reset completed for user: ${resetToken.user.email}`);

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully. You can now login with your new password."
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({
      error: "An unexpected error occurred. Please try again later."
    }, { status: 500 });
  }
}

// GET endpoint to verify token validity
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ 
        error: "Token is required" 
      }, { status: 400 });
    }

    // Find and validate reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      return NextResponse.json({
        valid: false,
        error: "Invalid or expired reset token"
      }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      email: resetToken.user.email
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json({
      valid: false,
      error: "An unexpected error occurred"
    }, { status: 500 });
  }
}