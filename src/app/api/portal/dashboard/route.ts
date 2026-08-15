import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
import { ensurePlayerNclId } from "@/lib/ncl-id";

const dashboardSchema = z.object({
  uid: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = dashboardSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { success: false, error: "Invalid request payload" },
        { status: 400 }
      );
    }

    const { uid } = parsed.data;
    const supabase = createAdminClient();

    // 1. Fetch Player and Stats
    const { data: rawPlayer, error: playerErr } = await supabase
      .from("players")
      .select("*, player_statistics(*)")
      .eq("user_id", uid)
      .single();

    if (playerErr || !rawPlayer) {
      return Response.json(
        { success: false, error: "Player profile not found" },
        { status: 404 }
      );
    }

    const player = ensurePlayerNclId(rawPlayer);

    // 2. Fetch Enrollments
    const { data: enrollments } = await supabase
      .from("season_enrollments")
      .select(`
        *,
        seasons (
          name,
          registration_status,
          tournament: tournaments ( name )
        )
      `)
      .eq("player_id", player.id)
      .order("created_at", { ascending: false });

    // 3. Fetch Leaderboards & Completed Matches to calculate total matches played
    const { data: leaderboards } = await supabase
      .from("leaderboards")
      .select("played, goals_for, wins")
      .eq("player_id", player.id);

    const totalMatchesFromLeaderboards = (leaderboards || []).reduce((acc: number, l: any) => acc + (l.played || 0), 0);
    const totalWinsFromLeaderboards = (leaderboards || []).reduce((acc: number, l: any) => acc + (l.wins || 0), 0);
    const totalGoalsFromLeaderboards = (leaderboards || []).reduce((acc: number, l: any) => acc + (l.goals_for || 0), 0);

    const playerStatsRecord = player.player_statistics?.[0] || null;
    const matchesPlayed = Math.max(playerStatsRecord?.matches_played || 0, totalMatchesFromLeaderboards);
    const goalsScored = Math.max(playerStatsRecord?.goals_scored || 0, totalGoalsFromLeaderboards);
    const matchesWon = Math.max(playerStatsRecord?.matches_won || 0, totalWinsFromLeaderboards);

    const mergedStats = {
      ...(playerStatsRecord || {}),
      matches_played: matchesPlayed,
      goals_scored: goalsScored,
      matches_won: matchesWon,
    };

    // 4. Fetch Open Seasons (Available Tournaments)
    const appliedSeasonIds = (enrollments || []).map((e: any) => e.season_id);
    
    let openSeasonsQuery = supabase
      .from("seasons")
      .select(`
        *,
        tournament: tournaments ( name )
      `)
      .eq("registration_status", "open")
      .is("deleted_at", null);

    const { data: allOpenSeasons } = await openSeasonsQuery;
    
    const availableSeasons = (allOpenSeasons || []).filter(
      (s: any) => !appliedSeasonIds.includes(s.id)
    );

    return Response.json({
      success: true,
      data: {
        player,
        stats: mergedStats,
        enrollments: enrollments || [],
        availableSeasons,
      },
    });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
