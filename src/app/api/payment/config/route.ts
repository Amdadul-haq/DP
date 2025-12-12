// app/api/payment/config/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { PaymentConfig } from '@/types/payment';

// GET payment configurations (public endpoint for checkout page)
export async function GET(request: NextRequest) {
  try {
    const result = await pool.query<PaymentConfig>(
      'SELECT * FROM payment_config WHERE is_active = true ORDER BY payment_method'
    );

    return NextResponse.json({
      success: true,
      paymentMethods: result.rows,
    });
  } catch (error) {
    console.error('Payment config fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}
