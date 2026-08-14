import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ApiResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { season_id } = body;

    if (!season_id) {
      return Response.json(
        { success: false, error: "Season ID is required" } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // High-level DBA Soft Delete Pattern:
    // We mark deleted_at timestamp on the season row.
    // This immediately hides all related season data (fixtures, standings, stats) from the website,
    // while permanently retaining 100% of historical records in PostgreSQL database.
    const { data, error } = await supabase
      .from("seasons")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", season_id)
      .select();

    if (error) {
      return Response.json(
        { success: false, error: error.message } satisfies ApiResponse,
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: "Season soft-deleted successfully (data permanently archived in DB)",
      data: data?.[0]
    } satisfies ApiResponse);
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message || "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
