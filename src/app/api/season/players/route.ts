import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const seasonId = searchParams.get("season_id");

    if (!seasonId) {
      return Response.json({ success: false, error: "season_id is required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Fetch approved enrollments with player data using explicit FK
    const { data, error } = await supabase
      .from("season_enrollments")
      .select("player_id, status, players!season_enrollments_player_id_fkey(id, name, slug, ncl_id, short_tag, favorite_team, photo_url, overall_rating, bio)")
      .eq("season_id", seasonId)
      .eq("status", "approved");

    if (error) {
      // Fallback: try without explicit FK name
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("season_enrollments")
        .select("player_id, status, players(id, name, slug, ncl_id, short_tag, favorite_team, photo_url, overall_rating, bio)")
        .eq("season_id", seasonId)
        .eq("status", "approved");

      if (fallbackError) {
        return Response.json({ success: false, error: fallbackError.message }, { status: 500 });
      }

      const players = (fallbackData ?? [])
        .map((e: any) => e.players)
        .filter(Boolean)
        .sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""));

      return Response.json({ success: true, data: players, count: players.length });
    }

    const players = (data ?? [])
      .map((e: any) => e.players)
      .filter(Boolean)
      .sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""));

    return Response.json({ success: true, data: players, count: players.length });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
