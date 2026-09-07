"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createProject } from "@/lib/actions/projects";
import { PROJECT_TEMPLATES } from "@/lib/templates";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [templateId, setTemplateId] = useState("none");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const result = await createProject({ name, description, templateId });
        router.push(`/projects/${result.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't create project");
      }
    });
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-lg font-display font-semibold mb-5 border-b border-line pb-3">
        New project
      </h1>

      {error && (
        <div className="mb-4 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          {error}{" "}
          <Link href="/app/billing" className="underline text-accentLight">
            Go to Billing
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label className="block text-xs font-medium mb-1">Project name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-line rounded-lg px-3 py-2 text-sm mb-4"
          placeholder="Website Relaunch"
        />
        <label className="block text-xs font-medium mb-1">Description (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-line rounded-lg px-3 py-2 text-sm mb-5"
          rows={3}
        />

        <label className="block text-xs font-medium mb-2">Start from a template</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
          {PROJECT_TEMPLATES.map((t) => (
            <button
              type="button"
              key={t.id}
              onClick={() => setTemplateId(t.id)}
              className={`text-left border rounded-lg p-3 text-sm ${
                templateId === t.id ? "border-ink bg-ink/5" : "border-line"
              }`}
            >
              <div className="font-medium">{t.name}</div>
              <div className="text-xs text-ink/50 mt-0.5">{t.description}</div>
              {t.tasks.length > 0 && (
                <div className="text-[10px] text-ink/40 mt-1">
                  {t.tasks.length} starter tasks
                </div>
              )}
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={isPending || !name}
          className="bg-gradient-to-b from-accentLight to-accent text-white rounded-lg shadow-glow hover:brightness-110 transition-[filter] px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {isPending ? "Creating…" : "Create project"}
        </button>
      </form>
    </div>
  );
}