"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function logTimeEntry(taskId: string, durationSeconds: number) {
  if (!taskId || durationSeconds < 1) return;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const endedAt = new Date();
  const startedAt = new Date(endedAt.getTime() - durationSeconds * 1000);

  const { error } = await supabase.from("time_entries").insert({
    task_id: taskId,
    user_id: user.id,
    started_at: startedAt.toISOString(),
    ended_at: endedAt.toISOString(),
    duration_seconds: Math.round(durationSeconds),
  });

  if (error) throw new Error(error.message);

  revalidatePath("/app/focus");
  revalidatePath("/projects", "layout");
}