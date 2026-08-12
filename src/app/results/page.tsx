import { redirect } from "next/navigation";
import { getActiveSeason } from "@/lib/supabase/queries";

/**
 * Legacy route /results — redirects to the active season's results.
 */
export default async function LegacyResultsPage() {
  const season = await getActiveSeason();
  if (season) {
    redirect(`/season/${season.id}/results`);
  }
  redirect("/");
}
