"use client";

import { useTransition } from "react";
import { setTaskStatus, deleteTask } from "@/lib/actions/tasks";
import { syncTaskToCalendar } from "@/lib/actions/calendar";
import type { Task } from "@/lib/types";

const priorityColor: Record<string, string> = {
  low: "text-inkMuted",
  medium: "text-ink/60",
  high: "text-amber-400",
  urgent: "text-red-400",
};

export default function TaskRow({
  task,
  projectName,
}: {
  task: Task;
  projectName?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const done = task.status === "done";

  function toggle() {
    startTransition(() => setTaskStatus(task.id, done ? "todo" : "done"));
  }

  function remove() {
    startTransition(() => deleteTask(task.id));
  }

  function sync() {
    startTransition(async () => {
      try {
        await syncTaskToCalendar(task.id);
      } catch (e) {
        alert(e instanceof Error ? e.message : "Couldn't sync to calendar");
      }
    });
  }

  return (
    <div
      className={`flex items-center gap-2 border border-line rounded-lg px-3 py-2 mb-1.5 bg-surface text-sm ${
        isPending ? "opacity-50" : ""
      }`}
    >
      <button
        onClick={toggle}
        aria-label="Toggle done"
        className={`w-4 h-4 rounded-md border shrink-0 ${
          done ? "bg-accent border-accent" : "border-ink/40"
        }`}
      />

      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className={`truncate ${done ? "line-through text-ink/40" : ""}`}>
          {task.title}
        </span>
        {task.priority !== "medium" && (
          <span className={`text-[10px] uppercase shrink-0 ${priorityColor[task.priority]}`}>
            {task.priority}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {projectName && (
          <span className="text-[10px] border border-line rounded-lg px-2 py-0.5 text-ink/50">
            {projectName}
          </span>
        )}
        {task.due_date && !task.google_event_id && (
          <button
            onClick={sync}
            className="text-ink/30 hover:text-accent text-xs w-5 h-5 flex items-center justify-center"
            aria-label="Sync to Google Calendar"
            title="Sync to Google Calendar"
          >
            📅
          </button>
        )}
        <button
          onClick={remove}
          className="text-ink/30 hover:text-red-400 text-xs w-5 h-5 flex items-center justify-center"
          aria-label="Delete task"
        >
          ✕
        </button>
      </div>
    </div>
  );
}