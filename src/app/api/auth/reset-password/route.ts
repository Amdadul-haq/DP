// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword } from '@/lib/auth';

interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email, code, newPassword, confirmPassword }: ResetPasswordRequest = await request.json();

    if (!email || !code || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    if (code.length !== 6 || isNaN(Number(code))) {
      return NextResponse.json(
        { error: 'Invalid code format' },
        { status: 400 }
      );
    }

    // Find user and verify code
    const result = await pool.query(
      `SELECT id, password_reset_code, reset_code_expires 
       FROM users 
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = result.rows[0];

    // Verify reset code
    if (!user.password_reset_code || user.password_reset_code !== code) {
      return NextResponse.json(
        { error: 'Invalid reset code' },
        { status: 400 }
      );
    }

    // Check if code has expired
    const now = new Date();
    if (new Date(user.reset_code_expires) < now) {
      return NextResponse.json(
        { error: 'Reset code has expired' },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password and clear reset code
    await pool.query(
      `UPDATE users 
       SET password_hash = $1, password_reset_code = NULL, reset_code_expires = NULL, email_verified = TRUE
       WHERE id = $2`,
      [passwordHash, user.id]
    );

    return NextResponse.json(
      { 
        message: 'Password reset successfully. You can now login with your new password.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
