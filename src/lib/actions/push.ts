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