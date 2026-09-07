"use client";

import { useState, useTransition } from "react";
import { createTask, type RecurrenceRule } from "@/lib/actions/tasks";
import type { Horizon } from "@/lib/types";

export default function QuickAddTask({
  horizon,
  projectId,
  dueDate,
  quarter,
  placeholder = "Add a task and press Enter…",
  allowRepeat = false,
}: {
  horizon: Horizon;
  projectId?: string | null;
  dueDate?: string | null;
  quarter?: string | null;
  placeholder?: string;
  allowRepeat?: boolean;
}) {
  const [title, setTitle] = useState("");
  const [repeat, setRepeat] = useState<RecurrenceRule>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const value = title;
    const rule = repeat;
    setTitle("");
    setRepeat(null);
    startTransition(async () => {
      await createTask({
        title: value,
        horizon,
        projectId: projectId ?? null,
        dueDate: dueDate ?? null,
        quarter: quarter ?? null,
        recurrenceRule: rule,
      });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mb-3 flex gap-1.5">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={placeholder}
        disabled={isPending}
        className="flex-1 min-w-0 border border-line rounded-lg px-3 py-2 text-sm bg-surface disabled:opacity-50"
      />
      {allowRepeat && (
        <select
          value={repeat ?? ""}
          onChange={(e) => setRepeat((e.target.value || null) as RecurrenceRule)}
          className="border border-line rounded-lg text-xs px-1.5 bg-surface shrink-0"
          title="Repeat"
        >
          <option value="">No repeat</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      )}
    </form>
  );
}