// app/api/prescriptions/latest/route.ts
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

    // URL parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");
    const search = searchParams.get("search") || "";

    const offset = (page - 1) * limit;

    // If assistant, get doctor_id
    let doctorId = user.id;
    if (user.role === "assistant" && user.doctor_id) {
      doctorId = user.doctor_id;
    }

    // Base query
    let baseQuery = `
      FROM prescriptions p
      INNER JOIN patients pt ON p.patient_id = pt.id
      WHERE p.doctor_id = $1
    `;

    const queryParams: (string | number)[] = [doctorId];

    // Add search functionality
    if (search) {
      baseQuery += ` AND (
        pt.full_name ILIKE $${queryParams.length + 1} OR 
        pt.patient_number::text ILIKE $${queryParams.length + 1} OR
        p.diagnosis ILIKE $${queryParams.length + 1}
      )`;
      queryParams.push(`%${search}%`);
    }

    // Use const instead of let
    const countQuery = `SELECT COUNT(DISTINCT p.patient_id) as total_count ${baseQuery}`;
    const dataQuery = `
      SELECT DISTINCT ON (p.patient_id) 
        p.id,
        p.patient_id,
        p.diagnosis,
        p.created_at,
        pt.full_name as patient_name,
        pt.patient_number
      ${baseQuery}
      ORDER BY p.patient_id, p.created_at DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    // Total count
    const countResult = await pool.query(countQuery, queryParams);
    const totalCount = parseInt(countResult.rows[0].total_count);
    const totalPages = Math.ceil(totalCount / limit);

    // Data query
    const dataParams = [...queryParams, limit, offset];
    const result = await pool.query(dataQuery, dataParams);

    return NextResponse.json({
      prescriptions: result.rows,
      totalPages,
      currentPage: page,
      totalCount,
    });
  } catch (error) {
    console.error("Latest prescriptions fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
