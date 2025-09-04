// app/api/plans/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(
      'SELECT * FROM plans WHERE is_active = true ORDER BY price_monthly ASC'
    );

    // Convert numeric IDs to string to match frontend expectations
    const plans = result.rows.map(plan => ({
      ...plan,
      id: plan.id.toString() // Convert numeric ID to string
    }));

    return NextResponse.json({
      plans,
    });
  } catch (error) {
    console.error('Plans fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}