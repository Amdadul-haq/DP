// app/api/auth/verify-reset-code/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

interface VerifyResetCodeRequest {
  email: string;
  code: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email, code }: VerifyResetCodeRequest = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      );
    }

    if (code.length !== 6 || isNaN(Number(code))) {
      return NextResponse.json(
        { error: 'Invalid code format. Code must be 6 digits.' },
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

    // Check if code exists and matches
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
        { error: 'Reset code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Code is valid - generate a temporary token for password reset
    // This token will be used in the reset-password endpoint
    const tempToken = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

    return NextResponse.json(
      { 
        message: 'Code verified successfully',
        tempToken,
        userId: user.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify reset code error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
