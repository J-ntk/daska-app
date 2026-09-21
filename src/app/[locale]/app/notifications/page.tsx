import { getTranslations } from "next-intl/server";
import { formatDistanceToNow } from "date-fns";
import { Link } from "@/i18n/navigation";
import InviteCard from "@/components/InviteCard";
import { getNotificationsFeed } from "@/lib/getShellData";
import { markAllNotificationsRead } from "@/lib/actions/notifications";

export default async function NotificationsPage() {
  const t = await getTranslations("nav");
  const feed = await getNotificationsFeed(100);

  const invites = feed.filter((n) => n.type === "invite");
  const others = feed.filter((n) => n.type !== "invite");
  const hasUnread = others.some((n) => !n.read);

  return (
    <div className="max-w-2xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-display font-semibold">{t("notifications")}</h1>
        {hasUnread && (
          <form action={markAllNotificationsRead}>
            <button type="submit" className="text-xs text-accentLight">
              {t("markAllRead")}
            </button>
          </form>
        )}
      </div>

      {feed.length === 0 && <p className="text-sm text-inkMuted">{t("nothingYet")}</p>}

      {invites.length > 0 && (
        <div className="space-y-2 mb-5">
          {invites.map((n) => (
            <InviteCard key={n.id} notification={n} />
          ))}
        </div>
      )}

      <div className="space-y-2">
        {others.map((n) => (
          <Link
            key={n.id}
            href={n.project_id ? `/projects/${n.project_id}` : "/app/daily"}
            className={`block text-sm border border-line rounded-lg p-3 hover:border-accent transition-colors ${
              n.read ? "opacity-50" : ""
            }`}
          >
            <div>{n.body}</div>
            <div className="text-xs text-inkMuted mt-1">
              {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}