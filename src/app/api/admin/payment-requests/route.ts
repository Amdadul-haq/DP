// app/api/admin/payment-requests/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromSession } from '@/lib/auth';
import { PaymentRequestWithDetails } from '@/types/payment';

// GET all payment requests (admin only)
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

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Get query parameters for filtering
    const url = new URL(request.url);
    const status = url.searchParams.get('status'); // 'pending', 'approved', 'rejected', or null for all

    let query = `
      SELECT 
        pr.*,
        u.email as user_email,
        u.first_name || ' ' || u.last_name as user_name,
        p.name as plan_name
      FROM payment_requests pr
      JOIN users u ON pr.user_id = u.id
      JOIN plans p ON pr.plan_id = p.id
    `;

    const params: string[] = [];
    
    if (status) {
      query += ' WHERE pr.status = $1';
      params.push(status);
    }

    query += ' ORDER BY pr.created_at DESC';

    const result = await pool.query<PaymentRequestWithDetails>(query, params);

    return NextResponse.json({
      success: true,
      paymentRequests: result.rows,
    });
  } catch (error) {
    console.error('Admin payment requests fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
