import { createClient } from "@/lib/supabase/server";
import KanbanBoard from "@/components/KanbanBoard";
import InviteModal from "@/components/InviteModal";
import QuickAddTask from "@/components/QuickAddTask";
import type { Task, ProjectMember } from "@/lib/types";
import { notFound } from "next/navigation";

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!project) notFound();

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", params.id)
    .order("created_at", { ascending: false });

  const { data: membersRaw } = await supabase
    .from("project_members")
    .select("*, profile:profiles(*)")
    .eq("project_id", params.id);

  const members = (membersRaw ?? []) as unknown as ProjectMember[];
  const allTasks = (tasks ?? []) as Task[];
  const total = allTasks.length;
  const done = allTasks.filter((t) => t.status === "done").length;
  const overdue = allTasks.filter(
    (t) => t.due_date && t.due_date < new Date().toISOString().slice(0, 10) && t.status !== "done"
  ).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const memberHints = members
    .map((m) =>
      (m.profile?.full_name || m.profile?.email || m.invited_email || "")
        .split("@")[0]
        .replace(/\s+/g, "")
        .toLowerCase()
    )
    .filter(Boolean);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4 mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-inkMuted mt-1">{project.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={`/projects/${project.id}/analytics`}
            className="bg-surfaceHover border border-line rounded-lg px-4 py-2 text-sm font-medium hover:border-accent transition-colors"
          >
            Analytics
          </a>
          <InviteModal projectId={project.id} members={members} />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Stat label="Complete" value={`${pct}%`} />
        <Stat label="Open tasks" value={String(total - done)} />
        <Stat label="Overdue" value={String(overdue)} />
        <Stat label="Members" value={String(members.length)} />
      </div>

      <div className="mb-4">
        <QuickAddTask
          horizon="daily"
          projectId={project.id}
          placeholder="Add a task to this project…"
        />
      </div>

      <KanbanBoard tasks={allTasks} projectId={project.id} memberHints={memberHints} />

      <div className="mt-6">
        <div className="text-xs font-medium uppercase text-ink/40 mb-2">Members</div>
        <div className="flex gap-2 flex-wrap">
          {members.map((m) => (
            <span
              key={m.id}
              className="text-xs border border-line rounded-full px-3 py-1 bg-surface"
            >
              {(m.profile?.full_name || m.profile?.email || m.invited_email || "?")
                .slice(0, 2)
                .toUpperCase()}{" "}
              · {m.role}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line rounded-lg p-3 text-center bg-surface">
      <div className="text-xl font-semibold">{value}</div>
      <div className="text-[10px] uppercase text-ink/40">{label}</div>
    </div>
  );
}