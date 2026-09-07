"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { addDays, format } from "date-fns";
import { PROJECT_TEMPLATES } from "@/lib/templates";
import type { Role } from "@/lib/types";

export async function createProject(input: {
  name: string;
  description?: string;
  templateId?: string;
}): Promise<{ id: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, is_founder")
    .eq("id", user.id)
    .single();

  if (!profile?.is_founder && (!profile || profile.plan === "free")) {
    const { count } = await supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", user.id);

    if ((count ?? 0) >= 1) {
      throw new Error(
        "The free plan includes 1 project. Upgrade to Pro for unlimited projects — see Billing."
      );
    }
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({ name: input.name, description: input.description ?? null, owner_id: user.id })
    .select()
    .single();

  if (error) throw new Error(error.message);

  const { error: memberError } = await supabase.from("project_members").insert({
    project_id: data.id,
    user_id: user.id,
    role: "owner",
    status: "active",
  });
  if (memberError) throw new Error(memberError.message);

  const template = PROJECT_TEMPLATES.find((t) => t.id === input.templateId);
  if (template && template.tasks.length > 0) {
    const today = new Date();
    const rows = template.tasks.map((t) => ({
      title: t.title,
      project_id: data.id,
      due_date: format(addDays(today, t.dayOffset), "yyyy-MM-dd"),
      horizon: t.horizon,
      priority: t.priority ?? "medium",
      created_by: user.id,
      assignee_id: user.id,
    }));
    await supabase.from("tasks").insert(rows);
  }

  revalidatePath("/app", "layout");
  return { id: data.id };
}

export async function inviteMember(input: {
  projectId: string;
  email: string;
  role: Role;
}) {
  const supabase = createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("name")
    .eq("id", input.projectId)
    .single();

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", input.email)
    .maybeSingle();

  const { error } = await supabase.from("project_members").insert({
    project_id: input.projectId,
    user_id: existingProfile?.id ?? null,
    invited_email: input.email,
    role: input.role,
    status: existingProfile ? "active" : "pending",
  });

  if (error) throw new Error(error.message);

  if (existingProfile) {
    await supabase.from("notifications").insert({
      user_id: existingProfile.id,
      type: "assignment",
      project_id: input.projectId,
      body: `You were added to "${project?.name ?? "a project"}"`,
    });
  } else {
    const admin = createAdminClient();
    if (admin) {
      try {
        await admin.auth.admin.inviteUserByEmail(input.email, {
          data: { invited_to_project: input.projectId },
        });
      } catch {
        // non-fatal
      }
    }
  }

  revalidatePath(`/projects/${input.projectId}`);
}

export async function removeMember(projectId: string, memberId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("project_members")
    .delete()
    .eq("id", memberId);
  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${projectId}`);
}

export async function updateMemberRole(projectId: string, memberId: string, role: Role) {
  const supabase = createClient();
  const { error } = await supabase
    .from("project_members")
    .update({ role })
    .eq("id", memberId);
  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${projectId}`);
}