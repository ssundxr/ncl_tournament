import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
import { generateNclId, generateDefaultShortTag, ensurePlayerNclId } from "@/lib/ncl-id";

const profileSchema = z.object({
  uid: z.string().min(1),
  action: z.enum(["get", "create", "update"]),
  profileData: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
      favorite_team: z.string().optional(),
      short_tag: z.string().optional(),
      bio: z.string().optional(),
      photo_url: z.string().optional(),
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

      const nclId = generateNclId();
      const shortTag = profileData.short_tag
        ? profileData.short_tag.trim().toUpperCase()
        : generateDefaultShortTag(profileData.favorite_team);

      const slug = profileData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString(36);

      const { data: newPlayer, error: createError } = await supabase
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

      const { data: updatedPlayer, error: updateError } = await supabase
        .from("players")
        .update(updates)
        .eq("user_id", uid)
        .select("*")
        .single();

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
