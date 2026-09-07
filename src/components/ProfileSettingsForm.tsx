"use client";

import { useState, useTransition, useMemo } from "react";
import { updateProfile } from "@/lib/actions/profile";

const VIEW_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "quick-tasks", label: "Quick Tasks" },
];

export default function ProfileSettingsForm({
  initial,
}: {
  initial: {
    fullName: string;
    jobTitle: string;
    timezone: string;
    defaultView: string;
    weekStart: string;
  };
}) {
  const [fullName, setFullName] = useState(initial.fullName);
  const [jobTitle, setJobTitle] = useState(initial.jobTitle);
  const [timezone, setTimezone] = useState(
    initial.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [defaultView, setDefaultView] = useState(initial.defaultView);
  const [weekStart, setWeekStart] = useState(initial.weekStart);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const timezones = useMemo(() => {
    try {
      // @ts-ignore - supported in modern browsers, not yet in older TS lib defs
      return Intl.supportedValuesOf ? Intl.supportedValuesOf("timeZone") : [timezone];
    } catch {
      return [timezone];
    }
  }, [timezone]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    startTransition(async () => {
      await updateProfile({ fullName, jobTitle, timezone, defaultView, weekStart });
      setSaved(true);
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="block text-xs font-medium mb-1">Display name</label>
      <input
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="w-full border border-line rounded-lg px-3 py-2 text-sm mb-3"
        placeholder="Your name"
      />

      <label className="block text-xs font-medium mb-1">Job title / role</label>
      <input
        value={jobTitle}
        onChange={(e) => setJobTitle(e.target.value)}
        className="w-full border border-line rounded-lg px-3 py-2 text-sm mb-3"
        placeholder="e.g. Team Lead, Software Developer"
      />

      <label className="block text-xs font-medium mb-1">Timezone</label>
      <select
        value={timezone}
        onChange={(e) => setTimezone(e.target.value)}
        className="w-full border border-line rounded-lg px-3 py-2 text-sm mb-3"
      >
        {timezones.map((tz: string) => (
          <option key={tz} value={tz}>
            {tz}
          </option>
        ))}
      </select>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs font-medium mb-1">Opens to</label>
          <select
            value={defaultView}
            onChange={(e) => setDefaultView(e.target.value)}
            className="w-full border border-line rounded-lg px-3 py-2 text-sm"
          >
            {VIEW_OPTIONS.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Week starts on</label>
          <select
            value={weekStart}
            onChange={(e) => setWeekStart(e.target.value)}
            className="w-full border border-line rounded-lg px-3 py-2 text-sm"
          >
            <option value="monday">Monday</option>
            <option value="sunday">Sunday</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="bg-gradient-to-b from-accentLight to-accent text-white rounded-lg shadow-glow hover:brightness-110 transition-[filter] px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
        {saved && !isPending && (
          <span className="text-xs text-green-400">Saved.</span>
        )}
      </div>
    </form>
  );
}