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
}: {
  dateLabel: string;
  dateValue: string;
  tasks: Task[];
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
      className={`border rounded-lg p-2 bg-surface min-h-[220px] transition-colors ${
        dragOver ? "border-accent bg-accent/5" : "border-line"
      } ${isPending ? "opacity-60" : ""}`}
    >
      <div className="text-xs font-semibold mb-2 border-b border-line pb-1.5">{dateLabel}</div>
      <QuickAddTask horizon="weekly" dueDate={dateValue} placeholder="+ add" />
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
  );
}