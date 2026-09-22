"use server";

import { createClient } from "@/lib/supabase/server";

export async function registerPushToken(token: string, platform: string = "android") {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { error } = await supabase.rpc("register_push_token", {
    p_token: token,
    p_platform: platform,
  });

  return { ok: !error };
}

export async function unregisterPushToken(token: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  // RLS (see phase12_migration.sql) already restricts this to the
  // signed-in user's own tokens; the .eq is belt-and-braces.
  const { error } = await supabase
    .from("device_push_tokens")
    .delete()
    .eq("user_id", user.id)
    .eq("token", token);

  return { ok: !error };
}