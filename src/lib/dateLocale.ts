import { enUS, el, ru, uk, de, fr, it, es, zhCN, ja, type Locale } from "date-fns/locale";

const dateFnsLocales: Record<string, Locale> = {
  en: enUS,
  el,
  ru,
  uk,
  de,
  fr,
  it,
  es,
  zh: zhCN,
  ja,
};

export function getDateFnsLocale(locale: string): Locale {
  return dateFnsLocales[locale] ?? enUS;
}
