// app/api/admin/check-access/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromSession } from '@/lib/auth';

/**
 * Check if the current user has admin access
 * Returns 200 if user is admin, 403 if not
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = await getUserFromSession(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only doctors can be admins
    if (user.role !== 'doctor') {
      return NextResponse.json(
        { error: 'Only doctors can have admin access' },
        { status: 403 }
      );
    }

    // Check if user has is_admin flag set to true
    const adminCheck = await pool.query(
      'SELECT is_admin FROM users WHERE id = $1',
      [user.id]
    );

    if (!adminCheck.rows[0]?.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      isAdmin: true,
      message: 'Admin access verified',
    });
  } catch (error) {
    console.error('Admin check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
