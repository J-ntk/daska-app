import { createClient } from "@/lib/supabase/server";
import WeekDayColumn from "@/components/WeekDayColumn";
import { startOfWeek, addDays, format, isSameDay } from "date-fns";
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
  const today = new Date();

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

      <p className="text-xs text-ink/40 mb-3 lg:hidden">Swipe to see other days.</p>
      <p className="text-xs text-ink/40 mb-3 hidden lg:block">
        Drag a task onto another day to reschedule it.
      </p>

      {/* One day dominates the screen and snaps into place while swiping,
          all the way up to a genuinely wide (1024px+) screen — 7 columns
          don't have room to breathe on a tablet or a modest laptop window,
          so the single-card view stays until there's real space for the
          full week grid. */}
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory lg:grid lg:grid-cols-7 lg:overflow-visible -mx-5 px-5 lg:mx-0 lg:px-0 pb-2">
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className="w-[86vw] max-w-sm shrink-0 snap-center lg:w-auto lg:max-w-none lg:shrink"
          >
            <WeekDayColumn
              dateLabel={format(day, "EEE d")}
              dateValue={format(day, "yyyy-MM-dd")}
              tasks={byDay(day) as Task[]}
              isToday={isSameDay(day, today)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}