import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ApiResponse } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const season_id = searchParams.get("season_id");

    if (!season_id) {
      return Response.json(
        { success: false, error: "Season ID is required" } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    let { data: enrollments, error } = await supabase
      .from("season_enrollments")
      .select("*, player:players!season_enrollments_player_id_fkey(*)")
      .eq("season_id", season_id)
      .order("created_at", { ascending: false });

    if (error) {
      // Fallback 1: Try fk_enrollment_player
      const fallback = await supabase
        .from("season_enrollments")
        .select("*, player:players!fk_enrollment_player(*)")
        .eq("season_id", season_id)
        .order("created_at", { ascending: false });
      
      if (!fallback.error) {
        enrollments = fallback.data;
        error = null;
      } else {
        // Fallback 2: Direct query + in-memory join
        const simple = await supabase
          .from("season_enrollments")
          .select("*")
          .eq("season_id", season_id)
          .order("created_at", { ascending: false });

        if (simple.data && simple.data.length > 0) {
          const playerIds = simple.data.map(e => e.player_id).filter(Boolean);
          const playersMap = new Map();
          if (playerIds.length > 0) {
            const { data: players } = await supabase.from("players").select("*").in("id", playerIds);
            (players || []).forEach(p => playersMap.set(p.id, p));
          }
          enrollments = simple.data.map(e => ({
            ...e,
            player: e.player_id ? playersMap.get(e.player_id) || null : null
          }));
          error = null;
        } else {
          enrollments = simple.data || [];
          error = simple.error;
        }
      }
    }

    if (error) {
      return Response.json(
        { success: false, error: error.message } satisfies ApiResponse,
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      data: enrollments || [],
    } satisfies ApiResponse);
  } catch (err: any) {
    return Response.json(
      { success: false, error: err.message || "Failed to fetch enrollments" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
