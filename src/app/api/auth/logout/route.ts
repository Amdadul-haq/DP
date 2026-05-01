// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;
    const cookieToken = request.cookies.get("token")?.value || null;
    const sessionToken = bearerToken || cookieToken;

    if (sessionToken) {
      // Best-effort session invalidation for deployments using user_sessions.
      await pool.query("DELETE FROM user_sessions WHERE session_token = $1", [sessionToken]);
    }

    const response = NextResponse.json({ message: "Logged out successfully" });

    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);

    const response = NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );

    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  }
}