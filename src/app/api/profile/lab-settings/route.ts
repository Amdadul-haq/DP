// app/api/profile/lab-settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromSession } from '@/lib/auth';

interface LabSettings {
  lab_name_bengali: string;
  lab_name_english: string;
  lab_address: string;
  lab_mobile: string;
  lab_email: string;
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

    const result = await pool.query(
      `SELECT lab_name_bengali, lab_name_english, lab_address, lab_mobile, lab_email
       FROM users WHERE id = $1`,
      [user.id]
    );

    const labSettings: LabSettings = result.rows[0] ? {
      lab_name_bengali: result.rows[0].lab_name_bengali || '',
      lab_name_english: result.rows[0].lab_name_english || '',
      lab_address: result.rows[0].lab_address || '',
      lab_mobile: result.rows[0].lab_mobile || '',
      lab_email: result.rows[0].lab_email || ''
    } : {
      lab_name_bengali: '',
      lab_name_english: '',
      lab_address: '',
      lab_mobile: '',
      lab_email: ''
    };

    return NextResponse.json({ labSettings });

  } catch (error) {
    console.error('Lab settings fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const labSettings: LabSettings = await request.json();

    // Validate required fields
    if (!labSettings.lab_name_bengali || !labSettings.lab_name_english || 
        !labSettings.lab_address || !labSettings.lab_mobile) {
      return NextResponse.json(
        { error: 'All lab settings fields are required except email' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE users 
       SET lab_name_bengali = $1, lab_name_english = $2, lab_address = $3, 
           lab_mobile = $4, lab_email = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING lab_name_bengali, lab_name_english, lab_address, lab_mobile, lab_email`,
      [
        labSettings.lab_name_bengali,
        labSettings.lab_name_english,
        labSettings.lab_address,
        labSettings.lab_mobile,
        labSettings.lab_email,
        user.id
      ]
    );

    return NextResponse.json({ 
      labSettings: result.rows[0],
      message: 'Lab settings updated successfully'
    });

  } catch (error) {
    console.error('Lab settings update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}