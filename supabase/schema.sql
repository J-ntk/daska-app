-- ============================================================
-- Planning App — Database Schema (Supabase / Postgres)
-- Run this in: Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================

-- 1. PROFILES (mirrors auth.users, one row per signed-up user)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Auto-create a profile row whenever someone signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- 2. PROJECTS
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  owner_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz default now()
);

-- 3. PROJECT MEMBERS (roles: owner, admin, editor, viewer)
create table if not exists project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  invited_email text, -- set when the invited person hasn't signed up yet
  role text not null default 'editor' check (role in ('owner','admin','editor','viewer')),
  status text not null default 'active' check (status in ('active','pending')),
  created_at timestamptz default now(),
  unique(project_id, user_id)
);

-- 4. TASKS
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade, -- null = personal task
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo','in_progress','done')),
  priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  assignee_id uuid references profiles(id) on delete set null,
  created_by uuid not null references profiles(id) on delete cascade,
  due_date date,
  recurrence_rule text, -- 'daily' | 'weekly' | 'monthly' | null
  parent_task_id uuid references tasks(id) on delete cascade, -- sub-tasks
  horizon text not null default 'daily' check (horizon in ('daily','weekly','monthly','yearly')),
  quarter text, -- e.g. 'Q1-2026', only used when horizon = 'yearly'
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- 5. COMMENTS
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table profiles enable row level security;
alter table projects enable row level security;
alter table project_members enable row level security;
alter table tasks enable row level security;
alter table comments enable row level security;

-- Profiles: anyone signed in can read basic profile info (needed for avatars/names)
create policy "profiles readable by authenticated" on profiles
  for select using (auth.role() = 'authenticated');
create policy "users update own profile" on profiles
  for update using (auth.uid() = id);

-- Helper: is the current user a member of a project?
create or replace function is_project_member(p_project_id uuid)
returns boolean as $$
  select exists (
    select 1 from project_members
    where project_id = p_project_id
    and user_id = auth.uid()
    and status = 'active'
  );
$$ language sql security definer stable;

create or replace function project_role(p_project_id uuid)
returns text as $$
  select role from project_members
  where project_id = p_project_id and user_id = auth.uid() and status = 'active'
  limit 1;
$$ language sql security definer stable;

-- Projects: visible to members; only owner/admin can update; owner can delete
create policy "members can view project" on projects
  for select using (is_project_member(id));
create policy "authenticated users can create project" on projects
  for insert with check (auth.uid() = owner_id);
create policy "owner/admin can update project" on projects
  for update using (project_role(id) in ('owner','admin'));
create policy "owner can delete project" on projects
  for delete using (owner_id = auth.uid());

-- Project members: visible to other members; owner/admin can manage
create policy "members can view member list" on project_members
  for select using (is_project_member(project_id));
create policy "owner/admin can invite" on project_members
  for insert with check (
    project_role(project_id) in ('owner','admin')
    or (select owner_id from projects where id = project_id) = auth.uid()
  );
create policy "owner/admin can update member roles" on project_members
  for update using (project_role(project_id) in ('owner','admin'));
create policy "owner/admin can remove member" on project_members
  for delete using (project_role(project_id) in ('owner','admin'));

-- Tasks: personal tasks visible only to creator; project tasks visible to members
create policy "view own personal tasks" on tasks
  for select using (project_id is null and created_by = auth.uid());
create policy "view project tasks as member" on tasks
  for select using (project_id is not null and is_project_member(project_id));
create policy "create personal task" on tasks
  for insert with check (project_id is null and created_by = auth.uid());
create policy "create project task as member" on tasks
  for insert with check (project_id is not null and is_project_member(project_id) and project_role(project_id) != 'viewer');
create policy "update own personal task" on tasks
  for update using (project_id is null and created_by = auth.uid());
create policy "update project task as editor+" on tasks
  for update using (project_id is not null and is_project_member(project_id) and project_role(project_id) != 'viewer');
create policy "delete own personal task" on tasks
  for delete using (project_id is null and created_by = auth.uid());
create policy "delete project task as editor+" on tasks
  for delete using (project_id is not null and is_project_member(project_id) and project_role(project_id) != 'viewer');

-- Comments: visible/writable by anyone who can see the parent task
create policy "view comments on visible tasks" on comments
  for select using (
    exists (
      select 1 from tasks t
      where t.id = task_id
      and (
        (t.project_id is null and t.created_by = auth.uid())
        or (t.project_id is not null and is_project_member(t.project_id))
      )
    )
  );
create policy "add comment on visible tasks" on comments
  for insert with check (user_id = auth.uid());
