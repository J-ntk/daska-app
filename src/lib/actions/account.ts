"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function deleteAccount(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  // Deleting an account whose projects have other members would strand
  // those members' access — projects.owner_id cascades, so leaving this
  // unguarded would silently delete the whole project out from under
  // everyone else on it.
  const { count: ownedProjects } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", user.id);

  if ((ownedProjects ?? 0) > 0) {
    return {
      ok: false,
      error:
        "You still own one or more projects. Delete them, or transfer ownership to someone else, before deleting your account.",
    };
  }

  const admin = createAdminClient();
  if (!admin) {
    return { ok: false, error: "Account deletion isn't available right now. Try again later." };
  }

  // profiles.id has no foreign key to auth.users — deleting the auth user
  // alone would remove their login but leave the profiles row (and
  // everything that cascades from it: tasks, comments, notifications,
  // etc.) untouched forever. Delete profiles explicitly so those cascades
  // actually fire. RLS has no delete policy on profiles at all, so this
  // has to go through the admin client, not the user's own session.

  // profiles.referred_by is NO ACTION: if this person referred anyone,
  // deleting their profile fails outright unless that reference is
  // cleared first. Nulling it is safe — it only clears the "who invited
  // them" history on the other person's row, their referral credits
  // (a separate table) are unaffected.
  const { error: clearReferralsError } = await admin
    .from("profiles")
    .update({ referred_by: null })
    .eq("referred_by", user.id);
  if (clearReferralsError) {
    return { ok: false, error: clearReferralsError.message };
  }

  const { error: profileDeleteError } = await admin
    .from("profiles")
    .delete()
    .eq("id", user.id);
  if (profileDeleteError) {
    return { ok: false, error: profileDeleteError.message };
  }

  const { error: authDeleteError } = await admin.auth.admin.deleteUser(user.id);
  if (authDeleteError) {
    return { ok: false, error: authDeleteError.message };
  }

  return { ok: true };
}