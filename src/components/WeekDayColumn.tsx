"use client";

import { useState, useTransition } from "react";
import { moveTaskDate } from "@/lib/actions/tasks";
import TaskRow from "@/components/TaskRow";
import QuickAddTask from "@/components/QuickAddTask";
import type { Task } from "@/lib/types";

export default function WeekDayColumn({
  dateLabel,
  dateValue,
  tasks,
  isToday = false,
}: {
  dateLabel: string;
  dateValue: string;
  tasks: Task[];
  isToday?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [dragOver, setDragOver] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const taskId = e.dataTransfer.getData("text/task-id");
    if (!taskId) return;
    startTransition(() => moveTaskDate(taskId, dateValue));
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`border rounded-lg corner-fix p-3 bg-surface min-h-[60vh] lg:min-h-[220px] transition-colors ${
        dragOver ? "border-accent bg-accent/5" : isToday ? "border-accent/50" : "border-line"
      } ${isPending ? "opacity-60" : ""}`}
    >
      <div className="flex items-center gap-2 mb-3 border-b border-line pb-2">
        <span className={`text-sm font-semibold ${isToday ? "text-accentLight" : ""}`}>
          {dateLabel}
        </span>
        {isToday && (
          <span className="text-[10px] uppercase tracking-wide bg-accent/15 text-accentLight rounded-full px-2 py-0.5">
            Today
          </span>
        )}
      </div>
      <QuickAddTask horizon="weekly" dueDate={dateValue} placeholder="Add a task…" />
      {tasks.length === 0 ? (
        <p className="text-xs text-ink/30 mt-3">Nothing planned.</p>
      ) : (
        <div className="mt-1">
          {tasks.map((t) => (
            <div
              key={t.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/task-id", t.id);
                e.dataTransfer.effectAllowed = "move";
              }}
              className="cursor-grab active:cursor-grabbing"
            >
              <TaskRow task={t} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}