// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth';
import pool from '@/lib/db';

interface CheckoutRequest {
  planId: string; // This comes as string from frontend ("1", "2", "3")
  billingCycle: 'monthly' | 'yearly';
}

export async function POST(request: NextRequest) {
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

    const { planId, billingCycle }: CheckoutRequest = await request.json();

    // Convert string ID to number for database query
    const planIdNum = parseInt(planId, 10);
    
    if (isNaN(planIdNum)) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      );
    }

    // Validate the plan
    const planResult = await pool.query(
      'SELECT * FROM plans WHERE id = $1 AND is_active = true',
      [planIdNum]
    );

    if (planResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    const plan = planResult.rows[0];

    // Calculate period dates
    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date();
    if (billingCycle === 'monthly') {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    } else {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    }

    // Create subscription
    const subscriptionResult = await pool.query(
      `INSERT INTO subscriptions 
       (user_id, plan_id, billing_cycle, current_period_start, current_period_end, status)
       VALUES ($1, $2, $3, $4, $5, 'active')
       RETURNING *`,
      [user.id, plan.id, billingCycle, currentPeriodStart, currentPeriodEnd]
    );

    const subscription = subscriptionResult.rows[0];

    return NextResponse.json({
      success: true,
      subscription: {
        ...subscription,
        plan_name: plan.name,
        features: plan.features,
      },
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}