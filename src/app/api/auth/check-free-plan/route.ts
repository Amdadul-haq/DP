// app/api/auth/check-free-plan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth';
import pool from '@/lib/db';

/**
 * Check if user has already used the Free Plan
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = await getUserFromSession(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has ever had a Free Plan subscription (plan_id = 1)
    const freePlanCheck = await pool.query(
      `SELECT id FROM subscriptions 
       WHERE user_id = $1 AND plan_id = 1
       LIMIT 1`,
      [user.id]
    );

    const hasUsedFreePlan = freePlanCheck.rows.length > 0;

    return NextResponse.json({
      hasUsedFreePlan,
    });
  } catch (error) {
    console.error('Check free plan error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
