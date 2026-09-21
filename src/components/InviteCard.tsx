"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { acceptInvite, declineInvite } from "@/lib/actions/invites";
import type { Notification } from "@/lib/types";

export default function InviteCard({
  notification,
  onDone,
}: {
  notification: Notification;
  onDone?: () => void;
}) {
  const t = useTranslations("notifications");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  const invite = notification.invite;
  if (!invite) return null;

  const projectName = invite.project_name || t("unnamedProject");

  function handleAccept() {
    setFailed(false);
    startTransition(async () => {
      const res = await acceptInvite(invite!.member_id);
      if (!res.ok) {
        setFailed(true);
        return;
      }
      onDone?.();
      router.push(`/projects/${res.projectId}`);
      router.refresh();
    });
  }

  function handleDecline() {
    setFailed(false);
    startTransition(async () => {
      const res = await declineInvite(invite!.member_id);
      if (!res.ok) {
        setFailed(true);
        return;
      }
      onDone?.();
      router.refresh();
    });
  }

  return (
    <div className="border border-accent/40 bg-accent/5 rounded-lg p-3">
      <div className="text-xs font-medium">
        {invite.invited_by_name
          ? t("invitedBy", { name: invite.invited_by_name, project: projectName })
          : t("invitedTo", { project: projectName })}
      </div>
      <div className="text-[11px] text-inkMuted mt-0.5">
        {t("roleLabel", { role: t(`roles.${invite.role}`) })}
      </div>

      {failed && <p className="text-[11px] text-red-400 mt-2">{t("error")}</p>}

      <div className="flex gap-2 mt-2.5">
        <button
          type="button"
          disabled={isPending}
          onClick={handleAccept}
          className="flex-1 bg-gradient-to-b from-accentLight to-accent text-white rounded-lg shadow-glow hover:brightness-110 transition-[filter] py-1.5 text-xs font-medium disabled:opacity-50"
        >
          {t("accept")}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={handleDecline}
          className="flex-1 border border-line rounded-lg py-1.5 text-xs text-inkMuted hover:border-red-400 hover:text-red-400 transition-colors disabled:opacity-50"
        >
          {t("decline")}
        </button>
      </div>
    </div>
  );
}