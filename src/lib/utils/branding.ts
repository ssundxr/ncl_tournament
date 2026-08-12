/**
 * Centralized branding utility.
 * Single source of truth for display name transformations.
 */
export function cleanBranding(str: string): string {
  if (!str) return "";
  let clean = str;
  if (clean.toLowerCase() === "namma football league") {
    clean = "NCL";
  }
  return clean;
}
