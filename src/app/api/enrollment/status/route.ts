import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ApiResponse } from "@/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const season_id = searchParams.get("season_id");
  const phone = searchParams.get("phone");

  if (!season_id || !phone) {
    return Response.json(
      { success: false, error: "Missing parameters" } satisfies ApiResponse,
      { status: 400 }
    );
  }

  try {
    const supabase = createAdminClient();
    const { data: enrollment, error } = await supabase
      .from("season_enrollments")
      .select("status, payment_status, rejection_reason, created_at, player:players(name)")
      .eq("season_id", season_id)
      .eq("phone", phone)
      .maybeSingle();

    if (error) throw error;

    if (!enrollment) {
      return Response.json(
        { success: false, error: "No registration found for this number." } satisfies ApiResponse,
        { status: 404 }
      );
    }

    return Response.json(
      { success: true, data: enrollment } satisfies ApiResponse,
      { status: 200 }
    );
  } catch (err: any) {
    return Response.json(
      { success: false, error: "An error occurred fetching status." } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
