import { createClient } from "@/lib/supabase/server";
import AnalyticsCharts from "@/components/AnalyticsCharts";
import { startOfWeek, subWeeks, format, addWeeks } from "date-fns";
import { notFound } from "next/navigation";

export default async function ProjectAnalyticsPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", params.id)
    .single();
  if (!project) notFound();

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, status, assignee_id, completed_at, due_date")
    .eq("project_id", params.id);

  const { data: membersRaw } = await supabase
    .from("project_members")
    .select("user_id, profile:profiles(id, full_name, email)")
    .eq("project_id", params.id)
    .eq("status", "active");

  const allTasks = tasks ?? [];
  const members = (membersRaw ?? []) as any[];

  const weekStart = startOfWeek(subWeeks(new Date(), 7), { weekStartsOn: 1 });
  const weekly = Array.from({ length: 8 }, (_, i) => {
    const start = addWeeks(weekStart, i);
    const end = addWeeks(weekStart, i + 1);
    const count = allTasks.filter((t) => {
      if (!t.completed_at) return false;
      const d = new Date(t.completed_at);
      return d >= start && d < end;
    }).length;
    return { week: format(start, "MMM d"), completed: count };
  });

  const perMember = members.map((m) => {
    const mine = allTasks.filter((t) => t.assignee_id === m.user_id);
    return {
      name: m.profile?.full_name || m.profile?.email?.split("@")[0] || "Unknown",
      total: mine.length,
      done: mine.filter((t) => t.status === "done").length,
    };
  });

  return (
    <div>
      <div className="border-b border-line pb-4 mb-6">
        <h1 className="text-2xl font-display font-semibold">{project.name} — Analytics</h1>
      </div>
      <AnalyticsCharts weekly={weekly} perMember={perMember} />
    </div>
  );
}