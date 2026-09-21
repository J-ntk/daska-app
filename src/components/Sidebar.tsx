"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import NotificationsBell from "@/components/NotificationsBell";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import type { Project, Notification } from "@/lib/types";

export default function Sidebar({
  projects,
  notifications,
  unreadCount,
  onNavigate,
  onClose,
}: {
  projects: Project[];
  notifications: Notification[];
  unreadCount: number;
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const navItems = [
    { href: "/app/daily", label: t("daily") },
    { href: "/app/weekly", label: t("weekly") },
    { href: "/app/monthly", label: t("monthly") },
    { href: "/app/yearly", label: t("yearly") },
    { href: "/app/quick-tasks", label: t("quickTasks") },
    { href: "/app/focus", label: t("focusMode") },
  ];

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-64 md:w-56 shrink-0 border-r border-line bg-surface h-full md:min-h-screen p-4 flex flex-col overflow-visible shadow-2xl md:shadow-none">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-line">
        <div className="flex items-center gap-2">
          <Image src="/icons/icon-192.png" alt="" width={26} height={26} className="rounded-md shrink-0" />
          <span className="font-display font-semibold text-sm">Daska</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden text-inkMuted text-lg leading-none px-1"
            aria-label="Close menu"
          >
            ✕
          </button>
        )}
      </div>

      <NotificationsBell notifications={notifications} unreadCount={unreadCount} />

      <nav className="space-y-1.5 mb-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`block text-sm px-3 py-2 rounded-lg transition-colors ${
              pathname === item.href
                ? "bg-accent/15 text-accentLight font-medium shadow-glow"
                : "text-inkMuted hover:bg-surfaceHover hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="text-xs font-medium uppercase tracking-wide text-inkMuted mb-2">
        {t("projects")}
      </div>
      <div className="space-y-1 mb-3 flex-1 overflow-y-auto overflow-x-visible">
        {projects.length === 0 && (
          <p className="text-xs text-inkMuted px-3">{t("noProjects")}</p>
        )}
        {projects.map((p) => (
          <Link
            key={p.id}
            href={`/projects/${p.id}`}
            onClick={onNavigate}
            className={`block text-sm px-3 py-2 rounded-lg truncate transition-colors ${
              pathname === `/projects/${p.id}`
                ? "bg-accent/15 text-accentLight font-medium shadow-glow"
                : "text-inkMuted hover:bg-surfaceHover hover:text-ink"
            }`}
          >
            <span className="text-accentLight mr-1">●</span> {p.name}
          </Link>
        ))}
      </div>
      <Link
        href="/app/new-project"
        onClick={onNavigate}
        className="text-sm px-3 py-2 rounded-lg border border-dashed border-line text-inkMuted text-center mb-4 hover:border-accent hover:text-accentLight transition-colors"
      >
        {t("newProject")}
      </Link>

      <div className="mb-3">
        <LanguageSwitcher />
      </div>

      <div className="border-t border-line pt-3 mt-1 space-y-1">
        <Link
          href="/app/settings"
          onClick={onNavigate}
          className={`block text-sm px-3 py-2 rounded-lg transition-colors ${
            pathname === "/app/settings"
              ? "bg-accent/15 text-accentLight font-medium shadow-glow"
              : "text-inkMuted hover:bg-surfaceHover hover:text-ink"
          }`}
        >
          {t("settings")}
        </Link>
        <Link
          href="/app/billing"
          onClick={onNavigate}
          className={`block text-sm px-3 py-2 rounded-lg transition-colors ${
            pathname === "/app/billing"
              ? "bg-accent/15 text-accentLight font-medium shadow-glow"
              : "text-inkMuted hover:bg-surfaceHover hover:text-ink"
          }`}
        >
          {t("billing")}
        </Link>
        <button
          onClick={handleLogout}
          className="w-full text-left text-sm px-3 py-2 rounded-lg text-inkMuted hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          {t("logout")}
        </button>
      </div>
    </aside>
  );
}
