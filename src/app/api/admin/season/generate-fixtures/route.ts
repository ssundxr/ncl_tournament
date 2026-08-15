import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fixtureGenerationSchema } from "@/lib/validations";
import { generateFixtures } from "@/lib/engine/fixture-generator";
import type { ApiResponse, FixtureGenerationResponse, Player } from "@/types";

/**
 * POST /api/admin/season/generate-fixtures
 *
 * Server-side fixture generation:
 * 1. Validates input
 * 2. Checks idempotency (no existing groups)
 * 3. Fetches approved players
 * 4. Runs fixture engine
 * 5. Bulk inserts groups, group_players, leaderboards, fixtures
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = fixtureGenerationSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.issues[0]?.message } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const { season_id, group_size, seed } = parsed.data;
    const supabase = createAdminClient();

    // 1. Check if fixtures already exist
    const { count: existingGroups } = await supabase
      .from("groups")
      .select("*", { count: "exact", head: true })
      .eq("season_id", season_id);

    if (existingGroups && existingGroups > 0) {
      return Response.json(
        {
          success: false,
          error: "Fixtures already exist for this season. Delete existing groups first to regenerate.",
        } satisfies ApiResponse,
        { status: 409 }
      );
    }

    // 2. Fetch approved players
    const { data: enrollments, error: enrollErr } = await supabase
      .from("season_enrollments")
      .select("player:players!season_enrollments_player_id_fkey(*)")
      .eq("season_id", season_id)
      .eq("status", "approved");

    if (enrollErr) {
      return Response.json(
        { success: false, error: "Failed to fetch enrollments" } satisfies ApiResponse,
        { status: 500 }
      );
    }

    const players: Player[] = (enrollments ?? [])
      .map((e: { player: unknown }) => e.player as Player)
      .filter(Boolean);

    if (players.length < 2) {
      return Response.json(
        { success: false, error: `Only ${players.length} approved player(s). Need at least 2.` } satisfies ApiResponse,
        { status: 400 }
      );
    }

    // 3. Run the fixture engine
    const result = generateFixtures({
      seasonId: season_id,
      players,
      groupSize: Math.min(group_size, players.length),
      seed,
    });

    // 4. Bulk insert everything
    let totalLeaderboards = 0;

    // Create groups and collect IDs
    const groupIdMap: string[] = []; // index → group UUID

    for (let gi = 0; gi < result.groups.length; gi++) {
      const g = result.groups[gi];

      const { data: newGroup, error: gErr } = await supabase
        .from("groups")
        .insert({
          season_id,
          name: g.name,
          sort_order: g.sortOrder,
        })
        .select("id")
        .single();

      if (gErr || !newGroup) {
        return Response.json(
          { success: false, error: `Failed to create ${g.name}: ${gErr?.message}` } satisfies ApiResponse,
          { status: 500 }
        );
      }

      groupIdMap.push(newGroup.id);

      // Insert group_players
      const gpRows = g.players.map((p) => ({
        group_id: newGroup.id,
        player_id: p.id,
      }));

      if (gpRows.length > 0) {
        await supabase.from("group_players").insert(gpRows);
      }

      // Insert leaderboard entries
      const lbRows = g.players.map((p) => ({
        season_id,
        group_id: newGroup.id,
        player_id: p.id,
      }));

      if (lbRows.length > 0) {
        await supabase.from("leaderboards").insert(lbRows);
        totalLeaderboards += lbRows.length;
      }
    }

    // Insert all fixtures
    const fixtureRows = result.fixtures.map((f) => ({
      season_id,
      group_id: groupIdMap[f.groupIndex],
      home_player_id: f.homePlayerId,
      away_player_id: f.awayPlayerId,
      matchday: f.matchday,
      stage: f.stage,
      status: "scheduled" as const,
    }));

    if (fixtureRows.length > 0) {
      const { error: fErr } = await supabase.from("fixtures").insert(fixtureRows);
      if (fErr) {
        return Response.json(
          { success: false, error: `Failed to insert fixtures: ${fErr.message}` } satisfies ApiResponse,
          { status: 500 }
        );
      }
    }

    return Response.json(
      {
        success: true,
        data: {
          groupsCreated: result.totalGroups,
          fixturesCreated: result.totalFixtures,
          leaderboardsCreated: totalLeaderboards,
        },
        message: `Generated ${result.totalGroups} groups and ${result.totalFixtures} fixtures for ${players.length} players`,
      } satisfies FixtureGenerationResponse,
      { status: 201 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Fixture generation error:", msg);
    return Response.json(
      { success: false, error: msg } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
