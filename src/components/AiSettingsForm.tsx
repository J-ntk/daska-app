"use client";

import { useState, useTransition } from "react";
import { saveAiSettings, deleteAiSettings } from "@/lib/actions/ai";

type Provider = "openai_compatible" | "anthropic";

const PROVIDER_DEFAULTS: Record<Provider, { baseUrl: string; model: string; label: string }> = {
  openai_compatible: {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    label: "OpenAI-compatible (OpenAI, OpenRouter, Groq, Ollama, etc.)",
  },
  anthropic: {
    baseUrl: "https://api.anthropic.com",
    model: "claude-3-5-haiku-20241022",
    label: "Anthropic",
  },
};

export default function AiSettingsForm({
  connected,
}: {
  connected: { provider: Provider; model: string; base_url: string | null } | null;
}) {
  const [editing, setEditing] = useState(!connected);
  const [provider, setProvider] = useState<Provider>(connected?.provider ?? "openai_compatible");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState(connected?.base_url ?? PROVIDER_DEFAULTS.openai_compatible.baseUrl);
  const [model, setModel] = useState(connected?.model ?? PROVIDER_DEFAULTS.openai_compatible.model);
  const [isPending, startTransition] = useTransition();

  function handleProviderChange(p: Provider) {
    setProvider(p);
    setBaseUrl(PROVIDER_DEFAULTS[p].baseUrl);
    setModel(PROVIDER_DEFAULTS[p].model);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await saveAiSettings({ provider, apiKey, baseUrl, model });
      setEditing(false);
      setApiKey("");
    });
  }

  if (!editing && connected) {
    return (
      <div className="flex justify-between items-center">
        <div>
          <div className="text-sm font-medium">{PROVIDER_DEFAULTS[connected.provider]?.label ?? connected.provider}</div>
          <div className="text-xs text-ink/50">Model: {connected.model}</div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditing(true)} className="text-xs border border-line rounded-lg px-3 py-1.5">
            Edit
          </button>
          <button
            onClick={() => startTransition(() => deleteAiSettings())}
            className="text-xs border border-line rounded-lg px-3 py-1.5"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="block text-xs font-medium mb-1">Provider</label>
      <div className="flex gap-1.5 mb-3">
        {(Object.keys(PROVIDER_DEFAULTS) as Provider[]).map((p) => (
          <button
            type="button"
            key={p}
            onClick={() => handleProviderChange(p)}
            className={`text-xs px-2.5 py-1 rounded-lg border ${
              provider === p ? "border-ink font-semibold" : "border-line text-ink/50"
            }`}
          >
            {p === "openai_compatible" ? "OpenAI-compatible" : "Anthropic"}
          </button>
        ))}
      </div>

      <label className="block text-xs font-medium mb-1">API key</label>
      <input
        type="password"
        required
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="sk-…"
        className="w-full border border-line rounded-lg px-3 py-2 text-sm mb-3"
      />

      {provider === "openai_compatible" && (
        <>
          <label className="block text-xs font-medium mb-1">Base URL</label>
          <input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            className="w-full border border-line rounded-lg px-3 py-2 text-sm mb-3"
          />
        </>
      )}

      <label className="block text-xs font-medium mb-1">Model</label>
      <input
        required
        value={model}
        onChange={(e) => setModel(e.target.value)}
        className="w-full border border-line rounded-lg px-3 py-2 text-sm mb-4"
      />

      <div className="flex gap-2 items-center">
        <button
          type="submit"
          disabled={isPending}
          className="bg-gradient-to-b from-accentLight to-accent text-white rounded-lg shadow-glow hover:brightness-110 transition-[filter] px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
        {connected && (
          <button type="button" onClick={() => setEditing(false)} className="text-xs text-ink/50 px-2">
            Cancel
          </button>
        )}
      </div>
      <p className="text-[10px] text-ink/40 mt-3">
        Your key is stored in your own Supabase project, readable only by you (Row Level
        Security). Consider using a key with a spend limit, since this app has no rate limiting
        of its own.
      </p>
    </form>
  );
}