"use client";

import { usePathname, Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Sun, CalendarDays, Folder, Menu } from "lucide-react";

export default function BottomTabBar({
  onProjectsClick,
  onMoreClick,
}: {
  onProjectsClick: () => void;
  onMoreClick: () => void;
}) {
  const pathname = usePathname();
  const t = useTranslations("nav");

  const linkTabs = [
    { href: "/app/daily", label: t("daily"), Icon: Sun },
    { href: "/app/weekly", label: t("weekly"), Icon: CalendarDays },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-30 flex bg-surface/95 backdrop-blur border-t border-line"
      style={{ paddingBottom: "var(--safe-bottom)" }}
    >
      {linkTabs.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 ${
              active ? "text-accentLight" : "text-inkMuted"
            }`}
          >
            <Icon size={20} aria-hidden="true" />
            <span className={`text-[11px] ${active ? "font-medium" : ""}`}>{label}</span>
          </Link>
        );
      })}

      <button
        onClick={onProjectsClick}
        className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-inkMuted"
      >
        <Folder size={20} aria-hidden="true" />
        <span className="text-[11px]">{t("projects")}</span>
      </button>

      <button
        onClick={onMoreClick}
        className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-inkMuted"
      >
        <Menu size={20} aria-hidden="true" />
        <span className="text-[11px]">More</span>
      </button>
    </nav>
  );
}