"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/app/daily");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm border border-line rounded-lg p-6 bg-surface"
      >
        <h1 className="text-lg font-display font-semibold mb-1">{t("title")}</h1>
        <p className="text-sm text-ink/60 mb-6">{t("subtitle")}</p>

        {error && (
          <div className="mb-4 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <label className="block text-xs font-medium mb-1">{t("email")}</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-line rounded-lg px-3 py-2 text-sm mb-4"
          placeholder="you@example.com"
        />

        <label className="block text-xs font-medium mb-1">{t("password")}</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-line rounded-lg px-3 py-2 text-sm mb-6"
          placeholder="••••••••"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-b from-accentLight to-accent text-white rounded-lg shadow-glow hover:brightness-110 transition-[filter] py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? t("submitting") : t("submit")}
        </button>

        <p className="text-xs text-center text-ink/60 mt-4">
          {t("noAccount")}{" "}
          <Link href="/signup" className="text-accent underline">
            {t("signUp")}
          </Link>
        </p>
        <p className="text-[10px] text-center text-ink/30 mt-3">
          <Link href="/privacy" className="underline">Privacy</Link>
          {" · "}
          <Link href="/terms" className="underline">Terms</Link>
        </p>
      </form>
    </div>
  );
}
