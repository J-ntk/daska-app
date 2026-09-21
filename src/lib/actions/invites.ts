"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  EMAIL_RE,
  findExistingMembership,
  normalizeEmail,
} from "@/lib/memberships";
import type { LookupResult } from "@/lib/types";

/**
 * Exact-email lookup used by the invite modal. Only project owners and
 * admins can use it, and it only ever matches one full address.
 */
export async function lookupInvitee(
  projectId: string,
  rawEmail: string
): Promise<LookupResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error" };

  const email = normalizeEmail(rawEmail);
  if (!EMAIL_RE.test(email)) return { status: "invalid_email" };

  const { data: me } = await supabase
    .from("project_members")
    .select("role")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();
  if (!me || (me.role !== "owner" && me.role !== "admin")) {
    return { status: "not_allowed" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url")
    .eq("email", email)
    .maybeSingle();

  const existing = await findExistingMembership(
    supabase,
    projectId,
    email,
    profile?.id ?? null
  );
  if (existing) {
    return {
      status: existing.status === "active" ? "already_member" : "already_invited",
    };
  }

  if (!profile) return { status: "not_found" };

  return {
    status: "found",
    profile: {
      email: profile.email,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
    },
  };
}

// Accept and decline go through database functions (phase9_migration.sql)
// that only touch a pending invite belonging to the signed-in user.
export async function acceptInvite(
  memberId: string
): Promise<{ ok: true; projectId: string } | { ok: false }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { data, error } = await supabase.rpc("accept_project_invite", {
    p_member_id: memberId,
  });
  if (error || !data) return { ok: false };

  revalidatePath("/[locale]/app", "layout");
  revalidatePath("/[locale]/projects", "layout");
  return { ok: true, projectId: data as string };
}

export async function declineInvite(memberId: string): Promise<{ ok: boolean }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { data, error } = await supabase.rpc("decline_project_invite", {
    p_member_id: memberId,
  });
  if (error || !data) return { ok: false };

  revalidatePath("/[locale]/app", "layout");
  revalidatePath("/[locale]/projects", "layout");
  return { ok: true };
}