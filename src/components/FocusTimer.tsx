"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { logTimeEntry } from "@/lib/actions/timeTracking";
import type { Task } from "@/lib/types";

const PRESETS = [15, 25, 50];

export default function FocusTimer({
  tasks,
  initialTaskId,
}: {
  tasks: Task[];
  initialTaskId?: string;
}) {
  const [taskId, setTaskId] = useState(initialTaskId ?? tasks[0]?.id ?? "");
  const [minutes, setMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [justLogged, setJustLogged] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);

  useEffect(() => {
    if (!running) {
      setSecondsLeft(minutes * 60);
      elapsedRef.current = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minutes]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        elapsedRef.current += 1;
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            finishSession(minutes * 60);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  function finishSession(durationSeconds: number) {
    if (!taskId || durationSeconds < 1) return;
    startTransition(() => logTimeEntry(taskId, durationSeconds));
    setJustLogged(durationSeconds);
  }

  function handleStop() {
    setRunning(false);
    if (elapsedRef.current > 5) {
      finishSession(elapsedRef.current);
    }
    setSecondsLeft(minutes * 60);
    elapsedRef.current = 0;
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="max-w-sm border border-line rounded-lg p-5 bg-surface text-center">
      <label className="block text-xs font-medium mb-1 text-left">Task</label>
      <select
        value={taskId}
        onChange={(e) => setTaskId(e.target.value)}
        disabled={running}
        className="w-full border border-line rounded-lg px-3 py-2 text-sm mb-4 bg-surface text-ink"
      >
        {tasks.length === 0 && <option value="">No open tasks</option>}
        {tasks.map((t) => (
          <option key={t.id} value={t.id}>
            {t.title}
          </option>
        ))}
      </select>

      <div className="flex justify-center gap-2 mb-4">
        {PRESETS.map((p) => (
          <button
            key={p}
            disabled={running}
            onClick={() => setMinutes(p)}
            className={`text-xs px-2.5 py-1 rounded-lg border ${
              minutes === p ? "border-ink font-semibold" : "border-line text-ink/50"
            }`}
          >
            {p} min
          </button>
        ))}
      </div>

      <div className="text-5xl font-semibold tabular-nums mb-5">
        {mm}:{ss}
      </div>

      <div className="flex justify-center gap-2">
        {!running ? (
          <button
            onClick={() => {
              setJustLogged(null);
              setRunning(true);
            }}
            disabled={!taskId}
            className="bg-gradient-to-b from-accentLight to-accent text-white rounded-lg shadow-glow hover:brightness-110 transition-[filter] px-5 py-2 text-sm font-medium disabled:opacity-50"
          >
            Start
          </button>
        ) : (
          <button
            onClick={() => setRunning(false)}
            className="border border-line rounded-lg px-5 py-2 text-sm font-medium"
          >
            Pause
          </button>
        )}
        <button
          onClick={handleStop}
          className="border border-line rounded-lg px-5 py-2 text-sm text-ink/60"
        >
          Stop &amp; log
        </button>
      </div>

      {isPending && <p className="text-xs text-ink/40 mt-3">Saving session…</p>}
      {!isPending && justLogged && (
        <p className="text-xs text-green-400 mt-3">
          Logged {Math.round(justLogged / 60)} min.
        </p>
      )}
    </div>
  );
}