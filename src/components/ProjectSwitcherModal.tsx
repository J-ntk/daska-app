"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Project } from "@/lib/types";

export default function ProjectSwitcherModal({
  projects,
  onClose,
}: {
  projects: Project[];
  onClose: () => void;
}) {
  const t = useTranslations("nav");

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-surface border border-line rounded-lg corner-fix p-4 max-h-[70vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold">{t("projects")}</h3>
          <button onClick={onClose} className="text-ink/40 text-sm" aria-label="Close">
            ✕
          </button>
        </div>

        {projects.length === 0 ? (
          <p className="text-xs text-ink/40 mb-3">{t("noProjects")}</p>
        ) : (
          <div className="space-y-1 mb-3">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                onClick={onClose}
                className="block text-sm px-3 py-2.5 rounded-lg corner-fix text-inkMuted hover:bg-surfaceHover hover:text-ink transition-colors truncate"
              >
                <span className="text-accentLight mr-1">●</span> {p.name}
              </Link>
            ))}
          </div>
        )}

        <Link
          href="/app/new-project"
          onClick={onClose}
          className="block text-sm px-3 py-2.5 rounded-lg corner-fix border border-dashed border-line text-inkMuted text-center hover:border-accent hover:text-accentLight transition-colors"
        >
          {t("newProject")}
        </Link>
      </div>
    </div>
  );
}