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

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const [
      userStatsResult,
      paymentStatsResult,
      subscriptionStatsResult,
      pendingPaymentResult,
    ] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*)::int AS total_users,
          COUNT(*) FILTER (WHERE role = 'doctor')::int AS total_doctors,
          COUNT(*) FILTER (WHERE role = 'assistant')::int AS total_assistants,
          COUNT(*) FILTER (WHERE role = 'admin')::int AS total_admins
        FROM users
      `),
      pool.query(`
        SELECT
          COUNT(*)::int AS total_payment_requests,
          COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_payments,
          COUNT(*) FILTER (WHERE status = 'approved')::int AS approved_payments,
          COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected_payments,
          COALESCE(SUM(amount) FILTER (WHERE status = 'approved'), 0)::numeric AS approved_amount_total
        FROM payment_requests
      `),
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE status = 'active' AND current_period_end > NOW())::int AS active_subscriptions,
          COUNT(*) FILTER (WHERE status = 'expired' OR (status = 'active' AND current_period_end <= NOW()))::int AS expired_subscriptions,
          COUNT(*) FILTER (WHERE status = 'canceled')::int AS canceled_subscriptions
        FROM subscriptions
      `),
      pool.query(`
        SELECT COUNT(*)::int AS users_with_pending_payment
        FROM (
          SELECT DISTINCT user_id
          FROM payment_requests
          WHERE status = 'pending'
        ) pending_users
      `),
    ]);

    const users = userStatsResult.rows[0];
    const payments = paymentStatsResult.rows[0];
    const subscriptions = subscriptionStatsResult.rows[0];
    const pendingUsers = pendingPaymentResult.rows[0];

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: users.total_users ?? 0,
        totalDoctors: users.total_doctors ?? 0,
        totalAssistants: users.total_assistants ?? 0,
        totalAdmins: users.total_admins ?? 0,
        totalPaymentRequests: payments.total_payment_requests ?? 0,
        pendingPayments: payments.pending_payments ?? 0,
        approvedPayments: payments.approved_payments ?? 0,
        rejectedPayments: payments.rejected_payments ?? 0,
        approvedAmountTotal: Number(payments.approved_amount_total ?? 0),
        activeSubscriptions: subscriptions.active_subscriptions ?? 0,
        expiredSubscriptions: subscriptions.expired_subscriptions ?? 0,
        canceledSubscriptions: subscriptions.canceled_subscriptions ?? 0,
        usersWithPendingPayment: pendingUsers.users_with_pending_payment ?? 0,
      },
    });
  } catch (error) {
    console.error("Admin stats fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
