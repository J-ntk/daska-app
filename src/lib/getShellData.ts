import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/getUser";
import type { Project, Notification } from "@/lib/types";

type Db = ReturnType<typeof createClient>;

// Pending invitations become "invite" items at the top of the feed.
// They come from the get_my_pending_invites() database function (see
// phase9_migration.sql), not the notifications table, so they disappear
// the moment the invite is accepted or declined.
async function loadInvites(supabase: Db, userId: string): Promise<Notification[]> {
  const { data } = await supabase.rpc("get_my_pending_invites");

  return ((data ?? []) as any[]).map((row) => ({
    id: `invite-${row.invite_member_id}`,
    user_id: userId,
    type: "invite",
    project_id: row.invite_project_id ?? null,
    task_id: null,
    body: row.invite_project_name ?? "",
    read: false,
    created_at: "",
    invite: {
      member_id: row.invite_member_id,
      project_name: row.invite_project_name ?? "",
      role: row.invite_role,
      invited_by_name: row.inviter_name ?? null,
    },
  })) as Notification[];
}

async function loadFeed(supabase: Db, userId: string, limit: number): Promise<Notification[]> {
  const [invites, notifs] = await Promise.all([
    loadInvites(supabase, userId),
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit),
  ]);

  return [...invites, ...((notifs.data ?? []) as Notification[])];
}

export async function getShellData() {
  const supabase = createClient();
  const user = await getAuthUser();

  let projects: Project[] = [];
  let notifications: Notification[] = [];

  if (user) {
    // Memberships and the notification/invite feed are independent —
    // run them concurrently instead of one after another.
    const [{ data: memberships }, feed] = await Promise.all([
      supabase
        .from("project_members")
        .select("project:projects(*)")
        .eq("user_id", user.id)
        .eq("status", "active"),
      loadFeed(supabase, user.id, 15),
    ]);

    projects = (memberships ?? [])
      .map((m: any) => m.project)
      .filter(Boolean) as Project[];

    notifications = feed;
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { projects, notifications, unreadCount };
}

// Full list for the notifications page.
export async function getNotificationsFeed(limit = 100): Promise<Notification[]> {
  const supabase = createClient();
  const user = await getAuthUser();
  if (!user) return [];
  return loadFeed(supabase, user.id, limit);
}