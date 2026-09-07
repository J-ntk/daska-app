import { createClient } from "@/lib/supabase/server";
import type { Project, Notification } from "@/lib/types";

export async function getShellData() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let projects: Project[] = [];
  let notifications: Notification[] = [];

  if (user) {
    const { data: memberships } = await supabase
      .from("project_members")
      .select("project:projects(*)")
      .eq("user_id", user.id)
      .eq("status", "active");

    projects = (memberships ?? [])
      .map((m: any) => m.project)
      .filter(Boolean) as Project[];

    const { data: notifs } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(15);

    notifications = (notifs ?? []) as Notification[];
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { projects, notifications, unreadCount };
}