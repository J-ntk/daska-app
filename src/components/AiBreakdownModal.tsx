"use client";

import { useState, useTransition } from "react";
import { breakdownGoal, createTasksFromBreakdown } from "@/lib/actions/ai";
import type { SuggestedTask } from "@/lib/ai";

export default function AiBreakdownModal({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [goal, setGoal] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestedTask[] | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!goal.trim()) return;
    setError(null);
    setSuggestions(null);
    setSaved(false);
    startTransition(async () => {
      try {
        const result = await breakdownGoal(goal);
        setSuggestions(result);
        setSelected(new Set(result.map((_, i) => i)));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  }

  function toggle(i: number) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function handleAdd() {
    if (!suggestions) return;
    const items = suggestions.filter((_, i) => selected.has(i));
    startTransition(async () => {
      await createTasksFromBreakdown(items);
      setSaved(true);
    });
  }

  function close() {
    setOpen(false);
    setGoal("");
    setSuggestions(null);
    setError(null);
    setSaved(false);
  }

  return (
    <>
      <span onClick={() => setOpen(true)} className="cursor-pointer">
        {trigger}
      </span>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-surface border border-line rounded-lg p-5 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-sm font-semibold">AI Task Breakdown</h3>
              <button onClick={close} className="text-ink/40 text-sm">
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-3 text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            {!suggestions && (
              <form onSubmit={handleGenerate}>
                <label className="block text-xs font-medium mb-1">Your goal</label>
                <textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Launch my freelance web design business"
                  rows={3}
                  className="w-full border border-line rounded-lg px-3 py-2 text-sm mb-3"
                />
                <button
                  type="submit"
                  disabled={isPending || !goal.trim()}
                  className="bg-gradient-to-b from-accentLight to-accent text-white rounded-lg shadow-glow hover:brightness-110 transition-[filter] px-4 py-2 text-sm font-medium disabled:opacity-50"
                >
                  {isPending ? "Thinking…" : "Break it down"}
                </button>
              </form>
            )}

            {suggestions && !saved && (
              <>
                <p className="text-xs text-ink/50 mb-2">Uncheck anything you don&apos;t want, then add.</p>
                <div className="flex-1 overflow-y-auto space-y-1.5 mb-3">
                  {suggestions.map((s, i) => (
                    <label key={i} className="flex items-start gap-2 text-sm border border-line rounded-lg p-2">
                      <input
                        type="checkbox"
                        checked={selected.has(i)}
                        onChange={() => toggle(i)}
                        className="mt-0.5"
                      />
                      <span>
                        {s.title}
                        <span className="block text-[10px] text-ink/40">
                          {s.horizon} · due in {s.offsetDays}d
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={handleAdd}
                  disabled={isPending || selected.size === 0}
                  className="bg-gradient-to-b from-accentLight to-accent text-white rounded-lg shadow-glow hover:brightness-110 transition-[filter] px-4 py-2 text-sm font-medium disabled:opacity-50"
                >
                  {isPending ? "Adding…" : `Add ${selected.size} task${selected.size === 1 ? "" : "s"}`}
                </button>
              </>
            )}

            {saved && (
              <div className="text-sm text-green-400">
                Added! Check your Daily/Weekly/Monthly views.
                <button onClick={close} className="block mt-3 text-xs border border-line rounded-lg px-3 py-1.5">
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}