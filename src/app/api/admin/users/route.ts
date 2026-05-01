import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserFromSession } from "@/lib/auth";

interface AdminUserRow {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  bmdc_reg: string | null;
  specialty: string | null;
  role: "doctor" | "assistant" | "admin";
  doctor_id: number | null;
  doctor_name: string | null;
  created_at: string;
  updated_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const admin = await getUserFromSession(token);

    if (!admin || admin.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const search = (url.searchParams.get("search") || "").trim();
    const role = (url.searchParams.get("role") || "all").trim();
    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
    const limit = Math.min(
      100,
      Math.max(1, Number(url.searchParams.get("limit") || 20))
    );
    const offset = (page - 1) * limit;

    const whereClauses: string[] = [];
    const values: Array<string | number> = [];

    if (role !== "all") {
      values.push(role);
      whereClauses.push(`u.role = $${values.length}`);
    }

    if (search) {
      values.push(`%${search}%`);
      whereClauses.push(
        `(u.email ILIKE $${values.length} OR u.first_name ILIKE $${values.length} OR u.last_name ILIKE $${values.length})`
      );
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const countQuery = `
      SELECT COUNT(*)::int AS total
      FROM users u
      ${whereSql}
    `;

    const usersQuery = `
      SELECT
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.bmdc_reg,
        u.specialty,
        u.role,
        u.doctor_id,
        d.first_name || ' ' || d.last_name AS doctor_name,
        u.created_at,
        u.updated_at
      FROM users u
      LEFT JOIN users d ON d.id = u.doctor_id
      ${whereSql}
      ORDER BY u.created_at DESC
      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2}
    `;

    const statsQuery = `
      SELECT
        COUNT(*)::int AS total_users,
        COUNT(*) FILTER (WHERE role = 'doctor')::int AS total_doctors,
        COUNT(*) FILTER (WHERE role = 'assistant')::int AS total_assistants,
        COUNT(*) FILTER (WHERE role = 'admin')::int AS total_admins
      FROM users
    `;

    const doctorsQuery = `
      SELECT id, first_name, last_name
      FROM users
      WHERE role = 'doctor'
      ORDER BY first_name, last_name
    `;

    const [countResult, usersResult, statsResult, doctorsResult] = await Promise.all([
      pool.query(countQuery, values),
      pool.query<AdminUserRow>(usersQuery, [...values, limit, offset]),
      pool.query(statsQuery),
      pool.query(doctorsQuery),
    ]);

    const total = countResult.rows[0]?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json({
      success: true,
      users: usersResult.rows,
      stats: {
        totalUsers: statsResult.rows[0]?.total_users ?? 0,
        totalDoctors: statsResult.rows[0]?.total_doctors ?? 0,
        totalAssistants: statsResult.rows[0]?.total_assistants ?? 0,
        totalAdmins: statsResult.rows[0]?.total_admins ?? 0,
      },
      doctors: doctorsResult.rows.map((doc) => ({
        id: doc.id,
        name: `${doc.first_name} ${doc.last_name}`,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Admin users fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
