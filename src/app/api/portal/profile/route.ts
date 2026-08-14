import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const profileSchema = z.object({
  uid: z.string().min(1),
  action: z.enum(["get", "create"]),
  profileData: z
    .object({
      name: z.string(),
      phone: z.string(),
      favorite_team: z.string(),
      bio: z.string().optional(),
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
      // Fetch player by user_id
      const { data: player, error } = await supabase
        .from("players")
        .select("*")
        .eq("user_id", uid)
        .single();

      if (error && error.code !== "PGRST116") {
        return Response.json({ success: false, error: error.message }, { status: 500 });
      }

      return Response.json({ success: true, data: player || null });
    }

    if (action === "create") {
      if (!profileData) {
        return Response.json({ success: false, error: "Missing profile data" }, { status: 400 });
      }

      // Check if user already exists
      const { data: existing } = await supabase
        .from("players")
        .select("id")
        .eq("user_id", uid)
        .single();

      if (existing) {
        return Response.json({ success: false, error: "Profile already exists" }, { status: 400 });
      }

      // Generate slug
      const { data: slugResult } = await supabase.rpc("generate_unique_slug", {
        p_name: profileData.name,
      });

      const slug = slugResult || profileData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();

      // Create new player profile
      const { data: newPlayer, error: createError } = await supabase
        .from("players")
        .insert({
          user_id: uid,
          name: profileData.name,
          slug,
          favorite_team: profileData.favorite_team,
          bio: profileData.bio || "",
          overall_rating: 70, // default rating
        })
        .select("*")
        .single();

      if (createError) {
        return Response.json({ success: false, error: createError.message }, { status: 500 });
      }

      return Response.json({ success: true, data: newPlayer });
    }

    return Response.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
