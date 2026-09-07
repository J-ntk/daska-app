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
  type: "mention" | "assignment";
  project_id: string | null;
  task_id: string | null;
  body: string;
  read: boolean;
  created_at: string;
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