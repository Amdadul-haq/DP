// app/api/prescriptions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromSession } from '@/lib/auth';

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

    if (!resolvedParams.id) {
      return NextResponse.json({ error: 'Prescription ID is required' }, { status: 400 });
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
       WHERE p.id = $1`,
      [resolvedParams.id]
    );

    if (prescriptionResult.rows.length === 0) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
    }

    // Get prescription medicines
    const medicinesResult = await pool.query(
      `SELECT name, rules, days, notes
       FROM prescription_medicines
       WHERE prescription_id = $1
       ORDER BY id`,
      [resolvedParams.id]
    );

    const prescription = prescriptionResult.rows[0];
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

    if (!resolvedParams.id) {
      return NextResponse.json({ error: 'Prescription ID is required' }, { status: 400 });
    }

    // If assistant, get doctor_id
    let doctorId = user.id;
    if (user.role === 'assistant' && user.doctor_id) {
      doctorId = user.doctor_id;
    }

    // First check if the prescription belongs to the doctor
    const checkResult = await pool.query(
      `SELECT id FROM prescriptions WHERE id = $1 AND doctor_id = $2`,
      [resolvedParams.id, doctorId]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
    }

    // Delete the prescription (cascade will delete related medicines)
    await pool.query(
      `DELETE FROM prescriptions WHERE id = $1`,
      [resolvedParams.id]
    );

    return NextResponse.json({ message: 'Prescription deleted successfully' });

  } catch (error) {
    console.error('Prescription deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}