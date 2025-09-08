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

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('id');

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    // If assistant, get doctor_id
    let doctorId = user.id;
    if (user.role === 'assistant' && user.doctor_id) {
      doctorId = user.doctor_id;
    }

    // Get patient details
    const patientResult = await pool.query(
      `SELECT id, full_name, gender, age, mobile, email, blood_group, address, last_visit_date
       FROM patients WHERE id = $1 AND doctor_id = $2`,
      [patientId, doctorId]
    );

    if (patientResult.rows.length === 0) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Get latest vitals
    const vitalsResult = await pool.query(
      `SELECT blood_pressure, pulse, weight, temperature, created_at
       FROM patients_vitals 
       WHERE patient_id = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [patientId]
    );

    const patient = patientResult.rows[0];
    const vitals = vitalsResult.rows[0] || {};

    return NextResponse.json({
      patient,
      vitals
    });

  } catch (error) {
    console.error('Patient search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}