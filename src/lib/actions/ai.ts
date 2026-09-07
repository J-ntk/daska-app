"use server";

import { createClient } from "@/lib/supabase/server";
import { callAiProvider, parseSuggestedTasks, type SuggestedTask } from "@/lib/ai";
import { revalidatePath } from "next/cache";
import { addDays, format } from "date-fns";

export async function saveAiSettings(input: {
  provider: "openai_compatible" | "anthropic";
  apiKey: string;
  baseUrl?: string;
  model: string;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("user_ai_settings").upsert(
    {
      user_id: user.id,
      provider: input.provider,
      api_key: input.apiKey,
      base_url: input.baseUrl || null,
      model: input.model,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) throw new Error(error.message);
  revalidatePath("/app/settings");
}

export async function deleteAiSettings() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("user_ai_settings").delete().eq("user_id", user.id);
  revalidatePath("/app/settings");
}

export async function breakdownGoal(goal: string): Promise<SuggestedTask[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: settings } = await supabase
    .from("user_ai_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!settings) throw new Error("Connect an AI provider in Settings first");

  const raw = await callAiProvider(settings as any, goal);
  return parseSuggestedTasks(raw);
}

export async function createTasksFromBreakdown(items: SuggestedTask[]) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  if (items.length === 0) return;

  const today = new Date();
  const rows = items.map((t) => ({
    title: t.title,
    project_id: null,
    due_date: format(addDays(today, Math.max(0, t.offsetDays)), "yyyy-MM-dd"),
    horizon: t.horizon,
    priority: "medium",
    created_by: user.id,
    assignee_id: user.id,
  }));

  const { error } = await supabase.from("tasks").insert(rows);
  if (error) throw new Error(error.message);

  revalidatePath("/app", "layout");
}