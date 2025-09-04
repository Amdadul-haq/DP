// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword, createJWT } from '@/lib/auth';

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  bmdcReg: string;
  specialty?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, bmdcReg, specialty }: RegisterRequest = await request.json();

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !bmdcReg) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR bmdc_reg = $2',
      [email, bmdcReg]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'User with this email or BMDC number already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, bmdc_reg, specialty)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, bmdc_reg, specialty`,
      [email, passwordHash, firstName, lastName, bmdcReg, specialty]
    );

    const user = result.rows[0];

    // Create JWT token
    const token = await createJWT({ userId: user.id });

    return NextResponse.json(
      { 
        message: 'User created successfully', 
        user,
        token 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}