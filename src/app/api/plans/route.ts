// app/api/plans/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Publicly allow GET for plans (for marketing/landing page)
    const result = await pool.query('SELECT * FROM plans WHERE is_active = true ORDER BY id ASC');
    return NextResponse.json({ plans: result.rows });
  } catch (error) {
    console.error('Plans fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}