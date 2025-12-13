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

    // Return success response immediately
    const successResponse = NextResponse.json({
      success: true,
      message: 'Payment request rejected',
    });

    // Send notifications asynchronously (non-blocking) - both Telegram and Email
    pool.query(
      `SELECT u.first_name, u.last_name, u.email, p.name as plan_name
       FROM users u, plans p
       WHERE u.id = $1 AND p.id = $2`,
      [paymentRequest.user_id, paymentRequest.plan_id]
    ).then((result) => {
      if (result.rows.length > 0) {
        const userName = `${result.rows[0].first_name} ${result.rows[0].last_name}`;
        const planName = result.rows[0].plan_name;
        const userEmail = result.rows[0].email;
        
        // Send Telegram notification
        sendPaymentRejectionNotification(userName, planName, adminNote).catch((err) => {
          console.error('Telegram notification failed:', err);
        });

        // Send Email notification to user
        import('@/lib/email').then(({ sendPaymentRejectionEmailToUser }) => {
          sendPaymentRejectionEmailToUser(
            userEmail,
            userName,
            planName,
            adminNote
          ).catch((err) => {
            console.error('Email notification to user failed:', err);
          });
        });
      }
    }).catch((err) => {
      console.error('Failed to fetch user details for notification:', err);
    });

    return successResponse;
  } catch (error) {
    console.error('Payment rejection error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
