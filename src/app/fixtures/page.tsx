import { redirect } from "next/navigation";
import { getActiveSeason } from "@/lib/supabase/queries";

/**
 * Legacy route /fixtures — redirects to the active season's fixtures,
 * or the most recent season if none is active.
 */
export default async function LegacyFixturesPage() {
  const season = await getActiveSeason();
  if (season) {
    redirect(`/season/${season.id}/fixtures`);
  }
  redirect("/");
}
