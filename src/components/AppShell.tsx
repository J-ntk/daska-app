"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import BottomTabBar from "@/components/BottomTabBar";
import NotificationsBell from "@/components/NotificationsBell";
import type { Project, Notification } from "@/lib/types";

// Header/tab-bar heights (excluding safe-area insets) stay constant; the
// safe-area inset is added on top so they always clear the physical
// notch/status bar and the gesture bar regardless of device.
const HEADER_H = "4rem";
const TAB_BAR_H = "3.75rem";

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
  const projectsSectionRef = useRef<HTMLDivElement>(null);

  function openDrawer(focusProjects = false) {
    setOpen(true);
    if (focusProjects) {
      // Wait for the drawer's open transition to start before scrolling,
      // so scrollIntoView has a laid-out element to target.
      requestAnimationFrame(() => {
        projectsSectionRef.current?.scrollIntoView({ block: "start" });
      });
    }
  }

  return (
    <div className="md:flex min-h-screen">
      {/* Mobile top bar — background extends behind the transparent status
          bar/notch; the padding-top keeps the icon/text clear of it. This
          whole element is md:hidden, so its inline style never applies on
          desktop. The hamburger is gone: Projects/More on the bottom tab
          bar now open this same drawer, and notifications live here
          instead of buried inside it. */}
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
        <NotificationsBell notifications={notifications} unreadCount={unreadCount} />
      </div>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
        />
      )}

      {/* Sidebar: fixed drawer on mobile (opened via the bottom tab bar's
          Projects/More buttons), static column on desktop */}
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
          projectsSectionRef={projectsSectionRef}
        />
      </div>

      <div className="flex-1 min-w-0">
        {/* --mobile-top-pad / --mobile-bottom-pad are CSS variables here
            (harmless on their own); the actual padding comes from the
            Tailwind classes below, so md:pt-8/md:pb-8 still correctly
            override them on desktop — an inline style for padding would
            NOT respect that breakpoint override, which is why this is
            split into vars plus arbitrary-value classes instead. */}
        <main
          className="p-5 pt-[var(--mobile-top-pad)] pb-[var(--mobile-bottom-pad)] md:pt-8 md:pb-8 md:p-8 max-w-6xl mx-auto"
          style={{
            ["--mobile-top-pad" as string]: `calc(${HEADER_H} + var(--safe-top) + 1.25rem)`,
            ["--mobile-bottom-pad" as string]: `calc(${TAB_BAR_H} + var(--safe-bottom) + 1.25rem)`,
          }}
        >
          {children}
        </main>
      </div>

      <BottomTabBar onOpenDrawer={openDrawer} />
    </div>
  );
}