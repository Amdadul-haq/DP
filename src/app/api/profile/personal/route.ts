// app/api/profile/personal/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromSession } from '@/lib/auth';

interface PersonalInfo {
  first_name: string;
  last_name: string;
  email: string;
  bmdc_reg: string;
  specialty?: string | null;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const user = await getUserFromSession(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await pool.query(
      `SELECT id, email, first_name, last_name, bmdc_reg, specialty, role, doctor_id
       FROM users WHERE id = $1`,
      [user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ personal: result.rows[0] });
  } catch (error) {
    console.error('Personal info fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const user = await getUserFromSession(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: PersonalInfo = await request.json();
    const { first_name, last_name, email, bmdc_reg, specialty } = body;

    if (!first_name || !last_name || !email || !bmdc_reg) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Uniqueness checks for email and BMDC registration across other users
    const uniqueCheck = await pool.query(
      'SELECT id FROM users WHERE (email = $1 OR bmdc_reg = $2) AND id <> $3',
      [email, bmdc_reg, user.id]
    );
    if (uniqueCheck.rows.length > 0) {
      return NextResponse.json({ error: 'Email or BMDC number already in use' }, { status: 409 });
    }

    const updateResult = await pool.query(
      `UPDATE users SET first_name = $1, last_name = $2, email = $3, bmdc_reg = $4, specialty = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING id, email, first_name, last_name, bmdc_reg, specialty, role, doctor_id`,
      [first_name, last_name, email, bmdc_reg, specialty || null, user.id]
    );

    return NextResponse.json({
      personal: updateResult.rows[0],
      message: 'Personal information updated successfully'
    });
  } catch (error) {
    console.error('Personal info update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
