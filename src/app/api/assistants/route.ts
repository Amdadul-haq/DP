// app/api/assistants/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const user = await getUserFromSession(token);
    if (!user || user.role !== 'doctor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const result = await pool.query(
      'SELECT id, email, first_name, last_name FROM users WHERE doctor_id = $1 AND role = $2',
      [user.id, 'assistant']
    );
    return NextResponse.json({ assistants: result.rows });
  } catch (error) {
    console.error('Assistants fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const user = await getUserFromSession(token);
    if (!user || user.role !== 'doctor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { email, password, firstName, lastName } = await request.json();
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    // Check if assistant already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: 'Assistant with this email already exists' }, { status: 409 });
    }
    // Hash password
    const { hashPassword } = await import('@/lib/auth');
    const passwordHash = await hashPassword(password);
    // Generate a unique bmdc_reg for assistant
    const bmdcReg = `assistant-${user.id}-${Date.now()}`;
    // Create assistant
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, bmdc_reg, role, doctor_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, first_name, last_name, role, doctor_id`,
      [email, passwordHash, firstName, lastName, bmdcReg, 'assistant', user.id]
    );
    return NextResponse.json({ assistant: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Assistant creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
