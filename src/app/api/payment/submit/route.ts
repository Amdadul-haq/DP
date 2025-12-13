// app/api/payment/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromSession } from '@/lib/auth';
import { CreatePaymentRequest } from '@/types/payment';
import { sendPaymentRequestNotification } from '@/lib/telegram';

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

    const { 
      planId, 
      billingCycle, 
      paymentMethod, 
      senderNumberLast4, 
      transactionId 
    }: CreatePaymentRequest = await request.json();

    // Validate input
    if (!planId || !billingCycle || !paymentMethod || !senderNumberLast4 || !transactionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (senderNumberLast4.length !== 4 || !/^\d{4}$/.test(senderNumberLast4)) {
      return NextResponse.json(
        { error: 'Sender number last 4 digits must be exactly 4 numeric digits' },
        { status: 400 }
      );
    }

    // Convert string ID to number
    const planIdNum = parseInt(planId, 10);
    
    if (isNaN(planIdNum)) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      );
    }

    // Get plan details to calculate amount
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
    const amount = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;

    // Free plan should not require payment
    if (amount === 0) {
      return NextResponse.json(
        { error: 'Free plan does not require payment submission' },
        { status: 400 }
      );
    }

    // Get payment config for the selected method
    const paymentConfigResult = await pool.query(
      'SELECT * FROM payment_config WHERE payment_method = $1 AND is_active = true',
      [paymentMethod]
    );

    if (paymentConfigResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Payment method not available' },
        { status: 400 }
      );
    }

    const paymentConfig = paymentConfigResult.rows[0];

    // Check for duplicate transaction ID
    const duplicateCheck = await pool.query(
      'SELECT id FROM payment_requests WHERE transaction_id = $1 AND payment_method = $2',
      [transactionId, paymentMethod]
    );

    if (duplicateCheck.rows.length > 0) {
      return NextResponse.json(
        { error: 'This transaction ID has already been submitted' },
        { status: 409 }
      );
    }

    // Check if user already has a pending request for this plan
    const pendingCheck = await pool.query(
      'SELECT id FROM payment_requests WHERE user_id = $1 AND plan_id = $2 AND status = $3',
      [user.id, planIdNum, 'pending']
    );

    if (pendingCheck.rows.length > 0) {
      return NextResponse.json(
        { error: 'You already have a pending payment request for this plan. Please wait for admin approval.' },
        { status: 409 }
      );
    }

    // Create payment request
    const paymentRequestResult = await pool.query(
      `INSERT INTO payment_requests 
       (user_id, plan_id, billing_cycle, payment_method, sender_number_last_4, 
        transaction_id, amount, recipient_number, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
       RETURNING *`,
      [
        user.id,
        planIdNum,
        billingCycle,
        paymentMethod,
        senderNumberLast4,
        transactionId,
        amount,
        paymentConfig.account_number
      ]
    );

    const paymentRequest = paymentRequestResult.rows[0];

    // Send notifications to admin (Telegram + Email) - non-blocking
    const userName = `${user.first_name} ${user.last_name}`;
    const notificationData = {
      userName,
      userEmail: user.email,
      planName: plan.name,
      amount: amount,
      billingCycle: billingCycle,
      paymentMethod: paymentMethod,
      transactionId: transactionId,
      senderNumberLast4: senderNumberLast4,
      recipientNumber: paymentConfig.account_number,
      requestId: paymentRequest.id,
    };

    // Send Telegram notification (if configured)
    sendPaymentRequestNotification(notificationData).catch((error) => {
      console.error('Telegram notification failed:', error);
    });

    // Send Email notification to admin
    // Get admin email from environment or use a default
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@digitalprescription.com';
    import('@/lib/email').then(({ sendPaymentRequestEmailToAdmin }) => {
      sendPaymentRequestEmailToAdmin(
        adminEmail,
        userName,
        user.email,
        plan.name,
        amount,
        billingCycle,
        paymentMethod,
        transactionId,
        paymentRequest.id
      ).catch((error) => {
        console.error('Admin email notification failed:', error);
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Payment request submitted successfully. Please wait for admin approval.',
      paymentRequest: {
        id: paymentRequest.id,
        status: paymentRequest.status,
        amount: paymentRequest.amount,
        created_at: paymentRequest.created_at,
      },
    });
  } catch (error) {
    console.error('Payment submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET user's payment requests
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

    const result = await pool.query(
      `SELECT pr.*, p.name as plan_name, p.features
       FROM payment_requests pr
       JOIN plans p ON pr.plan_id = p.id
       WHERE pr.user_id = $1
       ORDER BY pr.created_at DESC`,
      [user.id]
    );

    return NextResponse.json({
      success: true,
      paymentRequests: result.rows,
    });
  } catch (error) {
    console.error('Payment requests fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
