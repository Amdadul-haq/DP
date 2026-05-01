import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth';

// Returns the authenticated user for the provided Bearer token
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

    // Return a safe subset of user fields for client-side storage
    const safeUser = {
      id: String(user.id),
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      bmdc_reg: user.bmdc_reg,
      specialty: user.specialty,
      role: user.role,
      doctor_id: user.doctor_id ? String(user.doctor_id) : undefined,
    };

    return NextResponse.json({ success: true, user: safeUser });
  } catch (error) {
    console.error('Auth/me error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
