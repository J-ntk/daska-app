import { createClient } from "@/lib/supabase/server";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
} from "date-fns";

const WEEKDAY_LABELS_MON_START = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKDAY_LABELS_SUN_START = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function MonthlyPage() {
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
  const weekdayLabels = weekStartsOn === 0 ? WEEKDAY_LABELS_SUN_START : WEEKDAY_LABELS_MON_START;

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const gridStart = startOfWeek(monthStart, { weekStartsOn });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, due_date")
    .eq("assignee_id", user.id)
    .gte("due_date", format(gridStart, "yyyy-MM-dd"))
    .lte("due_date", format(gridEnd, "yyyy-MM-dd"));

  const countFor = (day: Date) =>
    (tasks ?? []).filter((t: any) => t.due_date === format(day, "yyyy-MM-dd")).length;

  return (
    <div>
      <div className="flex items-center justify-between border-b border-line pb-3 mb-5">
        <h1 className="text-lg font-display font-semibold">{format(now, "MMMM yyyy")}</h1>
      </div>

      <div className="grid grid-cols-7 border-t border-l border-line">
        {weekdayLabels.map((d) => (
          <div
            key={d}
            className="border-r border-b border-line bg-ink/5 text-[10px] font-medium uppercase text-ink/50 px-2 py-1"
          >
            {d}
          </div>
        ))}
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className={`border-r border-b border-line min-h-[56px] sm:min-h-[80px] p-1 sm:p-1.5 text-xs ${
              isSameMonth(day, now) ? "bg-surface" : "bg-ink/[0.02] text-ink/30"
            }`}
          >
            <div
              className={`text-[11px] mb-1 inline-flex items-center justify-center w-5 h-5 rounded-full ${
                isToday(day) ? "bg-accent text-white font-semibold" : ""
              }`}
            >
              {format(day, "d")}
            </div>
            {countFor(day) > 0 && (
              <div className="flex flex-wrap gap-0.5">
                {Array.from({ length: Math.min(countFor(day), 4) }).map((_, i) => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}