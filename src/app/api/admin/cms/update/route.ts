import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ApiResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, content } = body;

    if (!key || !content) {
      return Response.json(
        { success: false, error: "Key and content payload are required" } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("site_content")
      .upsert({
        key,
        content,
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      return Response.json(
        { success: false, error: error.message } satisfies ApiResponse,
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: "CMS content saved successfully",
      data: data?.[0]
    } satisfies ApiResponse);
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message || "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
