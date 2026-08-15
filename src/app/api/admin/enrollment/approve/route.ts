import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { enrollmentApprovalSchema } from "@/lib/validations";
import type { ApiResponse } from "@/types";

/**
 * POST /api/admin/enrollment/approve
 *
 * Atomically approves enrollments:
 * 1. Reads registration_data from each enrollment
 * 2. Creates player rows with unique slugs
 * 3. Links player_id to enrollment
 * 4. Sets status to 'approved'
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = enrollmentApprovalSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.issues[0]?.message } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const { season_id, enrollment_ids } = parsed.data;
    const supabase = createAdminClient();

    // enrollment_ids can be enrollment UUIDs or phone numbers
    const results: { identifier: string; playerName: string; playerId: string }[] = [];
    const errors: string[] = [];

    for (const idOrPhone of enrollment_ids) {
      try {
        // 1. Fetch enrollment by UUID id OR by phone + season_id
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrPhone);
        let query = supabase.from("season_enrollments").select("*, player:players!season_enrollments_player_id_fkey(*)");
        
        if (isUuid) {
          query = query.eq("id", idOrPhone);
        } else {
          query = query.eq("season_id", season_id).eq("phone", idOrPhone);
        }

        const { data: enrollment, error: fetchErr } = await query.maybeSingle();

        if (fetchErr || !enrollment) {
          errors.push(`Enrollment for ${idOrPhone} not found`);
          continue;
        }

        if (enrollment.status === "approved") {
          errors.push(`${enrollment.player?.name || enrollment.phone || idOrPhone} is already approved`);
          continue;
        }

        const regData = (enrollment.registration_data || {}) as {
          name?: string;
          favorite_team?: string;
          bio?: string;
          photo_url?: string;
        };

        // Case A: Player record is ALREADY linked (e.g. from Portal Registration)
        if (enrollment.player_id) {
          const { error: updateErr } = await supabase
            .from("season_enrollments")
            .update({
              status: "approved",
              payment_status: "verified",
              payment_verified_at: new Date().toISOString(),
            })
            .eq("id", enrollment.id);

          if (updateErr) {
            errors.push(`Failed to approve ${enrollment.id}: ${updateErr.message}`);
            continue;
          }

          results.push({
            identifier: idOrPhone,
            playerName: enrollment.player?.name || regData.name || "Player",
            playerId: enrollment.player_id,
          });
          continue;
        }

        // Case B: Player record needs to be created (Legacy enrollment)
        const playerName = regData.name || "NCL Player";
        const { data: slugResult } = await supabase.rpc("generate_unique_slug", {
          p_name: playerName,
        });

        const slug = slugResult || playerName.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();

        const { data: newPlayer, error: playerErr } = await supabase
          .from("players")
          .insert({
            name: playerName,
            slug,
            favorite_team: regData.favorite_team || "Independent",
            bio: regData.bio || "",
            photo_url: regData.photo_url || "",
            overall_rating: 70,
          })
          .select("id, name")
          .single();

        if (playerErr) {
          errors.push(`Failed to create player for ${idOrPhone}: ${playerErr.message}`);
          continue;
        }

        const { error: updateErr } = await supabase
          .from("season_enrollments")
          .update({
            player_id: newPlayer.id,
            status: "approved",
            payment_status: "verified",
            payment_verified_at: new Date().toISOString(),
          })
          .eq("id", enrollment.id);

        if (updateErr) {
          errors.push(`Failed to update enrollment for ${idOrPhone}: ${updateErr.message}`);
          continue;
        }

        results.push({
          identifier: idOrPhone,
          playerName: newPlayer.name,
          playerId: newPlayer.id,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        errors.push(`Error processing ${idOrPhone}: ${msg}`);
      }
    }

    return Response.json(
      {
        success: errors.length === 0,
        data: { approved: results, errors },
        message: `${results.length} enrollment(s) approved${errors.length > 0 ? `, ${errors.length} error(s)` : ""}`,
      } satisfies ApiResponse,
      { status: 200 }
    );
  } catch (err) {
    console.error("Approval error:", err);
    return Response.json(
      { success: false, error: "An unexpected error occurred" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
