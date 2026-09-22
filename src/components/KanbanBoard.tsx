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
    <div>
      <p className="text-xs text-ink/40 mb-2 lg:hidden">Swipe to see other columns.</p>
      {/* One column dominates and snaps into place while swiping, up to a
          genuinely wide (1024px+) screen — three columns squeezed into a
          tablet or a modest laptop window hid Done off the edge entirely. */}
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory lg:grid lg:grid-cols-3 lg:overflow-visible -mx-5 px-5 lg:mx-0 lg:px-0 pb-2">
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
              className={`w-[86vw] max-w-sm shrink-0 snap-center lg:w-auto lg:max-w-none lg:shrink border rounded-lg corner-fix p-3 bg-surface min-h-[50vh] lg:min-h-0 transition-colors ${
                dragOverCol === col.key ? "border-accent bg-accent/5" : "border-line"
              }`}
            >
              <div className="flex justify-between items-center text-sm font-semibold border-b border-line pb-2 mb-2">
                <span>{col.label}</span>
                <span className="text-ink/40 text-xs">{items.length}</span>
              </div>
              {items.map((t) => (
                <div
                  key={t.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/task-id", t.id);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  className={`border border-line rounded-lg corner-fix p-2.5 mb-2 text-sm bg-bg cursor-grab active:cursor-grabbing ${
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
                      className="text-ink/30 hover:text-red-400 text-xs shrink-0 w-6 h-6 flex items-center justify-center -mr-1 -mt-1"
                      aria-label="Delete task"
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
                      className="border border-line rounded-lg corner-fix text-[10px] px-1.5 py-1 bg-surface text-ink"
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
                  {dragOverCol === col.key ? "Drop here" : "Nothing here yet."}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}