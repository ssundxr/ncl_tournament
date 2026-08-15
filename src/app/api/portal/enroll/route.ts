import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
import { generateNclId, generateDefaultShortTag } from "@/lib/ncl-id";

const portalEnrollSchema = z.object({
  uid: z.string().min(1),
  season_id: z.string().uuid(),
  phone: z.string().min(6, "Phone number is required"),
  name: z.string().optional(),
  favorite_team: z.string().optional(),
  photo_url: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = portalEnrollSchema.safeParse(body);

    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map(i => i.message).join(", ");
      return Response.json(
        { success: false, error: errorMsg || "Invalid request payload. Please check your phone number." },
        { status: 400 }
      );
    }

    const { uid, season_id, phone, name, favorite_team, photo_url } = parsed.data;
    const supabase = createAdminClient();

    // 1. Verify or Auto-Create Player Profile
    let { data: player, error: playerErr } = await supabase
      .from("players")
      .select("id, name, favorite_team")
      .eq("user_id", uid)
      .single();

    if (!player) {
      const playerName = name || "New Player";
      const teamName = favorite_team || "Independent";
      const slug = playerName.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString(36);
      const nclId = generateNclId();
      const shortTag = generateDefaultShortTag(teamName);

      let { data: newPlayer, error: createPlayerErr } = await supabase
        .from("players")
        .insert({
          user_id: uid,
          name: playerName,
          slug,
          ncl_id: nclId,
          short_tag: shortTag,
          favorite_team: teamName,
          photo_url: photo_url || null,
          overall_rating: 70,
        })
        .select("id, name, favorite_team")
        .single();

      if (createPlayerErr) {
        // Fallback without short_tag/ncl_id if column missing in DB
        const retryCreate = await supabase
          .from("players")
          .insert({
            user_id: uid,
            name: playerName,
            slug,
            favorite_team: teamName,
            photo_url: photo_url || null,
            overall_rating: 70,
          })
          .select("id, name, favorite_team")
          .single();
        player = retryCreate.data;
      } else {
        player = newPlayer;
      }
    }

    if (!player) {
      return Response.json(
        { success: false, error: "Unable to establish player profile. Please retry." },
        { status: 500 }
      );
    }

    // Update name/team on player record if updated during enrollment
    const playerUpdates: Record<string, any> = {};
    if (name && player.name !== name) playerUpdates.name = name;
    if (favorite_team && player.favorite_team !== favorite_team) playerUpdates.favorite_team = favorite_team;

    if (Object.keys(playerUpdates).length > 0) {
      await supabase.from("players").update(playerUpdates).eq("id", player.id);
    }

    // 2. Verify Season is Open or Active
    const { data: season, error: seasonErr } = await supabase
      .from("seasons")
      .select("status, registration_status, fee_amount, registration_start, registration_end")
      .eq("id", season_id)
      .single();

    if (seasonErr || !season) {
      return Response.json({ success: false, error: "Season not found." }, { status: 404 });
    }

    const now = new Date();
    const isPastDeadline = season.registration_end ? now > new Date(season.registration_end) : false;
    const isBeforeStart = season.registration_start ? now < new Date(season.registration_start) : false;

    if (isPastDeadline) {
      return Response.json({ success: false, error: "Registration for this season has closed." }, { status: 400 });
    }

    if (isBeforeStart) {
      return Response.json({ success: false, error: "Registration for this season has not opened yet." }, { status: 400 });
    }

    const isRegistrationAllowed = 
      season.registration_status === "open" || 
      season.status === "active" || 
      (season.registration_end && new Date(season.registration_end) > now);

    if (!isRegistrationAllowed || season.registration_status === "closed") {
      // If timing was extended into the future, allow and auto-update
      if (season.registration_end && new Date(season.registration_end) > now) {
        await supabase.from("seasons").update({ registration_status: "open", status: "active" }).eq("id", season_id);
      } else {
        return Response.json({ success: false, error: "Registration is currently closed for this season." }, { status: 400 });
      }
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
