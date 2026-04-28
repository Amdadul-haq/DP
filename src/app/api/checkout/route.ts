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
      const client = await pool.connect();

      try {
        await client.query('BEGIN');
        await client.query('SELECT pg_advisory_xact_lock($1, $2)', [user.id, planIdNum]);

        // Check if user has already used Free Plan before
        const previousFreeSubscription = await client.query(
          `SELECT id, billing_cycle, current_period_start, current_period_end, status FROM subscriptions 
           WHERE user_id = $1 AND plan_id = $2 
           LIMIT 1`,
          [user.id, planIdNum]
        );

        if (previousFreeSubscription.rows.length > 0) {
          // Free Plan already exists for this user - return it as success (idempotent)
          await client.query('ROLLBACK');
          const existingSub = previousFreeSubscription.rows[0];
          return NextResponse.json({
            success: true,
            message: 'Free Plan activated successfully!',
            subscription: {
              id: existingSub.id,
              plan_name: plan.name,
              billing_cycle: existingSub.billing_cycle,
              valid_until: existingSub.current_period_end,
            },
            isDuplicate: true,
          });
        }

        // Create Free Plan subscription (valid for 1 month)
        const currentPeriodStart = new Date();
        const currentPeriodEnd = new Date();
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

        const insertResult = await client.query(
          `INSERT INTO subscriptions 
           (user_id, plan_id, billing_cycle, current_period_start, current_period_end, status, created_at)
           VALUES ($1, $2, $3, $4, $5, 'active', NOW())
           RETURNING id, user_id, plan_id, billing_cycle, current_period_start, current_period_end, status, created_at`,
          [user.id, planIdNum, billingCycle, currentPeriodStart, currentPeriodEnd]
        );

        if (insertResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return NextResponse.json(
            { error: 'Failed to create subscription' },
            { status: 500 }
          );
        }

        await client.query('COMMIT');

        // Prepare response using the created subscription
        const createdSub = insertResult.rows[0];
        const successResponse = NextResponse.json({
          success: true,
          message: 'Free Plan activated successfully!',
          subscription: {
            id: createdSub.id,
            plan_name: plan.name,
            billing_cycle: createdSub.billing_cycle,
            valid_until: createdSub.current_period_end,
          },
        });

        // Only after confirming subscription creation, send notifications (fire-and-forget)
        const userName = `${user.first_name} ${user.last_name}`;
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@digitalprescription.com';

        // Send admin notification email
        import('@/lib/email')
          .then(({ sendFreePlanNotificationToAdmin }) => {
            sendFreePlanNotificationToAdmin(
              adminEmail,
              userName,
              user.email,
              user.id,
              new Date(createdSub.current_period_end)
            ).catch((error) => {
              console.error('Admin Free Plan notification email failed:', error);
            });
          })
          .catch((error) => {
            console.error('Failed to load email module:', error);
          });

        // Send user confirmation email
        import('@/lib/email')
          .then(({ sendFreePlanConfirmationToUser }) => {
            sendFreePlanConfirmationToUser(
              user.email,
              userName,
              new Date(createdSub.current_period_end)
            ).catch((error) => {
              console.error('User Free Plan confirmation email failed:', error);
            });
          })
          .catch((error) => {
            console.error('Failed to load email module:', error);
          });

        return successResponse;
      } catch (error) {
        try {
          await client.query('ROLLBACK');
        } catch {
          // Ignore rollback errors so the original failure is preserved.
        }
        throw error;
      } finally {
        client.release();
      }
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