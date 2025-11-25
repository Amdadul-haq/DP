// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { generateResetCode, sendPasswordResetEmail } from '@/lib/email';

interface ForgotPasswordRequest {
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email }: ForgotPasswordRequest = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if user exists
    const result = await pool.query(
      'SELECT id, email, first_name, last_name FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      // SECURITY FIX: Return error for non-existent users (don't send email)
      return NextResponse.json(
        { error: 'No account found with this email address.' },
        { status: 404 }
      );
    }

    const user = result.rows[0];
    const resetCode = generateResetCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save reset code to database
    await pool.query(
      `UPDATE users 
       SET password_reset_code = $1, reset_code_expires = $2 
       WHERE id = $3`,
      [resetCode, expiresAt, user.id]
    );

    // Send email with reset code (only to existing users)
    const fullName = `${user.first_name} ${user.last_name}`;
    const emailSent = await sendPasswordResetEmail(user.email, fullName, resetCode);

    if (!emailSent) {
      console.error('Failed to send password reset email');
      return NextResponse.json(
        { error: 'Failed to send reset code. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Password reset code sent to your email',
        email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Masked email
        canResendAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes from now
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
