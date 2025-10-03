// app/api/lab-reports/route.ts (Fixed types)
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromSession } from '@/lib/auth';

interface LabCustomerData {
  full_name: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  mobile: string;
  email?: string;
  address?: string;
}

interface LabReportData {
  lab_id: string;
  referred_by?: string;
  test_name: string;
  result: string;
  sample_date: string;
  report_date: string;
  verified_by?: string;
}

interface LabReportResponse {
  id: number;
  lab_id: string;
  test_name: string;
  report_date: string;
  created_at: string;
  customer_name: string;
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

    // If assistant, get doctor_id
    let doctorId = user.id;
    if (user.role === 'assistant' && user.doctor_id) {
      doctorId = user.doctor_id;
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const offset = (page - 1) * limit;

    const result = await pool.query<LabReportResponse>(
      `SELECT lr.id, lr.lab_id, lr.test_name, lr.report_date, lr.created_at,
              lc.full_name as customer_name
       FROM lab_reports lr
       JOIN lab_customers lc ON lr.customer_id = lc.id
       WHERE lr.doctor_id = $1
       ORDER BY lr.created_at DESC
       LIMIT $2 OFFSET $3`,
      [doctorId, limit, offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM lab_reports WHERE doctor_id = $1`,
      [doctorId]
    );

    const totalCount = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      reports: result.rows,
      totalCount,
      currentPage: page
    });

  } catch (error) {
    console.error('Lab reports fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


// app/api/lab-reports/route.ts (Updated POST function)
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

    const { customer_data, lab_report }: { 
      customer_data: LabCustomerData | null; 
      lab_report: Omit<LabReportData, 'lab_id'> & { lab_id?: string }; // Make lab_id optional
    } = await request.json();

    // Validate required fields (remove lab_id from required validation)
    if (!lab_report.test_name || !lab_report.result || 
        !lab_report.sample_date || !lab_report.report_date) {
      return NextResponse.json(
        { error: 'Missing required lab report fields' },
        { status: 400 }
      );
    }

    // Always link to the doctor, not the assistant
    const doctorId = user.role === "assistant" && user.doctor_id ? user.doctor_id : user.id;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      let customerId: number;

      if (customer_data) {
        // Create new customer
        if (!customer_data.full_name || !customer_data.gender || !customer_data.age || !customer_data.mobile) {
          throw new Error('Missing required customer fields');
        }

        // Get next customer number
        const customerNumberResult = await client.query(
          `SELECT get_next_lab_customer_number($1) as next_number`,
          [doctorId]
        );
        
        const nextCustomerNumber = customerNumberResult.rows[0].next_number;

        // Insert customer
        const customerResult = await client.query(
          `INSERT INTO lab_customers 
           (doctor_id, customer_number, full_name, gender, age, mobile, email, address)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id`,
          [
            doctorId,
            nextCustomerNumber,
            customer_data.full_name,
            customer_data.gender,
            customer_data.age,
            customer_data.mobile,
            customer_data.email,
            customer_data.address
          ]
        );

        customerId = customerResult.rows[0].id;
      } else {
        // Find existing customer by mobile (for cases where we selected from search)
        // This would need to be passed differently in real implementation
        throw new Error('Existing customer selection not implemented in this example');
      }

      // Get the next lab ID for this doctor
      const labIdResult = await client.query(
        `SELECT get_next_lab_id($1) as next_lab_id`,
        [doctorId]
      );
      
      const nextLabId = labIdResult.rows[0].next_lab_id.toString();

      // Create lab report
      const reportResult = await client.query(
        `INSERT INTO lab_reports 
         (doctor_id, customer_id, lab_id, referred_by, test_name, result, sample_date, report_date, verified_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          doctorId,
          customerId,
          nextLabId, // Use auto-generated lab ID
          lab_report.referred_by,
          lab_report.test_name,
          lab_report.result,
          lab_report.sample_date,
          lab_report.report_date,
          lab_report.verified_by
        ]
      );

      await client.query('COMMIT');

      return NextResponse.json({ 
        report: reportResult.rows[0],
        message: 'Lab report created successfully'
      }, { status: 201 });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error: unknown) {
    console.error('Lab report creation error:', error);
    
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const err = error as { code?: string };
      if (err.code === '23505') {
        return NextResponse.json(
          { error: 'Lab report with this ID already exists' },
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