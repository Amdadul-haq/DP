// app/api/admin/payment-requests/[id]/approve/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromSession } from '@/lib/auth';
import { sendPaymentApprovalNotification } from '@/lib/telegram';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { adminNote } = await request.json();

    // Get payment request details
    const paymentRequestResult = await pool.query(
      'SELECT * FROM payment_requests WHERE id = $1',
      [id]
    );

    if (paymentRequestResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Payment request not found' },
        { status: 404 }
      );
    }

    const paymentRequest = paymentRequestResult.rows[0];

    if (paymentRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'Payment request has already been processed' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Set statement timeout to 15 seconds to prevent hanging transactions
      await client.query('SET statement_timeout = 15000');
      await client.query('BEGIN');

      // Double-check status within transaction to prevent race condition
      const lockCheck = await client.query(
        'SELECT status FROM payment_requests WHERE id = $1 FOR UPDATE',
        [id]
      );

      if (lockCheck.rows.length === 0 || lockCheck.rows[0].status !== 'pending') {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { error: 'Payment request has already been processed' },
          { status: 400 }
        );
      }

      // Calculate subscription period
      const currentPeriodStart = new Date();
      const currentPeriodEnd = new Date();
      
      if (paymentRequest.billing_cycle === 'monthly') {
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
      } else {
        currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
      }

      // Update payment request status
      await client.query(
        `UPDATE payment_requests 
         SET status = 'approved', admin_id = $1, admin_note = $2, reviewed_at = NOW(), updated_at = NOW()
         WHERE id = $3`,
        [user.id, adminNote || null, id]
      );

      // Check for existing active subscription - use single query
      const existingSubResult = await client.query(
        `SELECT id FROM subscriptions 
         WHERE user_id = $1 AND plan_id = $2 AND status = 'active'`,
        [paymentRequest.user_id, paymentRequest.plan_id]
      );

      if (existingSubResult.rows.length > 0) {
        // Update existing subscription
        await client.query(
          `UPDATE subscriptions 
           SET billing_cycle = $1, current_period_start = $2, current_period_end = $3, 
               payment_request_id = $4, updated_at = NOW()
           WHERE id = $5`,
          [
            paymentRequest.billing_cycle,
            currentPeriodStart,
            currentPeriodEnd,
            paymentRequest.id,
            existingSubResult.rows[0].id
          ]
        );
      } else {
        // Create new subscription
        await client.query(
          `INSERT INTO subscriptions 
           (user_id, plan_id, billing_cycle, current_period_start, current_period_end, status, payment_request_id)
           VALUES ($1, $2, $3, $4, $5, 'active', $6)`,
          [
            paymentRequest.user_id,
            paymentRequest.plan_id,
            paymentRequest.billing_cycle,
            currentPeriodStart,
            currentPeriodEnd,
            paymentRequest.id
          ]
        );
      }

      // Commit transaction
      await client.query('COMMIT');

      // CRITICAL: Return success response immediately
      // Don't await any queries after this point
      const successResponse = NextResponse.json({
        success: true,
        message: 'Payment request approved and subscription activated',
      });

      // Send Telegram notification asynchronously (fire and forget)
      // Use Promise without await to make it non-blocking
      pool.query(
        `SELECT u.first_name, u.last_name, p.name as plan_name
         FROM users u, plans p
         WHERE u.id = $1 AND p.id = $2`,
        [paymentRequest.user_id, paymentRequest.plan_id]
      ).then((result) => {
        if (result.rows.length > 0) {
          const userName = `${result.rows[0].first_name} ${result.rows[0].last_name}`;
          const planName = result.rows[0].plan_name;
          sendPaymentApprovalNotification(userName, planName, adminNote).catch((err) => {
            console.error('Telegram notification failed:', err);
          });
        }
      }).catch((err) => {
        console.error('Failed to fetch user details for notification:', err);
      });

      return successResponse;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Payment approval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
