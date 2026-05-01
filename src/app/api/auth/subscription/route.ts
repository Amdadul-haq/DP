// app/api/auth/subscription/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth';
import pool from '@/lib/db';
import { SubscriptionWithPlan } from '@/lib/plans';

interface SubscriptionResponse {
  hasActiveSubscription: boolean;
  subscription: SubscriptionWithPlan | null;
}

export async function GET(request: NextRequest): Promise<NextResponse<SubscriptionResponse | { error: string }>> {
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

    // Admins don't need subscriptions
    if (user.role === 'admin') {
      return NextResponse.json({
        hasActiveSubscription: true, // Admins always have access
        subscription: null,
        isAdmin: true,
      });
    }

    // Get the freshest active subscription for doctors
    const subscriptionResult = await pool.query(
      `SELECT s.*, p.name as plan_name, p.features
       FROM subscriptions s
       JOIN plans p ON s.plan_id = p.id
       WHERE s.user_id = $1 AND s.status = 'active' AND s.current_period_end > NOW()
       ORDER BY s.updated_at DESC, s.created_at DESC
       LIMIT 1`,
      [user.id]
    );

    const hasActiveSubscription = subscriptionResult.rows.length > 0;
    const subscription: SubscriptionWithPlan | null = hasActiveSubscription ? subscriptionResult.rows[0] : null;

    // Check for pending payment requests
    const pendingPaymentResult = await pool.query(
      `SELECT id, status, created_at
       FROM payment_requests
       WHERE user_id = $1 AND status = 'pending'
       ORDER BY created_at DESC
       LIMIT 1`,
      [user.id]
    );

    const hasPendingPayment = pendingPaymentResult.rows.length > 0;
    const pendingPayment = hasPendingPayment ? pendingPaymentResult.rows[0] : null;

    return NextResponse.json({
      hasActiveSubscription,
      subscription,
      hasPendingPayment,
      pendingPayment,
    });
  } catch (error) {
    console.error('Subscription check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}