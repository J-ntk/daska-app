import type { createClient } from "@/lib/supabase/server";

type Db = ReturnType<typeof createClient>;

// Rejects anything that could break out of a filter string or isn't shaped like an email.
export const EMAIL_RE = /^[^\s@,()]+@[^\s@,()]+\.[^\s@,()]+$/;

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

/**
 * Finds an existing membership (active or pending) for this person in a
 * project, matching either their invited email or their user id.
 */
export async function findExistingMembership(
  db: Db,
  projectId: string,
  email: string,
  userId: string | null
): Promise<{ id: string; status: "active" | "pending" } | null> {
  const byEmail = await db
    .from("project_members")
    .select("id, status")
    .eq("project_id", projectId)
    .eq("invited_email", email)
    .limit(1);
  if (byEmail.data && byEmail.data.length > 0) {
    return byEmail.data[0] as { id: string; status: "active" | "pending" };
  }

  if (userId) {
    const byUser = await db
      .from("project_members")
      .select("id, status")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .limit(1);
    if (byUser.data && byUser.data.length > 0) {
      return byUser.data[0] as { id: string; status: "active" | "pending" };
    }
  }

  return null;
}