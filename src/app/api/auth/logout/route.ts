// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Here you could add server-side logout logic if needed, such as:
    // - Invalidating tokens
    // - Clearing server sessions
    // - Logging logout events
    
    return NextResponse.json({ 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}