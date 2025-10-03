// app/api/lab-reports/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromSession } from '@/lib/auth';

interface LabReportResponse {
  id: number;
  lab_id: string;
  customer_id: number;
  referred_by?: string;
  test_name: string;
  result: string;
  sample_date: string;
  report_date: string;
  verified_by?: string;
  created_at: string;
  customer_name: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = await getUserFromSession(token);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // If assistant, get doctor_id
    let doctorId = user.id;
    if (user.role === 'assistant' && user.doctor_id) {
      doctorId = user.doctor_id;
    }

    const result = await pool.query<LabReportResponse>(
      `SELECT lr.*, lc.full_name as customer_name
       FROM lab_reports lr
       JOIN lab_customers lc ON lr.customer_id = lc.id
       WHERE lr.id = $1 AND lr.doctor_id = $2`,
      [resolvedParams.id, doctorId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Lab report not found' }, { status: 404 });
    }

    return NextResponse.json({ report: result.rows[0] });

  } catch (error) {
    console.error('Lab report fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}