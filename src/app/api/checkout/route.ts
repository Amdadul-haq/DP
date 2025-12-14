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

    // Special handling for Free Plan - create subscription directly
    // Convert decimal strings to numbers for comparison
    const priceMonthly = parseFloat(plan.price_monthly) || 0;
    const priceYearly = parseFloat(plan.price_yearly) || 0;
    
    if (priceMonthly === 0 && priceYearly === 0) {
      // Check if user has already used Free Plan before
      const previousFreeSubscription = await pool.query(
        `SELECT id FROM subscriptions 
         WHERE user_id = $1 AND plan_id = $2 
         LIMIT 1`,
        [user.id, planIdNum]
      );

      if (previousFreeSubscription.rows.length > 0) {
        return NextResponse.json(
          { error: 'Free Plan can only be activated once per account. Please choose a paid plan.' },
          { status: 400 }
        );
      }

      // Create Free Plan subscription (valid for 1 month)
      const currentPeriodStart = new Date();
      const currentPeriodEnd = new Date();
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

      await pool.query(
        `INSERT INTO subscriptions 
         (user_id, plan_id, billing_cycle, current_period_start, current_period_end, status)
         VALUES ($1, $2, $3, $4, $5, 'active')`,
        [user.id, planIdNum, billingCycle, currentPeriodStart, currentPeriodEnd]
      );

      return NextResponse.json({
        success: true,
        message: 'Free Plan activated successfully!',
        subscription: {
          plan_name: plan.name,
          billing_cycle: billingCycle,
          valid_until: currentPeriodEnd,
        },
      });
    }

    // For paid plans, only validate (subscriptions created on admin approval)
    return NextResponse.json({
      success: true,
      message: 'Plan validated successfully. Please proceed to payment.',
      plan: {
        id: plan.id,
        name: plan.name,
        price_monthly: plan.price_monthly,
        price_yearly: plan.price_yearly,
        features: plan.features,
      },
      billingCycle,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}