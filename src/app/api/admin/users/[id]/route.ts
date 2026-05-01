import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserFromSession } from "@/lib/auth";

type EditableRole = "doctor" | "assistant" | "admin";

interface UpdateUserBody {
  firstName?: string;
  lastName?: string;
  specialty?: string | null;
  role?: EditableRole;
  doctorId?: number | null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const userId = Number(id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    const body = (await request.json()) as UpdateUserBody;

    const existingUserResult = await pool.query(
      `SELECT id, role
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (existingUserResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingUser = existingUserResult.rows[0];

    if (existingUser.role === "admin" && body.role && body.role !== "admin") {
      return NextResponse.json(
        { error: "Admin role cannot be changed from this panel" },
        { status: 400 }
      );
    }

    if (admin.id === userId && body.role && body.role !== "admin") {
      return NextResponse.json(
        { error: "You cannot change your own role" },
        { status: 400 }
      );
    }

    const updates: string[] = [];
    const values: Array<string | number | null> = [];

    if (typeof body.firstName === "string") {
      values.push(body.firstName.trim());
      updates.push(`first_name = $${values.length}`);
    }

    if (typeof body.lastName === "string") {
      values.push(body.lastName.trim());
      updates.push(`last_name = $${values.length}`);
    }

    if (Object.prototype.hasOwnProperty.call(body, "specialty")) {
      const specialty = body.specialty && body.specialty.trim() ? body.specialty.trim() : null;
      values.push(specialty);
      updates.push(`specialty = $${values.length}`);
    }

    if (body.role) {
      values.push(body.role);
      updates.push(`role = $${values.length}`);

      if (body.role === "assistant") {
        const doctorId = Number(body.doctorId);
        if (!Number.isInteger(doctorId) || doctorId <= 0) {
          return NextResponse.json(
            { error: "A valid doctor is required for assistant role" },
            { status: 400 }
          );
        }

        const doctorResult = await pool.query(
          `SELECT id FROM users WHERE id = $1 AND role = 'doctor'`,
          [doctorId]
        );

        if (doctorResult.rows.length === 0) {
          return NextResponse.json(
            { error: "Selected doctor does not exist" },
            { status: 400 }
          );
        }

        values.push(doctorId);
        updates.push(`doctor_id = $${values.length}`);
      } else {
        values.push(null);
        updates.push(`doctor_id = $${values.length}`);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided to update" },
        { status: 400 }
      );
    }

    updates.push("updated_at = NOW()");

    values.push(userId);

    const result = await pool.query(
      `UPDATE users
       SET ${updates.join(", ")}
       WHERE id = $${values.length}
       RETURNING id, email, first_name, last_name, bmdc_reg, specialty, role, doctor_id, created_at, updated_at`,
      values
    );

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const userId = Number(id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    if (admin.id === userId) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    const targetResult = await pool.query(
      `SELECT id, role FROM users WHERE id = $1`,
      [userId]
    );

    if (targetResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const targetRole = targetResult.rows[0].role as EditableRole;

    if (targetRole === "admin") {
      return NextResponse.json(
        { error: "Admin accounts cannot be deleted from this panel" },
        { status: 400 }
      );
    }

    // Protect doctor data from accidental hard-delete cascades.
    // In this app, deleting a doctor can cascade into patients and prescriptions.
    if (targetRole === "doctor") {
      const doctorDependenciesResult = await pool.query(
        `SELECT
           (SELECT COUNT(*)::int FROM patients WHERE doctor_id = $1) AS patients_count,
           (SELECT COUNT(*)::int FROM prescriptions WHERE doctor_id = $1) AS prescriptions_count,
           (SELECT COUNT(*)::int FROM subscriptions WHERE user_id = $1) AS subscriptions_count,
           (SELECT COUNT(*)::int FROM payment_requests WHERE user_id = $1) AS payments_count,
           (SELECT COUNT(*)::int FROM users WHERE doctor_id = $1 AND role = 'assistant') AS assistants_count`,
        [userId]
      );

      const deps = doctorDependenciesResult.rows[0];
      const totalDependencies =
        Number(deps?.patients_count || 0) +
        Number(deps?.prescriptions_count || 0) +
        Number(deps?.subscriptions_count || 0) +
        Number(deps?.payments_count || 0) +
        Number(deps?.assistants_count || 0);

      if (totalDependencies > 0) {
        return NextResponse.json(
          {
            error:
              "Cannot delete this doctor because related records exist (patients, prescriptions, subscriptions, payments, or assistants).",
          },
          { status: 400 }
        );
      }
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Remove nullable author links to avoid foreign key constraint failures.
      await client.query(
        `UPDATE prescriptions SET created_by = NULL WHERE created_by = $1`,
        [userId]
      );

      const deleteResult = await client.query(`DELETE FROM users WHERE id = $1`, [userId]);

      if ((deleteResult.rowCount || 0) === 0) {
        await client.query("ROLLBACK");
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      await client.query("COMMIT");
    } catch (dbError) {
      await client.query("ROLLBACK");
      console.error("Admin user delete transaction error:", dbError);
      return NextResponse.json(
        { error: "Delete failed due to related records. Please resolve dependencies first." },
        { status: 400 }
      );
    } finally {
      client.release();
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Admin user delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
