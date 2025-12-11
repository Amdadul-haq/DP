// app/api/admin/payment-requests/[id]/reject/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromSession } from '@/lib/auth';
import { sendPaymentRejectionNotification } from '@/lib/telegram';

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

    if (!adminNote) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

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

    // Update payment request status
    await pool.query(
      `UPDATE payment_requests 
       SET status = 'rejected', admin_id = $1, admin_note = $2, reviewed_at = NOW(), updated_at = NOW()
       WHERE id = $3`,
      [user.id, adminNote, id]
    );

    // Get user details for notification
    const userResult = await pool.query(
      'SELECT first_name, last_name FROM users WHERE id = $1',
      [paymentRequest.user_id]
    );

    // Get plan details for notification
    const planResult = await pool.query(
      'SELECT name FROM plans WHERE id = $1',
      [paymentRequest.plan_id]
    );

    // Send Telegram notification (if configured)
    if (userResult.rows.length > 0 && planResult.rows.length > 0) {
      const userName = `${userResult.rows[0].first_name} ${userResult.rows[0].last_name}`;
      const planName = planResult.rows[0].name;
      
      try {
        await sendPaymentRejectionNotification(userName, planName, adminNote);
      } catch (telegramError) {
        // Log but don't fail if notification fails
        console.error('Telegram notification failed:', telegramError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment request rejected',
    });
  } catch (error) {
    console.error('Payment rejection error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
