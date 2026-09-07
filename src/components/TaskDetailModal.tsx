"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { addComment } from "@/lib/actions/comments";
import { createClient } from "@/lib/supabase/client";
import type { Comment, Task } from "@/lib/types";

export default function TaskDetailModal({
  task,
  projectId,
  memberHints,
  trigger,
}: {
  task: Task;
  projectId: string | null;
  memberHints?: string[];
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [body, setBody] = useState("");
  const [totalTrackedSeconds, setTotalTrackedSeconds] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const supabase = createClient();

  async function openModal() {
    setOpen(true);
    if (!loaded) {
      const [{ data: commentData }, { data: entries }] = await Promise.all([
        supabase
          .from("comments")
          .select("*, profile:profiles(*)")
          .eq("task_id", task.id)
          .order("created_at", { ascending: true }),
        supabase.from("time_entries").select("duration_seconds").eq("task_id", task.id),
      ]);
      setComments((commentData as unknown as Comment[]) ?? []);
      setTotalTrackedSeconds(
        (entries ?? []).reduce((sum: number, e: any) => sum + e.duration_seconds, 0)
      );
      setLoaded(true);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    const value = body;
    setBody("");
    startTransition(async () => {
      const newComment = await addComment({ taskId: task.id, projectId, body: value });
      if (newComment) setComments((c) => [...c, newComment as unknown as Comment]);
    });
  }

  const trackedLabel =
    totalTrackedSeconds && totalTrackedSeconds > 0
      ? `${Math.round(totalTrackedSeconds / 60)} min tracked`
      : null;

  return (
    <>
      <span onClick={openModal} className="cursor-pointer">
        {trigger}
      </span>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-surface border border-line rounded-lg p-5 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-sm font-semibold pr-4">{task.title}</h3>
              <button onClick={() => setOpen(false)} className="text-ink/40 text-sm shrink-0">
                ✕
              </button>
            </div>
            {task.description && (
              <p className="text-xs text-ink/50 mb-2">{task.description}</p>
            )}

            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-ink/50">{trackedLabel ?? "No time tracked yet"}</span>
              <Link
                href={`/app/focus?task=${task.id}`}
                className="text-xs border border-line rounded-lg px-2.5 py-1"
              >
                Focus on this
              </Link>
            </div>

            <div className="text-xs font-medium uppercase text-ink/40 mb-2 mt-1">
              Comments
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 mb-3 min-h-[80px]">
              {loaded && comments.length === 0 && (
                <p className="text-xs text-ink/30">No comments yet.</p>
              )}
              {comments.map((c) => (
                <div key={c.id} className="text-sm border border-line rounded-lg p-2">
                  <div className="text-[11px] text-ink/50 mb-0.5">
                    {c.profile?.full_name || c.profile?.email || "Someone"}
                  </div>
                  {c.body}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={
                  memberHints && memberHints.length > 0
                    ? `Write a comment… try @${memberHints[0]} to notify someone`
                    : "Write a comment…"
                }
                rows={2}
                className="w-full border border-line rounded-lg px-3 py-2 text-sm mb-2"
              />
              <button
                type="submit"
                disabled={isPending || !body.trim()}
                className="bg-gradient-to-b from-accentLight to-accent text-white rounded-lg shadow-glow hover:brightness-110 transition-[filter] px-3 py-1.5 text-xs font-medium disabled:opacity-50"
              >
                {isPending ? "Posting…" : "Post comment"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}