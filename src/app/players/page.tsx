import { redirect } from "next/navigation";
import { getActiveSeason } from "@/lib/supabase/queries";

/**
 * Legacy route /players — redirects to the active season's players.
 */
export default async function LegacyPlayersPage() {
  const season = await getActiveSeason();
  if (season) {
    redirect(`/season/${season.id}/players`);
  }
  redirect("/");
}
