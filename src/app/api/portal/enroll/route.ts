import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const portalEnrollSchema = z.object({
  uid: z.string().min(1),
  season_id: z.string().uuid(),
  phone: z.string().min(10), // Taking phone as it's needed for the unique constraint currently
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = portalEnrollSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { success: false, error: "Invalid request payload" },
        { status: 400 }
      );
    }

    const { uid, season_id, phone } = parsed.data;
    const supabase = createAdminClient();

    // 1. Verify Player Profile
    const { data: player, error: playerErr } = await supabase
      .from("players")
      .select("id, name, favorite_team")
      .eq("user_id", uid)
      .single();

    if (playerErr || !player) {
      return Response.json(
        { success: false, error: "Player profile not found. Please complete onboarding." },
        { status: 403 }
      );
    }

    // 2. Verify Season is Open
    const { data: season, error: seasonErr } = await supabase
      .from("seasons")
      .select("registration_status, fee_amount")
      .eq("id", season_id)
      .single();

    if (seasonErr || !season) {
      return Response.json({ success: false, error: "Season not found." }, { status: 404 });
    }

    if (season.registration_status !== "open") {
      return Response.json({ success: false, error: "Registration is currently closed for this season." }, { status: 400 });
    }

    // 3. Create strict enrollment mapped to player_id directly
    const { data: inserted, error: enrollErr } = await supabase
      .from("season_enrollments")
      .insert({
        season_id,
        player_id: player.id,
        phone,
        status: "pending",
        payment_status: "pending",
        registration_data: {
          name: player.name,
          favorite_team: player.favorite_team,
          phone: phone,
          source: "portal",
        },
      })
      .select("id")
      .single();

    if (enrollErr) {
      if (enrollErr.code === "23505") { // Unique violation
        return Response.json({ success: false, error: "You have already applied for this season." }, { status: 400 });
      }
      return Response.json({ success: false, error: enrollErr.message }, { status: 500 });
    }

    return Response.json({ 
      success: true, 
      message: "Application submitted successfully.",
      data: { enrollmentId: inserted.id }
    });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
