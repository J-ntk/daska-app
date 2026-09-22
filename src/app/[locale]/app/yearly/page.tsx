import { createClient } from "@/lib/supabase/server";
import QuickAddTask from "@/components/QuickAddTask";
import TaskRow from "@/components/TaskRow";
import AiBreakdownModal from "@/components/AiBreakdownModal";
import type { Task } from "@/lib/types";

const YEAR = new Date().getFullYear();
const QUARTERS = [`Q1-${YEAR}`, `Q2-${YEAR}`, `Q3-${YEAR}`, `Q4-${YEAR}`];

export default async function YearlyPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("assignee_id", user.id)
    .eq("horizon", "yearly");

  const byQuarter = (q: string) => (tasks ?? []).filter((t: any) => t.quarter === q);

  return (
    <div>
      <div className="flex items-center justify-between border-b border-line pb-3 mb-5">
        <h1 className="text-lg font-display font-semibold">{YEAR} Goals</h1>
        <AiBreakdownModal
          trigger={
            <span className="border border-line rounded-lg px-3 py-1.5 text-xs font-medium">
              AI Breakdown
            </span>
          }
        />
      </div>

      {/* Full width on phones, 2-up once there's real tablet width (a pair
          of quarters side by side is comfortable well before a laptop-wide
          screen), 4-up only once there's genuinely enough room for all of
          them at once. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {QUARTERS.map((q) => {
          const items = byQuarter(q);
          const done = items.filter((t: any) => t.status === "done").length;
          return (
            <div key={q} className="border border-line rounded-lg corner-fix p-4 bg-surface">
              <div className="text-sm font-semibold mb-3">
                {q.split("-")[0]}
                {items.length > 0 && (
                  <span className="text-ink/40 font-normal">
                    {" "}
                    · {done}/{items.length}
                  </span>
                )}
              </div>
              <QuickAddTask horizon="yearly" quarter={q} placeholder="Add a goal…" />
              {items.length === 0 ? (
                <p className="text-xs text-ink/30 mt-2">No goals yet for this quarter.</p>
              ) : (
                <div className="mt-1">
                  {items.map((t: any) => (
                    <TaskRow key={t.id} task={t as Task} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}