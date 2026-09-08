"use client";

import { useState } from "react";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import type { Project, Notification } from "@/lib/types";

export default function AppShell({
  projects,
  notifications,
  unreadCount,
  children,
}: {
  projects: Project[];
  notifications: Notification[];
  unreadCount: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:flex min-h-screen">
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 flex items-center justify-between border-b border-line bg-surface/90 backdrop-blur px-4 h-14">
        <div className="flex items-center gap-2">
          <Image src="/app-icon.png" alt="" width={24} height={24} className="rounded-md" />
          <span className="font-display font-semibold text-sm">Daska</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-line text-ink"
        >
          ☰
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accentLight" />
          )}
        </button>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
        />
      )}

      {/* Sidebar: fixed drawer on mobile, static column on desktop */}
      <div
        className={`fixed md:static top-0 left-0 z-50 h-full md:shrink-0 transition-transform duration-200 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <Sidebar
          projects={projects}
          notifications={notifications}
          unreadCount={unreadCount}
          onNavigate={() => setOpen(false)}
          onClose={() => setOpen(false)}
        />
      </div>

      <div className="flex-1 min-w-0">
        <main className="p-5 pt-20 md:pt-8 md:p-8 max-w-6xl mx-auto">{children}</main>
      </div>
    </div>
  );
}