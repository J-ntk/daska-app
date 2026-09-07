"use client";

import { useState, useTransition } from "react";
import { setTaskStatus, deleteTask } from "@/lib/actions/tasks";
import TaskDetailModal from "@/components/TaskDetailModal";
import type { Task, TaskStatus } from "@/lib/types";

const columns: { key: TaskStatus; label: string }[] = [
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "done", label: "Done" },
];

export default function KanbanBoard({
  tasks,
  projectId,
  memberHints,
}: {
  tasks: Task[];
  projectId: string;
  memberHints: string[];
}) {
  const [isPending, startTransition] = useTransition();
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);

  function handleDrop(status: TaskStatus, e: React.DragEvent) {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData("text/task-id");
    if (!taskId) return;
    startTransition(() => setTaskStatus(taskId, status));
  }

  return (
    <div className="flex gap-3 overflow-x-auto md:grid md:grid-cols-3 md:overflow-visible -mx-5 px-5 md:mx-0 md:px-0">
      {columns.map((col) => {
        const items = tasks.filter((t) => t.status === col.key);
        return (
          <div
            key={col.key}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverCol(col.key);
            }}
            onDragLeave={() => setDragOverCol((c) => (c === col.key ? null : c))}
            onDrop={(e) => handleDrop(col.key, e)}
            className={`min-w-[260px] md:min-w-0 border rounded-lg p-2.5 bg-surface transition-colors ${
              dragOverCol === col.key ? "border-accent bg-accent/5" : "border-line"
            }`}
          >
            <div className="flex justify-between items-center text-xs font-semibold border-b border-line pb-2 mb-2">
              <span>{col.label}</span>
              <span className="text-ink/40">{items.length}</span>
            </div>
            {items.map((t) => (
              <div
                key={t.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/task-id", t.id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                className={`border border-line rounded-lg p-2 mb-2 text-sm bg-surface cursor-grab active:cursor-grabbing ${
                  isPending ? "opacity-50" : ""
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <TaskDetailModal
                    task={t}
                    projectId={projectId}
                    memberHints={memberHints}
                    trigger={<span className="hover:underline">{t.title}</span>}
                  />
                  <button
                    onClick={() => startTransition(() => deleteTask(t.id))}
                    className="text-ink/30 hover:text-red-400 text-xs shrink-0"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex justify-between items-center mt-2 text-[10px] text-ink/50">
                  <span>{t.due_date ?? "No due date"}</span>
                  <select
                    value={t.status}
                    onChange={(e) =>
                      startTransition(() =>
                        setTaskStatus(t.id, e.target.value as TaskStatus)
                      )
                    }
                    className="border border-line rounded-lg text-[10px] px-1 py-0.5 bg-surface text-ink"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <p className="text-xs text-ink/30">
                {dragOverCol === col.key ? "Drop here" : "Nothing here"}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}