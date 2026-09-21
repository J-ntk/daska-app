"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, localeLabels } from "@/i18n/routing";
import { updateLanguage } from "@/lib/actions/profile";

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();

  function handleChange(newLocale: string) {
    startTransition(() => {
      updateLanguage(newLocale).catch(() => {});
    });
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <select
      value={locale}
      onChange={(e) => handleChange(e.target.value)}
      className={`border border-line rounded-lg bg-surface text-ink ${
        compact ? "text-xs px-2 py-1" : "text-sm px-3 py-2 w-full"
      }`}
    >
      {routing.locales.map((l) => (
        <option key={l} value={l}>
          {localeLabels[l]}
        </option>
      ))}
    </select>
  );
}
