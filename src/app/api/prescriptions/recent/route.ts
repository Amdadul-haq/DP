// app/api/prescriptions/recent/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserFromSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = await getUserFromSession(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "5");

    // If assistant, get doctor_id
    let doctorId = user.id;
    if (user.role === "assistant" && user.doctor_id) {
      doctorId = user.doctor_id;
    }

    const result = await pool.query(
      `SELECT p.id, p.diagnosis, p.created_at, 
              pt.full_name as patient_name, pt.patient_number
       FROM prescriptions p
       INNER JOIN patients pt ON p.patient_id = pt.id
       WHERE p.doctor_id = $1
       ORDER BY p.created_at DESC
       LIMIT $2`,
      [doctorId, limit]
    );

    return NextResponse.json({
      prescriptions: result.rows,
    });
  } catch (error) {
    console.error("Recent prescriptions fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
