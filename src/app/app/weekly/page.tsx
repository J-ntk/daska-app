import { createClient } from "@/lib/supabase/server";
import WeekDayColumn from "@/components/WeekDayColumn";
import { startOfWeek, addDays, format } from "date-fns";
import type { Task } from "@/lib/types";

export default async function WeeklyPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("week_start")
    .eq("id", user.id)
    .maybeSingle();
  const weekStartsOn = profile?.week_start === "sunday" ? 0 : 1;

  const start = startOfWeek(new Date(), { weekStartsOn });
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const rangeStart = format(days[0], "yyyy-MM-dd");
  const rangeEnd = format(days[6], "yyyy-MM-dd");

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, project:projects(id, name)")
    .eq("assignee_id", user.id)
    .gte("due_date", rangeStart)
    .lte("due_date", rangeEnd);

  const byDay = (date: Date) => {
    const key = format(date, "yyyy-MM-dd");
    return (tasks ?? []).filter((t: any) => t.due_date === key);
  };

  return (
    <div>
      <div className="flex items-center justify-between border-b border-line pb-3 mb-5">
        <h1 className="text-lg font-display font-semibold">
          Week of {format(days[0], "MMM d")} – {format(days[6], "MMM d")}
        </h1>
      </div>

      <p className="text-xs text-ink/40 mb-3">Drag a task onto another day to reschedule it.</p>

      <div className="flex gap-2 overflow-x-auto md:grid md:grid-cols-7 md:overflow-visible -mx-5 px-5 md:mx-0 md:px-0">
        {days.map((day) => (
          <div key={day.toISOString()} className="min-w-[150px] md:min-w-0">
            <WeekDayColumn
              dateLabel={format(day, "EEE d")}
              dateValue={format(day, "yyyy-MM-dd")}
              tasks={byDay(day) as Task[]}
            />
          </div>
        ))}
      </div>
    </div>
  );
}