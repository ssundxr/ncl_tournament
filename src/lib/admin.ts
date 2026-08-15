export const DEFAULT_ADMIN_EMAILS = [
  "ashwinfejl102@gmail.com",
  "ashwinfejl357@gmail.com",
  "shyamsundxr@gmail.com"
];

/**
 * Returns the list of authorized admin email addresses.
 * Safely handles environment variable parsing (strips outer quotes and whitespace)
 * and falls back to/combines default admin emails so admins are never locked out.
 */
export function getAdminEmails(): string[] {
  const envEmailsRaw = process.env.NEXT_PUBLIC_ADMIN_EMAILS;
  let parsed: string[] = [];

  if (envEmailsRaw) {
    parsed = envEmailsRaw
      .split(",")
      .map((e) => e.trim().replace(/^["']|["']$/g, "").toLowerCase())
      .filter(Boolean);
  }

  // Combine default admin emails with environment configured emails to guarantee access
  const defaultEmails = DEFAULT_ADMIN_EMAILS.map((e) => e.toLowerCase());
  const combined = Array.from(new Set([...defaultEmails, ...parsed]));
  
  return combined;
}

/**
 * Checks whether a given email address belongs to an authorized admin.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const adminEmails = getAdminEmails();
  return adminEmails.includes(email.trim().toLowerCase());
}
