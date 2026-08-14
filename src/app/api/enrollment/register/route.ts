import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { registrationSchema } from "@/lib/validations";
import type { ApiResponse } from "@/types";

/**
 * POST /api/enrollment/register
 * 
 * Server-side registration handler:
 * 1. Validates input with Zod
 * 2. Checks duplicate by phone + season
 * 3. Checks season capacity
 * 4. Checks registration window
 * 5. Creates enrollment row (player NOT created yet — deferred to admin approval)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { season_id, ...formFields } = body;

    // 1. Validate season_id
    if (!season_id || typeof season_id !== "string") {
      return Response.json(
        { success: false, error: "Missing or invalid season_id" } satisfies ApiResponse,
        { status: 400 }
      );
    }

    // 2. Validate form fields
    const parsed = registrationSchema.safeParse(formFields);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message ?? "Validation failed";
      return Response.json(
        { success: false, error: firstError } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const { name, favorite_team, phone, bio } = parsed.data;
    const supabase = createAdminClient();

    // 3. Fetch season and validate registration window
    const { data: season, error: seasonErr } = await supabase
      .from("seasons")
      .select("*")
      .eq("id", season_id)
      .single();

    if (seasonErr || !season) {
      return Response.json(
        { success: false, error: "Season not found" } satisfies ApiResponse,
        { status: 404 }
      );
    }

    if (season.status !== "active") {
      return Response.json(
        { success: false, error: "Registration is not active for this season" } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const now = new Date();
    if (season.registration_start && now < new Date(season.registration_start)) {
      return Response.json(
        { success: false, error: `Registration opens on ${new Date(season.registration_start).toLocaleString()}` } satisfies ApiResponse,
        { status: 400 }
      );
    }
    if (season.registration_end && now > new Date(season.registration_end)) {
      return Response.json(
        { success: false, error: "Registration for this season has closed" } satisfies ApiResponse,
        { status: 400 }
      );
    }

    // 4. Check duplicate enrollment by phone
    const { data: existing } = await supabase
      .from("season_enrollments")
      .select("status, phone")
      .eq("season_id", season_id)
      .eq("phone", phone)
      .maybeSingle();

    if (existing) {
      const statusMsg =
        existing.status === "approved"
          ? "You are already registered for this season!"
          : existing.status === "pending"
          ? "You already have a pending registration. Check your enrollment status."
          : "Your previous registration was rejected. Contact the organizer for details.";

      return Response.json(
        { success: false, error: statusMsg } satisfies ApiResponse,
        { status: 409 }
      );
    }

    // 5. Check capacity
    if (season.enrollment_capacity) {
      const { count } = await supabase
        .from("season_enrollments")
        .select("*", { count: "exact", head: true })
        .eq("season_id", season_id)
        .in("status", ["pending", "approved"]);

      if (count !== null && count >= season.enrollment_capacity) {
        return Response.json(
          { success: false, error: "Registration is full! Maximum capacity reached." } satisfies ApiResponse,
          { status: 400 }
        );
      }
    }

    // 6. Create enrollment record (player_id = NULL, created on approval)
    const registrationData = {
      name,
      favorite_team,
      phone,
      bio: bio || "",
      photo_url: "",
    };

    const { data: enrollment, error: insertErr } = await supabase
      .from("season_enrollments")
      .insert({
        season_id,
        player_id: null,
        status: "pending",
        phone,
        payment_status: "pending",
        payment_amount: season.fee_amount || 30,
        payment_method: "upi",
        registration_data: registrationData,
      })
      .select("season_id, phone, status, created_at")
      .single();

    if (insertErr) {
      // Handle unique constraint violation (race condition)
      if (insertErr.code === "23505") {
        return Response.json(
          { success: false, error: "You already have a registration for this season." } satisfies ApiResponse,
          { status: 409 }
        );
      }
      console.error("Enrollment insert error:", insertErr);
      return Response.json(
        { success: false, error: "Failed to create enrollment. Please try again." } satisfies ApiResponse,
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        data: {
          enrollmentId: `${enrollment.season_id}:${enrollment.phone}`,
          status: "pending" as const,
        },
        message: "Registration submitted successfully!",
      } satisfies ApiResponse<{ enrollmentId: string; status: string }>,
      { status: 201 }
    );
  } catch (err) {
    console.error("Registration error:", err);
    return Response.json(
      { success: false, error: "An unexpected error occurred" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
