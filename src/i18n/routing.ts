import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "el", "ru", "uk", "de", "fr", "it", "es", "zh", "ja"],
  defaultLocale: "en",
  localePrefix: "always",
});

export const localeLabels: Record<string, string> = {
  en: "English",
  el: "Ελληνικά",
  ru: "Русский",
  uk: "Українська",
  de: "Deutsch",
  fr: "Français",
  it: "Italiano",
  es: "Español",
  zh: "中文",
  ja: "日本語",
};
