// app/api/dashboard/stats/route.ts
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

    // If assistant, get doctor_id
    let doctorId = user.id;
    if (user.role === "assistant" && user.doctor_id) {
      doctorId = user.doctor_id;
    }

    // Get current and previous month/year for comparison
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    // Use a single connection for all queries to avoid pool exhaustion
    const client = await pool.connect();
    try {
      // Fetch all stats using single connection
      const [
        totalPatientsResult,
        previousPatientsResult,
        totalPrescriptionsResult,
        previousTotalPrescriptionsResult,
        monthlyPrescriptionsResult,
        previousMonthlyPrescriptionsResult,
        monthlyAnalyticsResult,
      ] = await Promise.all([
        // Current total patients
        client.query("SELECT COUNT(*) FROM patients WHERE doctor_id = $1", [
          doctorId,
        ]),
        // Previous month total patients (for comparison)
        client.query(
          `SELECT COUNT(*) FROM patients 
           WHERE doctor_id = $1 
           AND created_at < $2`,
          [doctorId, new Date(previousYear, previousMonth - 1, 1)]
        ),
        // Current total prescriptions
        client.query("SELECT COUNT(*) FROM prescriptions WHERE doctor_id = $1", [
          doctorId,
        ]),
        // Previous total prescriptions (1 month ago)
        client.query(
          `SELECT COUNT(*) FROM prescriptions 
           WHERE doctor_id = $1 
           AND created_at < $2`,
          [doctorId, new Date(previousYear, previousMonth - 1, 1)]
        ),
        // Current month prescriptions
        client.query(
          `SELECT COUNT(*) FROM prescriptions 
           WHERE doctor_id = $1 
           AND EXTRACT(MONTH FROM created_at) = $2 
           AND EXTRACT(YEAR FROM created_at) = $3`,
          [doctorId, currentMonth, currentYear]
        ),
        // Previous month prescriptions
        client.query(
          `SELECT COUNT(*) FROM prescriptions 
           WHERE doctor_id = $1 
           AND EXTRACT(MONTH FROM created_at) = $2 
           AND EXTRACT(YEAR FROM created_at) = $3`,
          [doctorId, previousMonth, previousYear]
        ),
        // Monthly analytics for chart (last 6 months)
        client.query(
          `SELECT 
             EXTRACT(YEAR FROM created_at) as year,
             EXTRACT(MONTH FROM created_at) as month,
             COUNT(*) as count
           FROM prescriptions 
           WHERE doctor_id = $1 
           AND created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '5 months')
           GROUP BY year, month
           ORDER BY year, month`,
          [doctorId]
        ),
      ]);

    // Process analytics data for chart
    const monthlyData = monthlyAnalyticsResult.rows.map((row) => ({
      month: new Date(row.year, row.month - 1).toLocaleDateString("en", {
        month: "short",
      }),
      prescriptions: parseInt(row.count),
    }));

    // Fill in missing months with zero
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleDateString("en", { month: "short" });

      const existingData = monthlyData.find((d) => d.month === monthKey);
      last6Months.push({
        month: monthKey,
        prescriptions: existingData ? existingData.prescriptions : 0,
      });
    }

    const stats = {
      totalPatients: parseInt(totalPatientsResult.rows[0].count),
      previousTotalPatients: parseInt(previousPatientsResult.rows[0].count),
      totalPrescriptions: parseInt(totalPrescriptionsResult.rows[0].count),
      previousTotalPrescriptions: parseInt(
        previousTotalPrescriptionsResult.rows[0].count
      ),
      monthlyPrescriptions: parseInt(monthlyPrescriptionsResult.rows[0].count),
      previousMonthlyPrescriptions: parseInt(
        previousMonthlyPrescriptionsResult.rows[0].count
      ),
      analytics: last6Months,
    };

    return NextResponse.json(stats);
    } finally {
      client.release(); // Always release connection
    }
  } catch (error) {
    console.error("Dashboard stats fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
