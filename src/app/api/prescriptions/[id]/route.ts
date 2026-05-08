// app/api/prescriptions/[id]/route.ts
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
  patient_id?: number;
  diagnosis: string;
  history?: string;
  cc?: string;
  bp?: string;
  pulse?: string;
  weight?: string;
  temperature?: string;
  tests?: string;
  next_visit_date?: string;
  advice?: string;
  medicines: Medicine[];
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

    if (!resolvedParams.id) {
      return NextResponse.json({ error: 'Prescription number is required' }, { status: 400 });
    }

    // Get prescription details
  const prescriptionResult = await pool.query(
      `SELECT p.*, 
              pt.patient_number,
              pt.full_name as patient_name, 
              pt.age as patient_age, 
              pt.gender as patient_gender,
              pt.mobile as patient_mobile,
              u.first_name as doctor_first_name,
              u.last_name as doctor_last_name,
              u.bmdc_reg as doctor_bmdc,
              u.specialty as doctor_specialty
       FROM prescriptions p
       LEFT JOIN patients pt ON p.patient_id = pt.id
       LEFT JOIN users u ON p.doctor_id = u.id
       WHERE p.prescription_number = $1 AND p.doctor_id = $2`,
      [resolvedParams.id, doctorId]
    );

    if (prescriptionResult.rows.length === 0) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
    }

    // Get prescription medicines
    const prescription = prescriptionResult.rows[0];
    const medicinesResult = await pool.query(
      `SELECT name, rules, days, notes
       FROM prescription_medicines
       WHERE prescription_id = $1
       ORDER BY id`,
      [prescription.id]
    );

    prescription.medicines = medicinesResult.rows;

    return NextResponse.json({ prescription });

  } catch (error) {
    console.error('Prescription fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;

    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie') || '';
    const cookieTokenMatch = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : cookieTokenMatch?.[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserFromSession(token);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let doctorId = user.id;
    if (user.role === 'assistant' && user.doctor_id) {
      doctorId = user.doctor_id;
    }

    if (!resolvedParams.id) {
      return NextResponse.json(
        { error: 'Prescription number is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      const prescriptionData = (await request.json()) as PrescriptionData;

      if (!prescriptionData.diagnosis?.trim()) {
        return NextResponse.json(
          { error: 'Diagnosis is required' },
          { status: 400 }
        );
      }

      const validMedicines = (prescriptionData.medicines || []).filter(
        (medicine) =>
          medicine.name.trim() && medicine.rules.trim() && medicine.days.trim()
      );

      if (validMedicines.length === 0) {
        return NextResponse.json(
          { error: 'At least one medicine is required' },
          { status: 400 }
        );
      }

      const nextVisitDate =
        prescriptionData.next_visit_date?.trim() === ''
          ? null
          : prescriptionData.next_visit_date || null;

      await client.query('BEGIN');

      const existingPrescriptionResult = await client.query(
        `SELECT id, patient_id
         FROM prescriptions
         WHERE prescription_number = $1 AND doctor_id = $2
         FOR UPDATE`,
        [resolvedParams.id, doctorId]
      );

      if (existingPrescriptionResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { error: 'Prescription not found' },
          { status: 404 }
        );
      }

      const existingPrescription = existingPrescriptionResult.rows[0];
      const patientId = prescriptionData.patient_id || existingPrescription.patient_id;

      const patientCheck = await client.query(
        'SELECT id FROM patients WHERE id = $1 AND doctor_id = $2',
        [patientId, doctorId]
      );

      if (patientCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { error: 'Patient not found or access denied' },
          { status: 404 }
        );
      }

      await client.query(
        `UPDATE prescriptions
         SET patient_id = $1,
             diagnosis = $2,
             history = $3,
             cc = $4,
             bp = $5,
             pulse = $6,
             weight = $7,
             temperature = $8,
             tests = $9,
             next_visit_date = $10,
             advice = $11,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $12`,
        [
          patientId,
          prescriptionData.diagnosis,
          prescriptionData.history || null,
          prescriptionData.cc || null,
          prescriptionData.bp || null,
          prescriptionData.pulse || null,
          prescriptionData.weight || null,
          prescriptionData.temperature || null,
          prescriptionData.tests || null,
          nextVisitDate,
          prescriptionData.advice || null,
          existingPrescription.id,
        ]
      );

      await client.query(
        'DELETE FROM prescription_medicines WHERE prescription_id = $1',
        [existingPrescription.id]
      );

      for (const medicine of validMedicines) {
        await client.query(
          `INSERT INTO prescription_medicines
           (prescription_id, name, rules, days, notes)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            existingPrescription.id,
            medicine.name,
            medicine.rules,
            medicine.days,
            medicine.notes || null,
          ]
        );
      }

      await client.query('COMMIT');

      return NextResponse.json({
        message: 'Prescription updated successfully',
        prescriptionId: resolvedParams.id,
        prescription_number: resolvedParams.id,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Prescription update error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    } finally {
      client.release();
    }
  } finally {
    // no-op; client is released in the inner finally after auth succeeds
  }
}

export async function DELETE(
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

    if (!resolvedParams.id) {
      return NextResponse.json({ error: 'Prescription number is required' }, { status: 400 });
    }

    // Delete by doctor-scoped prescription number
    const deleteResult = await pool.query(
      `DELETE FROM prescriptions WHERE prescription_number = $1 AND doctor_id = $2 RETURNING id`,
      [resolvedParams.id, doctorId]
    );

    if (deleteResult.rows.length === 0) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Prescription deleted successfully' });

  } catch (error) {
    console.error('Prescription deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}