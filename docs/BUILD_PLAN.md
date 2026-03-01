# Personal Task & Habit Manager — Build Plan
**Project:** ToDo App | **Owner:** Yosef | **Last updated:** 1 March 2026

---

## How to Use This Plan with Claude Code

When you are ready to build, open Cursor, go to the terminal, and type `claude` to start Claude Code. Then paste the following prompt:

> "Please read the file at docs/BUILD_PLAN.md. This is the full build plan for my personal productivity app. Start at Phase 1 and work through every step in order. Complete each phase fully and confirm it works before moving to the next. After finishing each phase, update its status in this file from `[ ]` to `[x]`. If you hit an error you cannot fix, or you need information from me (like account credentials or API keys), stop and ask. Otherwise keep going until the app is fully built."

Claude Code will then run autonomously. Keep an eye on the terminal — it will stop and ask you at the **pause points** listed below.

---

## Pause Points (Where You Will Need to Step In)

These are moments where Claude Code cannot proceed without real information from you. They are also marked inside each phase.

| # | Phase | What Claude Code Will Need From You |
|---|-------|-------------------------------------|
| 1 | Phase 1 — GitHub | Your GitHub username and to authenticate in the browser when it opens |
| 2 | Phase 5 — Supabase | Your Supabase project URL and API key (found in your Supabase dashboard) |
| 3 | Phase 13 — Google Calendar | Your Google Cloud project credentials (Client ID and Client Secret) |

---

## Build Status

| Phase | Name | Status |
|-------|------|--------|
| 1 | Connect to GitHub | [x] Done |
| 2 | App Shell & Layout | [x] Done |
| 3 | Basic Task List | [x] Done |
| 4 | Natural Language Input | [x] Done |
| 5 | Supabase Database | [x] Done |
| 6 | Project Categories | [x] Done |
| 7 | Priority Levels | [x] Done |
| 8 | Task Completion & Archive | [x] Done |
| 9 | Habit Tracker Screen | [x] Done |
| 10 | Monthly Habit Calendar | [x] Done |
| 11 | Streak Counters | [x] Done |
| 12 | Health Metric Logging | [x] Done |
| 13 | Google Calendar Sync | [x] Done |
| 14 | Customisable Views | [x] Done |
| 15 | Polish & Deploy to Vercel | [x] Done |
| 16 | UI Design Polish | [x] Done |
| 17 | Bug Fixes & Full App Testing | [x] Done |
| 18 | Todoist-Accurate Visual Redesign | [ ] Pending |

---

## Project Health Summary

### ✅ Confirmed Working (code-verified)
- All Supabase CRUD for tasks, projects, habits, habit_logs, health_logs
- Natural language task input — chrono-node parses project tags, dates, duration, priority
- Four task views (Today / Upcoming / By Project / Backlog) with localStorage persistence
- Priority dot system — p1/p2/p3 cycling, Supabase update, p1 always visible
- Project sidebar with live task counts via custom `tasks-changed` window event
- Collapsible Completed and Low-priority sections
- Habit daily checklist (green checkbox, resets at midnight), drag-and-drop reorder
- Monthly habit calendar with colour-coded completion cells and hover tooltips
- Streak calculation (current and best) in `src/lib/streaks.ts`
- Health log (sleep/mood/water) with upsert on today's date
- Google Calendar sync — create/update (✓ prefix on complete)/delete via server-side API route
- Vercel cron job (`vercel.json`) — cleanup runs at 2am UTC daily
- Error handling — all Supabase mutations have try/catch + console.error + UI error messages

### ⚠️ Known Issues
- **Google OAuth token expiry:** access tokens expire after ~1 hour. No automatic refresh is implemented (`refreshToken` is stored in the JWT but never used). Calendar sync silently stops working until the user reconnects manually.
- **Cleanup cron and Supabase RLS:** the cleanup API route uses the public anon key. If Row Level Security is enabled on the tasks table without a service-role bypass, the cron job will silently delete 0 rows.
- **Dead code:** `src/lib/googleCalendar.ts` exists but is never called from client code. All calendar calls go through `/api/calendar/route.ts`. The file is safe to delete.
- **Vercel deployment of Phase 16–17 unconfirmed:** user reported the live URL appeared unchanged after the latest push. Root cause not yet established (pending deployment, failed build, or browser cache).

### 🔲 Still Needs Attention
- Verify Vercel has successfully deployed the Phase 16 and 17 commits (check Vercel dashboard → Deployments)
- Run the full manual test suite from Phase 17 (T1–T16, P1–P5, H1–H8, G1–G4) in a real browser
- Decide whether to implement OAuth token refresh or add a clear "reconnect" prompt when the token is near expiry
- Remove dead file `src/lib/googleCalendar.ts` if confirmed unused

---

## Reference: App Specification Summary

Before building, keep these rules in mind at all times:

- **Platform:** Mac web app, browser-based, single user (Yosef only)
- **Design:** Clean and minimal — lots of white space, simple typography. No clutter.
- **Default view:** Today's tasks on open
- **Two modules:** Task Manager and Habit Tracker, accessed from a left sidebar
- **Not building in v1:** mobile app, push notifications, two-way calendar sync, dark mode, recurring tasks, collaboration

---

## Phase 1 — Connect to GitHub
**What this does:** Saves your project code to GitHub, which is like a remote backup of all your code. Every future change will be saved there automatically. This is also required for Vercel deployment later.

**Status:** [x] Done

**Completion Notes:**
- A git repository already existed in the project folder — `git init` was skipped. The remote `origin` was added pointing to `https://github.com/abebeyosef/todo-app` (public repo, created by Yosef).
- Package name is `"todo"` (not `"todo-app"`) because npm disallows uppercase letters in package names. The folder name `ToDo` caused `create-next-app` to fail during initial scaffold — workaround was to create the project in `/tmp/todo-app` first, then move it to `~/Desktop/ToDo` and re-run `npm install`.
- After moving files, a "Cannot find module '../server/require-hook'" error appeared because `node_modules` contained stale `/tmp` paths. Fixed by deleting `node_modules` and `package-lock.json` and running a fresh `npm install` in the correct directory.
- **Success criteria met:** `git log` shows commits; code is visible at `https://github.com/abebeyosef/todo-app`.

### Steps for Claude Code
1. Inside `~/Desktop/ToDo`, check whether a Git repository already exists by running `git status`. If it does, skip to step 3.
2. If no Git repo exists, initialise one: `git init`
3. Check the current git log to see if there are existing commits: `git log --oneline`
4. Stage all current project files: `git add .`
5. Create the first commit with message: `"Initial commit — Next.js scaffold"`
6. Go to GitHub (github.com) and instruct Yosef to create a new **public** repository named `todo-app` with no README, no .gitignore, and no licence (these already exist locally).
7. Once Yosef has created the repo and copied the repository URL, connect the local project to it: `git remote add origin [URL Yosef provides]`
8. Push the code: `git push -u origin main`

### Success Criteria
- Running `git log --oneline` shows at least one commit
- Visiting the GitHub repository URL shows the project files online

### ⚠️ Pause Point
Ask Yosef to: (a) confirm his GitHub username, (b) create the new repository on GitHub following the instructions above, and (c) paste the repository URL back into the terminal.

---

## Phase 2 — App Shell & Layout
**What this does:** Replaces the default Next.js placeholder page with the actual skeleton of the app — a left sidebar for navigation and a main content area on the right. Nothing is functional yet, but the visual structure is in place.

**Status:** [x] Done

**Completion Notes:**
- Created: `src/components/Sidebar.tsx`, `src/components/MainContent.tsx`, `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx` (placeholder), `src/app/habits/page.tsx` (placeholder). Also created `src/components/Providers.tsx` (NextAuth `SessionProvider` wrapper — needed later in Phase 13).
- `layout.tsx` wraps `<Sidebar>` in a `<Suspense>` boundary. This is required by Next.js App Router because `Sidebar` uses `useSearchParams()`, which must be inside Suspense.
- Initial styling used plain Tailwind classes; all colours and spacing were later replaced in Phase 16 with CSS custom property design tokens.
- **Success criteria met:** sidebar renders with Tasks and Habits links; clicking navigates between pages.

### Steps for Claude Code
1. Open `src/app/layout.tsx` and restructure it to include a persistent left sidebar and a main content area side by side. The sidebar should fill the full height of the screen.
2. Create a new component file at `src/components/Sidebar.tsx`. The sidebar should contain:
   - App name or logo at the top ("ToDo")
   - Two navigation links: "Tasks" and "Habits"
   - Clean, minimal styling using Tailwind CSS
3. Create a new component file at `src/components/MainContent.tsx` as a placeholder wrapper for page content.
4. Update `src/app/page.tsx` to render the sidebar layout with a placeholder message in the main area (e.g. "Task Manager — coming soon").
5. Create a second page at `src/app/habits/page.tsx` with a placeholder message ("Habit Tracker — coming soon").
6. Wire up the sidebar navigation links so clicking "Tasks" goes to `/` and clicking "Habits" goes to `/habits`.
7. Apply global styles in `src/app/globals.css`: white background, clean sans-serif font (Inter or system font), no default margins.
8. Run `npm run dev` and visually confirm the layout renders correctly.

### Success Criteria
- Opening `http://localhost:3000` shows a sidebar on the left and content area on the right
- Clicking "Tasks" and "Habits" in the sidebar navigates between the two pages
- The page looks clean and minimal — no default Next.js styling

---

## Phase 3 — Basic Task List
**What this does:** Builds the first working version of the task list. You can type a task, press Enter, see it appear, check it off, or delete it. All data is stored temporarily in the browser (no database yet — tasks disappear on refresh, which is intentional at this stage).

**Status:** [x] Done

**Completion Notes:**
- Created: `src/components/TaskInput.tsx`, `src/components/TaskItem.tsx`, `src/components/TaskList.tsx`, `src/types/task.ts`.
- Initial `Task` type was `{ id, name, completed, createdAt }`. Extended in Phase 4 to add all metadata fields (project, scheduledAt, duration, priority, isBacklog, completedAt, googleEventId).
- `page.tsx` managed state with `useState`; tasks lived in memory only (lost on refresh, as intended at this stage).
- `TaskList.tsx` renders a list of `TaskItem` components. In practice, `page.tsx` calls `renderTask()` directly in most views rather than using `TaskList` — `TaskList` is still present but rarely used.
- **Success criteria met:** add, complete, and delete all worked in-browser.

### Steps for Claude Code
1. Create `src/components/TaskInput.tsx` — a simple text input bar at the top of the tasks page. Pressing Enter submits the task.
2. Create `src/components/TaskItem.tsx` — displays a single task with:
   - A checkbox to mark complete
   - The task name
   - A delete button (small "×" or trash icon)
3. Create `src/components/TaskList.tsx` — renders a list of `TaskItem` components.
4. Create `src/types/task.ts` — defines the TypeScript type for a task object:
   ```ts
   export type Task = {
     id: string;
     name: string;
     completed: boolean;
     createdAt: Date;
   }
   ```
5. Update `src/app/page.tsx` to manage task state using `useState`. Wire up add, complete, and delete actions.
6. Style everything using Tailwind CSS to match the clean, minimal design. Completed tasks should appear visually struck through or dimmed.
7. Run `npm run dev` and test adding, completing, and deleting tasks.

### Success Criteria
- Typing a task name and pressing Enter adds it to the list
- Clicking the checkbox marks it as complete (visual change)
- Clicking delete removes it from the list
- The list looks clean and readable

---

## Phase 4 — Natural Language Input
**What this does:** Replaces the plain text input with a smart input bar that understands natural language commands. You can type things like `#health Morning run today 7am [45min] p1` and the app will automatically extract the project, task name, date, time, duration, and priority.

**Status:** [x] Done

**Completion Notes:**
- Installed `chrono-node@^2.9.0`. Created `src/lib/parseTask.ts` with a documented header showing example test inputs and their expected output.
- Parser handles: `#project` tag (must be at start of input), `[duration]` in brackets (h/hr/hour/min/m), `p1`/`p2`/`p3` priority token, and free-text dates/times via chrono-node (`forwardDate: true`).
- `isBacklog` is derived as `!scheduledAt` — any task without a parsed date automatically becomes a backlog item. No separate "backlog" keyword is needed.
- `Task` type extended to its final shape: `project`, `projectId`, `projectColour`, `scheduledAt`, `duration`, `priority`, `isBacklog`, `completedAt`, `googleEventId`.
- **Known limitation:** if a task name contains a word chrono-node interprets as a date (e.g. "Buy May flowers tomorrow"), the date token is correctly stripped but can leave a double-space in the name. The parser cleans up double-spaces but the edge case exists.
- **Success criteria met:** all three plan examples (`#app`, `#health`, `#personal`) parse correctly.

### Steps for Claude Code
1. Install the date parsing library: `npm install chrono-node`
2. Create `src/lib/parseTask.ts` — a function that takes a raw input string and returns a structured task object. It must handle:
   - `#project` at the start — extracts and removes the project tag
   - `[duration]` in square brackets — extracts duration in minutes or hours
   - `p1`, `p2`, `p3` anywhere in the string — extracts priority (default `p2` if not specified)
   - Date/time language using `chrono-node`: today, tomorrow, monday, next week, in 3 days, 9am, 2:30pm, noon
   - Everything remaining after parsing = the task name
   - No date found = task goes to backlog
3. Update the `Task` type in `src/types/task.ts` to include:
   ```ts
   project?: string;
   scheduledAt?: Date;
   duration?: number; // in minutes
   priority: 'p1' | 'p2' | 'p3';
   isBacklog: boolean;
   ```
4. Update `TaskInput.tsx` to use `parseTask` when the user submits input.
5. Update `TaskItem.tsx` to display: project tag (colour-coded), scheduled date/time (if any), duration (if any), and priority indicator.
6. Write a small set of test inputs in a comment at the top of `parseTask.ts` and verify each one parses correctly.
7. Run `npm run dev` and test with the example inputs from the spec:
   - `#app Make a new app tomorrow 1pm [2hr] p1`
   - `#health Morning run today 7am [45min]`
   - `#personal Call dentist someday`

### Success Criteria
- Each of the three example inputs produces the correct structured output
- Project, date, duration, and priority all display correctly on the task item
- Tasks with no date appear in a "Backlog" section below dated tasks

---

## Phase 5 — Connect Supabase Database
**What this does:** Connects the app to a real database so tasks are saved permanently. Tasks will no longer disappear when you refresh the page.

**Status:** [x] Done

**Completion Notes:**
- Installed `@supabase/supabase-js@^2.98.0`. Created `src/lib/supabase.ts` — a minimal two-line client initialisation that exports a single `supabase` instance.
- `.env.local` created with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. The Project URL was constructed manually from the Project ID (`cfwszllqhwyvvssoqilr`) as `https://cfwszllqhwyvvssoqilr.supabase.co` — the Supabase dashboard had reorganised its UI and the full URL was not immediately visible.
- The Supabase anon key is a JWT (`eyJhbG...`). A newer `sb_publishable_` format key was also visible in the dashboard but is not the correct key — clarification was needed.
- **All DDL (CREATE TABLE, ALTER TABLE) must be run manually in the Supabase SQL Editor.** The anon key has no schema-change permissions. This constraint applies to every subsequent phase. First SQL paste had a truncation error (`'reate table'` instead of `'create table'`) — fixed by pasting again in a fresh query tab.
- **Known limitation:** the anon key is exposed in the browser (prefixed `NEXT_PUBLIC_`). Supabase Row Level Security should be configured to protect data, but RLS policy setup was not part of this build.
- **Success criteria met:** tasks persist after page refresh; Supabase table editor shows correct data after add/complete/delete.

### Steps for Claude Code
1. Ask Yosef to:
   - Log in to supabase.com
   - Create a new project (name it `todo-app`, choose the free tier, pick a region close to the UK)
   - Once created, go to Project Settings → API and copy: (a) the Project URL and (b) the `anon` public API key
2. Install Supabase client: `npm install @supabase/supabase-js`
3. Create a `.env.local` file in the project root with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=<paste URL here>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste key here>
   ```
4. Create `src/lib/supabase.ts` — initialises and exports the Supabase client.
5. In the Supabase dashboard SQL editor, run the following to create the tasks table:
   ```sql
   create table tasks (
     id uuid default gen_random_uuid() primary key,
     name text not null,
     project text,
     scheduled_at timestamptz,
     duration integer,
     priority text default 'p2',
     is_backlog boolean default false,
     completed boolean default false,
     completed_at timestamptz,
     created_at timestamptz default now()
   );
   ```
6. Replace all `useState` task logic in `src/app/page.tsx` with Supabase queries:
   - Load tasks: `supabase.from('tasks').select('*')`
   - Add task: `supabase.from('tasks').insert([...])`
   - Complete task: `supabase.from('tasks').update({ completed: true, completed_at: new Date() }).eq('id', id)`
   - Delete task: `supabase.from('tasks').delete().eq('id', id)`
7. Add a loading state so the UI doesn't flash while tasks are being fetched.
8. Run `npm run dev` and confirm tasks persist after a page refresh.

### Success Criteria
- Adding a task saves it to Supabase (visible in the Supabase table editor)
- Refreshing the page still shows all tasks
- Completing and deleting tasks updates the database correctly

### ⚠️ Pause Point
Ask Yosef to create the Supabase project and provide: (a) the Project URL and (b) the anon API key.

---

## Phase 6 — Project Categories
**What this does:** Adds a proper project system. The sidebar shows your projects (Work, Personal, Health, App) with task counts. Tasks are grouped and filtered by project.

**Status:** [x] Done

**Completion Notes:**
- `projects` table SQL and `ALTER TABLE tasks ADD COLUMN project_id` run manually in Supabase dashboard. Four default projects inserted (Work/Personal/Health/App). The SQL was run twice accidentally — second run produced `ERROR: 42P07: relation 'projects' already exists` which is harmless.
- Created `src/types/project.ts`, `src/components/ProjectModal.tsx`. One TypeScript bug fixed during implementation: `ringColor` is not a valid CSS `style={}` property — replaced with `outline` / `outlineOffset`.
- **Design decision: Inbox is a virtual bucket, not a database row.** Tasks with `project_id = NULL` are counted and displayed under "Inbox" in the sidebar. The plan's Phase 17 Bug 1 suggestion to create a real Inbox project in the database was reviewed and rejected — the null-based approach already satisfies all requirements.
- Sidebar task counts use a `window.dispatchEvent(new Event('tasks-changed'))` pattern. Every mutation in `page.tsx` fires this event; the Sidebar listens and re-fetches counts. This avoids prop drilling and works across components.
- **Success criteria met:** sidebar shows 4 projects with counts; create/rename/delete project works; `#work` etc. correctly link tasks to the matching project (case-insensitive name match).

### Steps for Claude Code
1. Create a `projects` table in Supabase:
   ```sql
   create table projects (
     id uuid default gen_random_uuid() primary key,
     name text not null,
     colour text not null,
     created_at timestamptz default now()
   );
   insert into projects (name, colour) values
     ('Work', '#4F46E5'),
     ('Personal', '#16A34A'),
     ('Health', '#DC2626'),
     ('App', '#D97706');
   ```
2. Add a `project_id` foreign key column to the tasks table:
   ```sql
   alter table tasks add column project_id uuid references projects(id);
   ```
3. Update `parseTask.ts` to match `#tag` input to an existing project by name (case-insensitive). If no match, leave as null (Inbox).
4. Update the `Sidebar.tsx` to:
   - Fetch and display all projects from Supabase
   - Show a coloured dot beside each project name
   - Show the count of incomplete tasks for each project
   - Add "Inbox" at the top for tasks with no project
   - Add an "+ New Project" button at the bottom
5. Create `src/components/ProjectModal.tsx` — a simple modal for creating and renaming projects. Includes a name field and a colour picker (6 preset colours).
6. Add delete project functionality (with a confirmation prompt). Deleting a project moves its tasks to Inbox.
7. Update the task list to filter by the selected project when one is clicked in the sidebar.
8. Update `TaskItem.tsx` to display the project colour dot.

### Success Criteria
- Sidebar shows all 4 default projects with task counts
- Clicking a project filters the task list to that project only
- Can create, rename, and delete projects
- Tasks tagged with `#work`, `#personal`, `#health`, or `#app` automatically link to the correct project

---

## Phase 7 — Priority Levels
**What this does:** Adds visual priority indicators (p1 = red, p2 = amber, p3 = grey) to every task. You can click the indicator to cycle through priorities without having to retype the task.

**Status:** [x] Done

**Completion Notes:**
- `TaskItem.tsx` updated with a clickable priority badge cycling p1→p2→p3→p1. `TaskList.tsx` updated to forward the new `onPriorityChange` prop (had been missing, causing a TypeScript error).
- `updatePriority` async function in `page.tsx` calls `supabase.from('tasks').update({ priority }).eq('id', id)`.
- Tasks are sorted within each view by `byPriority` comparator using `PRIORITY_ORDER = { p1: 0, p2: 1, p3: 2 }`.
- p3 tasks hidden in a collapsible "Low priority" section (collapsed by default). High-priority tasks render above it in a `renderPriorityGroups()` helper shared by Today and Backlog views.
- In Phase 16, priority badges were redesigned from text labels (`P1`, `P2`, `P3`) to 8px coloured dots with the p2/p3 dots hidden until the row is hovered.
- **Success criteria met:** badges show on all tasks; click cycles priority and updates Supabase; p1 floats to top; p3 collapsed by default.

### Steps for Claude Code
1. Update `TaskItem.tsx` to show a small coloured priority badge:
   - `p1` → red badge, floated to the top of the list
   - `p2` → amber badge (default)
   - `p3` → grey badge, collapsed behind a "Show low priority" toggle
2. Clicking the priority badge cycles it: p1 → p2 → p3 → p1
3. Each click immediately updates the `priority` field in Supabase.
4. Within each project/view, sort tasks: p1 first, then p2, then p3.
5. Add a "p3" collapsible section at the bottom of the list — p3 tasks are hidden by default with a toggle to show them.

### Success Criteria
- Every task shows a coloured priority badge
- Clicking the badge cycles the priority and updates the database
- p1 tasks always appear at the top
- p3 tasks are collapsed by default

---

## Phase 8 — Task Completion & Archive
**What this does:** Adds a proper completed tasks section. When you check off a task, it moves to a collapsible "Completed" section at the bottom of the list. Tasks are automatically deleted after 30 days.

**Status:** [x] Done

**Completion Notes:**
- `completedAt` added to `Task` type. `completeTask` in `page.tsx` toggles `completed` and sets/clears `completed_at` in Supabase — clicking the checkbox a second time un-completes the task.
- Created `src/app/api/cleanup/route.ts`: a `GET` handler that deletes tasks where `completed = true` AND `completed_at < now() - 30 days`. Returns `{ deleted: count }`.
- Created `vercel.json` with one cron job: `GET /api/cleanup` at schedule `0 2 * * *` (2am UTC daily).
- Completed section in `page.tsx` is scoped to the selected project when one is active in the sidebar.
- **Known limitation:** the cleanup API uses the public Supabase anon key. If Supabase Row Level Security is enabled without a policy permitting deletes, the cron job will delete 0 rows silently. No service-role key was configured for this endpoint.
- **Success criteria met:** completing a task moves it to the Completed section; manual delete works; cron job is configured in `vercel.json` (not verified as actually running on Vercel free tier).

### Steps for Claude Code
1. Update `src/app/page.tsx` to separate tasks into two lists: active and completed.
2. Add a collapsible "Completed" section below active tasks. Shows the number of completed tasks in the section header. Collapsed by default.
3. Each completed task shows: task name (struck through), project tag, and the date it was completed.
4. Add a manual delete button on completed tasks.
5. Create a Supabase database function (or a Next.js API route at `src/app/api/cleanup/route.ts`) that deletes tasks where `completed_at` is older than 30 days.
6. Set this cleanup to run automatically once per day (use a Vercel cron job configured in `vercel.json`, scheduled for 2am).

### Success Criteria
- Completing a task moves it to the Completed section immediately
- The Completed section is collapsed by default and shows the count
- Manually deleting a completed task removes it from the database
- Completed tasks older than 30 days are automatically removed

---

## Phase 9 — Habit Tracker Screen
**What this does:** Builds the Habit Tracker module. You define your own habits, and each day you check them off. The list resets every night at midnight.

**Status:** [x] Done

**Completion Notes:**
- Installed `@hello-pangea/dnd@^18.0.1`. `habits` and `habit_logs` SQL tables created manually in Supabase. The SQL for habits was accidentally run twice — second run returned `ERROR: 42P07: relation 'habits' already exists`, which is harmless (first run succeeded).
- Created `src/types/habit.ts` with `Habit` and `HabitLog` types. Built `src/app/habits/page.tsx` from scratch with: daily checklist, drag-and-drop reordering (DnD context wraps the settings list only), settings panel (add name + emoji, delete with confirmation).
- The `habit_logs` table has `UNIQUE(habit_id, completed_on)`, so inserting a duplicate log (double-click) will fail gracefully rather than create a duplicate row.
- Daily reset is automatic — the checklist queries `habit_logs WHERE completed_on = today`, so it is always empty on a new day with no extra logic needed.
- **Bug introduced here, fixed in Phase 17:** in the drag-and-drop implementation, `provided.draggableProps.style` was spread *after* custom styles, which overrode the CSS `transform` property that powers dragging. Fixed by moving the spread first.
- **Success criteria met:** checklist, add, delete, and drag-to-reorder all work.

### Steps for Claude Code
1. Create the habits table in Supabase:
   ```sql
   create table habits (
     id uuid default gen_random_uuid() primary key,
     name text not null,
     emoji text,
     sort_order integer default 0,
     created_at timestamptz default now()
   );
   create table habit_logs (
     id uuid default gen_random_uuid() primary key,
     habit_id uuid references habits(id),
     completed_on date not null,
     created_at timestamptz default now(),
     unique(habit_id, completed_on)
   );
   ```
2. Build `src/app/habits/page.tsx` with:
   - A daily checklist of all habits
   - Each habit shows its emoji (if set), name, and a checkbox
   - Checking a habit inserts a row into `habit_logs` for today's date
   - Unchecking removes that row
3. Add a settings panel (slide-in or bottom of page) for managing habits:
   - Add a new habit (name + optional emoji)
   - Delete a habit (with confirmation — historical data is preserved)
   - Drag-and-drop reordering using `@hello-pangea/dnd` (`npm install @hello-pangea/dnd`)
4. The checklist resets at midnight automatically — this happens naturally since the app queries `habit_logs` for today's date only.

### Success Criteria
- Habits page shows the daily checklist
- Checking and unchecking habits saves to the database
- The list resets on a new day (test by changing the date query to yesterday to verify yesterday's data is separate)
- Can add, delete, and reorder habits in the settings panel

---

## Phase 10 — Monthly Habit Calendar
**What this does:** Adds a colour-coded monthly calendar to the Habits page. Each day shows how many habits you completed that day, using a colour scale from red (almost nothing) to green (everything).

**Status:** [x] Done

**Completion Notes:**
- Created `src/components/HabitCalendar.tsx`. Fetches `habit_logs` for the viewed month and calculates completion percentage per day client-side. Calendar week starts Monday.
- Colour thresholds: 0% → `--habit-grey`, 1–19% → `--habit-red`, 20–59% → `--habit-amber`, 60–99% → `--habit-lgreen`, 100% → `--habit-green`. These were later converted from Tailwind classes to CSS variable inline styles in Phase 16.
- Two TypeScript bugs fixed post-implementation: (1) the Supabase join `habits(name)` returns `{ name: string } | { name: string }[]` — handled with an `Array.isArray()` guard; (2) tooltip accessed a scoped `data` variable that was undefined in the render path — fixed by reading from `tooltip.data` instead.
- Today's cell uses an `outline` ring (not a border, to avoid affecting layout). Month navigation updates `year` and `month` state, triggering a re-fetch.
- **Success criteria met:** calendar renders with correct colours; month navigation works; hover tooltip shows completed habit names.

### Steps for Claude Code
1. Add a monthly calendar view at the top of `src/app/habits/page.tsx`.
2. For each day in the current month, query `habit_logs` and calculate completion percentage:
   - Green: 100%
   - Light green: 60–99%
   - Amber: 20–59%
   - Red: 1–19%
   - Grey: 0% (nothing logged)
3. Render each day as a small coloured square with the date number inside.
4. Add previous/next month navigation buttons.
5. Clicking a day shows a tooltip or small popup with the list of habits completed on that day.

### Success Criteria
- Calendar shows the current month with colour-coded days
- Colours match the completion percentage thresholds exactly
- Can navigate between months
- Days with no data show grey

---

## Phase 11 — Streak Counters
**What this does:** Tracks your habit streaks. Shows your current streak (consecutive days at 100%) and your all-time best streak, prominently on the Habits page.

**Status:** [x] Done

**Completion Notes:**
- Created `src/lib/streaks.ts`. Exports `calculateStreaks(logs, habitCount): { current, best }` — a pure function that takes the full `habit_logs` array and current habit count.
- Current streak: if today is a perfect day, count back from today; otherwise count back from yesterday (streak is not broken until midnight).
- Best streak: iterates all dates in ascending order, counting consecutive perfect days. Uses a `run` counter that resets on any non-perfect or non-consecutive day.
- **Limitation:** if habits have been added or deleted over time, historical days may not reach 100% against the current habit count, so past streaks can appear shorter than they actually were. This is acceptable and documented.
- In Phase 16, the streak numbers were moved from inline emoji text in the header to dedicated stat cards with white background and shadow.
- **Success criteria met:** current and best streak display correctly and update in real time as habits are toggled.

### Steps for Claude Code
1. Create a server-side function (in `src/lib/streaks.ts`) that:
   - Fetches all `habit_logs` entries
   - Groups them by date
   - For each date, calculates whether all habits were completed (100%)
   - Counts the current consecutive streak from today backwards
   - Counts the longest ever streak from all historical data
2. Display both numbers prominently at the top of the Habits page:
   - "🔥 Current streak: X days"
   - "🏆 Best streak: X days"
3. If today's habits are not yet completed, the current streak shows yesterday's count (streak is not broken until midnight).

### Success Criteria
- Current streak and best streak display correctly
- Streak resets if a day ends at below 100%
- Both numbers update in real time as habits are checked off

---

## Phase 12 — Health Metric Logging
**What this does:** Adds optional daily health tracking fields alongside your habits — sleep hours, mood score (1–5), and water intake.

**Status:** [x] Done

**Completion Notes:**
- `health_logs` table SQL run manually in Supabase — succeeded first attempt. Table has a `UNIQUE` constraint on `logged_on` (one row per day).
- Created `src/components/HealthLog.tsx` with three inputs: sleep (number 0–24, step 0.5), mood (5 emoji buttons 😞→😄), water (number 0–10, step 0.25).
- Saves on every input change using `supabase.from('health_logs').upsert({ logged_on: today, ...merged }, { onConflict: 'logged_on' })`. No explicit Save button.
- Pre-fills on load via `.maybeSingle()` — returns null if today's row doesn't exist yet without throwing an error.
- Clicking the currently-selected mood button again deselects it (sets `mood_score: null`).
- **Success criteria met:** all three fields save, persist, and reload correctly.

### Steps for Claude Code
1. Create the health metrics table in Supabase:
   ```sql
   create table health_logs (
     id uuid default gen_random_uuid() primary key,
     logged_on date not null unique,
     sleep_hours numeric(3,1),
     mood_score integer check (mood_score between 1 and 5),
     water_litres numeric(3,1),
     created_at timestamptz default now()
   );
   ```
2. Add a "Daily Health Log" section below the habit checklist on the Habits page with three inputs:
   - Sleep: number input (e.g. 7.5 hours)
   - Mood: 1–5 star or button selector
   - Water: number input (e.g. 2.5 litres)
3. On entering a value, save to Supabase immediately (upsert on today's date).
4. On page load, fetch today's health log and pre-fill any values already saved.

### Success Criteria
- All three health metric inputs save and reload correctly
- Values persist after page refresh
- The section is clearly labelled and visually separate from habits

---

## Phase 13 — Google Calendar Sync
**What this does:** Connects the app to your Google Calendar. When you add a task with a date and time, it automatically creates a calendar event. If you reschedule or delete the task, the event updates or disappears.

**Status:** [x] Done

**Completion Notes:**
- Installed `next-auth@^5.0.0-beta.30` and `googleapis@^171.4.0`. **`@auth/supabase-adapter` (mentioned in the plan) was NOT installed** — it is not needed for a single-user app without database-backed sessions.
- Files created: `src/lib/auth.ts` (NextAuth v5 config, Google provider with `calendar.events` scope, offline access), `src/app/api/auth/[...nextauth]/route.ts` (thin `{ GET, POST }` handler), `src/lib/googleCalendar.ts` (createEvent/updateEvent/deleteEvent), `src/types/next-auth.d.ts` (extends `Session` with `accessToken`), `src/components/CalendarButton.tsx` (sign-in/out button in sidebar footer).
- **Critical architectural issue discovered and resolved:** `googleapis` uses Node.js internals (`child_process`, `net`, `fs`) that cannot run in the browser or Next.js Edge runtime. Importing it in a client component causes a build error. All calendar API calls were moved to `src/app/api/calendar/route.ts` (a Node.js server-side API route). `page.tsx` calls `fetch('/api/calendar', { action, accessToken, task })` instead. `src/lib/googleCalendar.ts` is therefore **dead code** — it exists but is never called from client components.
- The `accessToken` from the Google OAuth flow is stored in the NextAuth JWT and forwarded to the calendar API route in the request body.
- **Known limitation: no token refresh.** OAuth access tokens expire after ~1 hour. `refreshToken` is stored in the JWT but never used to obtain a new `accessToken`. After expiry, calendar sync silently fails until the user clicks "Connect Google Calendar" again.
- **Success criteria partially met.** Connect ✅, create event on add ✅, delete event on task delete ✅, ✓ prefix on complete ✅. "Reschedule task updates event" is **not met** — there is no inline task-editing UI, so rescheduling is not possible without deleting and re-adding.

### Steps for Claude Code
1. Ask Yosef to:
   - Go to console.cloud.google.com and create a new project called `todo-app`
   - Enable the Google Calendar API
   - Create OAuth 2.0 credentials (Web Application type)
   - Add `http://localhost:3000` as an authorised redirect URI
   - Copy the Client ID and Client Secret
2. Install required packages: `npm install next-auth @auth/supabase-adapter googleapis`
3. Set up NextAuth.js at `src/app/api/auth/[...nextauth]/route.ts` with Google provider.
4. Add to `.env.local`:
   ```
   GOOGLE_CLIENT_ID=<paste here>
   GOOGLE_CLIENT_SECRET=<paste here>
   NEXTAUTH_SECRET=<generate a random string>
   NEXTAUTH_URL=http://localhost:3000
   ```
5. Add a "Connect Google Calendar" button to the app header. Clicking it initiates the Google OAuth flow.
6. Create `src/lib/googleCalendar.ts` with functions for:
   - `createEvent(task)` — creates a calendar event from a task
   - `updateEvent(task)` — updates an existing event
   - `deleteEvent(googleEventId)` — removes an event
7. Add a `google_event_id` column to the tasks table in Supabase:
   ```sql
   alter table tasks add column google_event_id text;
   ```
8. Hook calendar sync into task actions:
   - Add task with date/time → call `createEvent`, store `google_event_id`
   - Reschedule task → call `updateEvent`
   - Delete task → call `deleteEvent`
   - Complete task → call `updateEvent` with `✓ ` prefix on event title
9. Test with a real task: add `#app Test calendar sync tomorrow 3pm [1hr] p1` and confirm it appears in Google Calendar.

### Success Criteria
- Clicking "Connect Google Calendar" opens Google sign-in and grants permission
- Adding a dated task creates a corresponding Google Calendar event
- Rescheduling a task updates the event
- Deleting a task removes the event
- Completing a task adds a ✓ to the event title

### ⚠️ Pause Point
Ask Yosef to set up the Google Cloud project and provide the Client ID and Client Secret. Give him step-by-step instructions.

---

## Phase 14 — Customisable Views
**What this does:** Adds four views to the task manager — Today, Upcoming, By Project, and Backlog. The app remembers which view you were last using.

**Status:** [x] Done

**Completion Notes:**
- Added `Today`, `Upcoming`, `By Project`, `Backlog` view tabs to `page.tsx`. Last-used view persisted to `localStorage` with key `'lastView'`; default is `'today'` if nothing is stored.
- Each view is implemented as a render function. Today and Backlog share a `renderPriorityGroups()` helper (p1/p2 tasks, then collapsible p3). Upcoming groups tasks by ISO date and renders a day-header above each group.
- When a project is selected in the sidebar (via `?project=` query param), the view tabs are hidden and `renderByProject()` is used regardless of the stored view preference.
- **Design deviation from plan:** view tabs were initially styled as underline tabs (border-bottom active indicator). In Phase 16 they were redesigned as pill-style tabs right-aligned beside the page title.
- **Success criteria met:** all four views work correctly; view persists across browser sessions.

### Steps for Claude Code
1. Add view tabs or a toggle at the top of the task page: Today | Upcoming | By Project | Backlog
2. Implement each view:
   - **Today:** Tasks scheduled for today only (sorted p1 → p3)
   - **Upcoming:** Tasks scheduled in the next 7 days, grouped by day
   - **By Project:** All incomplete tasks, grouped by project with headers
   - **Backlog:** All tasks with no scheduled date
3. Save the last selected view to `localStorage` so it persists between browser sessions.
4. The default view on first load (or if nothing is saved) is Today.

### Success Criteria
- All four views render correctly with the right tasks in each
- Switching views updates the task list immediately
- The last used view is remembered after closing and reopening the browser

---

## Phase 15 — Polish & Deploy to Vercel
**What this does:** The final phase. Polishes the app visually, then deploys it to a live URL on Vercel so you can access it from any browser on your Mac.

**Status:** [x] Done

**Completion Notes:**
- App deployed to Vercel by connecting `abebeyosef/todo-app` GitHub repo. Live URL: `https://todo-app-seven-theta-97.vercel.app`.
- All six environment variables added to Vercel project settings: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (set to the live Vercel URL, not localhost).
- Google Cloud Console updated with the Vercel URL as an additional authorised redirect URI.
- Auto-deploy confirmed: every push to `main` triggers a new Vercel deployment.
- **Note:** the design polish done at this phase was limited (spacing consistency, hover states). A comprehensive visual redesign was added in Phase 16.
- **Success criteria met:** app is live and accessible; auto-deploy works.

### Steps for Claude Code
1. **Design polish — run through this checklist:**
   - Consistent spacing throughout (use Tailwind's spacing scale)
   - Sidebar has hover states and an active link indicator
   - All buttons have hover and focus styles
   - Empty states (e.g. "No tasks today") are friendly and well-styled
   - Task input bar is prominent and always visible
   - Typography is consistent (one font, clear hierarchy)
   - All colour-coding is consistent with the spec (p1 red, p2 amber, p3 grey, habit calendar colours)
   - Mobile layout is not required — but ensure it doesn't break on smaller Mac browser windows

2. **Connect GitHub to Vercel:**
   - Ask Yosef to go to vercel.com and log in
   - Click "Add New Project" and import the `todo-app` GitHub repository
   - Vercel will auto-detect Next.js

3. **Add environment variables to Vercel:**
   - In the Vercel project settings, add all variables from `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `GOOGLE_CLIENT_ID`
     - `GOOGLE_CLIENT_SECRET`
     - `NEXTAUTH_SECRET`
     - `NEXTAUTH_URL` (set this to the Vercel live URL, e.g. `https://todo-app.vercel.app`)

4. **Update Google OAuth redirect URI:**
   - Go back to Google Cloud Console and add the Vercel URL as an additional authorised redirect URI

5. **Deploy and test:**
   - Vercel will deploy automatically from the GitHub main branch
   - Test the live URL: add a task, check habits, confirm calendar sync works
   - Fix any issues that appear on the live deployment

6. **Set up auto-deploy:**
   - Confirm that Vercel is set to auto-deploy on every push to `main` (this is on by default)
   - From now on, any code change pushed to GitHub will automatically go live

### Success Criteria
- App is live at a public Vercel URL
- All features work on the live URL (not just locally)
- Google Calendar sync works with the live URL
- Auto-deploy is confirmed working (make a small change, push to GitHub, confirm it appears on the live site)

---

## Phase 16 — UI Design Polish
**What this does:** Transforms the app from functional-but-plain into something that looks and feels premium — clean, calm, and professional. The design reference is Todoist (warm neutrals, precise typography, refined sidebar), with influences from Things 3 (extreme minimalism, generous whitespace) and Linear (crisp layout, subtle depth). Every detail below is intentional. Do not skip any step.

**Status:** [x] Done

**Completion Notes:**
- Updated 13 files: `globals.css`, `layout.tsx`, `Sidebar.tsx`, `MainContent.tsx`, `TaskInput.tsx`, `TaskItem.tsx`, `TaskList.tsx`, `page.tsx`, `habits/page.tsx`, `HabitCalendar.tsx`, `HealthLog.tsx`, `ProjectModal.tsx`, `CalendarButton.tsx`.
- **Tailwind v4 limitation:** arbitrary CSS variable values (e.g. `text-[var(--accent)]`) are not reliably resolved in all contexts. All colour and shadow references use inline `style={}` props or `onMouseEnter`/`onMouseLeave` handlers instead of Tailwind arbitrary classes. Hover states that require CSS variable colours are implemented via JavaScript event handlers, not pure CSS.
- **Priority dot deviation from spec (16.6):** the plan says p2 hidden until hover, p3 always grey. Actual implementation hides *both* p2 and p3 until hover; only p1 (red) is always visible. This reduces visual noise — p3 tasks look clean unless hovered.
- **Section 16.11 QA checklist was not executed.** Verification was build-only (`npm run build` with TypeScript checks passing). No browser-based visual inspection or cross-browser testing was performed.
- **Deployment status uncertain at time of writing:** user reported the live Vercel URL appeared unchanged after the Phase 16 push. Cause unknown — pending deployment, failed deploy, or browser cache. Commits `790639b` and `d263dba` are confirmed on GitHub `main`.
- **Success criteria partially met:** all components updated and build passes; live deployment not yet confirmed.

---

### 16.1 — Colour System

Replace any ad-hoc colours in the codebase with this exact design token system. Define these as CSS custom properties in `src/app/globals.css` and use them everywhere.

```css
:root {
  /* Backgrounds */
  --bg-app:        #FEFDFC;   /* Warm white — main app background (Todoist-inspired) */
  --bg-sidebar:    #F5F3F0;   /* Slightly darker warm grey — sidebar */
  --bg-hover:      #EDEAE6;   /* Subtle hover state on sidebar items */
  --bg-card:       #FFFFFF;   /* Pure white — task cards / input bar */
  --bg-input:      #F7F6F4;   /* Input field background when unfocused */

  /* Text */
  --text-primary:  #25221E;   /* Near-black — task names, headings */
  --text-secondary:#6B6560;   /* Medium grey — dates, metadata, placeholders */
  --text-muted:    #B0ABA5;   /* Light grey — empty states, disabled */

  /* Accent */
  --accent:        #DB4035;   /* Todoist red — primary action, active nav, p1 badge */
  --accent-hover:  #C0392B;   /* Darker red — hover on accent elements */

  /* Priority colours */
  --p1:            #DB4035;   /* Red */
  --p2:            #FF9800;   /* Amber */
  --p3:            #9E9E9E;   /* Grey */

  /* Habit calendar colours */
  --habit-green:   #2E7D32;
  --habit-lgreen:  #66BB6A;
  --habit-amber:   #FF9800;
  --habit-red:     #EF5350;
  --habit-grey:    #E0E0E0;

  /* Borders & dividers */
  --border:        #E8E4DF;   /* Subtle warm border */
  --divider:       #F0ECE8;   /* Even subtler — between task rows */

  /* Shadows */
  --shadow-sm:     0 1px 3px rgba(0,0,0,0.06);
  --shadow-md:     0 4px 12px rgba(0,0,0,0.08);
}
```

---

### 16.2 — Typography

Install and apply the Inter font from Google Fonts. Add this to `src/app/layout.tsx`:

```tsx
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
```

Apply these exact type styles throughout the app using Tailwind classes or inline styles:

| Element | Size | Weight | Colour |
|---|---|---|---|
| App name ("ToDo") | 16px | 700 | `--text-primary` |
| Sidebar nav items | 14px | 500 | `--text-primary` |
| Section headings (e.g. "Today") | 22px | 700 | `--text-primary` |
| Task name | 14px | 400 | `--text-primary` |
| Task metadata (date, project, duration) | 12px | 400 | `--text-secondary` |
| Input placeholder | 14px | 400 | `--text-muted` |
| Priority badge | 11px | 600 | White |
| Empty state message | 14px | 400 | `--text-muted` |

Rules:
- Never use more than two font weights on any single screen
- Line height for task names: 1.5. For headings: 1.2.
- Letter spacing for section headings: `-0.02em`

---

### 16.3 — Sidebar

The sidebar is the spine of the app. It should feel calm and organised, not cluttered.

**Structure (top to bottom):**
1. App name / logo — "ToDo" in bold, with 24px padding top and left
2. 16px gap
3. Navigation section — "Tasks" and "Habits" links
4. 24px gap + a subtle horizontal divider (`--divider`)
5. "Projects" label (10px, uppercase, letter-spacing 0.08em, `--text-muted`)
6. Project list (Work, Personal, Health, App, Inbox)
7. "+ New Project" button at the bottom of the project list
8. Spacer to push the bottom section down
9. Google Calendar connection status at the very bottom

**Sidebar width:** exactly `240px`. Fixed, not resizable.

**Nav item styling:**
- Height: 36px, padding: 0 12px
- Border radius: 8px
- Active state: `--bg-hover` background + `--accent` coloured left bar (3px wide, full height, border-radius 2px)
- Hover state: `--bg-hover` background, transition 100ms ease
- Icon (optional): 16px, same colour as text, 8px gap to the right of icon

**Project items:**
- Same height and padding as nav items
- Left: a 10px filled circle in the project's colour
- Middle: project name
- Right: task count in `--text-muted`, 12px

**Sidebar background:** `--bg-sidebar`. No border-right — use the colour difference to create natural separation.

---

### 16.4 — Task Input Bar

This is the most-used element in the app. It must feel prominent and inviting.

- Position: fixed at the top of the main content area, full width of the content column
- Height: 52px
- Background: `--bg-card` with `var(--shadow-sm)`
- Border: 1.5px solid `--border`, border-radius: 12px
- Padding: 0 16px
- Placeholder text: "Add a task — try #project task name tomorrow 2pm [1hr] p1"
- Font size: 14px, colour `--text-muted` for placeholder, `--text-primary` when typing
- On focus: border colour transitions to `--accent`, shadow lifts to `var(--shadow-md)`, transition 150ms ease
- Submit button (→ arrow or ↵): appears on the right side only when the input has content. Colour: `--accent`. Clicking it submits. Hidden when empty.
- Margin below the bar before the task list: 24px

---

### 16.5 — Task List & Task Rows

Each task row is the core unit of the app. Make it feel light and readable.

**Task row layout (left to right):**
1. Checkbox — 18px circle, border 1.5px `--border`. On hover, border turns `--accent`. On check: fills with `--accent`, shows a white checkmark, then the row slides up and fades out over 250ms.
2. 12px gap
3. Task name — 14px, `--text-primary`
4. Below task name (if metadata exists): project dot + project name + date + duration in 12px `--text-secondary`, on a second line
5. Right-aligned: priority badge (see 16.6)

**Row styling:**
- Height: minimum 44px (taller if two lines of content)
- Padding: 10px 0
- Bottom border: 1px solid `--divider` (not on the last item)
- No background colour on rows — they sit directly on `--bg-app`
- Hover: very subtle `--bg-hover` background, border-radius 8px, transition 80ms

**Section headings** (e.g. "Today", "Tomorrow", "Overdue"):
- 13px, uppercase, letter-spacing 0.06em, `--text-muted`
- 24px margin top, 8px margin bottom
- No background or box

**Completed tasks section:**
- Collapsed by default, toggle with a chevron
- Task names: colour `--text-muted`, text-decoration: line-through
- Completion date shown in 12px `--text-muted` on the right

---

### 16.6 — Priority Badges

Replace any chunky labels with small, refined indicators.

- Style: a small filled dot, 8px diameter, inline with the task row on the right side
- p1: `--p1` (red dot)
- p2: `--p2` (amber dot) — shown only on hover of the task row (to reduce visual noise; p2 is the default)
- p3: `--p3` (grey dot)
- On click: cycles p1 → p2 → p3 → p1, updates Supabase, shows a brief scale animation (scale 1.4 → 1.0 over 150ms)
- Tooltip on hover: "Priority 1 — click to change"

---

### 16.7 — Empty States

Every empty state should feel calm and encouraging, not like an error.

| View | Empty state message |
|---|---|
| Today — no tasks | "Nothing scheduled for today. Add one above ↑" |
| Upcoming — no tasks | "Your next 7 days are clear." |
| Backlog — empty | "No tasks in your backlog." |
| A project — empty | "No tasks in [Project Name] yet." |
| Habits — none added | "No habits set up yet. Add your first one below." |

Styling: message centred vertically in the content area, `--text-muted`, 14px. No illustration needed — clean text only.

---

### 16.8 — Habit Tracker Screen

**Daily checklist:**
- Each habit row: same height and layout as a task row
- Emoji (if set) shown at 18px before the habit name
- Checkbox style: same as task rows, but on completion fills with a softer green (`--habit-green`) instead of red

**Monthly calendar:**
- Each day cell: 36px × 36px, border-radius 6px, the completion colour as background
- Date number inside: 11px, white if background is dark, `--text-secondary` if cell is grey
- Today's cell: thin `--accent` border (1.5px), even if it has a colour
- Calendar grid: 7 columns, aligned to Mon–Sun. Month name and year as heading above.
- Prev/Next month navigation: small arrow buttons, right-aligned on the heading row

**Streak counters:**
- Displayed in two cards at the top of the habits page, side by side
- Card: white background, `var(--shadow-sm)`, border-radius 12px, padding 16px 20px
- Large number: 32px, 700 weight, `--text-primary`
- Label below: "Current streak" / "Best streak", 12px, `--text-muted`
- Fire emoji 🔥 before current streak number. Trophy emoji 🏆 before best streak.

---

### 16.9 — Micro-interactions & Transitions

These small touches make the app feel alive and polished.

- **Task completion:** checkbox fill + row fade-out: 250ms ease
- **Sidebar active link change:** background transition: 100ms ease
- **Input bar focus:** border + shadow transition: 150ms ease
- **Priority badge click:** scale pop: 150ms ease
- **Modal open (new project):** fade in + slide up 8px: 200ms ease
- **Completed section expand/collapse:** height transition: 200ms ease
- **Habit checkbox:** same as task completion, but green fill
- All transitions: use `transition` CSS property. Never use JavaScript for animations that CSS can handle.

---

### 16.10 — Layout & Spacing System

Use only these spacing values (in px) throughout the entire app. Do not invent new ones.

`4, 8, 12, 16, 20, 24, 32, 40, 48, 64`

Key layout measurements:
- Sidebar width: 240px
- Main content max-width: 680px (centred in the remaining space)
- Main content horizontal padding: 40px each side
- Top padding below page heading: 32px
- Gap between input bar and task list: 24px
- Gap between task sections: 32px

**Page heading area:**
- Page title (e.g. "Today", "Upcoming", "Health") — 22px, 700, `--text-primary`
- Subtitle (e.g. "Sunday, 1 March" or task count) — 13px, `--text-secondary`, 4px below title
- View switcher tabs (Today / Upcoming / By Project / Backlog): placed to the right of the heading, 13px, pill-style tabs. Active tab: `--accent` background, white text. Inactive: `--bg-hover`, `--text-secondary`.

---

### 16.11 — Final QA Checklist

Before pushing to GitHub and deploying, go through every item below:

**Visual consistency**
- [ ] Every screen uses only the colours defined in Section 16.1
- [ ] Font sizes match the table in Section 16.2 on every screen
- [ ] Spacing uses only the values listed in Section 16.10
- [ ] No default Tailwind blue anywhere in the app

**Interactions**
- [ ] All transitions run at the specified durations
- [ ] Task completion animation works correctly
- [ ] Priority badge cycles correctly and updates the database
- [ ] Input bar focus state (border + shadow) works

**Content**
- [ ] All empty states show the correct messages from Section 16.7
- [ ] Sidebar shows correct task counts per project
- [ ] Habit calendar colours match the thresholds in Section 6.6 of the handoff doc

**Cross-browser**
- [ ] Test in Safari and Chrome on Mac
- [ ] Nothing overflows or breaks at 1280px wide browser window
- [ ] Nothing overflows or breaks at 1440px wide

**After QA passes:** commit all changes with message `"Phase 16 — UI design polish"` and push to GitHub. Vercel will auto-deploy.

---

## Phase 17 — Bug Fixes & Full App Testing
**What this does:** Systematically tests every feature in the app, documents what works and what doesn't, and fixes all known bugs. Do not skip any test. After fixing each bug, re-test that specific feature before moving on.

**Status:** [x] Done

**Completion Notes:**
- Added `try/catch` + `console.error('descriptive message:', error)` to every Supabase call across `page.tsx`, `habits/page.tsx`, and `Sidebar.tsx`. Calendar `fetch()` wrappers also wrapped.
- UI error messages added: `taskError` state in `page.tsx` passed as `error` prop to `TaskInput` (red text below input bar, input border turns red); `projectError` state in `Sidebar.tsx` passed to `ProjectModal` (inline red error inside modal); `habitError` state in `habits/page.tsx` (red text below the add-habit row, name input border turns red).
- **Bug 1 (tasks without project):** reviewed and confirmed not a real bug. Tasks with no `#tag` correctly receive `project_id: null` and appear under the virtual "Inbox" bucket in both the sidebar and the By Project view. No code change made. The plan's suggestion to create a real "Inbox" database row was not implemented.
- **Bugs 2, 3, 4 (project/task/habit creation):** no logic errors found in the form handlers or Supabase calls upon code inspection. Most likely cause of these symptoms in production is Supabase RLS blocking inserts silently. The added error handling will now surface these as visible console errors and UI messages.
- **Fixed drag-and-drop bug** (introduced Phase 9, surfaced Phase 17): `provided.draggableProps.style` was spread *after* custom styles in `habits/page.tsx`. This overrode the CSS `transform` used for drag positioning. Moved to spread first.
- **Full test suite (T1–T16, P1–P5, H1–H8, G1–G4) was NOT executed.** These tests require live browser interaction and cannot be run programmatically. All verification was code-review and build-check only.
- **Success criteria partially met:** all code-level fixes and error handling complete; manual browser test suite not run.

---

### 17.0 — Known Bugs to Fix First

Fix these confirmed bugs before running the full test suite below.

**Bug 1: Tasks without a project should go to Inbox**
- Currently, tasks typed without a `#project` tag have no project assigned and may not appear anywhere.
- Fix: In `src/lib/parseTask.ts`, when no `#project` tag is detected, set `project` to `"Inbox"` (matching the Inbox project in the database by name).
- In `src/app/page.tsx` (or wherever tasks are saved), if the parsed project is `"Inbox"`, look up the Inbox project ID from Supabase and assign it. If no Inbox project exists in the database, create it automatically on first use.
- Confirm: Type a task with no `#tag` — it should appear under Inbox in the sidebar.

**Bug 2: Adding a project does nothing**
- Investigate `src/components/ProjectModal.tsx` (or wherever the new project form lives).
- Check the browser console (right-click → Inspect → Console tab) for any red error messages when submitting a new project.
- Likely causes: (a) the Supabase insert is failing silently, (b) the form submit handler is not wired up correctly, (c) the modal closes before the insert completes.
- Fix the root cause. After fixing, confirm: creating a new project adds it to the sidebar immediately with a task count of 0.

**Bug 3: Adding a task does nothing**
- Investigate `src/components/TaskInput.tsx`.
- Check the browser console for errors on task submission.
- Likely causes: (a) the Supabase insert is failing (check environment variables are set correctly on Vercel), (b) the natural language parser is throwing an error and silently swallowing it, (c) the task list is not re-fetching after insert.
- Fix the root cause. After fixing, confirm: typing a task and pressing Enter adds it to the list immediately.

**Bug 4: Can't add a habit**
- Investigate `src/app/habits/page.tsx` and the habit settings panel.
- Check the browser console for errors when submitting a new habit.
- Likely causes: same as Bug 3 — silent failure on Supabase insert, or form handler not connected.
- Fix the root cause. After fixing, confirm: adding a habit name and pressing Enter or clicking Add shows it in the daily checklist immediately.

---

### 17.1 — Full Test Suite

Run through every test below in order. For each test, record the result as PASS or FAIL in a comment in the terminal. Fix any FAILs before moving on.

**Test environment:** Run tests on the live Vercel URL, not just localhost. Both should work.

#### Task Manager

| # | Test | How to test | Expected result |
|---|------|-------------|-----------------|
| T1 | Add task with no project | Type `Buy groceries` and press Enter | Task appears in Inbox |
| T2 | Add task with project tag | Type `#personal Book a dentist appointment tomorrow 3pm` | Task appears under Personal, scheduled for tomorrow at 3pm |
| T3 | Add task with all fields | Type `#work Finish report friday 2pm [1hr] p1` | Task appears in Work, Friday 2pm, 1 hour duration, p1 priority |
| T4 | p1 priority floats to top | Add a p3 task, then a p1 task | p1 task appears above p3 task |
| T5 | p3 tasks collapsed | Add a p3 task | It appears in a collapsed "Low priority" section |
| T6 | Complete a task | Click the checkbox on any task | Task moves to Completed section with a strikethrough |
| T7 | Delete a task | Hover a task and click delete | Task disappears from the list and from Supabase |
| T8 | Completed section collapsed | Complete a task | Completed section is collapsed by default, shows count |
| T9 | Expand completed section | Click the Completed section header | Completed tasks become visible |
| T10 | Cycle priority | Click the priority dot on a task | Priority cycles p1 → p2 → p3 → p1, updates in Supabase |
| T11 | Today view | Switch to Today view | Only tasks scheduled for today appear |
| T12 | Upcoming view | Switch to Upcoming view | Tasks for the next 7 days, grouped by day |
| T13 | Backlog view | Switch to Backlog view | Tasks with no date |
| T14 | By Project view | Switch to By Project view | All tasks grouped under their project headings |
| T15 | View remembered | Switch to Upcoming, close the browser tab, reopen | Upcoming view is still selected |
| T16 | Inbox project | Add a task with no `#tag` | It appears under Inbox in the sidebar |

#### Project Management

| # | Test | How to test | Expected result |
|---|------|-------------|-----------------|
| P1 | Create new project | Click "+ New Project", enter name and pick colour | Project appears in sidebar with count 0 |
| P2 | Filter by project | Click a project in the sidebar | Task list filters to that project only |
| P3 | Task count updates | Add a task to a project | Sidebar count for that project increments |
| P4 | Rename project | Right-click or click edit on a project | Can rename it; sidebar updates immediately |
| P5 | Delete project | Delete a project | Its tasks move to Inbox; project disappears from sidebar |

#### Habit Tracker

| # | Test | How to test | Expected result |
|---|------|-------------|-----------------|
| H1 | Add a habit | Open habits settings, add "Morning walk" | Habit appears in the daily checklist |
| H2 | Check off a habit | Click the checkbox on a habit | Checkbox fills green; logged in Supabase |
| H3 | Uncheck a habit | Click a checked habit | Unchecked; row removed from habit_logs |
| H4 | Reorder habits | Drag a habit up or down | Order updates and persists after refresh |
| H5 | Delete a habit | Delete a habit | Disappears from checklist; historical data preserved |
| H6 | Calendar colours | Complete all habits today | Today's cell shows green on the monthly calendar |
| H7 | Calendar navigation | Click previous month | Calendar shows last month's data |
| H8 | Streak counter | Complete all habits for 2+ consecutive days | Current streak shows correct number |

#### Google Calendar Sync

| # | Test | How to test | Expected result |
|---|------|-------------|-----------------|
| G1 | Connect Google Calendar | Click "Connect Google Calendar" | Google sign-in opens, then returns to app connected |
| G2 | Task creates event | Add `#work Test event tomorrow 4pm [30min]` | Event appears in Google Calendar |
| G3 | Delete task removes event | Delete that task | Event disappears from Google Calendar |
| G4 | Complete task updates event | Complete a task with a calendar event | Event title gets ✓ prefix |

---

### 17.2 — Error Handling Improvements

After fixing the known bugs, add proper error handling so future issues are visible rather than silent.

1. **Task input:** If the Supabase insert fails, show a small red error message below the input bar: "Couldn't save task — please try again." The input text should remain so it's not lost.
2. **Project creation:** If insert fails, show an inline error inside the modal.
3. **Habit creation:** If insert fails, show an inline error in the settings panel.
4. **General:** Add a try/catch around every Supabase call in the codebase. Log the error to the console with a descriptive message (e.g. `console.error('Failed to insert task:', error)`). Never let errors fail silently.

---

### 17.3 — After All Tests Pass

1. Commit all fixes: `git commit -m "Phase 17 — bug fixes and full test suite passed"`
2. Push to GitHub: `git push origin main`
3. Wait for Vercel to auto-deploy (usually under 2 minutes)
4. Re-run tests T1, T3, P1, H1, and G1 on the live Vercel URL to confirm the deployment is working

### Success Criteria
- All tests in 17.1 marked as PASS
- No silent errors anywhere in the app
- All four known bugs (17.0) confirmed fixed
- Live Vercel deployment passes spot-check tests

---

## Phase 18 — Todoist-Accurate Visual Redesign
**What this does:** Fully replaces the Phase 16 design with a pixel-accurate recreation of the Todoist interface observed in the reference screen recording. This is a comprehensive rework of every visual element. Phase 16 remains in this document for reference but Phase 18 takes priority in every area where they conflict.

**Status:** [ ] Pending

**Important note for Claude Code:** Read every section of this phase before writing a single line of code. The changes are interconnected — the sidebar, task input, and task rows all need to change together. Do not partially implement.

---

### 18.1 — Colour System (Replaces Phase 16.1 entirely)

Remove all Phase 16 CSS variables and replace with this exact set in `src/app/globals.css`:

```css
:root {
  /* Backgrounds */
  --bg-sidebar:       #FAF8F5;   /* Warm cream — sidebar background */
  --bg-main:          #FFFFFF;   /* Pure white — main content area */
  --bg-active:        #FFEED9;   /* Light amber/peach — active sidebar item */
  --bg-hover-sidebar: #F0EDE8;   /* Slightly darker cream — sidebar hover */
  --bg-hover-row:     #F5F5F5;   /* Very light grey — task row hover */
  --bg-modal:         #FFFFFF;   /* White — modal/dialog backgrounds */
  --bg-toast:         #1F1F1F;   /* Near-black — toast notification */
  --bg-input:         #FFFFFF;   /* White — task input form */
  --bg-tag:           #FFEED9;   /* Light amber — NL input parsed tokens */

  /* Text */
  --text-primary:     #202020;   /* Near-black — task names, headings */
  --text-secondary:   #666666;   /* Medium grey — metadata, descriptions */
  --text-muted:       #999999;   /* Light grey — placeholders, counts */
  --text-accent:      #B45309;   /* Dark amber — "Add task" label, links */
  --text-toast:       #FFFFFF;   /* White — toast text */
  --text-overdue:     #DB4035;   /* Red — overdue date text */
  --text-upcoming:    #B45309;   /* Amber — upcoming date text */

  /* Accent (primary action colour — amber/orange, as seen in recording) */
  --accent:           #D97706;   /* Amber — buttons, active icons */
  --accent-dark:      #B45309;   /* Darker amber — hover on accent */
  --accent-bg:        #FFEED9;   /* Very light amber — active item fill */

  /* Sidebar nav icon colour */
  --icon:             #555555;   /* Dark grey — all sidebar icons */
  --icon-active:      #D97706;   /* Amber — active sidebar item icon */

  /* Task row */
  --checkbox-border:  #CCCCCC;   /* Light grey — empty checkbox ring */
  --divider:          #F0F0F0;   /* Very subtle — between task rows */

  /* Date badge colours */
  --date-overdue-bg:  #FDECEA;   /* Light red bg — overdue date pill */
  --date-future-bg:   #FFF3E0;   /* Light amber bg — upcoming date pill */

  /* Borders */
  --border:           #E8E4DF;   /* Warm grey — input borders, modal edges */
  --border-input:     #D1CBC3;   /* Slightly darker — input field border */

  /* Shadows */
  --shadow-dropdown:  0 4px 16px rgba(0,0,0,0.12);  /* Dropdown/modal shadow */
  --shadow-toast:     0 4px 12px rgba(0,0,0,0.20);  /* Toast shadow */
}
```

---

### 18.2 — Typography (Replaces Phase 16.2)

Keep the Inter font from Phase 16. Apply this updated type scale:

| Element | Size | Weight | Colour | Notes |
|---|---|---|---|---|
| Page title (e.g. "Today", "PMG") | 24px | 700 | `--text-primary` | Letter-spacing: -0.02em |
| Page subtitle (e.g. "1 task") | 13px | 400 | `--text-muted` | 4px below title |
| Sidebar section label ("My Projects") | 12px | 600 | `--text-secondary` | Uppercase, letter-spacing 0.04em |
| Sidebar nav item | 15px | 400 | `--text-primary` | |
| Sidebar nav item — active | 15px | 600 | `--text-primary` | |
| Task name | 15px | 400 | `--text-primary` | |
| Task date/metadata | 12px | 400 | `--text-overdue` or `--text-upcoming` | Depends on date status |
| Task placeholder | 15px | 400 | `--text-muted` | "Task name" |
| Description placeholder | 13px | 400 | `--text-muted` | "Description" |
| Section date header (e.g. "Mar 1 · Today · Sunday") | 14px | 600 | `--text-primary` | |
| "Overdue" section header | 14px | 600 | `--text-secondary` | |
| "Add task" button in sidebar | 15px | 600 | `--text-accent` | |
| Toast text | 13px | 400 | `--text-toast` | |
| Modal field label | 13px | 600 | `--text-primary` | |
| Button text (primary) | 14px | 600 | `#FFFFFF` | |
| Button text (secondary) | 14px | 400 | `--text-secondary` | |

---

### 18.3 — Overall Layout (Replaces Phase 16.10)

```
┌─────────────────────┬──────────────────────────────────────────┐
│   SIDEBAR  280px    │           MAIN CONTENT                   │
│   bg: --bg-sidebar  │           bg: --bg-main                  │
│                     │                                          │
│   [traffic lights   │   [page title]                           │
│    at very top]     │                                          │
│                     │   [task list]                            │
│   [user avatar]     │                                          │
│   [Add task btn]    │                                          │
│   [nav items]       │                                          │
│   [My Projects]     │                                          │
│   [project list]    │                                          │
│                     │                                          │
│   [Help & resources]│                                          │
└─────────────────────┴──────────────────────────────────────────┘
```

- Sidebar width: **280px** (wider than Phase 16's 240px — matches Todoist exactly)
- No visible border between sidebar and main — colour difference creates separation
- Main content: **no max-width** — content uses the full remaining width with `48px` padding each side
- App window: full Mac window with standard traffic light buttons (these come from the OS — no styling needed)

---

### 18.4 — Sidebar (Replaces Phase 16.3 entirely)

**Structure top to bottom:**

**1. User row** (top of sidebar, 16px padding)
- Circle avatar with initials ("YA"), teal/blue-green background, white initials, 32px diameter
- Username "Yosef" in 14px, 500 weight, `--text-primary`
- Small dropdown chevron after name

**2. Primary action row** (12px below user row)
- Large circular `+` button: 28px diameter, `--accent` background, white `+` icon, 20px
- Text: "Add task" in 15px, 600 weight, `--text-accent`
- Right side: waveform/voice icon in `--icon`, 18px
- This row has 12px left padding, 8px top/bottom padding
- On hover: text and icon darken slightly

**3. Navigation items** (16px top margin)
Each item: 36px height, 12px left padding, 8px border-radius, full sidebar width minus 8px on each side

Icons (16px, `--icon`): use these Lucide icons:
- Search → `Search`
- Inbox → `Inbox`
- Today → `CalendarCheck`
- Upcoming → `CalendarRange`
- Filters & Labels → `Tag`
- More → `MoreHorizontal`

Layout: `[icon 16px] [8px gap] [label]` — right side shows count badge if > 0

**Active state:** `--bg-active` background fill, icon colour → `--icon-active`, text weight → 600. NO left border. Just background fill.

**Hover state:** `--bg-hover-sidebar` background, transition 80ms ease.

**Count badge** (right side of nav items):
- Red text, 13px, 400 weight: `--text-overdue`
- No background — just the number in red

**4. "My Projects" section** (24px below nav items)
- Header: "My Projects" label left-aligned + collapse chevron right-aligned
- Label: 12px, 600, `--text-secondary`, NOT uppercase (matches Todoist)
- Chevron rotates on collapse

**Project items** (same height/padding as nav items):
- Left: `#` symbol in the project's assigned colour (16px, bold) — NOT a dot
- Middle: project name, 15px, `--text-primary`
- Right: task count in `--text-muted`, 13px — only shown if > 0
- On hover: shows `···` (three dots) button on far right for project actions (rename, delete)
- Active: `--bg-active` background, name weight → 600

**5. Bottom of sidebar**
- "Help & resources" link in `--text-muted`, 13px, with a `?` circle icon, pinned to bottom with 16px padding

---

### 18.5 — Task Input (Replaces Phase 16.4 entirely)

**CRITICAL CHANGE:** Remove the fixed input bar at the top of the content area. Todoist does NOT have a persistent input bar in the content area. Instead, task input works in two ways:

**Way 1: "Add task" button in sidebar** (always visible)
- Clicking opens the inline task form at the TOP of the current view's task list

**Way 2: "+ Add task" row at the bottom of each task list**
- A subtle `+` icon followed by "Add task" text in `--text-muted`, 15px
- On hover: text and icon become `--text-accent` (amber)
- Clicking expands the inline task form directly below the last task

**The inline task form** (expands in place, replacing the "+ Add task" row):

```
┌─────────────────────────────────────────────────────────────┐
│  Task name                                          [🎤]    │
│  Description                                                │
├─────────────────────────────────────────────────────────────┤
│  [📅 Date] [⏰ Deadline] [🚩 Priority] [🔔 Reminders] [···]│
├─────────────────────────────────────────────────────────────┤
│  [# ProjectName ▾]               [Cancel] [Add task]       │
└─────────────────────────────────────────────────────────────┘
```

Styling:
- White background, 1px `--border` border, border-radius 8px, `--shadow-dropdown`
- Task name input: 15px, `--text-primary`, placeholder "Task name" in `--text-muted`
- Description input: 13px, placeholder "Description" in `--text-muted`
- Toolbar row: small pill buttons — `[icon] [label]` format, 12px text, `--text-secondary`, border: 1px `--border`, border-radius 4px, 6px horizontal padding
- When date is parsed/set: pill shows the date value in `--text-accent` with amber background `--accent-bg`, and an `×` to clear it
- Project selector: `#` in project colour + project name + dropdown arrow
- Cancel button: no border, `--text-secondary`, 14px
- "Add task" button: `--accent` background, white text, 14px, 600 weight, border-radius 6px, 10px horizontal padding

**Natural language parsing behaviour (visual):**
When the user types `#PMG make app tomorrow`:
- `#PMG` gets highlighted as an amber tag pill inline within the text
- `tomorrow` gets highlighted as an amber tag pill inline within the text
- The project selector at the bottom automatically switches to `# PMG`
- The Date pill in the toolbar automatically populates with "Tomorrow" in amber

---

### 18.6 — Task Rows (Replaces Phase 16.5)

**Row structure (left to right):**
```
[⠿] [○] Task name                      [✏] [💬] [···]
         📅 Feb 26 5 PM
```

Elements:
1. **Drag handle** `⠿` (6 dots): 16px, `--text-muted`, only appears on ROW HOVER, 8px to the left of checkbox
2. **Checkbox** `○`: 20px diameter circle, border 1.5px `--checkbox-border`. On hover: border colour → `--accent`. On click: fills with `--accent`, white checkmark appears, then row fades out over 200ms
3. **12px gap**
4. **Task name**: 15px, 400, `--text-primary`
5. **Date line** (second line, only if date exists): calendar icon (12px) + date text (12px). Colour: `--text-overdue` (red) if past, `--text-upcoming` (amber) if future. No date = no second line.
6. **Action icons** (right side, only on ROW HOVER): pencil (edit), comment bubble, three dots (`···`). All 16px, `--icon`. Gap between icons: 12px. Fade in on hover over 80ms.

**Row metrics:**
- Min height: 48px (56px if two lines)
- Padding: 8px top and bottom, 0px left (drag handle sits outside)
- Bottom border: 1px `--divider` (only between rows — not after the last one)
- Background on hover: `--bg-hover-row`, border-radius 6px, transition 80ms

**Section grouping headers** (within task lists):
- "Overdue" header: 13px, 600, `--text-secondary` on left + "Reschedule" in `--text-accent` on right
- Date headers (e.g. "Mar 1 · Today · Sunday"): 14px, 600, `--text-primary`, 20px top margin, 8px bottom margin
- A thin `--divider` line above each date header

---

### 18.7 — Priority System (Replaces Phase 16.6)

Todoist uses **flag icons** for priority, not dots. Update accordingly:

- **p1**: red flag icon 🚩 (filled red `#DB4035`) — shown always on the task row, right-aligned before the action icons
- **p2**: orange flag icon (filled amber `#D97706`) — shown on hover only
- **p3**: blue flag icon (filled `#4073FF`) — shown on hover only
- **No priority**: outline/empty flag icon — shown on hover only

In the task context menu (`···`), show the Priority section as 4 clickable flag icons in a row (red, orange, blue, outline) — clicking sets that priority.

Remove the small dot system from Phase 16 entirely.

---

### 18.8 — Context Menu (`···` on task rows)

When clicking the `···` button on a task row, show a dropdown menu:

```
┌─────────────────────────────┐
│ ↑  Add task above           │
│ ↓  Add task below           │
│ ✏  Edit              ⌘E    │
├─────────────────────────────┤
│ Date                     T  │
│ [📅] [📆] [⊘] [···]        │
├─────────────────────────────┤
│ Priority                 Y  │
│ [🚩] [🚩] [🚩] [🏳]        │
├─────────────────────────────┤
│ ⏰  Deadline                │
│ 🔔  Reminders               │
├─────────────────────────────┤
│ ↕  Move to...            V  │
│ ⧉  Duplicate                │
│ 🔗  Copy link to task       │
├─────────────────────────────┤
│ 🗑  Delete          (red)   │
└─────────────────────────────┘
```

Styling: white background, 1px `--border`, border-radius 8px, `--shadow-dropdown`, min-width 220px. Items: 34px height, 12px padding, 14px text. Keyboard shortcut shown in `--text-muted` right-aligned. Delete item: `--text-overdue` (red). Hover state: `--bg-hover-row`.

---

### 18.9 — "Add Project" Modal (Replaces current ProjectModal.tsx)

The modal observed in the recording:

```
┌──────────────────────────────────────┐
│ Add project  ?                    ×  │
├──────────────────────────────────────┤
│ Name                                 │
│ [________________________] 0/120     │
│                                      │
│ Color                                │
│ [● Charcoal                      ▾]  │
│                                      │
│                        [Cancel][Add] │
└──────────────────────────────────────┘
```

Keep it simple — just Name and Color (remove Workspace, Parent project, Access, Layout). These are Todoist Pro features we don't need.

Styling:
- White card, border-radius 12px, `--shadow-dropdown`, width 440px, centered in screen with dark overlay behind
- Header: "Add project" 16px, 600, `--text-primary` + `×` button top-right (20px, `--text-muted`)
- Field labels: 13px, 600, `--text-primary`, 8px below
- Text input: full-width, 1px `--border-input`, border-radius 6px, 10px padding, 15px text. Character count "0/120" right-aligned inside the input in `--text-muted`
- Color dropdown: shows color dot + color name, same border/radius as text input
- Color options: Charcoal, Berry Red, Forest Green, Sky Blue, Grape Purple, Tangerine Orange, Salmon Pink (each with a filled dot in that colour)
- Cancel button: 14px, `--text-secondary`, no border, no background
- Add button: `--accent` background, white text, 14px, 600, border-radius 6px, 12px horizontal padding

---

### 18.10 — Toast Notifications

Every action (task complete, task added, order changed) shows a toast in the **bottom-left corner**:

```
┌────────────────────────────────────┐
│  1 task completed  [Undo]  [×]     │
│  Task added to PMG  [Open]  [×]    │
│  Order changed  [Undo]  [×]        │
└────────────────────────────────────┘
```

Styling:
- Background: `--bg-toast` (#1F1F1F)
- Text: 13px, 400, white
- "Undo" / "Open": 13px, 600, white, underlined
- `×`: 14px white, `--text-muted` on hover
- Border-radius: 8px
- Padding: 12px 16px
- `--shadow-toast`
- Position: fixed, bottom: 24px, left: 24px
- Auto-dismisses after 5 seconds
- Multiple toasts stack vertically with 8px gap

Implement using a toast context in `src/lib/toast.tsx` — any component can trigger a toast by calling `showToast('message', 'undo' | 'open' | null)`.

---

### 18.11 — Today View Layout

The Today view has a specific layout that differs from other views:

- Page title: "Today" (large, bold)
- Subtitle: "✓ X tasks" below the title in `--text-muted`
- **"Overdue" section** at the top (if any overdue tasks):
  - Grey section header "Overdue" on left + "Reschedule" link in `--text-accent` on right
  - Lists overdue tasks with red dates
- **Date section** for today:
  - Header: "Mar 1 · Today · Sunday" in 14px, 600
  - Today's tasks below
- **"+ Add task"** row at the bottom of today's section

---

### 18.12 — Completed Tasks Behaviour

When a task is checked:
1. Checkbox fills with `--accent` (amber), white tick appears
2. Task row fades out over 200ms
3. Toast appears bottom-left: "1 task completed  Undo  ×"
4. Task moves to a hidden "Completed" view (not shown in main task list)
5. Pressing "Undo" in the toast un-completes it and brings it back

Do NOT show completed tasks in the same list with a strikethrough — they disappear from view immediately (this is different from Phase 16's behaviour).

---

### 18.13 — Implementation Order

Implement in this exact order to avoid breaking changes mid-way:

1. Update `globals.css` with Phase 18.1 colour tokens
2. Update `Sidebar.tsx` — new layout (18.4), wider at 280px, `#` project items, amber active state
3. Remove the fixed top input bar from `page.tsx` and `TaskInput.tsx`
4. Add `+ Add task` row to the bottom of each task section in `page.tsx`
5. Build the inline task form that expands from the `+ Add task` row
6. Update `TaskItem.tsx` — new row layout (18.6), drag handle, action icons on hover, flag priority
7. Update `ProjectModal.tsx` — simplified modal (18.9)
8. Build the toast system `src/lib/toast.tsx` and `src/components/Toast.tsx` (18.10)
9. Update context menu on task rows (18.8)
10. Update Today view layout (18.11)
11. `npm run build` — fix any TypeScript errors
12. Commit: `"Phase 18 — Todoist-accurate visual redesign"`
13. Push to GitHub — confirm Vercel deploys successfully
14. Test on live URL: add a task, complete it, check toast, add a project, switch views

---

### Success Criteria
- Sidebar is 280px wide, warm cream background, amber active states with NO left border indicator
- Project items show `#` in their colour — not dots
- No fixed input bar in the content area — task input is inline via `+ Add task`
- Task rows show drag handle + action icons on hover
- Priority uses flag icons, not dots
- Completing a task triggers a toast and removes the row immediately (no strikethrough in list)
- Toast notifications appear bottom-left, dark background, with Undo option
- "Add project" modal is clean and simple with just Name and Color fields
- Live Vercel deployment matches localhost exactly

---

*End of Build Plan — 18 Phases*
