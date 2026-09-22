"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Bell } from "lucide-react";
import { markAllNotificationsRead } from "@/lib/actions/notifications";
import InviteCard from "@/components/InviteCard";
import type { Notification } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsBell({
  notifications,
  unreadCount,
  variant = "full",
}: {
  notifications: Notification[];
  unreadCount: number;
  // "full": the original text pill, used inside the Sidebar drawer.
  // "compact": a small square bell icon, used in the top bar — the panel
  // anchors from the right there so it can't run off the screen edge.
  variant?: "full" | "compact";
}) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div className={`relative ${variant === "full" ? "mb-4" : ""}`}>
      {variant === "compact" ? (
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={t("notifications")}
          className="relative w-9 h-9 flex items-center justify-center rounded-lg corner-fix border border-line text-ink hover:border-accent transition-colors"
        >
          <Bell size={18} aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[10px] rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 font-semibold">
              {unreadCount}
            </span>
          )}
        </button>
      ) : (
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between text-sm px-3 py-2 rounded-lg corner-fix border border-line bg-bg text-ink hover:border-accent transition-colors"
        >
          <span className="flex items-center gap-2">
            <Bell size={16} aria-hidden="true" />
            {t("notifications")}
          </span>
          {unreadCount > 0 && (
            <span className="bg-accent text-white text-[10px] rounded-full px-1.5 py-0.5 font-semibold">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {open && (
        <div
          className={`absolute top-full mt-1 w-72 max-w-[calc(100vw-2rem)] bg-surface border border-line rounded-lg corner-fix z-50 p-3 ${
            variant === "compact" ? "right-0" : "left-0"
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold">{t("notifications")}</span>
            {unreadCount > 0 && (
              <button
                disabled={isPending}
                onClick={() => startTransition(() => markAllNotificationsRead())}
                className="text-[11px] text-accentLight"
              >
                {t("markAllRead")}
              </button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1.5">
            {notifications.length === 0 && (
              <p className="text-xs text-inkMuted">{t("nothingYet")}</p>
            )}
            {notifications.map((n) =>
              n.type === "invite" ? (
                <InviteCard
                  key={n.id}
                  notification={n}
                  onDone={() => setOpen(false)}
                />
              ) : (
                <Link
                  key={n.id}
                  href={n.project_id ? `/projects/${n.project_id}` : "/app/daily"}
                  onClick={() => setOpen(false)}
                  className={`block text-xs border border-line rounded-lg corner-fix p-2 hover:border-accent transition-colors ${
                    n.read ? "opacity-50" : ""
                  }`}
                >
                  <div>{n.body}</div>
                  <div className="text-[10px] text-inkMuted mt-0.5">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </div>
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}