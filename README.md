# Planning App — MVP

Daily / Weekly / Monthly / Yearly task planning, plus shared projects with
invited members. Built with Next.js + Supabase. **$0 to run** on the free
tiers described below.

## What's implemented (MVP / Phase 1)

- Email/password auth (sign up, log in, log out)
- Daily view — today's tasks + overdue, quick-add
- Weekly view — 7-day columns, quick-add per day
- Monthly view — calendar grid with task-count dots
- Yearly view — quarter goal cards (Q1–Q4)
- Create projects
- Project dashboard — stats (% complete, open, overdue, members) + Kanban board
- Invite members by email with a role (Viewer / Admin / Editor / Owner)
- Row Level Security in Postgres — members can only see projects they belong to

## What's NOT built yet (see "Next phases" below)
Recurring tasks execution, comments/mentions, email notifications, calendar
sync, analytics dashboard, drag-and-drop reordering, templates, mobile app.
The plan for these is in the schema/README so they're easy to add next.

---

## 1. Set up Supabase (free, no credit card)

1. Go to https://supabase.com → **Start your project** → sign up free.
2. **New project** → pick a name, a database password (save it), a region.
3. Once it's ready, open **SQL Editor** → **New query**.
4. Paste the entire contents of `supabase/schema.sql` from this repo → **Run**.
   This creates all tables, the `profiles` auto-trigger, and Row Level
   Security policies.
5. Go to **Project Settings → API**. Copy:
   - `Project URL`
   - `anon public` key

## 2. Configure the app

```bash
cp .env.example .env.local
```

Paste your Supabase URL and anon key into `.env.local`.

## 3. Run locally (free)

```bash
npm install
npm run dev
```

Open http://localhost:3000 → you'll be redirected to `/login` → click
**Sign up** → check your email for the confirmation link (Supabase sends
this automatically on the free tier) → log in.

## 4. Deploy for free

1. Push this folder to a GitHub repo.
2. Go to https://vercel.com → sign up free with GitHub.
3. **Add New Project** → import the repo.
4. In **Environment Variables**, add the same two values from `.env.local`.
5. Deploy. You get a free `*.vercel.app` URL with HTTPS, no cost.

Supabase free tier covers: 500MB database, 50k monthly active users,
5GB file storage, auth, and realtime — plenty for an MVP and small team use.

## Note on invite emails

Right now, inviting someone by email creates a `pending` row in
`project_members`. If they already have an account (email match), they get
access immediately. If not, they need to **sign up with that same email** —
their pending invite then becomes active automatically the next time they
open the project (you can wire this up as a one-line check on login, listed
in "Next phases").

To send an actual "you've been invited" email for free, the simplest option
is enabling **Supabase Auth → Email Templates → Invite user**, which requires
calling `supabase.auth.admin.inviteUserByEmail()` from a server context with
the **service role key** (never expose this key in client code — only use it
inside a server action or Supabase Edge Function). This is a good first
addition in Phase 2.

## Project structure

```
supabase/schema.sql        → run once in Supabase SQL editor
src/lib/supabase/          → browser + server Supabase clients
src/lib/actions/           → server actions (create task, invite member, etc.)
src/app/login, /signup     → auth pages
src/app/app/               → daily/weekly/monthly/yearly + sidebar shell
src/app/projects/[id]/     → project dashboard, kanban, invite modal
src/components/            → Sidebar, TaskRow, QuickAddTask, KanbanBoard, InviteModal
```

## Next phases (from the original plan)

**Phase 2**
- Recurring tasks (cron-style rule → auto-generate next instance on completion)
- Comments + @mentions on tasks, with in-app notifications
- Google/Outlook calendar sync
- Analytics dashboard (tasks completed per week, per member)
- Proper invite emails via Supabase service role

**Phase 3**
- AI task breakdown (yearly goal → suggested monthly/weekly/daily tasks)
- Time tracking / focus mode (Pomodoro)
- Project templates
- Native mobile app (React Native, reusing the same Supabase backend)
- Drag-and-drop between days/columns (currently uses dropdowns/quick-add)
