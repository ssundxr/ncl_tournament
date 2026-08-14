import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ApiResponse, FixtureStage } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { season_id, target_bracket_size } = body;
    if (!season_id) {
      return Response.json(
        { success: false, error: "season_id is required" } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. Fetch all fixtures for this season to determine the current stage
    const { data: fixtures, error: fixErr } = await supabase
      .from("fixtures")
      .select("*")
      .eq("season_id", season_id);

    if (fixErr) throw fixErr;

    const fixturesByStage = {
      group: fixtures?.filter(f => f.stage === 'group') || [],
      round_of_16: fixtures?.filter(f => f.stage === 'round_of_16') || [],
      quarter_final: fixtures?.filter(f => f.stage === 'quarter_final') || [],
      semi_final: fixtures?.filter(f => f.stage === 'semi_final') || [],
      final: fixtures?.filter(f => f.stage === 'final') || [],
    };

    // Determine what stage we need to generate next
    let baseMatchday = 0;
    
    // Check if we need to progress a knockout round
    if (fixturesByStage.semi_final.length > 0) {
      // Check if semi-finals are done
      if (fixturesByStage.semi_final.some(f => f.status !== 'completed')) {
        return Response.json({ success: false, error: "Semi-finals are not completed yet." }, { status: 400 });
      }
      if (fixturesByStage.final.length > 0) {
        return Response.json({ success: false, error: "Final is already generated." }, { status: 400 });
      }
      return advanceKnockoutRound(supabase, season_id, fixturesByStage.semi_final, 'final', 201);
    } 
    else if (fixturesByStage.quarter_final.length > 0) {
      if (fixturesByStage.quarter_final.some(f => f.status !== 'completed')) {
        return Response.json({ success: false, error: "Quarter-finals are not completed yet." }, { status: 400 });
      }
      return advanceKnockoutRound(supabase, season_id, fixturesByStage.quarter_final, 'semi_final', 101);
    }
    else if (fixturesByStage.round_of_16.length > 0) {
      if (fixturesByStage.round_of_16.some(f => f.status !== 'completed')) {
        return Response.json({ success: false, error: "Round of 16 is not completed yet." }, { status: 400 });
      }
      return advanceKnockoutRound(supabase, season_id, fixturesByStage.round_of_16, 'quarter_final', 81);
    }
    
    // ========================================================================
    // FIRST KNOCKOUT ROUND GENERATION (from Group Stage)
    // ========================================================================
    
    if (fixturesByStage.group.some(f => f.status !== 'completed')) {
       return Response.json({ success: false, error: "Group stage matches are not all completed yet." }, { status: 400 });
    }

    // 2. Fetch groups to get total count
    const { data: groups, error: gErr } = await supabase
      .from("groups")
      .select("id")
      .eq("season_id", season_id);

    if (gErr || !groups || groups.length < 2) {
      return Response.json({ success: false, error: "Not enough groups to generate knockouts" }, { status: 400 });
    }
    
    const N = groups.length;
    let targetBracketSize = target_bracket_size ? Number(target_bracket_size) : 0;
    
    // Auto-calculate if not provided
    if (!targetBracketSize) {
      if (N >= 6) targetBracketSize = 16;
      else if (N >= 3) targetBracketSize = 8;
      else targetBracketSize = 4;
    }
    
    let stageName: FixtureStage = "semi_final";
    baseMatchday = 41;

    if (targetBracketSize === 16) {
      stageName = "round_of_16";
      baseMatchday = 161;
    } else if (targetBracketSize === 8) {
      stageName = "quarter_final";
      baseMatchday = 81;
    }

    // 3. Fetch leaderboards to get top players
    const { data: boards, error: lbErr } = await supabase
      .from("leaderboards")
      .select("player_id, group_id, points, goal_difference, goals_for")
      .eq("season_id", season_id)
      .order("points", { ascending: false })
      .order("goal_difference", { ascending: false })
      .order("goals_for", { ascending: false });

    if (lbErr || !boards) throw lbErr;

    // Group leaderboards by group_id
    const groupStandings = new Map<string, any[]>();
    groups.forEach((g) => groupStandings.set(g.id, []));
    boards.forEach((b) => {
      const g = groupStandings.get(b.group_id);
      if (g) g.push(b);
    });

    // 4. Intelligent Seeding Algorithm
    // Collect 1st place from all groups, then 2nd place, etc.
    const globalAdvancementList: string[] = [];
    const maxGroupSize = Math.max(...Array.from(groupStandings.values()).map(arr => arr.length));

    for (let pos = 0; pos < maxGroupSize; pos++) {
      const playersAtPos: any[] = [];
      groups.forEach(g => {
        const standings = groupStandings.get(g.id);
        if (standings && standings.length > pos) {
          playersAtPos.push(standings[pos]);
        }
      });
      // Sort this bucket among themselves
      playersAtPos.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
        return b.goals_for - a.goals_for;
      });
      
      playersAtPos.forEach(p => globalAdvancementList.push(p.player_id));
    }

    // Truncate to the target bracket size
    if (globalAdvancementList.length < targetBracketSize) {
      return Response.json({ success: false, error: `Not enough players (${globalAdvancementList.length}) to form a ${targetBracketSize}-player bracket.` }, { status: 400 });
    }
    const qualifiedPlayers = globalAdvancementList.slice(0, targetBracketSize);

    // 5. Generate Matchups
    // e.g., 1 vs 16, 8 vs 9, 4 vs 13, 5 vs 12, 2 vs 15, 7 vs 10, 3 vs 14, 6 vs 11
    const fixturesToInsert: any[] = [];
    const B = targetBracketSize;
    
    // standard seeding pairs
    const seedOrder16 = [1, 16, 8, 9, 4, 13, 5, 12, 2, 15, 7, 10, 3, 14, 6, 11];
    const seedOrder8 = [1, 8, 4, 5, 2, 7, 3, 6];
    const seedOrder4 = [1, 4, 2, 3];
    
    let seedOrder = seedOrder4;
    if (B === 16) seedOrder = seedOrder16;
    else if (B === 8) seedOrder = seedOrder8;
    
    for (let i = 0; i < B; i += 2) {
      const seed1 = seedOrder[i] - 1; // 0-indexed
      const seed2 = seedOrder[i + 1] - 1;
      
      fixturesToInsert.push({
        season_id,
        stage: stageName,
        home_player_id: qualifiedPlayers[seed1],
        away_player_id: qualifiedPlayers[seed2],
        matchday: baseMatchday + (i / 2),
        status: "scheduled",
      });
    }

    const { error: insertErr } = await supabase.from("fixtures").insert(fixturesToInsert);
    if (insertErr) throw insertErr;

    return Response.json({ success: true, message: `${stageName.replace('_', ' ').toUpperCase()} generated successfully!` });
  } catch (err: any) {
    console.error("Knockout gen error:", err);
    return Response.json({ success: false, error: err.message || "Unknown error" }, { status: 500 });
  }
}

// Helper to progress to the next round based on winners
async function advanceKnockoutRound(supabase: any, season_id: string, previousFixtures: any[], nextStage: string, baseMatchday: number) {
  // Sort previous fixtures by matchday to maintain bracket integrity
  previousFixtures.sort((a, b) => (a.matchday || 0) - (b.matchday || 0));
  
  const fixturesToInsert = [];
  
  for (let i = 0; i < previousFixtures.length; i += 2) {
    const f1 = previousFixtures[i];
    const f2 = previousFixtures[i + 1];
    
    if (!f1 || !f2) break; // should not happen in a valid power-of-2 bracket
    
    // Determine winners (we assume they are completed, so scores exist)
    const f1Winner = (f1.home_score || 0) > (f1.away_score || 0) ? f1.home_player_id : f1.away_player_id;
    const f2Winner = (f2.home_score || 0) > (f2.away_score || 0) ? f2.home_player_id : f2.away_player_id;
    
    fixturesToInsert.push({
      season_id,
      stage: nextStage,
      home_player_id: f1Winner,
      away_player_id: f2Winner,
      matchday: baseMatchday + (i / 2),
      status: "scheduled",
    });
  }
  
  const { error: insertErr } = await supabase.from("fixtures").insert(fixturesToInsert);
  if (insertErr) throw insertErr;

  return Response.json({ success: true, message: `${nextStage.replace('_', ' ').toUpperCase()} generated successfully!` });
}
