import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensurePlayerNclId } from "@/lib/ncl-id";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return Response.json({ success: false, error: "Missing player ID or NCL tag" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const isNclId = /^NCL-/i.test(id);

    let query = supabase.from("players").select("*, player_statistics(*)");
    if (isNclId) {
      query = query.eq("ncl_id", id.toUpperCase());
    } else if (isUuid) {
      query = query.eq("id", id);
    } else {
      query = query.or(`slug.eq.${id},ncl_id.eq.${id.toUpperCase()}`);
    }

    const { data: rawPlayer, error } = await query.single();

    if (error || !rawPlayer) {
      return Response.json({ success: false, error: "Player not found" }, { status: 404 });
    }

    const player = ensurePlayerNclId(rawPlayer);

    // Fetch leaderboards and stats summary
    const { data: leaderboards } = await supabase
      .from("leaderboards")
      .select("*, season:seasons(name)")
      .eq("player_id", player.id);

    const totalWins = (leaderboards || []).reduce((s: number, l: any) => s + (l.wins ?? 0), 0);
    const totalGoals = (leaderboards || []).reduce((s: number, l: any) => s + (l.goals_for ?? 0), 0);
    const totalPoints = (leaderboards || []).reduce((s: number, l: any) => s + (l.points ?? 0), 0);
    const totalPlayed = (leaderboards || []).reduce((s: number, l: any) => s + (l.played ?? 0), 0);

    return Response.json({
      success: true,
      data: {
        player,
        summary: {
          totalWins,
          totalGoals,
          totalPoints,
          totalPlayed,
        },
        stats: player.player_statistics || [],
        history: leaderboards || [],
      },
    });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
