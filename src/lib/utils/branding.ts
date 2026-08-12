/**
 * Centralized branding utility.
 * Single source of truth for display name transformations.
 */
export function cleanBranding(str: string): string {
  if (!str) return "";
  return str
    .replace(/Namma Champions League/gi, "Namma Football League")
    .replace(/\bNCL\b/g, "NFL");
}
