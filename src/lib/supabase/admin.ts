import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * SERVER-ONLY. Uses the service role key, which bypasses Row Level
 * Security. Never import this file from a "use client" component, and
 * never expose SUPABASE_SERVICE_ROLE_KEY to the browser (note it does
 * NOT have the NEXT_PUBLIC_ prefix, so Next.js keeps it server-side).
 *
 * Used only for supabase.auth.admin.* calls, like sending invite emails.
 */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return null;

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
