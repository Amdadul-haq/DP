import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/auth";
import pool from "@/lib/db";

export async function POST(request: NextRequest) {
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

    if (user.role !== "doctor") {
      return NextResponse.json(
        { error: "Only doctor accounts can cancel subscriptions" },
        { status: 403 }
      );
    }

    const result = await pool.query(
      `UPDATE subscriptions
       SET status = 'canceled',
           current_period_end = CASE
             WHEN current_period_end > NOW() THEN NOW()
             ELSE current_period_end
           END,
           updated_at = NOW()
       WHERE user_id = $1
         AND status = 'active'
         AND current_period_end > NOW()
       RETURNING id`,
      [user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "No active subscription found to cancel" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Subscription cancelled successfully",
    });
  } catch (error) {
    console.error("Subscription cancellation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}