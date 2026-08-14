import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

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
    const { data: player, error: playerErr } = await supabase
      .from("players")
      .select("*, player_statistics(*)")
      .eq("user_id", uid)
      .single();

    if (playerErr || !player) {
      return Response.json(
        { success: false, error: "Player profile not found" },
        { status: 404 }
      );
    }

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

    // 3. Fetch Open Seasons (Available Tournaments)
    // We only want seasons where registration is open AND the player hasn't already applied
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
        stats: player.player_statistics?.[0] || null,
        enrollments: enrollments || [],
        availableSeasons,
      },
    });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
