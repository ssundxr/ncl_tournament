import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ApiResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, name, role, photo_url, bio, email, whatsapp_number } = body;

    const supabase = createAdminClient();

    if (action === "delete") {
      if (!id) {
        return Response.json(
          { success: false, error: "Organizer ID required for deletion" } satisfies ApiResponse,
          { status: 400 }
        );
      }
      const { error } = await supabase.from("organizers").delete().eq("id", id);
      if (error) throw error;
      return Response.json({ success: true, message: "Organizer deleted" } satisfies ApiResponse);
    }

    const payload: Record<string, any> = {
      name,
      role: role || "Organizer",
      photo_url: photo_url || null,
      bio: bio || null,
      email: email || null,
      whatsapp_number: whatsapp_number || null,
    };

    if (id) {
      payload.id = id;
    }

    const { data, error } = await supabase
      .from("organizers")
      .upsert(payload)
      .select();

    if (error) throw error;

    return Response.json({
      success: true,
      message: "Organizer saved successfully",
      data: data?.[0],
    } satisfies ApiResponse);
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message || "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
