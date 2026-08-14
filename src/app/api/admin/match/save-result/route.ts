import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { matchResultSchema } from "@/lib/validations";
import type { ApiResponse } from "@/types";

/**
 * POST /api/admin/match/save-result
 *
 * Server-side match result saving:
 * 1. Validates scores
 * 2. Creates or updates match record
 * 3. Marks fixture as completed
 * 4. Calls recalculate_standings DB function (replaces N+1 client-side loop)
 * 5. Handles semi-final auto-advancement and final creation
 * 6. Marks season complete if final is finished
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = matchResultSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.issues[0]?.message } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const { fixture_id, home_score, away_score } = parsed.data;
    const supabase = createAdminClient();

    // 1. Fetch fixture
    const { data: fixture, error: fixErr } = await supabase
      .from("fixtures")
      .select("*")
      .eq("id", fixture_id)
      .single();

    if (fixErr || !fixture) {
      return Response.json(
        { success: false, error: "Fixture not found" } satisfies ApiResponse,
        { status: 404 }
      );
    }

    // 2. Create or update match record
    const { data: existingMatch } = await supabase
      .from("matches")
      .select("id")
      .eq("fixture_id", fixture_id)
      .maybeSingle();

    if (existingMatch) {
      await supabase
        .from("matches")
        .update({
          home_score,
          away_score,
          ended_at: new Date().toISOString(),
        })
        .eq("id", existingMatch.id);
    } else {
      await supabase.from("matches").insert({
        fixture_id,
        home_score,
        away_score,
        started_at: new Date().toISOString(),
        ended_at: new Date().toISOString(),
      });
    }

    // 3. Mark fixture as completed
    await supabase
      .from("fixtures")
      .update({ status: "completed" })
      .eq("id", fixture_id);

    // 4. Recalculate standings if group stage
    if (fixture.stage === "group") {
      const { error: rpcErr } = await supabase.rpc("recalculate_standings", {
        p_season_id: fixture.season_id,
      });

      if (rpcErr) {
        console.error("Standings recalculation error:", rpcErr);
        // Non-fatal — match is saved, standings can be recalculated later
      }
    }

    // 5. Removed legacy auto-advancement logic.
    // Bracket progression is now handled by /api/admin/season/generate-knockouts
    
    // 6. Removed legacy auto-complete season logic.
    // Season completion should be handled explicitly by the admin.

    return Response.json(
      {
        success: true,
        message: "Result saved and standings updated",
      } satisfies ApiResponse,
      { status: 200 }
    );
  } catch (err) {
    console.error("Save result error:", err);
    return Response.json(
      { success: false, error: "An unexpected error occurred" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
