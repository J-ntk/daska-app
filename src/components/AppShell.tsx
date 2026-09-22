"use client";

import { useState } from "react";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import type { Project, Notification } from "@/lib/types";

// Header height (excluding the notch/status bar) stays a constant 4rem;
// the safe-area inset is added on top of that so it always clears the
// physical status bar/notch regardless of device.
const HEADER_H = "4rem";

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
      {/* Mobile top bar — background extends behind the transparent status
          bar/notch; the padding-top keeps the icon/text clear of it. This
          whole element is md:hidden, so its inline style never applies on
          desktop. */}
      <div
        className="md:hidden fixed top-0 inset-x-0 z-30 flex items-center justify-between border-b border-line bg-surface/90 backdrop-blur px-4"
        style={{
          height: `calc(${HEADER_H} + var(--safe-top))`,
          paddingTop: "var(--safe-top)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <Image src="/icons/icon-192.png" alt="" width={32} height={32} className="rounded-lg" />
          <span className="font-display font-semibold text-base">Daska</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="relative w-10 h-10 flex items-center justify-center rounded-lg corner-fix border border-line text-ink text-lg"
        >
          ☰
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accentLight" />
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
        {/* --mobile-top-pad is just a CSS variable here (harmless on its
            own); the actual padding-top comes from the Tailwind classes
            below, so md:pt-8 still correctly overrides it on desktop —
            an inline style for padding-top would NOT respect that
            breakpoint override, which is why this is split into a var
            plus an arbitrary-value class instead. */}
        <main
          className="p-5 pt-[var(--mobile-top-pad)] md:pt-8 md:p-8 max-w-6xl mx-auto"
          style={{
            ["--mobile-top-pad" as string]: `calc(${HEADER_H} + var(--safe-top) + 1.25rem)`,
            paddingBottom: "calc(var(--safe-bottom) + 1.25rem)",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}