import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
import { generateNclId, generateDefaultShortTag, ensurePlayerNclId } from "@/lib/ncl-id";

const profileSchema = z.object({
  uid: z.string().min(1),
  action: z.enum(["get", "create", "update", "claim"]),
  profileData: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
      favorite_team: z.string().optional(),
      short_tag: z.string().optional(),
      bio: z.string().optional(),
      photo_url: z.string().optional(),
      claim_token: z.string().optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { success: false, error: "Invalid request payload" },
        { status: 400 }
      );
    }

    const { uid, action, profileData } = parsed.data;
    const supabase = createAdminClient();

    if (action === "get") {
      const { data: rawPlayer, error } = await supabase
        .from("players")
        .select("*")
        .eq("user_id", uid)
        .single();

      if (error && error.code !== "PGRST116") {
        return Response.json({ success: false, error: error.message }, { status: 500 });
      }

      if (!rawPlayer) {
        return Response.json({ success: true, data: null });
      }

      const player = ensurePlayerNclId(rawPlayer);
      return Response.json({ success: true, data: player });
    }

    if (action === "claim") {
      if (!profileData || !profileData.claim_token) {
        return Response.json({ success: false, error: "Claim token is required" }, { status: 400 });
      }

      const token = profileData.claim_token.trim().toUpperCase();

      // Find the player with this claim token where user_id is null
      const { data: legacyPlayer, error: claimSearchError } = await supabase
        .from("players")
        .select("*")
        .eq("claim_token", token)
        .is("user_id", null)
        .single();

      if (claimSearchError || !legacyPlayer) {
        return Response.json({ success: false, error: "Invalid or already mapped Temporary ID." }, { status: 400 });
      }

      // Check if this UID is already mapped to someone else
      const { data: existingUser } = await supabase
        .from("players")
        .select("id")
        .eq("user_id", uid)
        .single();

      if (existingUser) {
        return Response.json({ success: false, error: "Your Google account is already mapped to another profile." }, { status: 400 });
      }

      console.log(`[Profile API] Claim successful! Linking UID ${uid} to legacy player ${legacyPlayer.name}`);
      
      const { data: updatedLegacyPlayer, error: updateLegacyError } = await supabase
        .from("players")
        .update({ user_id: uid, claim_token: null })
        .eq("id", legacyPlayer.id)
        .select("*")
        .single();

      if (updateLegacyError) {
        return Response.json({ success: false, error: updateLegacyError.message }, { status: 500 });
      }

      return Response.json({ success: true, data: ensurePlayerNclId(updatedLegacyPlayer) });
    }

    if (action === "create") {
      if (!profileData || !profileData.name || !profileData.favorite_team) {
        return Response.json({ success: false, error: "Name and favorite team are required" }, { status: 400 });
      }

      const { data: existing } = await supabase
        .from("players")
        .select("id")
        .eq("user_id", uid)
        .single();

      if (existing) {
        return Response.json({ success: false, error: "Profile already exists" }, { status: 400 });
      }

      // --- AUTO-LINK LOGIC FOR LEGACY PLAYERS ---
      // Check if a player with this name already exists from Season 1 without a login
      const { data: legacyPlayer } = await supabase
        .from("players")
        .select("*")
        .ilike("name", profileData.name)
        .is("user_id", null)
        .single();

      if (legacyPlayer) {
        console.log(`[Profile API] Auto-linking UID ${uid} to legacy player ${legacyPlayer.name}`);
        
        const updates: any = { user_id: uid };
        if (profileData.favorite_team) updates.favorite_team = profileData.favorite_team;
        if (profileData.short_tag) updates.short_tag = profileData.short_tag.trim().toUpperCase();
        if (profileData.bio) updates.bio = profileData.bio;
        
        const { data: updatedLegacyPlayer, error: updateLegacyError } = await supabase
          .from("players")
          .update(updates)
          .eq("id", legacyPlayer.id)
          .select("*")
          .single();

        if (updateLegacyError) {
          return Response.json({ success: false, error: updateLegacyError.message }, { status: 500 });
        }

        return Response.json({ success: true, data: ensurePlayerNclId(updatedLegacyPlayer) });
      }
      // ------------------------------------------

      const nclId = generateNclId();
      const shortTag = profileData.short_tag
        ? profileData.short_tag.trim().toUpperCase()
        : generateDefaultShortTag(profileData.favorite_team);

      const slug = profileData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString(36);

      let { data: newPlayer, error: createError } = await supabase
        .from("players")
        .insert({
          user_id: uid,
          name: profileData.name,
          slug,
          ncl_id: nclId,
          short_tag: shortTag,
          favorite_team: profileData.favorite_team,
          bio: profileData.bio || "",
          photo_url: profileData.photo_url || null,
          overall_rating: 70,
        })
        .select("*")
        .single();

      if (createError && (createError.message?.toLowerCase().includes("short_tag") || createError.message?.toLowerCase().includes("ncl_id"))) {
        console.warn("[Profile API] short_tag/ncl_id not found in schema cache on create. Retrying with basic fields...");
        const retry = await supabase
          .from("players")
          .insert({
            user_id: uid,
            name: profileData.name,
            slug,
            favorite_team: profileData.favorite_team,
            bio: profileData.bio || "",
            photo_url: profileData.photo_url || null,
            overall_rating: 70,
          })
          .select("*")
          .single();
        newPlayer = retry.data;
        createError = retry.error;
      }

      if (createError) {
        return Response.json({ success: false, error: createError.message }, { status: 500 });
      }

      return Response.json({ success: true, data: ensurePlayerNclId(newPlayer) });
    }

    if (action === "update") {
      if (!profileData) {
        return Response.json({ success: false, error: "Missing profile update data" }, { status: 400 });
      }

      const updates: Record<string, any> = {};
      if (profileData.name) updates.name = profileData.name;
      if (profileData.favorite_team) updates.favorite_team = profileData.favorite_team;
      if (profileData.short_tag) updates.short_tag = profileData.short_tag.trim().toUpperCase();
      if (profileData.bio !== undefined) updates.bio = profileData.bio;
      if (profileData.photo_url !== undefined) updates.photo_url = profileData.photo_url;

      let { data: updatedPlayer, error: updateError } = await supabase
        .from("players")
        .update(updates)
        .eq("user_id", uid)
        .select("*")
        .single();

      // Graceful fallback if short_tag or ncl_id column is not yet in Supabase schema cache
      if (updateError && updateError.message?.toLowerCase().includes("short_tag")) {
        console.warn("[Profile API] short_tag column not found in schema cache. Retrying without short_tag...");
        delete updates.short_tag;
        const retry = await supabase
          .from("players")
          .update(updates)
          .eq("user_id", uid)
          .select("*")
          .single();
        updatedPlayer = retry.data;
        updateError = retry.error;
      }

      if (updateError) {
        return Response.json({ success: false, error: updateError.message }, { status: 500 });
      }

      return Response.json({ success: true, data: ensurePlayerNclId(updatedPlayer) });
    }

    return Response.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
