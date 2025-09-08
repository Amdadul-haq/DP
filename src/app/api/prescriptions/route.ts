import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromSession } from '@/lib/auth';

interface Medicine {
  name: string;
  rules: string;
  days: string;
  notes?: string;
}

interface PrescriptionData {
  patient_id: number;
  diagnosis: string;
  history?: string;
  cc?: string;
  bp?: string;
  pulse?: string;
  weight?: string;
  temperature?: string;
  tests?: string;
  next_visit_date?: string;
  medicines: Medicine[];
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

    const prescriptionData: PrescriptionData = await request.json();

    // Validate required fields
    if (!prescriptionData.patient_id || !prescriptionData.diagnosis) {
      return NextResponse.json(
        { error: 'Patient ID and Diagnosis are required' },
        { status: 400 }
      );
    }

    // Verify patient belongs to doctor/assistant
    let doctorId = user.id;
    if (user.role === 'assistant' && user.doctor_id) {
      doctorId = user.doctor_id;
    }

    const patientCheck = await pool.query(
      'SELECT id FROM patients WHERE id = $1 AND doctor_id = $2',
      [prescriptionData.patient_id, doctorId]
    );

    if (patientCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Patient not found or access denied' },
        { status: 404 }
      );
    }

    // Handle empty next_visit_date
    const nextVisitDate = prescriptionData.next_visit_date?.trim() === '' ? 
      null : prescriptionData.next_visit_date;

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert prescription
      const prescriptionResult = await client.query(
        `INSERT INTO prescriptions 
         (doctor_id, patient_id, diagnosis, history, cc, bp, pulse, weight, temperature, tests, next_visit_date, created_by, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'completed')
         RETURNING id`,
        [
          doctorId,
          prescriptionData.patient_id,
          prescriptionData.diagnosis,
          prescriptionData.history,
          prescriptionData.cc,
          prescriptionData.bp,
          prescriptionData.pulse,
          prescriptionData.weight,
          prescriptionData.temperature,
          prescriptionData.tests,
          nextVisitDate, // This can be null now
          user.id
        ]
      );

      const prescriptionId = prescriptionResult.rows[0].id;

      // Insert medicines
      if (prescriptionData.medicines && prescriptionData.medicines.length > 0) {
        for (const medicine of prescriptionData.medicines) {
          if (medicine.name.trim() && medicine.rules.trim() && medicine.days.trim()) {
            await client.query(
              `INSERT INTO prescription_medicines 
               (prescription_id, name, rules, days, notes)
               VALUES ($1, $2, $3, $4, $5)`,
              [
                prescriptionId,
                medicine.name,
                medicine.rules,
                medicine.days,
                medicine.notes
              ]
            );
          }
        }
      }

      await client.query('COMMIT');

      return NextResponse.json(
        { message: 'Prescription created successfully', prescriptionId },
        { status: 201 }
      );

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Database error:', error);
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Prescription creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}