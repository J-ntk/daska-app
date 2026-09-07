"use server";

import { createClient } from "@/lib/supabase/server";
import { createCalendarEvent, refreshGoogleToken } from "@/lib/google";
import { revalidatePath } from "next/cache";

export async function syncTaskToCalendar(taskId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: task } = await supabase.from("tasks").select("*").eq("id", taskId).single();
  if (!task || !task.due_date) throw new Error("Task needs a due date to sync");

  const { data: integration } = await supabase
    .from("user_integrations")
    .select("*")
    .eq("user_id", user.id)
    .eq("provider", "google")
    .maybeSingle();

  if (!integration) throw new Error("Connect Google Calendar first, in Settings");

  let accessToken = integration.access_token;

  const expiresAt = integration.expires_at ? new Date(integration.expires_at) : null;
  if (expiresAt && expiresAt.getTime() < Date.now() + 60_000) {
    if (!integration.refresh_token) {
      throw new Error("Google connection expired — reconnect it in Settings");
    }
    const refreshed = await refreshGoogleToken(integration.refresh_token);
    accessToken = refreshed.access_token;
    await supabase
      .from("user_integrations")
      .update({
        access_token: refreshed.access_token,
        expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
      })
      .eq("id", integration.id);
  }

  const event = await createCalendarEvent(accessToken, {
    title: task.title,
    date: task.due_date,
    description: task.description ?? undefined,
  });

  await supabase.from("tasks").update({ google_event_id: event.id }).eq("id", taskId);

  revalidatePath("/app", "layout");
  revalidatePath("/projects", "layout");
}

export async function disconnectGoogleCalendar() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("user_integrations").delete().eq("user_id", user.id).eq("provider", "google");
  revalidatePath("/app/settings");
}