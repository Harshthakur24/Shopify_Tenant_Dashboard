import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";
import crypto from 'crypto';

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

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    // Always return success to prevent email enumeration attacks
    // But only send email if user exists
    if (user) {
      // Generate a secure random token
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Set expiration to 1 hour from now
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Invalidate any existing reset tokens for this user
      await prisma.passwordResetToken.updateMany({
        where: {
          userId: user.id,
          used: false,
          expiresAt: {
            gt: new Date()
          }
        },
        data: {
          used: true
        }
      });

      // Create new reset token
      await prisma.passwordResetToken.create({
        data: {
          token: resetToken,
          userId: user.id,
          expiresAt,
        }
      });

      // Create reset URL
      const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

      // Send password reset email
      try {
        await sendPasswordResetEmail({
          to: user.email,
          resetUrl,
          userName: user.email.split('@')[0] // Use email username as display name
        });
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        // Don't expose email sending errors to prevent information disclosure
        return NextResponse.json({ 
          error: "Failed to send reset email. Please try again later." 
        }, { status: 500 });
      }
    }

    // Always return success message (security best practice)
    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, we've sent you a password reset link."
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({
      error: "An unexpected error occurred. Please try again later."
    }, { status: 500 });
  }
}
