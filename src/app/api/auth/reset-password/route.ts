import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

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

    // Find the reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!resetToken) {
      return NextResponse.json({ 
        error: "Invalid or expired reset token" 
      }, { status: 400 });
    }

    // Check if token has expired
    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json({ 
        error: "Reset token has expired. Please request a new password reset." 
      }, { status: 400 });
    }

    // Check if token has already been used
    if (resetToken.used) {
      return NextResponse.json({ 
        error: "Reset token has already been used. Please request a new password reset." 
      }, { status: 400 });
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update user password and mark token as used in a transaction
    await prisma.$transaction(async (tx) => {
      // Update user password
      await tx.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash }
      });

      // Mark token as used
      await tx.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true }
      });

      // Invalidate all other reset tokens for this user
      await tx.passwordResetToken.updateMany({
        where: {
          userId: resetToken.userId,
          used: false,
          id: { not: resetToken.id }
        },
        data: { used: true }
      });
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password."
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

    // Find the reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      select: {
        id: true,
        expiresAt: true,
        used: true,
        user: {
          select: {
            email: true
          }
        }
      }
    });

    if (!resetToken) {
      return NextResponse.json({ 
        valid: false,
        error: "Invalid reset token" 
      }, { status: 400 });
    }

    // Check if token has expired
    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json({ 
        valid: false,
        error: "Reset token has expired" 
      }, { status: 400 });
    }

    // Check if token has already been used
    if (resetToken.used) {
      return NextResponse.json({ 
        valid: false,
        error: "Reset token has already been used" 
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
