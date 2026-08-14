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

    // enrollment_ids are phone numbers for our schema (composite key is season_id + phone)
    const results: { phone: string; playerName: string; playerId: string }[] = [];
    const errors: string[] = [];

    for (const phone of enrollment_ids) {
      try {
        // 1. Fetch enrollment
        const { data: enrollment, error: fetchErr } = await supabase
          .from("season_enrollments")
          .select("*")
          .eq("season_id", season_id)
          .eq("phone", phone)
          .single();

        if (fetchErr || !enrollment) {
          errors.push(`Enrollment for ${phone} not found`);
          continue;
        }

        if (enrollment.status === "approved") {
          errors.push(`${phone} is already approved`);
          continue;
        }

        const regData = enrollment.registration_data as {
          name: string;
          favorite_team: string;
          bio?: string;
          photo_url?: string;
        } | null;

        if (!regData?.name) {
          errors.push(`${phone} has no registration data`);
          continue;
        }

        // 2. Generate unique slug
        const { data: slugResult } = await supabase.rpc("generate_unique_slug", {
          p_name: regData.name,
        });

        const slug = slugResult || regData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();

        // 3. Create player
        const { data: newPlayer, error: playerErr } = await supabase
          .from("players")
          .insert({
            name: regData.name,
            slug,
            favorite_team: regData.favorite_team,
            bio: regData.bio || "",
            photo_url: regData.photo_url || "",
            overall_rating: 70,
          })
          .select("id, name")
          .single();

        if (playerErr) {
          errors.push(`Failed to create player for ${phone}: ${playerErr.message}`);
          continue;
        }

        // 4. Link player and approve
        const { error: updateErr } = await supabase
          .from("season_enrollments")
          .update({
            player_id: newPlayer.id,
            status: "approved",
            payment_status: "verified",
            payment_verified_at: new Date().toISOString(),
          })
          .eq("season_id", season_id)
          .eq("phone", phone);

        if (updateErr) {
          errors.push(`Failed to update enrollment for ${phone}: ${updateErr.message}`);
          continue;
        }

        results.push({
          phone,
          playerName: newPlayer.name,
          playerId: newPlayer.id,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        errors.push(`Error processing ${phone}: ${msg}`);
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
