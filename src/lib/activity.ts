import { supabase } from "@/lib/supabase/client";

/**
 * Fire-and-forget activity logger.
 * Logs an action for the current player to `player_activity_log`.
 * 
 * Usage:
 *   logActivity("enroll", { season_id: "xxx" });
 *   logActivity("tag_download", { format: "png" });
 *   logActivity("profile_update", { fields: ["name", "short_tag"] });
 */
export function logActivity(
  action: string,
  metadata: Record<string, any> = {},
  playerId?: string
) {
  if (!playerId) return; // Can't log without a player

  // Fire-and-forget — don't await, don't block UI
  supabase
    .from("player_activity_log")
    .insert({
      player_id: playerId,
      action,
      metadata,
    })
    .then(({ error }) => {
      if (error) console.warn("[Activity Log]", error.message);
    });
}
