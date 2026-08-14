import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client for admin-only server operations.
 * Bypasses RLS — NEVER expose this to the browser.
 * Used for: enrollment approval, fixture generation, standings recalculation.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Admin operations require the service role key."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
