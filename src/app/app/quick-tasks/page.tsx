import { createClient } from "@/lib/supabase/server";
import QuickAddTask from "@/components/QuickAddTask";
import TaskRow from "@/components/TaskRow";
import type { Task } from "@/lib/types";

export default async function QuickTasksPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("assignee_id", user.id)
    .eq("horizon", "anytime")
    .order("created_at", { ascending: false });

  const open = (tasks ?? []).filter((t: any) => t.status !== "done");
  const done = (tasks ?? []).filter((t: any) => t.status === "done");

  return (
    <div>
      <div className="border-b border-line pb-3 mb-5">
        <h1 className="text-lg font-display font-semibold">Quick Tasks</h1>
        <p className="text-sm text-ink/50">
          Errands and one-offs — grocery run, call someone, copy documents.
          No day attached, just check them off whenever.
        </p>
      </div>

      <QuickAddTask
        horizon="anytime"
        placeholder="Add an errand… e.g. Buy groceries"
      />

      {open.length === 0 && (
        <p className="text-sm text-ink/40 mt-4">Nothing on your list.</p>
      )}
      {open.map((t: any) => (
        <TaskRow key={t.id} task={t as Task} />
      ))}

      {done.length > 0 && (
        <>
          <div className="text-xs font-medium uppercase text-ink/40 mb-2 mt-6">
            Done
          </div>
          {done.map((t: any) => (
            <TaskRow key={t.id} task={t as Task} />
          ))}
        </>
      )}
    </div>
  );
}