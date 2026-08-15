import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ApiResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { season_id, status, registration_start, registration_end, registration_status } = body;

    if (!season_id) {
      return Response.json(
        { success: false, error: "Season ID is required" } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const updatePayload: Record<string, any> = {};
    if (status !== undefined) updatePayload.status = status;
    if (registration_start !== undefined) updatePayload.registration_start = registration_start;
    if (registration_end !== undefined) updatePayload.registration_end = registration_end;
    if (registration_status !== undefined) updatePayload.registration_status = registration_status;

    // Auto-sync lifecycle and registration status when timings are updated
    const now = new Date();
    if (registration_end) {
      const endDate = new Date(registration_end);
      if (endDate > now) {
        // Extended into future -> automatically reopen registration
        if (registration_status === undefined) {
          updatePayload.registration_status = "open";
        }
        if (status === undefined || status !== "completed") {
          updatePayload.status = "active";
        }
      } else if (endDate <= now) {
        // Past deadline -> close registration
        if (registration_status === undefined) {
          updatePayload.registration_status = "closed";
        }
      }
    }

    if (status === "completed") {
      updatePayload.registration_status = "closed";
    } else if (status === "active" && registration_status === undefined) {
      updatePayload.registration_status = "open";
    }

    const { data, error } = await supabase
      .from("seasons")
      .update(updatePayload)
      .eq("id", season_id)
      .select();

    if (error) {
      return Response.json(
        { success: false, error: error.message } satisfies ApiResponse,
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return Response.json(
        { success: false, error: "Season not found or update failed" } satisfies ApiResponse,
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Season updated and registration synced successfully",
      data: data[0]
    } satisfies ApiResponse);
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message || "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
