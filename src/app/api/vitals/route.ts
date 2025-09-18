// app/api/vitals/route.ts - UPDATED
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromSession } from '@/lib/auth';

interface VitalsData {
  patient_number: number; // CHANGED: from patient_id to patient_number
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
    if (!vitalsData.patient_number) {
      return NextResponse.json(
        { error: 'Patient number is required' },
        { status: 400 }
      );
    }

    // Verify that the patient belongs to the doctor/assistant
    let doctorId = user.id;
    if (user.role === 'assistant' && user.doctor_id) {
      doctorId = user.doctor_id;
    }

    // CHANGED: Get patient by patient_number instead of internal ID
    const patientCheck = await pool.query(
      'SELECT id FROM patients WHERE patient_number = $1 AND doctor_id = $2',
      [vitalsData.patient_number, doctorId]
    );

    if (patientCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Patient not found or access denied' },
        { status: 404 }
      );
    }

    const patientId = patientCheck.rows[0].id;

    const result = await pool.query(
      `INSERT INTO patients_vitals 
       (patient_id, blood_pressure, pulse, weight, temperature)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        patientId, // Use internal ID for the foreign key relationship
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
    const patientNumber = searchParams.get('patient_number'); // CHANGED: from patient_id to patient_number

    if (!patientNumber) {
      return NextResponse.json(
        { error: 'Patient number is required' },
        { status: 400 }
      );
    }

    // Verify that the patient belongs to the doctor/assistant
    let doctorId = user.id;
    if (user.role === 'assistant' && user.doctor_id) {
      doctorId = user.doctor_id;
    }

    // CHANGED: Get patient by patient_number instead of internal ID
    const patientCheck = await pool.query(
      'SELECT id FROM patients WHERE patient_number = $1 AND doctor_id = $2',
      [patientNumber, doctorId]
    );

    if (patientCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Patient not found or access denied' },
        { status: 404 }
      );
    }

    const patientId = patientCheck.rows[0].id;

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