// app/api/prescriptions/latest/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
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

    // Query to get the latest prescription for each patient
    const result = await pool.query(`
      SELECT DISTINCT ON (p.patient_id) 
        p.id,
        p.patient_id,
        p.diagnosis,
        p.created_at,
        pt.full_name as patient_name,
        pt.patient_number
      FROM prescriptions p
      INNER JOIN patients pt ON p.patient_id = pt.id
      WHERE p.doctor_id = $1
      ORDER BY p.patient_id, p.created_at DESC
    `, [doctorId]);

    return NextResponse.json({ 
      prescriptions: result.rows 
    });

  } catch (error) {
    console.error('Latest prescriptions fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}