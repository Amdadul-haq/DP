// app/api/patients/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromSession } from '@/lib/auth';

interface Patient {
  id?: number;
  full_name: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  mobile: string;
  email?: string;
  blood_group?: string;
  address?: string;
  last_visit_date?: string;
}

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/patients called with search params:', request.nextUrl.searchParams.toString()); // Debug log
    
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
    let doctorId: number = user.id;
    if (user.role === 'assistant' && typeof user.doctor_id === 'number') {
      doctorId = user.doctor_id;
    }
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;
    let query = `
      SELECT id, full_name, gender, dob, mobile, email, blood_group, address, last_visit_date, created_at
      FROM patients 
      WHERE doctor_id = $1
    `;
    let countQuery = `SELECT COUNT(*) FROM patients WHERE doctor_id = $1`;
    const queryParams: (string | number)[] = [doctorId];
    if (search) {
      query += ` AND (full_name ILIKE $2 OR mobile ILIKE $2)`;
      countQuery += ` AND (full_name ILIKE $2 OR mobile ILIKE $2)`;
      queryParams.push(`%${search}%`);
    }
    query += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);
    const [patientsResult, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, queryParams.slice(0, search ? 2 : 1))
    ]);
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);
    return NextResponse.json({
      patients: patientsResult.rows,
      totalPages,
      currentPage: page,
      totalCount
    });

  } catch (error) {
    console.error('Patients fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
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

    const patientData: Patient = await request.json();

    // Validate required fields
    if (!patientData.full_name || !patientData.gender || !patientData.dob || !patientData.mobile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Handle empty last_visit_date by setting it to null
    const lastVisitDate = patientData.last_visit_date?.trim() === '' ? null : patientData.last_visit_date;

    // Always link patient to the doctor, not the assistant
    const doctorId = user.role === "assistant" && user.doctor_id ? user.doctor_id : user.id;
    const result = await pool.query(
      `INSERT INTO patients 
       (doctor_id, full_name, gender, dob, mobile, email, blood_group, address, last_visit_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        doctorId,
        patientData.full_name,
        patientData.gender,
        patientData.dob,
        patientData.mobile,
        patientData.email,
        patientData.blood_group,
        patientData.address,
        lastVisitDate
      ]
    );

    return NextResponse.json({ patient: result.rows[0] }, { status: 201 });

  } catch (error: unknown) {
    console.error('Patient creation error:', error);
    
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