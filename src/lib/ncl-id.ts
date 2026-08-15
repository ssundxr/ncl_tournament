import { Player } from "@/types";

/**
 * Generates a unique NCL ID format: NCL-XXXXX
 * (5 uppercase alphanumeric characters)
 */
export function generateNclId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "NCL-";
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generates a 3-letter uppercase default short tag from name or team.
 * Examples: "Shyam Sundar" -> "SSD", "Mathew" -> "MTW", "Independent" -> "IND"
 */
export function generateDefaultShortTag(nameOrTeam?: string | null): string {
  if (!nameOrTeam || !nameOrTeam.trim()) return "IND";
  
  const clean = nameOrTeam.trim().toUpperCase().replace(/[^A-Z0-9\s]/g, "");
  const words = clean.split(/\s+/).filter(Boolean);

  if (words.length >= 3) {
    return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
  } else if (words.length === 2) {
    return (words[0][0] + words[1].substring(0, 2)).toUpperCase();
  } else if (clean.length >= 3) {
    return clean.substring(0, 3).toUpperCase();
  }

  return (clean + "IND").substring(0, 3).toUpperCase();
}

/**
 * Ensures player object has ncl_id and short_tag set.
 * Returns safe player data with defaults.
 */
export function ensurePlayerNclId<T extends Partial<Player>>(player: T): T & { ncl_id: string; short_tag: string } {
  const ncl_id = player.ncl_id || (player.id ? `NCL-${player.id.substring(0, 5).toUpperCase()}` : generateNclId());
  const short_tag = player.short_tag || generateDefaultShortTag(player.favorite_team || player.name);

  return {
    ...player,
    ncl_id,
    short_tag,
  };
}
