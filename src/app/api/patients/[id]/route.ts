import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromSession } from '@/lib/auth';

interface PatientData {
  full_name: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  mobile: string;
  email?: string;
  blood_group?: string;
  address?: string;
  last_visit_date?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const result = await pool.query(
      `SELECT * FROM patients WHERE id = $1 AND doctor_id = $2`,
      [params.id, user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json({ patient: result.rows[0] });

  } catch (error) {
    console.error('Patient fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const patientData: PatientData = await request.json();

    const result = await pool.query(
      `UPDATE patients 
       SET full_name = $1, gender = $2, dob = $3, mobile = $4, email = $5, 
           blood_group = $6, address = $7, last_visit_date = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 AND doctor_id = $10
       RETURNING *`,
      [
        patientData.full_name,
        patientData.gender,
        patientData.dob,
        patientData.mobile,
        patientData.email,
        patientData.blood_group,
        patientData.address,
        patientData.last_visit_date,
        params.id,
        user.id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json({ patient: result.rows[0] });

  } catch (error: unknown) {
    console.error('Patient update error:', error);
    
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const err = error as { code?: string };
      if (err.code === '23505') {
        return NextResponse.json(
          { error: 'Patient with this mobile number already exists' },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const result = await pool.query(
      `DELETE FROM patients WHERE id = $1 AND doctor_id = $2 RETURNING id`,
      [params.id, user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Patient deleted successfully' });

  } catch (error) {
    console.error('Patient deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}