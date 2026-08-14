import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { paymentSubmissionSchema } from "@/lib/validations";
import type { ApiResponse } from "@/types";

/**
 * POST /api/enrollment/submit-payment
 * 
 * Accepts enrollment phone + season_id + transaction_id
 * Updates the enrollment record with payment details
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = paymentSubmissionSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message ?? "Validation failed";
      return Response.json(
        { success: false, error: firstError } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const { enrollment_season_id, enrollment_phone, transaction_id } = parsed.data;
    const supabase = createAdminClient();

    // Find the enrollment
    const { data: enrollment, error: fetchErr } = await supabase
      .from("season_enrollments")
      .select("*")
      .eq("season_id", enrollment_season_id)
      .eq("phone", enrollment_phone)
      .single();

    if (fetchErr || !enrollment) {
      return Response.json(
        { success: false, error: "Enrollment not found. Please register first." } satisfies ApiResponse,
        { status: 404 }
      );
    }

    if (enrollment.status === "approved") {
      return Response.json(
        { success: false, error: "Your enrollment is already approved!" } satisfies ApiResponse,
        { status: 400 }
      );
    }

    // Update with payment details
    const { error: updateErr } = await supabase
      .from("season_enrollments")
      .update({
        transaction_id,
        payment_status: "submitted",
      })
      .eq("season_id", enrollment_season_id)
      .eq("phone", enrollment_phone);

    if (updateErr) {
      console.error("Payment update error:", updateErr);
      return Response.json(
        { success: false, error: "Failed to update payment details" } satisfies ApiResponse,
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Payment details submitted! Your enrollment is pending admin verification.",
      } satisfies ApiResponse,
      { status: 200 }
    );
  } catch (err) {
    console.error("Payment submission error:", err);
    return Response.json(
      { success: false, error: "An unexpected error occurred" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
