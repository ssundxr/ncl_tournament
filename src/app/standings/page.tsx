import { redirect } from "next/navigation";
import { getActiveSeason } from "@/lib/supabase/queries";

/**
 * Legacy route /standings — redirects to the active season's standings.
 */
export default async function LegacyStandingsPage() {
  const season = await getActiveSeason();
  if (season) {
    redirect(`/season/${season.id}/standings`);
  }
  redirect("/");
}
