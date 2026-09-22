"use client";

import { usePathname, Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Sun, CalendarDays, Plus, Folder, Menu } from "lucide-react";
import { playTap } from "@/lib/sound";

export default function BottomTabBar({
  onProjectsClick,
  onMoreClick,
}: {
  onProjectsClick: () => void;
  onMoreClick: () => void;
}) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const quickTasksActive = pathname === "/app/quick-tasks";

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
            onClick={playTap}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 ${
              active ? "text-accentLight" : "text-inkMuted"
            }`}
          >
            <Icon size={20} aria-hidden="true" />
            <span className={`text-[11px] ${active ? "font-medium" : ""}`}>{label}</span>
          </Link>
        );
      })}

      {/* Quick Tasks gets the raised center button — the whole point of
          that page is speed, so it earns the most prominent spot. */}
      <Link
        href="/app/quick-tasks"
        onClick={playTap}
        className="flex-1 flex flex-col items-center gap-1 py-2.5 text-inkMuted"
      >
        <span
          className={`w-12 h-12 -mt-6 rounded-full flex items-center justify-center text-white shadow-glow transition-[filter] ${
            quickTasksActive
              ? "bg-gradient-to-b from-accentLight to-accent brightness-110"
              : "bg-gradient-to-b from-accentLight to-accent hover:brightness-110"
          }`}
        >
          <Plus size={24} aria-hidden="true" />
        </span>
        <span className={`text-[11px] ${quickTasksActive ? "text-accentLight font-medium" : ""}`}>
          {t("quickTasks")}
        </span>
      </Link>

      <button
        onClick={() => {
          playTap();
          onProjectsClick();
        }}
        className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-inkMuted"
      >
        <Folder size={20} aria-hidden="true" />
        <span className="text-[11px]">{t("projects")}</span>
      </button>

      <button
        onClick={() => {
          playTap();
          onMoreClick();
        }}
        className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-inkMuted"
      >
        <Menu size={20} aria-hidden="true" />
        <span className="text-[11px]">More</span>
      </button>
    </nav>
  );
}