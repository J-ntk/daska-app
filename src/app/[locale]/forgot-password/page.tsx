"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth.forgot");
  const tl = useTranslations("auth.login");
  const locale = useLocale();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/${locale}/reset-password`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm border border-line rounded-lg p-6 bg-surface">
        {sent ? (
          <>
            <h1 className="text-lg font-display font-semibold mb-1">{t("sentTitle")}</h1>
            <p className="text-sm text-ink/60 mb-6">{t("sentBody", { email })}</p>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <h1 className="text-lg font-display font-semibold mb-1">{t("title")}</h1>
            <p className="text-sm text-ink/60 mb-6">{t("subtitle")}</p>

            {error && (
              <div className="mb-4 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <label className="block text-xs font-medium mb-1">{tl("email")}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-line rounded-lg px-3 py-2 text-sm mb-6"
              placeholder="you@example.com"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-b from-accentLight to-accent text-white rounded-lg shadow-glow hover:brightness-110 transition-[filter] py-2 text-sm font-medium disabled:opacity-50"
            >
              {loading ? t("submitting") : t("submit")}
            </button>
          </form>
        )}

        <p className="text-xs text-center text-ink/60 mt-4">
          <Link href="/login" className="text-accent underline">
            {t("back")}
          </Link>
        </p>
      </div>
    </div>
  );
}