"use client";

import { usePathname, Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function BottomTabBar({
  onOpenDrawer,
}: {
  // focusProjects: true scrolls the opened drawer straight to the
  // Projects section instead of leaving it at the top.
  onOpenDrawer: (focusProjects?: boolean) => void;
}) {
  const pathname = usePathname();
  const t = useTranslations("nav");

  const linkTabs = [
    { href: "/app/daily", label: t("daily") },
    { href: "/app/weekly", label: t("weekly") },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-30 flex bg-surface/95 backdrop-blur border-t border-line"
      style={{ paddingBottom: "var(--safe-bottom)" }}
    >
      {linkTabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5"
          >
            <span
              className={`w-6 h-0.5 rounded-full ${active ? "bg-accentLight" : "bg-transparent"}`}
            />
            <span className={`text-[11px] ${active ? "text-accentLight font-medium" : "text-inkMuted"}`}>
              {tab.label}
            </span>
          </Link>
        );
      })}

      <button
        onClick={() => onOpenDrawer(true)}
        className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5"
      >
        <span className="w-6 h-0.5 rounded-full bg-transparent" />
        <span className="text-[11px] text-inkMuted">{t("projects")}</span>
      </button>

      <button
        onClick={() => onOpenDrawer(false)}
        className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5"
      >
        <span className="w-6 h-0.5 rounded-full bg-transparent" />
        <span className="text-[11px] text-inkMuted">More</span>
      </button>
    </nav>
  );
}