"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { markAllNotificationsRead } from "@/lib/actions/notifications";
import type { Notification } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsBell({
  notifications,
  unreadCount,
}: {
  notifications: Notification[];
  unreadCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="relative mb-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-sm px-3 py-2 rounded-lg border border-line bg-bg text-ink hover:border-accent transition-colors"
      >
        <span>Notifications</span>
        {unreadCount > 0 && (
          <span className="bg-accent text-white text-[10px] rounded-full px-1.5 py-0.5 font-semibold">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-72 bg-surface border border-line rounded-lg shadow-glow z-50 p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <button
                disabled={isPending}
                onClick={() => startTransition(() => markAllNotificationsRead())}
                className="text-[11px] text-accentLight"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1.5">
            {notifications.length === 0 && (
              <p className="text-xs text-inkMuted">Nothing yet.</p>
            )}
            {notifications.map((n) => (
              <Link
                key={n.id}
                href={n.project_id ? `/projects/${n.project_id}` : "/app/daily"}
                onClick={() => setOpen(false)}
                className={`block text-xs border border-line rounded-lg p-2 hover:border-accent transition-colors ${
                  n.read ? "opacity-50" : ""
                }`}
              >
                <div>{n.body}</div>
                <div className="text-[10px] text-inkMuted mt-0.5">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}