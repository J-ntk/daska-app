export type Role = "owner" | "admin" | "editor" | "viewer";
export type TaskStatus = "todo" | "in_progress" | "done";
export type Priority = "low" | "medium" | "high" | "urgent";
export type Horizon = "daily" | "weekly" | "monthly" | "yearly" | "anytime";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string | null;
  invited_email: string | null;
  role: Role;
  status: "active" | "pending";
  profile?: Profile;
}

export interface Task {
  id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  assignee_id: string | null;
  created_by: string;
  due_date: string | null;
  recurrence_rule: string | null;
  parent_task_id: string | null;
  horizon: Horizon;
  quarter: string | null;
  created_at: string;
  completed_at: string | null;
  google_event_id: string | null;
  assignee?: Profile;
}

export interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  body: string;
  created_at: string;
  profile?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: "mention" | "assignment" | "invite";
  project_id: string | null;
  task_id: string | null;
  body: string;
  read: boolean;
  created_at: string;
  /**
   * Only set on type "invite". These items are not rows in the
   * notifications table: they are built from pending project_members
   * rows (see getShellData.ts), so they always reflect the live invite.
   */
  invite?: {
    member_id: string;
    project_name: string;
    role: Role;
    invited_by_name: string | null;
  };
}

export interface TimeEntry {
  id: string;
  task_id: string;
  user_id: string;
  started_at: string;
  ended_at: string;
  duration_seconds: number;
  created_at: string;
}

export type InviteResult =
  | { ok: true; kind: "existing" | "email"; emailSent?: boolean }
  | {
      ok: false;
      error:
        | "not_authenticated"
        | "invalid_email"
        | "already_member"
        | "already_invited"
        | "failed";
      message?: string;
    };

export type LookupResult =
  | {
      status: "found";
      profile: { email: string; full_name: string | null; avatar_url: string | null };
    }
  | { status: "not_found" }
  | { status: "already_member" }
  | { status: "already_invited" }
  | { status: "invalid_email" }
  | { status: "not_allowed" }
  | { status: "error" };