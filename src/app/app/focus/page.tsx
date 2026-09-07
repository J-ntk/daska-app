import { createClient } from "@/lib/supabase/server";
import FocusTimer from "@/components/FocusTimer";
import type { Task } from "@/lib/types";

export default async function FocusPage({
  searchParams,
}: {
  searchParams: { task?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("assignee_id", user.id)
    .neq("status", "done")
    .order("due_date", { ascending: true, nullsFirst: false });

  return (
    <div>
      <div className="border-b border-line pb-3 mb-5">
        <h1 className="text-lg font-display font-semibold">Focus Mode</h1>
        <p className="text-sm text-ink/50">
          Pick a task, run a timer, and the time is logged automatically.
        </p>
      </div>
      <FocusTimer tasks={(tasks as Task[]) ?? []} initialTaskId={searchParams.task} />
    </div>
  );
}