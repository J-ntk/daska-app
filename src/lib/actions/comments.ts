"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Matches @token — token can contain letters, numbers, dots, underscores
const MENTION_REGEX = /@([a-zA-Z0-9._]+)/g;

export async function addComment(input: {
  taskId: string;
  projectId: string | null;
  body: string;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: comment, error } = await supabase
    .from("comments")
    .insert({ task_id: input.taskId, user_id: user.id, body: input.body })
    .select("*, profile:profiles(*)")
    .single();

  if (error) throw new Error(error.message);

  // Resolve @mentions against this project's members and notify them
  if (input.projectId) {
    const mentionedTokens = Array.from(
      input.body.matchAll(MENTION_REGEX),
      (m) => m[1].toLowerCase()
    );

    if (mentionedTokens.length > 0) {
      const { data: members } = await supabase
        .from("project_members")
        .select("user_id, profile:profiles(id, full_name, email)")
        .eq("project_id", input.projectId)
        .eq("status", "active");

      const matched = (members ?? []).filter((m: any) => {
        if (!m.profile) return false;
        const nameKey = (m.profile.full_name || "").replace(/\s+/g, "").toLowerCase();
        const emailKey = (m.profile.email || "").split("@")[0].toLowerCase();
        return mentionedTokens.some((t) => t === nameKey || t === emailKey);
      });

      for (const m of matched) {
        if (m.user_id === user.id) continue; // don't notify yourself
        await supabase.from("notifications").insert({
          user_id: m.user_id,
          type: "mention",
          project_id: input.projectId,
          task_id: input.taskId,
          body: `mentioned you in a comment: "${input.body.slice(0, 80)}"`,
        });
      }
    }
  }

  revalidatePath(`/projects/${input.projectId}`);
  return comment;
}
