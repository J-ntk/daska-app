import { createClient } from "@/lib/supabase/server";
import QuickAddTask from "@/components/QuickAddTask";
import TaskRow from "@/components/TaskRow";
import { format } from "date-fns";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getDateFnsLocale } from "@/lib/dateLocale";
import type { Task, Project } from "@/lib/types";

export default async function DailyPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations("daily");
  const dateFnsLocale = getDateFnsLocale(locale);

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
        <h1 className="text-lg font-display font-semibold">
          {t("title", { date: format(new Date(), "EEE, MMM d", { locale: dateFnsLocale }) })}
        </h1>
      </div>

      <QuickAddTask
        horizon="daily"
        dueDate={today}
        placeholder={t("addPlaceholder")}
        allowRepeat
      />

      {overdue.length > 0 && (
        <>
          <div className="text-xs font-medium uppercase text-red-400 mb-2 mt-4">
            {t("overdue", { count: overdue.length })}
          </div>
          {overdue.map((t: any) => (
            <TaskRow key={t.id} task={t as Task} projectName={t.project?.name} />
          ))}
        </>
      )}

      <div className="text-xs font-medium uppercase text-ink/40 mb-2 mt-4">
        {t("today")}
      </div>
      {dueToday.length === 0 && noDate.length === 0 && (
        <p className="text-sm text-ink/40">{t("empty")}</p>
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
