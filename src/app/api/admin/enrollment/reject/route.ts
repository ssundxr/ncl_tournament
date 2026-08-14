import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { enrollmentRejectionSchema } from "@/lib/validations";
import type { ApiResponse } from "@/types";

/**
 * POST /api/admin/enrollment/reject
 *
 * Rejects an enrollment with an optional reason.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = enrollmentRejectionSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.issues[0]?.message } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const { season_id, phone, reason } = parsed.data;
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("season_enrollments")
      .update({
        status: "rejected",
        rejection_reason: reason || null,
      })
      .eq("season_id", season_id)
      .eq("phone", phone);

    if (error) {
      return Response.json(
        { success: false, error: error.message } satisfies ApiResponse,
        { status: 500 }
      );
    }

    return Response.json(
      { success: true, message: "Enrollment rejected" } satisfies ApiResponse,
      { status: 200 }
    );
  } catch (err) {
    console.error("Rejection error:", err);
    return Response.json(
      { success: false, error: "An unexpected error occurred" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
