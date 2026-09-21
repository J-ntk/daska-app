"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { addDays, format } from "date-fns";
import { PROJECT_TEMPLATES } from "@/lib/templates";
import { EMAIL_RE, findExistingMembership, normalizeEmail } from "@/lib/memberships";
import type { InviteResult, Role } from "@/lib/types";

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

  // add the creator as owner in project_members
  const { error: memberError } = await supabase.from("project_members").insert({
    project_id: data.id,
    user_id: user.id,
    role: "owner",
    status: "active",
  });
  if (memberError) throw new Error(memberError.message);

  // Seed tasks from the chosen template, if any
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

  revalidatePath("/[locale]/app", "layout");
  return { id: data.id };
}

export async function inviteMember(input: {
  projectId: string;
  email: string;
  role: Role;
}): Promise<InviteResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not_authenticated" };

  const email = normalizeEmail(input.email);
  if (!EMAIL_RE.test(email)) return { ok: false, error: "invalid_email" };

  // Does this address already belong to a Daska account?
  const admin = createAdminClient();
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  const existing = await findExistingMembership(
    supabase,
    input.projectId,
    email,
    existingProfile?.id ?? null
  );
  if (existing) {
    return {
      ok: false,
      error: existing.status === "active" ? "already_member" : "already_invited",
    };
  }

  // Always pending. Existing accounts see the invite in their notifications
  // and accept or decline it; new people get it once they sign up.
  const { error } = await supabase.from("project_members").insert({
    project_id: input.projectId,
    user_id: existingProfile?.id ?? null,
    invited_email: email,
    invited_by: user.id,
    role: input.role,
    status: "pending",
  });

  if (error) return { ok: false, error: "failed", message: error.message };

  let emailSent: boolean | undefined;

  if (!existingProfile) {
    // No account yet — send a real invite email via Supabase Auth.
    // Requires SUPABASE_SERVICE_ROLE_KEY to be set (see README). If it's
    // not configured, the invite row still exists — they just won't get an
    // email and will need to sign up with this address.
    emailSent = false;
    if (admin) {
      try {
        const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
          data: { invited_to_project: input.projectId },
        });
        emailSent = !inviteError;
      } catch {
        // e.g. rate-limited or already invited — non-fatal, the
        // membership row above still grants access once they sign up.
        emailSent = false;
      }
    }
  }

  revalidatePath("/[locale]/projects", "layout");
  return { ok: true, kind: existingProfile ? "existing" : "email", emailSent };
}

export async function removeMember(projectId: string, memberId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("project_members")
    .delete()
    .eq("id", memberId);
  if (error) throw new Error(error.message);
  revalidatePath("/[locale]/projects", "layout");
}

export async function updateMemberRole(projectId: string, memberId: string, role: Role) {
  const supabase = createClient();
  const { error } = await supabase
    .from("project_members")
    .update({ role })
    .eq("id", memberId);
  if (error) throw new Error(error.message);
  revalidatePath("/[locale]/projects", "layout");
}