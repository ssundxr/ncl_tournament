import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ApiResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, category, title, content, season_id, tournament_id } = body;

    const supabase = createAdminClient();

    if (action === "delete") {
      if (!id) {
        return Response.json(
          { success: false, error: "Rule ID required for deletion" } satisfies ApiResponse,
          { status: 400 }
        );
      }
      const { error } = await supabase.from("tournament_rules").delete().eq("id", id);
      if (error) throw error;
      return Response.json({ success: true, message: "Rule deleted" } satisfies ApiResponse);
    }

    const payload: Record<string, any> = {
      category: category || "General",
      title,
      content,
      season_id: season_id || null,
      tournament_id: tournament_id || null,
    };

    if (id) {
      payload.id = id;
    }

    const { data, error } = await supabase
      .from("tournament_rules")
      .upsert(payload)
      .select();

    if (error) throw error;

    return Response.json({
      success: true,
      message: "Tournament rule saved successfully",
      data: data?.[0],
    } satisfies ApiResponse);
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message || "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
