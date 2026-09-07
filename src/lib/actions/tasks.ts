"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { addDays, addWeeks, addMonths, format } from "date-fns";
import type { Horizon, Priority } from "@/lib/types";

export type RecurrenceRule = "daily" | "weekly" | "monthly" | null;

export async function createTask(input: {
  title: string;
  projectId?: string | null;
  dueDate?: string | null;
  horizon?: Horizon;
  priority?: Priority;
  quarter?: string | null;
  recurrenceRule?: RecurrenceRule;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("tasks").insert({
    title: input.title,
    project_id: input.projectId ?? null,
    due_date: input.dueDate ?? null,
    horizon: input.horizon ?? "daily",
    priority: input.priority ?? "medium",
    quarter: input.quarter ?? null,
    recurrence_rule: input.recurrenceRule ?? null,
    created_by: user.id,
    assignee_id: user.id,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/app", "layout");
  if (input.projectId) revalidatePath(`/projects/${input.projectId}`);
}

function nextDueDate(current: string, rule: string): string {
  const date = new Date(current);
  if (rule === "daily") return format(addDays(date, 1), "yyyy-MM-dd");
  if (rule === "weekly") return format(addWeeks(date, 1), "yyyy-MM-dd");
  return format(addMonths(date, 1), "yyyy-MM-dd");
}

export async function setTaskStatus(taskId: string, status: "todo" | "in_progress" | "done") {
  const supabase = createClient();

  const { data: task } = await supabase.from("tasks").select("*").eq("id", taskId).single();

  const { error } = await supabase
    .from("tasks")
    .update({
      status,
      completed_at: status === "done" ? new Date().toISOString() : null,
    })
    .eq("id", taskId);

  if (error) throw new Error(error.message);

  if (status === "done" && task?.recurrence_rule && task?.due_date) {
    await supabase.from("tasks").insert({
      title: task.title,
      project_id: task.project_id,
      due_date: nextDueDate(task.due_date, task.recurrence_rule),
      horizon: task.horizon,
      priority: task.priority,
      recurrence_rule: task.recurrence_rule,
      created_by: task.created_by,
      assignee_id: task.assignee_id,
    });
  }

  revalidatePath("/app", "layout");
  revalidatePath("/projects", "layout");
}

export async function moveTaskDate(taskId: string, newDate: string) {
  const supabase = createClient();
  const { error } = await supabase.from("tasks").update({ due_date: newDate }).eq("id", taskId);
  if (error) throw new Error(error.message);
  revalidatePath("/app", "layout");
}

export async function deleteTask(taskId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) throw new Error(error.message);
  revalidatePath("/app", "layout");
  revalidatePath("/projects", "layout");
}