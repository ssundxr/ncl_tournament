import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ApiResponse } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get("tournament_id");
    const seasonId = searchParams.get("season_id");

    const supabase = createAdminClient();

    let query = supabase
      .from("tournament_rules")
      .select("*")
      .order("category", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (seasonId && seasonId !== "all") {
      // Return rules for this season + all global rules (season_id is null)
      query = query.or(`season_id.eq.${seasonId},season_id.is.null`);
    } else if (tournamentId && tournamentId !== "all") {
      // Return rules for this tournament + all global rules (tournament_id is null)
      query = query.or(`tournament_id.eq.${tournamentId},tournament_id.is.null`);
    }

    const { data: rules, error } = await query;

    if (error) {
      return Response.json(
        { success: false, error: error.message } satisfies ApiResponse,
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      data: rules || [],
    } satisfies ApiResponse);
  } catch (err: any) {
    return Response.json(
      { success: false, error: err.message || "Failed to fetch rules" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
