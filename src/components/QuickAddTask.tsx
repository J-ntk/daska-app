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
  compact = false,
}: {
  horizon: Horizon;
  projectId?: string | null;
  dueDate?: string | null;
  quarter?: string | null;
  placeholder?: string;
  allowRepeat?: boolean;
  // Tight spaces (e.g. a ~150px-wide weekly day column) need a smaller
  // button and, critically, a background that actually contrasts with
  // the surrounding card instead of matching it exactly.
  compact?: boolean;
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
    <form onSubmit={handleSubmit} className={`flex gap-1.5 ${compact ? "mb-2" : "mb-3"}`}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={placeholder}
        disabled={isPending}
        enterKeyHint="done"
        className={`flex-1 min-w-0 border border-line rounded-lg corner-fix bg-bg disabled:opacity-50 ${
          compact ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm"
        }`}
      />
      {allowRepeat && (
        <select
          value={repeat ?? ""}
          onChange={(e) => setRepeat((e.target.value || null) as RecurrenceRule)}
          className="border border-line rounded-lg corner-fix text-xs px-1.5 bg-bg shrink-0"
          title="Repeat"
        >
          <option value="">No repeat</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      )}
      <button
        type="submit"
        disabled={isPending || !title.trim()}
        aria-label="Add task"
        className={`shrink-0 flex items-center justify-center bg-gradient-to-b from-accentLight to-accent text-white rounded-lg corner-fix shadow-glow hover:brightness-110 transition-[filter] font-medium disabled:opacity-40 ${
          compact ? "w-6 text-sm" : "w-9 text-lg"
        }`}
      >
        +
      </button>
    </form>
  );
}