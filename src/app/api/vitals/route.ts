// app/api/vitals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromSession } from '@/lib/auth';

interface VitalsData {
  patient_id: number;
  blood_pressure?: string;
  pulse?: string;
  weight?: string;
  temperature?: string;
}

export async function POST(request: NextRequest) {
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

    const vitalsData: VitalsData = await request.json();

    // Validate required fields
    if (!vitalsData.patient_id) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    // Verify that the patient belongs to the doctor/assistant
    let doctorId = user.id;
    if (user.role === 'assistant' && user.doctor_id) {
      doctorId = user.doctor_id;
    }

    const patientCheck = await pool.query(
      'SELECT id FROM patients WHERE id = $1 AND doctor_id = $2',
      [vitalsData.patient_id, doctorId]
    );

    if (patientCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Patient not found or access denied' },
        { status: 404 }
      );
    }

    const result = await pool.query(
      `INSERT INTO patients_vitals 
       (patient_id, blood_pressure, pulse, weight, temperature)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        vitalsData.patient_id,
        vitalsData.blood_pressure,
        vitalsData.pulse,
        vitalsData.weight,
        vitalsData.temperature
      ]
    );

    return NextResponse.json({ vitals: result.rows[0] }, { status: 201 });

  } catch (error) {
    console.error('Vitals creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const patientId = searchParams.get('patient_id');

    if (!patientId) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    // Verify that the patient belongs to the doctor/assistant
    let doctorId = user.id;
    if (user.role === 'assistant' && user.doctor_id) {
      doctorId = user.doctor_id;
    }

    const patientCheck = await pool.query(
      'SELECT id FROM patients WHERE id = $1 AND doctor_id = $2',
      [patientId, doctorId]
    );

    if (patientCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Patient not found or access denied' },
        { status: 404 }
      );
    }

    const result = await pool.query(
      `SELECT * FROM patients_vitals 
       WHERE patient_id = $1 
       ORDER BY created_at DESC`,
      [patientId]
    );

    return NextResponse.json({ vitals: result.rows });

  } catch (error) {
    console.error('Vitals fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}