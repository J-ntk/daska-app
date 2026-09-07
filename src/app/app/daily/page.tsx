import { createClient } from "@/lib/supabase/server";
import QuickAddTask from "@/components/QuickAddTask";
import TaskRow from "@/components/TaskRow";
import { format } from "date-fns";
import type { Task, Project } from "@/lib/types";

export default async function DailyPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const today = format(new Date(), "yyyy-MM-dd");

  // Personal tasks + tasks assigned to me in any project, due today or overdue
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, project:projects(id, name)")
    .eq("assignee_id", user.id)
    .neq("status", "done")
    .lte("due_date", today)
    .order("due_date", { ascending: true });

  const { data: todayNoDate } = await supabase
    .from("tasks")
    .select("*, project:projects(id, name)")
    .eq("assignee_id", user.id)
    .eq("horizon", "daily")
    .is("due_date", null)
    .neq("status", "done");

  const overdue = (tasks ?? []).filter((t: any) => t.due_date && t.due_date < today);
  const dueToday = (tasks ?? []).filter((t: any) => t.due_date === today);
  const noDate = todayNoDate ?? [];

  return (
    <div>
      <div className="flex items-center justify-between border-b border-line pb-3 mb-5">
        <h1 className="text-lg font-semibold">
          Today — {format(new Date(), "EEE, MMM d")}
        </h1>
      </div>

      <QuickAddTask
        horizon="daily"
        dueDate={today}
        placeholder="Add a task for today…"
        allowRepeat
      />

      {overdue.length > 0 && (
        <>
          <div className="text-xs font-medium uppercase text-red-700 mb-2 mt-4">
            Overdue ({overdue.length})
          </div>
          {overdue.map((t: any) => (
            <TaskRow key={t.id} task={t as Task} projectName={t.project?.name} />
          ))}
        </>
      )}

      <div className="text-xs font-medium uppercase text-ink/40 mb-2 mt-4">
        Today
      </div>
      {dueToday.length === 0 && noDate.length === 0 && (
        <p className="text-sm text-ink/40">Nothing due today. Add something above.</p>
      )}
      {dueToday.map((t: any) => (
        <TaskRow key={t.id} task={t as Task} projectName={t.project?.name} />
      ))}
      {noDate.map((t: any) => (
        <TaskRow key={t.id} task={t as Task} projectName={t.project?.name} />
      ))}
    </div>
  );
}
