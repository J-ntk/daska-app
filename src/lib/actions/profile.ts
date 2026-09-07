"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(input: {
  fullName: string;
  jobTitle: string;
  timezone: string;
  defaultView: string;
  weekStart: string;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: input.fullName || null,
      job_title: input.jobTitle || null,
      timezone: input.timezone || null,
      default_view: input.defaultView,
      week_start: input.weekStart,
    })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/app/settings");
}

export async function changeEmail(newEmail: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ email: newEmail });
  if (error) throw new Error(error.message);
}

export async function changePassword(newPassword: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}