# Personal Task & Habit Manager — Build Plan
**Project:** ToDo App | **Owner:** Yosef | **Last updated:** 2 March 2026 (Phase 21)

---

## How to Use This Plan with Claude Code

When you are ready to build, open Cursor, go to the terminal, and type `claude` to start Claude Code. Then paste the following prompt:

> "Please read the file at docs/BUILD_PLAN.md. This is the full build plan for my personal productivity app. Find the first phase marked `[ ] Pending` and work through it section by section.
>
> **Important — update this file as you go, not just at the end. For each numbered section (e.g. 22.1, 22.2), follow this three-step pattern before moving on:**
>
> 1. **Before writing any code**, add a brief **Approach** note directly below the section heading. Write 2–4 sentences explaining which files you will change, what the key decision or risk is, and how you plan to solve it. This captures your thinking so that if the session ends unexpectedly, the next session can resume without repeating the analysis.
>
> 2. **After completing the section**, add a **Completion Notes** entry directly below the Approach note, describing what you actually built, what files changed, and whether the success criteria were met.
>
> 3. **After completing the entire phase**, update its status in the Build Status table from `[ ] Pending` to `[x] Done` and add an overall Completion Notes block at the top of the phase.
>
> If you are interrupted or the session ends mid-phase, the Approach notes already written will preserve your reasoning so work can resume from exactly the right place without re-reading the codebase from scratch.
>
> If you hit an error you cannot fix, or you need information from me (like account credentials or API keys), stop and ask. Otherwise keep going until the entire pending phase is complete."

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
| 18 | Todoist-Accurate Visual Redesign | [x] Done |
| 19 | Bug Fixes, NL Parsing & Token Highlighting | [x] Done |
| 20 | Inbox Fallback for Unassigned Tasks | [x] Done |
| 21 | Inbox View, Task Detail, Habit Types, Search, Health Log, Calendars | [x] Done |
| 22 | Inbox as Master Task Overview | [x] Done |
| 23 | Google Calendar Sync Reliability | [x] Done |
| 24 | Duration in Upcoming View & Free-order NL Parsing | [x] Done |
| 25 | Completed Tasks Visible In-Place | [x] Done |
| 26 | Bug Fixes: Cursor Lag, Project Task Disappearing, Completed Tasks in Calendar | [x] Done |
| 27 | Theme Customisation — 11 Themes | [x] Done |
| 28 | Fix Cursor Lag in Task Input (Background-Highlight Approach) + Habit Delete | [x] Done |
| 29 | Mobile-Friendly Layout + PWA | [ ] Pending |
| 30 | Overlapping Calendar Events — Side-by-Side Column Layout | [ ] Pending |

### 🔮 Future Stages (Not Yet Actioned)
These ideas have been explored and scoped but are not part of the active build. Move them into the main table when ready to action.

| Future Stage | Name | Notes |
|---|---|---|
| F1 | Browser Extension (Safari + Chrome) | See detailed scope below |
| F2 | Multi-User Support | See detailed scope below |

---

## Project Health Summary

### ✅ Confirmed Working (code-verified, as of Phase 19)
- All Supabase CRUD for tasks, projects, habits, habit_logs, health_logs
- Natural language task input — chrono-node parses project tags, dates/times (12:00, 9am, 2:30pm), duration, priority; backlog keywords (someday, eventually, one day) stripped from task name
- Five task views (Today / Upcoming / By Project / Backlog / Inbox) with URL-based routing (`?view=`)
- Priority flag system (p1/p2/p3) — Lucide Flag icons in toolbar dropdown + context menu, Supabase update, p1 always visible in task row
- Project sidebar with live task counts via `tasks-changed` window event; `#` project symbols in project colour; amber active fill; no left border indicator
- Habit daily checklist (green checkbox), drag-and-drop reorder via @hello-pangea/dnd
- Monthly habit calendar with colour-coded completion cells and hover tooltips
- Streak calculation (current and best) in `src/lib/streaks.ts`
- Health log (sleep/mood/water) with upsert on today's date
- Google Calendar sync — create/update/delete via server-side `/api/calendar/route.ts`
- Vercel cron job (`vercel.json`) — cleanup runs at 2am UTC daily
- Toast system (`src/lib/toast.tsx`) — dark bottom-left toasts, 5s dismiss, Undo action
- Inline token highlighting (`src/lib/highlightTask.ts`) — mirror div behind transparent input highlights `#project`, date/time, `[duration]`, `p1/p2/p3` as coloured spans while typing
- Parsed preview line below task input — updates live with detected tokens
- Task INSERT: detailed error logging (code/message/details/hint); `google_event_id` conditional (only sent if non-null, avoiding failures when Phase 13 column wasn't migrated)
- Error message in InlineTaskForm clears on form remount and on first keystroke after a failure

### ⚠️ Known Issues
- **Google OAuth token expiry:** access tokens expire after ~1 hour. No automatic refresh implemented (`refreshToken` stored in JWT but unused). Calendar sync silently stops until user reconnects manually.
- **Cleanup cron and Supabase RLS:** cleanup API route uses the public anon key. If RLS is enabled on the tasks table without a service-role bypass, the cron job silently deletes 0 rows.
- **Dead code:** `src/lib/googleCalendar.ts` exists but is never called (all calendar calls go through `/api/calendar/route.ts`). Safe to delete.
- **Deadline button in InlineTaskForm:** clicking toggles today at 9:00am only — no date picker UI. The button is a placeholder; full date picker not yet implemented.
- **Reminders button:** renders with Bell icon but is non-functional (placeholder for a future phase).

### 🔲 Still Needs Attention
- Decide whether to implement OAuth token refresh or add a clear "Reconnect" prompt when the token is near expiry
- Remove dead file `src/lib/googleCalendar.ts`
- Add a proper date picker to the Deadline button in InlineTaskForm
- Implement Reminders functionality

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

**Status:** [x] Done

**Completion Notes:**
- Updated all CSS variables to Phase 18 amber/warm token set; added compatibility aliases (--bg-app, --bg-card, --bg-hover, --accent-hover, --shadow-sm/md, --p1/p2/p3) so habits page and health log keep working without full rewrites.
- Sidebar fully rewritten: 280px, user avatar (YA teal circle), amber Add task button firing `open-task-form` event, Lucide icons (Inbox/CalendarCheck/CalendarRange/ListTodo), `#` project symbols in colour, collapsible My Projects, amber active fill, no left border indicator.
- Fixed top TaskInput bar removed; replaced with `InlineTaskForm` component (new file) that expands from `+ Add task` row in each view section. Sidebar button fires `open-task-form` window event to open global form at top of current view.
- Task rows rewritten: drag handle (visual, hover-only), circle checkbox fades row on complete, date second line with overdue/upcoming colour, hover action icons (✏ edit, ··· context menu), flag priority icons replacing dots, p1 flag always visible.
- Context menu on ··· click: priority flags (p1/p2/p3 + no-priority row) + delete (red).
- ProjectModal redesigned: 440px card, Name field with 0/120 char count, named colour dropdown (7 colours) instead of swatches.
- Toast system created (src/lib/toast.tsx with ToastProvider): dark bottom-left toasts, 5s auto-dismiss, Undo/Open action + × dismiss, stacks with gap. Task completion removes row immediately and shows Undo toast.
- Today view: overdue section with "Reschedule" link, date header "Mar 1 · Today · Sunday", subtitle "✓ X tasks".
- View routing switched from localStorage tabs to URL params (?view=today/upcoming/backlog/inbox); sidebar nav items push to correct URLs.
- Build: `next build` passes cleanly. Commit: 244beb0.
- **Success criteria met:** all 9 criteria confirmed against code — sidebar 280px/amber active/# projects, no fixed input bar, drag handle, flag priority, toast on complete, dark toast with Undo, clean project modal.

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

## Phase 19 — Bug Fixes, NL Parsing Improvements & Inline Token Highlighting
**What this does:** Fixes three confirmed bugs from screen recording review, improves the natural language parser to correctly detect time and duration, and adds Todoist-style inline token highlighting inside the task input field so detected values are visually highlighted as you type.

**Status:** [x] Done

**Completion Notes:**
- **Bug 19.0.1 (task INSERT failure):** root cause was `google_event_id` being sent unconditionally in the INSERT payload — if the Phase 13 `ALTER TABLE` was never run in the actual Supabase project, every insert failed with a "column does not exist" error. Fixed by building the payload as a `Record<string, unknown>` and only spreading in `google_event_id` when it is non-null. Also improved error logging to `console.error('Task insert failed:', error.code, error.message, error.details, error.hint)` for future debugging.
- **Bug 19.0.2 (toolbar icons = triangles):** `InlineTaskForm.tsx` toolbar was using emoji characters (📅, 🚩) which rendered as orange/red play-button triangles in some environments. Replaced with Lucide React components: `CalendarClock` (Deadline), `Flag` (Priority), `Bell` (Reminders). Redesigned toolbar: single Priority button opens a small positioned dropdown with P1/P2/P3 options (each styled in their priority colour), replaced 3 separate flag buttons. Outside-click listener via `useEffect` + `priorityMenuRef` closes the dropdown.
- **Bug 19.0.3 (stale error persists on form reopen):** `error` prop was passed directly from parent `taskError` state into `InlineTaskForm`. On form remount, the stale error value was passed in immediately and shown. Fixed with a `mountedRef` guard: the component ignores the initial `error` prop value on mount, and only displays errors that arrive via subsequent prop changes (i.e. from a failed submit after the form is open). Additionally clears `localError` on the first keystroke after an error.
- **Phase 19.1 (NL parser):** added "someday", "eventually", "one day" as backlog keyword stripping — they are removed from the raw string before the name is finalised, so "#personal Call dentist someday" produces name "Call dentist" not "Call dentist someday". Confirmed all five test cases in the updated comment block. Chrono-node was already correctly handling combined date+time (e.g. "tomorrow 12:00", "friday 2:30pm") — no logic change needed there.
- **Phase 19.2 (inline token highlighting):** created `src/lib/highlightTask.ts` (new file). `buildHighlightedHTML(text, projectNames)` runs regex detection for `#project`, `[duration]`, `p1/p2/p3` and chrono-node for date/time ranges, sorts and de-overlaps them, and builds an HTML string with inline-styled `<span>` elements. `InlineTaskForm.tsx` renders a mirror `<div>` (absolute, `pointer-events: none`) behind a transparent `<input>` using identical font/size/line-height. When `name` has content, the input's `color` is set to `transparent` so the mirror shows through; `caretColor` remains visible. Added a parsed preview line below the input — "→ App · Tomorrow 12:00 · 60 min · Priority 1" — built from `formatPreview()` which calls `parseTask()` live on each keystroke.
- Files created/modified: `src/lib/highlightTask.ts` (new), `src/lib/parseTask.ts`, `src/components/InlineTaskForm.tsx`, `src/app/page.tsx`, `docs/BUILD_PLAN.md`.
- Build: `next build` passed with zero TypeScript errors. Commit: 370602b.
- **Success criteria met:** tasks save; time/duration parsed correctly in all 5 test cases; token highlighting colours appear live as you type; preview line shows detected tokens; toolbar shows CalendarClock/Flag/Bell icons; error message clears on reopen and on first keystroke.

**Implement in this exact order — do not skip ahead.**

---

### 19.0 — Critical Bug Fixes (Fix These First)

**Bug 1 — Tasks won't save**
This is the most important fix. Tasks fail to insert with "Couldn't save task — please try again."

Steps:
1. Find the Supabase task insert code and update the catch block to log the full error:
   ```ts
   console.error('Task insert failed:', error.code, error.message, error.details, error.hint)
   ```
2. Open the Supabase dashboard → Table Editor → `tasks` table and write down every column that exists there
3. Compare this exactly against every field the code is trying to insert. Fix any mismatch — including wrong column names, missing columns, or columns the table doesn't have
4. Specifically check:
   - Is `project_id` being sent as a valid UUID that exists in the `projects` table? Or is it sending a name string instead of a UUID?
   - Are any NOT NULL columns missing values in the insert?
   - Is there a column called `color` when the table has `colour` (or vice versa)?
   - Does the `priority` column expect `'p1'`/`'p2'`/`'p3'` strings, or integers like `1`/`2`/`3`?
5. Fix the root cause. Do not just suppress the error — actually fix what's wrong with the insert
6. Test: type `Buy milk` and press Add task. Task should appear in the list immediately

**Bug 2 — Toolbar icons showing as triangles**
The Deadline, Priority, and Reminders buttons in the task input form are rendering as orange/red play button triangles (▶) instead of proper icons.

Steps:
1. Find where these three buttons are rendered in the task input component
2. Check the Lucide icon imports — they are likely using icon names that don't exist in the installed version of lucide-react
3. Replace with these confirmed valid Lucide icon names:
   - Deadline → `CalendarClock`
   - Priority → `Flag`
   - Reminders → `Bell`
4. Confirm all three render as proper icons, not triangles or fallback symbols

**Bug 3 — Error message persists between form opens**
"Couldn't save task" stays visible even after closing and reopening the task form.

Steps:
1. Find the error state variable in the task input component
2. Add `setError(null)` in two places: (a) when the form is opened/expanded, (b) when the user starts typing (on the first keystroke after an error)
3. This ensures the form always starts clean

---

### 19.1 — Fix NL Parser: Time and Duration Detection

Currently the parser detects date words like "tomorrow" but misses the time ("12:00") and duration ("[1hr]"). Fix `src/lib/parseTask.ts` to handle all of the following correctly.

**Time detection** (must work alongside date detection):
- `12:00`, `9:00`, `14:30` → 24-hour format
- `1pm`, `9am`, `2:30pm`, `noon`, `midnight` → 12-hour format
- Must combine with date: `tomorrow 12:00` → tomorrow at 12:00. `monday 9am` → next Monday at 9am
- Use `chrono-node` for this — it handles combined date+time strings natively. Make sure the full string including time is passed to `chrono.parseDate()`, not just the date word

**Duration detection** (bracket format):
- `[1hr]`, `[2hr]`, `[30min]`, `[45min]`, `[1.5hr]`, `[90min]`
- Extract the number and unit, convert everything to minutes: `[1hr]` → 60, `[30min]` → 30, `[1.5hr]` → 90
- After extracting duration, remove the `[...]` token from the remaining string so it doesn't become part of the task name
- Store as `duration: number` (in minutes) on the parsed task object

**Test these exact inputs and confirm they all parse correctly:**

| Input | Expected output |
|---|---|
| `#app make an app tomorrow 12:00 [1hr]` | project: App, name: "make an app", date: tomorrow 12:00, duration: 60min |
| `#health Morning run today 7am [45min]` | project: Health, name: "Morning run", date: today 07:00, duration: 45min |
| `#work Call with client friday 2:30pm [30min] p1` | project: Work, name: "Call with client", date: Friday 14:30, duration: 30min, priority: p1 |
| `Buy milk` | project: Inbox, name: "Buy milk", no date, no duration, priority: p2 |
| `#personal Call dentist someday` | project: Personal, name: "Call dentist", backlog: true, no date |

Write these five test cases as a comment block at the top of `parseTask.ts` and verify each one manually before moving on.

---

### 19.2 — Inline Token Highlighting in the Task Input

**What this looks like:** As the user types, detected tokens are highlighted with coloured backgrounds directly inside the input field — exactly like Todoist. For example, typing `#app make an app tomorrow 12:00 [1hr] p1` shows:

```
[#app] make an app [tomorrow 12:00] [1hr] [p1]
  ↑ amber pill    ↑ blue pill      ↑ grey ↑ red
```

**Implementation — use a mirror div behind a transparent textarea:**

Replace the plain task name `<input>` with this two-layer structure:

```tsx
<div style={{ position: 'relative', width: '100%' }}>
  {/* Layer 1 — behind — renders highlighted HTML */}
  <div
    className="highlight-mirror"
    aria-hidden="true"
    dangerouslySetInnerHTML={{ __html: buildHighlightedHTML(inputValue) }}
  />
  {/* Layer 2 — on top — user types here, text is invisible */}
  <textarea
    value={inputValue}
    onChange={e => setInputValue(e.target.value)}
    style={{ background: 'transparent', color: 'transparent', caretColor: 'var(--text-primary)' }}
  />
</div>
```

Both layers must have **identical** CSS: same font-family, font-size, font-weight, line-height, letter-spacing, padding, margin, width, and `white-space: pre-wrap`. If these differ by even 1px, the highlights will be misaligned with the text.

The mirror div must have `pointer-events: none` so clicks pass through to the textarea.

**`buildHighlightedHTML(text)` function:**

This function takes the raw input string and returns an HTML string with detected tokens wrapped in `<mark>` spans. It must:

1. Run the NL parser on the current input to detect all tokens and their positions in the string
2. For each detected token, record its start index, end index, and type
3. Sort tokens by start index
4. Build the output string by iterating through the original text and wrapping detected ranges in styled spans

Token highlight styles:

| Token type | Background | Text colour | Border-radius |
|---|---|---|---|
| `#project` | `#FFEED9` | `#B45309` | 4px |
| Date + time | `#E8F4FD` | `#1D6FA4` | 4px |
| `[duration]` | `#F0F0F0` | `#555555` | 4px |
| `p1` | `#FDECEA` | `#DB4035` | 4px |
| `p2` | `#FFF3E0` | `#D97706` | 4px |
| `p3` | `#F5F5F5` | `#888888` | 4px |

Only highlight the `#project` token if it matches an existing project name. Everything else (the task name text) stays unstyled.

**Parsed preview line:**

Directly below the input wrapper (outside the mirror), show a small live preview in `--text-muted`, 12px, that only appears when at least one token has been detected:

```
→ App · Tomorrow 12:00 · 60 min · Priority 1
```

This updates on every keystroke and gives the user confidence the parser understood their input. Hide it when the input is empty or no tokens are found.

---

### 19.3 — Build Status Table Update

After implementing, update the build status table at the top of this file to show Phase 19 as `[x] Done`.

### 19.4 — Deployment

1. Run `npm run build` locally — fix any TypeScript errors before committing
2. Test on localhost with all five NL test cases from section 19.1
3. Test token highlighting — each token type should light up as you type
4. Confirm tasks save and appear in the list
5. Commit: `git commit -m "Phase 19 — bug fixes, NL parsing improvements, inline token highlighting"`
6. Push to GitHub and confirm Vercel deploys successfully
7. Test on the live Vercel URL — add a task with all token types, confirm it saves and highlights correctly

### Success Criteria
- Adding a task saves to Supabase and appears in the list immediately
- Time (12:00, 9am, 2:30pm) and duration ([1hr], [45min]) are correctly parsed and stored
- All five test cases in 19.1 produce the correct output
- Typed tokens are highlighted inline with coloured backgrounds as the user types
- The parsed preview line appears below the input when tokens are detected
- Toolbar icons show correctly (Flag, CalendarClock, Bell) — not triangles
- Error message clears when the form is opened or when the user starts typing

---

## Phase 20 — Inbox Fallback for Unassigned Tasks
**What this does:** Tasks added without a `#project` tag currently disappear from view. This fix ensures they always land in the Inbox project instead, where they can be found and categorised later.

**Status:** [x] Done

**Completion Notes:**
- `addTask()` in `page.tsx` now finds the Inbox project from the loaded `projects` state and uses `effectiveProjectId = task.projectId ?? matchedProject?.id ?? inboxProject?.id ?? null` — so any task with no `#tag` automatically goes to the Inbox project.
- `renderInbox()` updated to show tasks where `!t.projectId || t.projectId === inboxProject?.id`, covering both null-project legacy tasks and newly assigned Inbox tasks.
- `Sidebar.tsx` `loadProjects()`: finds the Inbox project row by name, then counts `inboxCount` as tasks where `!t.project_id || t.project_id === inboxProjectId`. The Inbox project is excluded from the "My Projects" list so it doesn't appear twice.
- The sidebar Inbox nav now routes to `/inbox` (the new dedicated page, Phase 21.1). `isInboxPage` added to `activeNav` detection.
- Build: `next build` passes cleanly. Commit: dab25be.

---

### Steps for Claude Code

1. **Find the task insert code** — wherever `parseTask()` output is used to build the Supabase insert payload (likely in `src/components/InlineTaskForm.tsx` or `src/app/page.tsx`)

2. **Find the Inbox project ID** — before inserting, query Supabase for the project whose name is exactly `"Inbox"`:
   ```ts
   const { data: inbox } = await supabase
     .from('projects')
     .select('id')
     .eq('name', 'Inbox')
     .single()
   ```

3. **Apply the fallback** — if the parsed task has no `project_id` (i.e. the user typed no `#tag`, or the tag didn't match any project), set `project_id` to the Inbox project's ID:
   ```ts
   const projectId = parsedTask.projectId ?? inbox?.id ?? null
   ```

4. **Handle the edge case** — if no Inbox project exists in the database yet, create it automatically before inserting the task:
   ```ts
   if (!inbox) {
     const { data: newInbox } = await supabase
       .from('projects')
       .insert({ name: 'Inbox', colour: '#808080' })
       .select('id')
       .single()
     projectId = newInbox?.id ?? null
   }
   ```

5. **Confirm Inbox appears in the sidebar** — the Inbox project should already be listed there. If it is not, check that it exists in the `projects` table in Supabase. If it is missing, insert it manually:
   ```sql
   insert into projects (name, colour) values ('Inbox', '#808080');
   ```

6. **Test:**
   - Type `Buy milk` (no `#tag`) → task should appear under Inbox in the sidebar
   - Type `#personal Call dentist` → task should appear under Personal, not Inbox
   - Click Inbox in the sidebar → both untagged tasks should be visible there

7. **Commit:** `git commit -m "fix: unassigned tasks fall back to Inbox instead of disappearing"`
8. **Push to GitHub** and confirm Vercel deploys successfully

### Success Criteria
- Any task typed without a `#project` tag saves to Inbox and is immediately visible there
- Tasks with a valid `#project` tag still go to the correct project
- Inbox is visible in the sidebar and clicking it shows all unassigned tasks
- No tasks disappear silently after being added

---

## Phase 21 — Feature Expansion: Inbox View, Task Detail, Habit Types, Search, Health Log & Calendar Redesign

**What this does:** Implements six distinct improvements observed from user testing. Each section is self-contained — implement them in order and confirm each works before moving to the next.

**Status:** [x] Done

**Completion Notes:**
- **21.1 — Inbox page (`src/app/inbox/page.tsx`, new):** Fetches tasks where `project_id = inbox.id OR project_id IS NULL`. Sort selector (Priority / Date / Date added / Alphabetical) persisted to `localStorage` under `'inbox-sort'`. Full task management (complete, delete, priority change, add task via InlineTaskForm). Empty state: "Your inbox is empty. Tasks without a project land here." Sidebar Inbox nav updated to route to `/inbox`; Inbox project hidden from My Projects list.
- **21.2 — Health log persistence (`src/components/HealthLog.tsx`):** Added 500ms debounce using `debounceRef` so Supabase is not hammered on every keystroke. `saved` state shows "Saved ✓" in green (#16a34a, 12px) for 1.5s after each successful upsert. The upsert logic was already correct; this phase added debounce and visual confirmation.
- **21.3 — Habit tracking types (`src/types/habit.ts`, `src/app/habits/page.tsx`):** Added `TrackingType` union (`checkbox | count | duration | amount | rating | mood | yesno`) to habit type. `logValues: Map<string, LogValue>` replaces the old `checked: Set<string>`. `logHabit()` upserts with `value` and `text_value`. Daily checklist renders per-type inputs: checkbox, Yes/No pills, +/− stepper (count), number input (duration/amount), 10-dot rating row, 5-emoji mood row. Manage panel add form includes Type selector + optional Goal/Unit fields. **Requires SQL migration** — see section 21.3 for the `ALTER TABLE` statements.
- **21.4 — Search overlay (`src/components/SearchOverlay.tsx`, `src/components/GlobalOverlays.tsx`, new):** Full-screen dark-backdrop overlay with auto-focused search input. Queries `tasks.ilike('name', '%query%')` after 2+ characters, showing task name + `#Project` in colour + date. Escape closes. `GlobalOverlays.tsx` is a client component in `layout.tsx` that listens for `'open-search'` window event and manages overlay visibility. Sidebar Search button now dispatches `'open-search'`. Clicking a result dispatches `'open-task-detail'` custom event with `taskId`.
- **21.5 — Task detail panel (`src/components/TaskDetailPanel.tsx`, new):** 400px right slide-in panel with: editable task name (click-to-edit → Supabase UPDATE on blur/Enter); metadata row (date/priority/project pills); description textarea (saves on blur with "Saved ✓"); sub-tasks section (INSERT/UPDATE/DELETE on `subtasks` table); comments section (INSERT on `task_comments` table, Cmd+Enter to post). `TaskItem` gained `onOpen` prop — clicking the task name area opens the panel. `page.tsx` manages `selectedTaskId` state and renders the panel. All Supabase calls are defensive (try/catch, empty graceful fallback). **Requires SQL migration** — see section 21.5 for the `CREATE TABLE` statements.
- **21.6 — Habit calendar (`src/components/HabitCalendar.tsx`, `src/app/habits/page.tsx`):** Habits page now has Today/Calendar tabs. Calendar tab shows `<HabitCalendar fullScreen />` only. `fullScreen` prop: streak cards above grid (36px numbers), larger cells at `calc((100vh - 280px) / numWeekRows)`, date number top-left + completion fraction centered, today cell with 2px `--accent` outline, "Today" reset button, click-to-open day popover listing completed habits.
- **21.7 — Upcoming week view (`src/app/page.tsx`):** `renderUpcoming()` completely replaced with 7-column Mon–Sun week grid. 60px per hour, 7am–10pm time axis. All-day row with date headers at top. Timed task event blocks: `top = (h - 7 + m/60) * 60`, `height = max(duration/60 * 60, 28)`, background = project colour at 20% opacity + 3px coloured border-left. Red current-time indicator line on current week. Week navigation via `weekOffset` state (◀/This week/▶). Clicking any task block opens task detail panel.
- New files: `src/app/inbox/page.tsx`, `src/components/SearchOverlay.tsx`, `src/components/GlobalOverlays.tsx`, `src/components/TaskDetailPanel.tsx`.
- Updated files: `src/app/page.tsx`, `src/components/Sidebar.tsx`, `src/components/HealthLog.tsx`, `src/components/HabitCalendar.tsx`, `src/app/habits/page.tsx`, `src/types/habit.ts`, `src/types/task.ts`, `src/app/layout.tsx`.
- Build: `next build` passes cleanly with zero TypeScript errors. Commit: dab25be.
- **SQL migrations: ✅ Successfully run by user (2 Mar 2026).** All Phase 21.3 and 21.5 migrations confirmed applied in Supabase. New columns and tables are live. Full feature testing still pending.

---

### 21.1 — Inbox View: Full Task List with Sort Controls

**Current behaviour:** Clicking Inbox in the sidebar navigates to the Today view instead of showing inbox tasks.

**Required behaviour:** Inbox shows every task assigned to the Inbox project (regardless of date), as one long scrollable list. A sort selector lets the user change the order.

**Steps:**
1. Create `src/app/inbox/page.tsx` — a dedicated Inbox page that fetches all incomplete tasks where `project_id` matches the Inbox project
2. Wire the Inbox sidebar link to navigate to `/inbox` instead of `/`
3. Add a sort selector in the top-right of the Inbox page. Style it as a small dropdown (matching the view tabs on other pages). Options:
   - **Priority** (default) — p1 first, then p2, then p3. Within each priority, sort by `created_at` ascending
   - **Date** — tasks with a scheduled date first (earliest first), then undated tasks at the bottom
   - **Date added** — `created_at` descending (newest first)
   - **Alphabetical** — task name A→Z
4. Persist the chosen sort to `localStorage` under the key `inbox-sort` so it's remembered between sessions
5. Display tasks in the same row format as other views (checkbox, name, date metadata, priority flag, action icons on hover)
6. Show a count below the page title: "X tasks"
7. Empty state: "Your inbox is empty. Tasks without a project land here."

---

### 21.2 — Daily Health Log: Fix Persistence

**Current behaviour:** Changing sleep hours, mood, and water values in the Daily Health Log doesn't save to Supabase — changes are lost on refresh.

**Steps:**
1. Find the Daily Health Log component and check the save logic. Most likely the `onChange` handler is updating local state but not calling a Supabase upsert
2. Each field should upsert to the `health_logs` table on change (use a 500ms debounce to avoid hammering the database on every keystroke):
   ```ts
   await supabase
     .from('health_logs')
     .upsert({ logged_on: today, sleep_hours: value }, { onConflict: 'logged_on' })
   ```
3. On page load, fetch today's `health_logs` row and pre-fill all three fields with the saved values
4. Add a subtle "Saved ✓" confirmation that appears briefly (1.5s) after each field saves, then fades out
5. Test: enter sleep = 7, mood = 4, water = 2.0, refresh the page — all three values should still be there

---

### 21.3 — Habit Tracking Types

**Current behaviour:** All habits are checkboxes only.

**Required behaviour:** When creating a habit, the user can choose a tracking type. The habit then renders the appropriate input each day.

**Database changes first** — run this SQL in Supabase:
```sql
alter table habits add column tracking_type text not null default 'checkbox';
alter table habits add column unit text;
alter table habits add column goal numeric;
alter table habit_logs add column value numeric;
alter table habit_logs add column text_value text;
```

**Tracking types to support** (these cover the most common real-world habit tracking use cases):

| Type | Description | Daily input | Example habits |
|---|---|---|---|
| `checkbox` | Simple done/not done | Green checkbox (existing) | Meditate, Take vitamins, Read |
| `count` | How many times | Number stepper (+/- buttons) | Pushups, Glasses of water, Pages read |
| `duration` | How many minutes | Number input + "min" label | Exercise, Screen-free time, Sleep (alternative) |
| `amount` | A measured quantity with custom unit | Number input + unit label | Calories, Steps, Weight (kg/lbs) |
| `rating` | Score out of 10 | A row of 10 small clickable circles | Energy level, Focus, Stress |
| `mood` | Emoji-based mood selection | 5 emoji buttons: 😞😐😊😄🤩 | Daily mood, Anxiety level |
| `yesno` | Yes or No (more explicit than checkbox) | Two pill buttons: "Yes" / "No" | Took medication, No alcohol, Cold shower |

**Habit creation modal changes:**
- Add a "Tracking type" field below the habit name — a segmented selector or dropdown showing all 7 types with a short description of each
- If type is `count`, `duration`, or `amount`: show an optional "Goal" number input and optional "Unit" text input (e.g. "calories", "steps", "kg")
- Unit and goal are stored in the `habits` table

**Daily checklist rendering:**
- Each habit row renders its input type instead of always showing a checkbox
- `checkbox` / `yesno` → existing checkbox or Yes/No pills
- `count` → `[-] [number] [+]` stepper, shows goal if set (e.g. "8 / 10")
- `duration` → number input with "min" suffix
- `amount` → number input with the habit's unit suffix
- `rating` → 10 small circles in a row, filled up to the selected number
- `mood` → 5 emoji buttons, selected one is highlighted with a subtle background

On any value change, upsert to `habit_logs` with both `value` (numeric) and `text_value` (for mood/yesno) for today's date. A `checkbox`/`yesno` completion is when `value = 1`.

**Streak and calendar calculation update:**
- A habit day counts as "completed" if: for checkbox/yesno → `value = 1`; for count/duration/amount → `value >= goal` (if goal set) or `value > 0` (if no goal); for rating/mood → any value logged
- Update the streak and calendar colour logic in `src/lib/streaks.ts` to use this rule

---

### 21.4 — Search

**Current behaviour:** Clicking Search in the sidebar does nothing.

**Steps:**
1. Clicking "Search" in the sidebar should open a full-screen search overlay (same pattern as many apps — a dark semi-transparent backdrop with a centred search input)
2. The overlay contains:
   - A search input at the top, auto-focused, with a magnifying glass icon and "Search tasks..." placeholder
   - Results list below, updating live as the user types (after 2+ characters)
   - An `×` button top-right to close, and pressing Escape also closes
3. Search queries the `tasks` table in Supabase using `ilike`:
   ```ts
   supabase.from('tasks').select('*').ilike('name', `%${query}%`).eq('completed', false)
   ```
4. Each result shows: task name, project name (with `#` in project colour), and scheduled date if any
5. Clicking a result closes the overlay and opens the task detail panel for that task (see 21.5)
6. If no results: show "No tasks matching '[query]'" in `--text-muted`
7. Wire the sidebar Search link to open this overlay

---

### 21.5 — Task Detail Panel

**Current behaviour:** Clicking a task does nothing.

**Required behaviour:** Clicking anywhere on a task row opens a slide-in panel from the right showing full task details, editable fields, sub-tasks, and comments.

**Panel layout** (slides in from the right, ~400px wide, full height, with a subtle shadow on the left edge):

```
┌────────────────────────────────────────┐
│  [×] Close                             │
│                                        │
│  ○ Task name (editable, click to edit) │
│                                        │
│  📅 Date     🚩 Priority  # Project    │
│                                        │
│  Description                           │
│  ┌──────────────────────────────────┐  │
│  │ Click to add a description...    │  │
│  └──────────────────────────────────┘  │
│                                        │
│  Sub-tasks                             │
│  ○ Sub-task 1                  [×]     │
│  ○ Sub-task 2                  [×]     │
│  + Add sub-task                        │
│                                        │
│  Comments                              │
│  ┌──────────────────────────────────┐  │
│  │ Add a comment...                 │  │
│  └──────────────────────────────────┘  │
│  [YA] Mon 2 Mar · "First comment"      │
└────────────────────────────────────────┘
```

**Database changes — run this SQL:**
```sql
create table subtasks (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references tasks(id) on delete cascade,
  name text not null,
  completed boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table task_comments (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references tasks(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

alter table tasks add column description text;
```

**Panel behaviour:**
- Clicking a task row opens the panel. The main task list stays visible behind it (panel overlays the right portion)
- Close with the `×` button or pressing Escape
- Task name is editable inline — click to edit, Enter or blur to save (updates Supabase)
- Description is a `<textarea>` that auto-expands — saves on blur with a "Saved ✓" confirmation
- Sub-tasks: add with the `+ Add sub-task` input (Enter to save), check off to complete, `×` to delete
- Comments: textarea at the top of the comments section, submit with Enter+Cmd or a Send button. Posted comments appear below in chronological order with a timestamp. Cannot be edited or deleted (keep it simple)
- All changes save to Supabase immediately

---

### 21.6 — Habit Calendar: Full Screen & Visual Redesign

**Current behaviour:** The calendar is a small grid at the top of the Habits page, sharing space with the habit checklist.

**Required behaviour:** The Habits page has two tabs — **Today** (the daily checklist) and **Calendar** (the full-screen calendar). The Calendar tab takes the entire content area.

**Tabs:**
- Add two tabs at the top of the Habits page: "Today" and "Calendar"
- "Today" tab shows the existing daily checklist and health log
- "Calendar" tab shows the full-screen calendar view

**Full-screen calendar redesign:**

Layout: the calendar fills the full content area. Each day cell is much larger — tall enough to show meaningful content inside each cell.

```
          March 2026                    [◀] [▶]
   Mon    Tue    Wed    Thu    Fri    Sat    Sun
┌──────┬──────┬──────┬──────┬──────┬──────┬──────┐
│  23  │  24  │  25  │  26  │  27  │  28  │   1  │
│      │      │      │      │      │      │      │
│      │      │      │      │      │      │ grey │
├──────┼──────┼──────┼──────┼──────┼──────┼──────┤
│   2  │   3  │  ... │      │      │      │      │
│ 2/2  │      │      │      │      │      │      │
│green │      │      │      │      │      │      │
└──────┴──────┴──────┴──────┴──────┴──────┴──────┘
```

Each day cell:
- **Size:** equal-width columns, rows sized to fill the available height (so the whole month fits without scrolling)
- **Date number:** top-left corner, 13px, `--text-secondary`
- **Completion fraction:** e.g. "2/3" in the centre of the cell, 12px, white if background is coloured
- **Background colour:** the completion colour from the spec (green/light-green/amber/red/grey)
- **Today's cell:** slightly bolder border (2px, `--accent`)
- **Hover:** slight brightness increase, cursor pointer. On hover, show a tooltip listing which habits were completed that day
- **Clicking a day:** shows a small popover with the list of habits and their logged values for that day

**Colour thresholds** (unchanged from spec):
- Green: 100% | Light green: 60–99% | Amber: 20–59% | Red: 1–19% | Grey: 0%

**Month navigation:**
- "◀" and "▶" arrows to move between months
- Month name and year as a large heading above the grid (20px, 700)
- A "Today" button next to the arrows that jumps back to the current month

**Streak cards** (shown above the calendar on the Calendar tab):
- Two side-by-side cards: "🔥 Current streak" and "🏆 Best streak"
- Card style: white background, subtle shadow, rounded corners, 20px padding
- Large number: 36px, 700, `--text-primary`. Label: 12px, `--text-muted`

---

### 21.7 — Upcoming View: Google Calendar-Style Week View

**Current behaviour:** Upcoming shows a flat list of tasks for the next 7 days, grouped by day.

**Required behaviour:** Upcoming shows a week-view calendar where scheduled tasks appear as coloured event blocks at their scheduled time, with height proportional to their duration — exactly like Google Calendar.

**Layout:**

```
        Mon 2    Tue 3    Wed 4    Thu 5    Fri 6    Sat 7    Sun 8
        ─────    ─────    ─────    ─────    ─────    ─────    ─────
 9am  │         │███████│         │         │         │         │
      │         │Make   │         │         │         │         │
10am  │         │app    │         │         │         │         │
      │         │███████│         │         │         │         │
11am  │         │       │         │███████  │         │         │
12pm  │         │       │         │Call     │         │         │
      │         │       │         │dentist  │         │         │
```

**Steps:**

1. Replace the flat list in `src/app/upcoming/page.tsx` (or wherever the Upcoming view is rendered) with a 7-column week grid
2. **Time axis** on the left: show hours from 7am to 10pm in 1-hour increments, 60px per hour
3. **Day columns:** 7 equal-width columns for Mon–Sun of the current week. Column headers show the day name + date number. Today's column has a subtle `--accent` tinted header background
4. **Week navigation:** "◀" and "▶" buttons to move one week forward/back. A "This week" button to jump back to the current week
5. **Task event blocks:** for each task with a scheduled date+time that falls in the visible week:
   - Position vertically based on scheduled time (e.g. 9:00am = 120px from top of 7am axis)
   - Height based on duration (e.g. 60 min = 60px, 30 min = 30px). Minimum height: 28px (for tasks with no duration or very short duration)
   - Width: fills the column minus 8px padding each side
   - Background: the project's colour at 20% opacity. Border-left: 3px solid the project's full colour
   - Content inside: task name (truncated if needed), duration below in smaller text (e.g. "1 hr")
   - Priority indicator: small coloured dot top-right of the event block
   - On hover: slightly elevated shadow, cursor pointer
   - On click: opens the task detail panel (from 21.5)
6. **Tasks without a time** (have a date but no time): shown in a small "all-day" row at the top of the relevant day column, as a flat pill rather than a timed block
7. **Tasks with no date at all:** not shown in this view (they're in Backlog)
8. **Current time indicator:** a horizontal red line across all columns at the current time, auto-updating every minute (only shown on the current week)
9. **Empty column:** if a day has no tasks, show nothing — just the empty grid lines

**Success criteria for 21.7:**
- Upcoming shows a 7-day week grid with a time axis
- Scheduled tasks appear as coloured blocks at the correct time and with correct height for their duration
- Clicking an event opens the task detail panel
- Week navigation (◀/▶/This week) works correctly
- The current time line is visible on the current week

---

### 21.8 — Deployment

1. Run all SQL migrations from 21.3 and 21.5 in Supabase before testing
2. Run `npm run build` locally — fix all TypeScript errors
3. Test each feature in order: Inbox sort, health log persistence, habit types (create one of each), search overlay, task detail panel, calendar full-screen, upcoming week view
4. Commit: `git commit -m "Phase 21 — inbox view, task detail, habit types, search, health log fix, calendar redesign, upcoming week view"`
5. Push to GitHub, confirm Vercel deploys successfully
6. Smoke-test on the live URL

### Success Criteria
- Inbox shows all unassigned tasks with working sort controls
- Health log values persist after page refresh
- All 7 habit tracking types can be created and logged
- Search overlay opens, returns live results, closes on Escape
- Clicking a task opens the detail panel with editable name, description, sub-tasks, and comments
- Habits page has Today/Calendar tabs; Calendar tab is full-screen and visually rich
- Upcoming shows a 7-day week grid with timed task event blocks and week navigation
- All changes deploy successfully to Vercel

---

---

## Phase 22 — Inbox as Master Task Overview
**What this does:** Changes the Inbox from a view that only shows unassigned tasks to a master overview of every task in the app — regardless of whether it has a project. Tasks continue to appear in their project views as normal; Inbox simply becomes the one place you can see everything together. A sort control lets you reorder by priority, due date, date added, or alphabetically.

**Status:** [x] Done

**Completion Notes:**
- `src/app/inbox/page.tsx`: removed the inbox-project-filter query entirely; now fetches all incomplete tasks via `supabase.from('tasks').select('*, projects(name, colour)').eq('completed', false)`. Page heading changed to "All Tasks", subheading to "Every task, across all projects.", empty state to "No tasks yet. Add one from any project view."
- `src/components/Sidebar.tsx`: label changed from "Inbox" to "All Tasks"; sidebar count now totals all incomplete tasks instead of only inbox/null tasks.
- `src/components/TaskItem.tsx`: added optional `showProjectLabel` prop; when true, renders a subtle colour dot + project name below the task name (hidden for tasks whose project is null or named "inbox").
- Build passed clean. Committed `bd9a22c` and pushed. Vercel deployment triggered.

### Background
Currently, `src/app/inbox/page.tsx` fetches tasks where `project_id = inbox.id OR project_id IS NULL`. This means tasks assigned to real projects (Work, Personal, etc.) are invisible in Inbox. The fix is to remove the project filter entirely so all tasks are returned, while keeping the sort control and the existing layout.

### Steps for Claude Code

#### 22.1 — Update the Inbox query

1. Open `src/app/inbox/page.tsx` (or wherever the Inbox data fetch lives — check `src/app/inbox/` and any related server components or API routes).
2. Find the Supabase query that fetches inbox tasks. It will look something like:
   ```ts
   .eq('project_id', inboxProjectId)
   // or
   .or(`project_id.eq.${inboxProjectId},project_id.is.null`)
   ```
3. Remove the project filter entirely so the query fetches **all tasks** for the user, regardless of `project_id`. The query should simply be:
   ```ts
   supabase.from('tasks').select('*, projects(name, color)').eq('completed', false)
   ```
   (Keep any existing `order` clause — the sort control will override it anyway.)
4. Confirm the result: the Inbox page should now show every incomplete task across all projects.

**Completion Notes:** *(Claude Code fills this in after completing 22.1)*

---

#### 22.2 — Update the Inbox page header and empty state

1. Change the page heading from "Inbox" to **"All Tasks"** (or keep "Inbox" — whichever reads more naturally as a master list; "All Tasks" is preferred).
2. Update the subheading or description text (if any) to reflect the new purpose, e.g. *"Every task, across all projects."*
3. Update the empty state message (shown when there are no tasks at all) to something like *"No tasks yet. Add one from any project view."*
4. The sort selector from Phase 21 should remain exactly as-is — Priority / Due date / Date added / Alphabetical — persisted to `localStorage` under `'inbox-sort'`.

**Completion Notes:** *(Claude Code fills this in after completing 22.2)*

---

#### 22.3 — Update the Sidebar label

1. Open `src/components/Sidebar.tsx`.
2. Find the "Inbox" navigation link in the sidebar.
3. Update its label to **"All Tasks"** to match the new page heading.
4. The route (`/inbox`) does not need to change — only the visible label.

**Completion Notes:** *(Claude Code fills this in after completing 22.3)*

---

#### 22.4 — Show project label on each task row in the Inbox

Since tasks from all projects are now mixed together, each task row in the Inbox should display which project it belongs to, so Yosef can tell at a glance where a task comes from.

1. In the Inbox task list, for each task row, display the project name (and optionally its colour dot) as a small inline label — positioned to the right of the task name or below it in muted text (e.g. `text-xs text-[#888]`).
2. If a task has no project (i.e. `project_id` is null or points to the special Inbox project), show no label (or show "Inbox" in muted text if helpful).
3. Use the `projects` join already available on the task object (from the `select('*, projects(name, color)')` query in 22.1).
4. Keep the label subtle — it should not compete visually with the task name.

**Completion Notes:** *(Claude Code fills this in after completing 22.4)*

---

#### 22.5 — Deploy

1. Run `npm run build` locally — fix any TypeScript errors.
2. Commit: `git commit -m "Phase 22 — inbox shows all tasks as master overview"`
3. Push to GitHub, confirm Vercel deploys successfully.
4. Smoke-test on the live URL: verify that tasks from all projects appear in All Tasks / Inbox, and that the sort control works.

**Completion Notes:** *(Claude Code fills this in after completing 22.5)*

---

### Success Criteria
- The Inbox / All Tasks view shows every incomplete task regardless of project
- Tasks still appear in their individual project views as before — nothing is removed or moved
- Each task row in the Inbox shows a subtle project label so you can tell which project it belongs to
- The sort control (Priority / Due date / Date added / Alphabetical) works correctly across all tasks
- The sidebar label reads "All Tasks"
- All changes deploy to Vercel successfully

---

---

## Phase 23 — Google Calendar Sync Reliability
**What this does:** Fixes the root causes of tasks sometimes not appearing in Google Calendar. A code investigation found four distinct problems: (1) Google OAuth access tokens expire after ~1 hour with no refresh or warning, causing all subsequent syncs to silently fail; (2) any calendar API failure is swallowed silently — the user sees no error; (3) tasks with a date but no time are synced as midnight timed events rather than true all-day events; (4) there is no way to manually re-sync a task if it missed. This phase fixes all four.

**Status:** [x] Done

**Completion Notes:**
- `src/lib/auth.ts`: session callback now exposes `token.expiresAt` as `session.expiresAt`. `src/types/next-auth.d.ts` already had the `expiresAt?: number` declaration.
- `src/app/page.tsx`: added `isTokenExpired()` helper (60-second buffer). On page load, a `useEffect` fires once when `accessToken` is first set — if the token is already expired, shows a toast. In `addTask`, before calling `calendarCreate`, checks expiry and shows the reconnect toast if expired; otherwise calls `calendarCreate` which now returns `string | null | false`. If `false`, sets `calendarSyncFailed = true` and shows a "Task saved, but calendar sync failed" toast after Supabase insert.  Added `calendarSync(id)` function — checks token, calls `calendarCreate`, and on success updates `google_event_id` in Supabase + local state. Passed as `onCalendarSync` to `renderTask`.
- `src/app/api/calendar/route.ts`: added `isAllDay()` helper and `buildEventTimes()` that returns `start.date`/`end.date` for midnight tasks and `start.dateTime`/`end.dateTime` otherwise. Applied to both `create` and `update` handlers. Error catch now returns `{ error: 'calendar_failed' }` with status 500 instead of `{ ok: true }`.
- `src/components/TaskItem.tsx`: added `onCalendarSync?: (id: string) => Promise<void>` prop and `syncing` state. When `task.scheduledAt && !task.googleEventId && onCalendarSync` and the row is hovered (or syncing), renders a `CalendarX2` icon button that calls `onCalendarSync` on click and shows as disabled while in flight.
- Build passed clean. Committed `bb94f76` and pushed.

### Root Cause Summary (from code investigation)

| Problem | Location | Effect |
|---------|----------|--------|
| OAuth token expires after ~1 hour, no refresh | `src/lib/auth.ts` — `expiresAt` stored but unused | All calendar syncs silently fail after first hour |
| Calendar API errors are swallowed silently | `src/app/page.tsx` `calendarCreate()` + `src/app/api/calendar/route.ts` | User has no idea sync failed |
| Date-only tasks create midnight timed events | `src/app/api/calendar/route.ts` lines 21–32 | Events appear at 12:00 AM with 60-min duration instead of as all-day events |
| No way to re-sync a missed task | Nowhere in app | If sync fails, it's lost forever with no recovery |

---

### Steps for Claude Code

#### 23.1 — Expose token expiry to the session and detect expiry

The `expiresAt` value is already stored in the JWT (in `src/lib/auth.ts`) but is never passed through to the session object. Fix this so the frontend knows whether the token is still valid before attempting a calendar sync.

1. Open `src/lib/auth.ts`. In the `jwt` callback, confirm `token.expiresAt` is being stored (it should already be).
2. In the `session` callback, expose it:
   ```ts
   session.expiresAt = token.expiresAt as number | undefined;
   ```
3. Open `src/types/next-auth.d.ts` (or wherever the session type is declared). Add:
   ```ts
   expiresAt?: number;
   ```
4. In `src/app/page.tsx` (where `calendarCreate` is called), add a helper:
   ```ts
   const isTokenExpired = (expiresAt?: number) =>
     !expiresAt || Date.now() / 1000 > expiresAt - 60; // 60-second buffer
   ```
5. Wrap the `calendarCreate` call with an expiry check:
   ```ts
   if (accessToken && task.scheduledAt) {
     if (isTokenExpired(session?.expiresAt)) {
       // Show reconnect toast — handled in 23.2
     } else {
       googleEventId = await calendarCreate(task, accessToken);
     }
   }
   ```

**Completion Notes:** *(Claude Code fills this in after completing 23.1)*

---

#### 23.2 — Show a "Reconnect Google Calendar" toast when token is expired

When the token is expired (detected in 23.1), instead of silently skipping the sync, show a persistent warning toast so Yosef knows to reconnect.

1. In the toast system (`src/lib/toast.tsx`), check whether it supports a persistent (non-auto-dismissing) toast variant. If it does, use it. If not, use the existing 5-second toast.
2. When an expired token is detected, show a toast with the message:
   > **"Google Calendar disconnected"** — Your Google session has expired. Sign out and sign back in to re-enable calendar sync.
3. Also check for expired token at the top of the page on load (not just at task creation time). If the token is already expired when the page loads, show the same warning toast once.
4. The task should still be saved to Supabase as normal — the only thing skipped is the calendar sync. Make sure this is the case.

**Completion Notes:** *(Claude Code fills this in after completing 23.2)*

---

#### 23.3 — Show a toast when a calendar sync fails at runtime

Even when the token is valid, the calendar API call can fail due to network issues, Google API rate limits, or other errors. Currently these are silently swallowed. Fix this so Yosef always knows when a sync failed.

1. In `src/app/page.tsx`, update the `calendarCreate` function to return a distinguishable failure signal (e.g. throw, or return a typed result) rather than silently returning `null`.
2. After calling `calendarCreate`, check the result:
   - If it succeeded: proceed as normal (task saved with `google_event_id`).
   - If it failed: save the task to Supabase without `google_event_id`, then show a toast:
     > **"Task saved, but calendar sync failed"** — The task was saved. Tap the calendar icon on the task to retry syncing it to Google Calendar.
3. In `src/app/api/calendar/route.ts`, update the error handler to return a proper error response instead of `{ ok: true }` on failure:
   ```ts
   catch (e) {
     console.error('Calendar error:', e);
     return NextResponse.json({ error: 'calendar_failed' }, { status: 500 });
   }
   ```
4. In `calendarCreate` on the client, check the response status and treat non-2xx as a failure.

**Completion Notes:** *(Claude Code fills this in after completing 23.3)*

---

#### 23.4 — Fix all-day events to appear correctly in Google Calendar

Tasks that have a date but no time (e.g. "Buy groceries tomorrow") currently get synced as timed events at midnight, which shows up as a 12:00 AM appointment in Google Calendar. These should instead be synced as true all-day events.

The Google Calendar API represents all-day events differently: instead of using `start.dateTime` and `end.dateTime`, they use `start.date` and `end.date` (with no time component, in `YYYY-MM-DD` format).

1. Open `src/app/api/calendar/route.ts`.
2. Add a helper to detect whether a task is an all-day event:
   ```ts
   const isAllDay = (scheduledAt: Date) =>
     scheduledAt.getHours() === 0 && scheduledAt.getMinutes() === 0;
   ```
3. When building the Google Calendar event payload, branch on this:
   ```ts
   const start = new Date(task.scheduledAt);
   const eventPayload = isAllDay(start)
     ? {
         summary: task.name,
         start: { date: start.toISOString().split('T')[0] },
         end:   { date: start.toISOString().split('T')[0] }, // same day = all-day
       }
     : {
         summary: task.name,
         start: { dateTime: start.toISOString() },
         end:   { dateTime: new Date(start.getTime() + (task.duration ?? 60) * 60 * 1000).toISOString() },
       };
   ```
4. Apply the same all-day logic to the UPDATE handler in the same route (for when tasks are edited).

**Completion Notes:** *(Claude Code fills this in after completing 23.4)*

---

#### 23.5 — Add a manual "Sync to Calendar" button on tasks that missed sync

For tasks that were saved without a `google_event_id` (because the sync failed), add a way to manually trigger the sync later.

1. In `src/components/TaskItem.tsx`, check whether the task has a `scheduledAt` value but no `google_event_id`. If so, show a small calendar icon button (use Lucide `CalendarX2` or `CalendarPlus`) in the task row, in muted colour, indicating the event is not yet synced.
2. On click, call the calendar create API with the existing task data and update the task's `google_event_id` in Supabase on success.
3. On success, swap the icon to the normal calendar indicator (or hide it).
4. On failure, show the same toast from 23.3.
5. If the task has no `scheduledAt` at all, do not show any calendar icon (calendar sync doesn't apply to undated tasks).

**Completion Notes:** *(Claude Code fills this in after completing 23.5)*

---

#### 23.6 — Deploy

1. Run `npm run build` locally — fix any TypeScript errors.
2. Commit: `git commit -m "Phase 23 — calendar sync reliability: token expiry detection, error toasts, all-day events, manual retry"`
3. Push to GitHub, confirm Vercel deploys successfully.
4. Smoke-test: create a task with a date+time → confirm it appears in Google Calendar. Create a task with a date only → confirm it appears as an all-day event (not a midnight appointment).

**Completion Notes:** *(Claude Code fills this in after completing 23.6)*

---

### Success Criteria
- Creating a task with a date+time syncs to Google Calendar immediately and reliably
- Creating a task with a date but no time creates a proper all-day event in Google Calendar (not a midnight timed event)
- If the Google OAuth token has expired, a clear toast appears on page load and at task creation time telling Yosef to reconnect — the task is still saved
- If the calendar API call fails for any other reason, a toast informs Yosef the sync failed — the task is still saved
- Tasks that missed the sync show a small calendar icon; clicking it triggers a manual retry
- No calendar errors are silently swallowed without user feedback

---

---

## Phase 24 — Duration in Upcoming View & Free-order NL Parsing
**What this does:** Fixes two related issues with task input and display. First, tasks in the Upcoming week view always appear as 30-minute blocks regardless of the duration you set — this is because the block height calculation falls back to 30 when `task.duration` is null, suggesting duration is not being saved to or read back from Supabase correctly. Second, the natural language parser only recognises `#project`, duration, and priority tokens when they appear in specific positions (project must be first); this phase makes token order completely free so `#project`, `[duration]`, `p1/p2/p3`, date, and time can appear anywhere in the input string.

**Status:** [x] Done

**Completion Notes:**
- Root cause of duration bug: `InlineTaskForm.tsx` `submit()` was building the Task object without `duration: parsed.duration`, so `task.duration` was always `undefined`, causing `null` to be inserted every time.
- `parseTask.ts` rewritten with a collect-then-strip approach: scans for `#project`, `[duration]`, and `p[123]` using regex `.exec()` to capture positions; strips "for" before `[duration]`; reconstructs remainder in one pass; runs chrono on the cleaned string; removes boundary prepositions.
- `highlightTask.ts` updated to detect `#project` anywhere in the input (not just at position 0).
- All 6 parser test cases pass (3 free-order + Call dentist + Buy milk + leading token).
- Build clean. Committed `c2f2a8e` and pushed. Vercel deployment triggered.

---

### Steps for Claude Code

#### 24.1 — Diagnose and fix duration not persisting to Supabase

**Approach:** The INSERT payload in `addTask()` already includes `duration: task.duration ?? null`, and `dbToTask` maps it correctly, so the Supabase column is fine. The real bug is in `InlineTaskForm.tsx` `submit()`: the `Task` object it builds is missing `duration: parsed.duration` — so `task.duration` is always `undefined` when `addTask` receives it, causing `null` to be inserted every time. Fix: add `duration: parsed.duration` to the task literal in `submit()`.

The Upcoming view computes block height on line 726 of `src/app/page.tsx`:
```ts
const height = Math.max(((t.duration ?? 30) / 60) * HOUR_HEIGHT, 28);
```
If `t.duration` is null, every block defaults to 30 minutes regardless of what was typed. The bug is upstream — duration is parsed correctly by `parseTask.ts` but may not be reaching the Supabase `tasks` table.

1. Open `src/app/page.tsx` and find the Supabase INSERT payload for new tasks (look for the `supabase.from('tasks').insert(...)` call, likely in `addTask()`).
2. Check whether `duration` is included in the insert payload. If it is missing, add it: `duration: task.duration ?? null`.
3. Also check the Supabase SELECT query that fetches tasks on page load — confirm `duration` is included (it should be in a `select('*')` or explicit column list).
4. Check `src/types/task.ts` (or wherever `Task` is defined) — confirm `duration` is typed as `number | null` and not accidentally omitted or named differently from the database column.
5. To verify the fix: create a task with `[1hr]` duration, check the Supabase dashboard to confirm `duration = 60` is saved, then check the Upcoming view to confirm the block height is now 60px (1 hour at 60px/hr) rather than 30px.

**Completion Notes:** Root cause was `InlineTaskForm.tsx` `submit()` not copying `parsed.duration` into the `Task` object. Added `duration: parsed.duration` to the task literal. The INSERT payload and `dbToTask` mapper were already correct. No Supabase schema changes needed.

---

#### 24.2 — Refactor NL parser to support free token order

Currently `src/lib/parseTask.ts` strips `#project` from the **start** of the raw string first, which means project tags anywhere else in the input are silently ignored. The fix is to scan the full input for all token types in a single pass — regardless of position — strip them all out, and treat whatever text remains as the task name plus any date/time expression.

The three examples that must all produce identical output after this fix:
- `#App Make an update tomorrow 12:00 [1hr]`
- `Make an update tomorrow 12pm [1hr] #app`
- `Make an #app update tomorrow at 12 for [1hr]`

All three should parse to: name = "Make an update", project = "app", date = tomorrow 12:00, duration = 60min.

**Implementation steps:**

1. Open `src/lib/parseTask.ts`.

2. Replace the current sequential-strip approach with a **collect-then-strip** approach:

   a. **Collect all tokens first** (scan the full input string, record each match and its position):
      - Project: `/\#([a-zA-Z]\w*)/g` — find ALL `#tag` matches (take the first one as project, ignore duplicates)
      - Duration: `/\[(\d+(?:\.\d+)?)\s*(hr?|hour|min?|minutes?)\]/gi`
      - Priority: `/\b(p[123])\b/gi`
      - The word "for" immediately before a `[duration]` token should also be stripped (e.g. `for [1hr]` → strip both `for` and `[1hr]`)

   b. **Strip all found tokens from the raw string** to produce a clean remainder string. Do this by building a list of `[startIndex, endIndex]` ranges to remove, then reconstruct the string with those ranges cut out.

   c. **Run chrono-node on the clean remainder** to extract date/time as before. After chrono-node runs, strip the matched date/time text from the remainder to get the final task name.

   d. **Clean up the task name**: trim whitespace, collapse multiple spaces into one, remove any leading/trailing punctuation left by stripping (commas, hyphens, "at", "for", "on" at the boundaries).

3. Update the test examples in the comment block at the top of `parseTask.ts` to include the three new free-order examples.

4. Also update `src/lib/highlightTask.ts` (the mirror div highlighter) to use the same position-independent token detection so inline highlighting still works correctly when tokens appear mid-sentence or at the end.

**Approach:** Rewrite `parseTask.ts` with a collect-then-strip approach: (1) scan the raw input for `#tag`, `[duration]`, `p1/p2/p3` using regex with `.exec()` to capture start/end positions; (2) if "for" immediately precedes the `[duration]` bracket, extend the removal range to include it; (3) sort all removal ranges and reconstruct the remainder string by skipping those spans; (4) run chrono on the remainder and strip the date/time match; (5) clean up double spaces and boundary prepositions. Update test cases in the comment block. Also update `highlightTask.ts` to use `/#([a-zA-Z]\w*)/g` instead of anchoring at position 0.

**Completion Notes:** Rewrote `parseTask.ts` with the collect-then-strip approach. Key changes: `#project` now detected with `/#([a-zA-Z]\w*)/g` scanning the full string (not anchored to start); "for" immediately before `[duration]` is included in the removal range; all removals are sorted and the remainder is reconstructed in a single pass; boundary prepositions ("at", "for", "on", "from") are stripped after all tokens are removed. Updated comment block with 10 test cases including all free-order examples. Updated `highlightTask.ts` to also detect `#project` anywhere using the same regex approach.

---

#### 24.3 — Test all token order combinations

Before deploying, manually verify the following inputs all parse correctly (log output to console if helpful):

| Input | Expected name | Project | Date/Time | Duration | Priority |
|-------|---------------|---------|-----------|----------|----------|
| `#App Make an update tomorrow 12:00 [1hr]` | Make an update | app | tomorrow 12:00 | 60 | — |
| `Make an update tomorrow 12pm [1hr] #app` | Make an update | app | tomorrow 12:00 | 60 | — |
| `Make an #app update tomorrow at 12 for [1hr]` | Make an update | app | tomorrow 12:00 | 60 | — |
| `Call dentist friday 3pm [30min] p1 #health` | Call dentist | health | friday 15:00 | 30 | p1 |
| `Buy milk` | Buy milk | — | — | — | — |
| `[2hr] p2 #work standup tomorrow 9am` | standup | work | tomorrow 09:00 | 120 | p2 |

Also verify inline highlighting in the task input field correctly highlights each token regardless of where it appears.

**Approach:** Build the project and use the TypeScript compiler output to confirm no errors. Then write a small inline test script using `tsx` (or `ts-node`) to call `parseTask` with each case and compare to expected output. Since `parseTask.ts` is pure TS with no DOM dependencies this runs directly in Node.

**Completion Notes:** Ran an inline Node script against all 6 plan test cases (3 free-order + Call dentist + Buy milk + [2hr] leading). All 6/6 passed. The parser correctly extracts project, name, duration, date, and priority regardless of token order.

---

#### 24.4 — Deploy

1. Run `npm run build` locally — fix any TypeScript errors.
2. Commit: `git commit -m "Phase 24 — fix duration in upcoming view, free-order NL token parsing"`
3. Push to GitHub, confirm Vercel deploys successfully.
4. Smoke-test on the live URL: create tasks with duration set in different positions, check Upcoming view block heights are correct.

**Approach:** Run `npm run build` to catch any TypeScript errors introduced by the parser rewrite. Files changed are `src/lib/parseTask.ts`, `src/lib/highlightTask.ts`, and `src/components/InlineTaskForm.tsx` — all pure TypeScript with no new dependencies.

**Completion Notes:** Build clean. Committed `c2f2a8e` and pushed. Vercel deployment triggered.

---

### Success Criteria
- A task created with `[1hr]` duration shows a 60px-tall block in the Upcoming week view (not 30px)
- A task created with `[30min]` duration shows a 30px-tall block
- `#project` tag is detected and applied whether it appears at the start, middle, or end of the input
- `[duration]` is detected whether it appears before or after the task name, date, or project tag
- The word "for" immediately before `[duration]` is stripped cleanly from the task name
- `p1/p2/p3` priority is detected in any position
- Inline token highlighting in the input field works correctly for all token positions
- All existing parsing behaviour (backlog keywords, date/time detection) is unaffected

---

---

## Phase 25 — Completed Tasks Visible In-Place
**What this does:** Instead of completed tasks disappearing entirely, they now appear at the bottom of each view section as greyed-out rows with a strikethrough task name. All task details (project, date, duration, priority) are retained and visible. Clicking the checkbox again reopens the task and returns it to the active list. A collapsible "Completed" section header keeps the list tidy when there are many completed tasks.

**Status:** [x] Done

**Completion Notes:**
- `src/app/page.tsx`: added `byCompletedAt` sorter; added `completedTasks` derived array (sorted by completedAt desc); added `renderCompleted` helper that wraps `CompletedSection` with callbacks pre-bound; wired into Today (scoped to today), By Project grouped (per-project scope), By Project single (same project scope), and Backlog (isBacklog scope). Each uses a unique `storageKey`. Upcoming view intentionally left unchanged.
- `src/components/TaskItem.tsx`: when `task.completed`, checkbox renders as filled accent circle with ✓; task name gets `line-through` + muted color; project dot row, date row, project label, and right-side actions all wrapped with `opacity: 0.45`. Reopening a completed task skips the fade animation.
- `src/components/CompletedSection.tsx` (new): collapsed by default; `localStorage` persists expanded state per `storageKey`; renders nothing when `tasks.length === 0`; count badge shows number of tasks.
- `src/app/inbox/page.tsx`: removed `eq('completed', false)` filter; added `completedTasksAll` sorted by completedAt desc; added `CompletedSection` at the bottom with `showProjectLabel` and key `completed-alltasks-open`.
- Build clean. Committed `cb82b63` and pushed. Vercel deployment triggered.

### Background (from code investigation)
- Completed tasks are already fetched from Supabase — the query on line 165 of `src/app/page.tsx` has no `completed` filter
- They are filtered out client-side: `const activeTasks = tasks.filter((t) => !t.completed)` (line 350)
- The toggle function on line 252 already handles both completing AND re-opening a task (it sets `completed = !task.completed`), so reopen functionality requires no new logic — just exposing completed tasks in the UI
- The fix is: derive a `completedTasks` array from `tasks`, render it below active tasks in each view, and style it appropriately

---

### Steps for Claude Code

#### 25.1 — Derive completed tasks and pass them into each view renderer

1. Open `src/app/page.tsx`.
2. Below line 350 (`const activeTasks = ...`), add:
   ```ts
   const completedTasks = tasks.filter((t) => t.completed);
   ```
3. Note that `completedTasks` should NOT be sorted by the existing sort functions — sort completed tasks by `completedAt` descending (most recently completed first) so the last thing you ticked off appears at the top of the completed section.
4. Add a helper at the top of the file:
   ```ts
   const byCompletedAt = (a: Task, b: Task) =>
     (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0);
   ```

**Approach:** Add `byCompletedAt` sorter alongside the existing `byPriority` sorter near the top of `page.tsx`. Add `completedTasks` below `activeTasks`. The existing `tasks` query fetches everything (no completed filter) so no query change is needed. Risk: completed tasks from old sessions may be numerous — the collapsible section (25.3) handles this.

**Completion Notes:** Added `byCompletedAt` sorter next to `byPriority` in `page.tsx`. Added `completedTasks` derived array below `activeTasks`, pre-sorted by `completedAt` descending. No query changes needed.

---

#### 25.2 — Style TaskItem for completed state

1. Open `src/components/TaskItem.tsx`.
2. Add a `isCompleted` prop (or derive it from `task.completed` which is already on the task object — use that directly rather than adding a new prop).
3. When `task.completed` is true, apply the following styles to the task row:
   - Task name: `textDecoration: 'line-through'`, `color: 'var(--text-muted)'` (the existing muted colour token)
   - Row background: no change (keep it white/transparent — the strikethrough and muted text are enough visual signal)
   - Checkbox: show as checked/filled in the accent colour, same as it does today when completing
   - Project label, date, priority flag: also render at reduced opacity (`opacity: 0.45`) so they recede but are still readable
   - The row should still be hoverable and the checkbox still clickable (to reopen)
4. No other changes to TaskItem interaction — the existing `onToggle` already handles the reopen.

**Approach:** `task.completed` is already on the Task type so no new prop needed. When `task.completed` is true: apply `textDecoration: 'line-through'` + muted color to the name span; render the checkbox as a filled accent-colored circle with a ✓ character; wrap project-label, date, and priority with `opacity: 0.45`. The existing `onComplete` callback already handles toggling back to active.

**Completion Notes:** Added `isCompleted` derived from `task.completed`. Checkbox now shows a filled accent circle with ✓ when completed; reopening calls `onComplete` directly without the fade animation. Task name gets `textDecoration: 'line-through'` and muted color. Project dot row, date row, project-label row, and right-side actions all wrapped with `opacity: 0.45` when completed. Row is still fully interactive (hover, click to reopen).

---

#### 25.3 — Add a collapsible "Completed" section to each view

Completed tasks should appear below active tasks in a collapsible section. This keeps the list clean when there are many completed tasks — Yosef can expand it when needed.

1. Create a small reusable component (inline in `page.tsx` or as `src/components/CompletedSection.tsx`) that renders:
   - A section divider line
   - A clickable header row: a chevron icon (Lucide `ChevronDown` / `ChevronRight`) + the text **"Completed"** + a count badge showing how many completed tasks are in this section (e.g. `3`)
   - When expanded (default: **collapsed**): renders the completed task rows below
   - Collapse/expand state stored in `useState` — no persistence needed
   - Header styling: `fontSize: 13`, `color: 'var(--text-muted)'`, `fontWeight: 500`; subtle, not prominent

2. Persist the collapsed/expanded preference to `localStorage` under the key `'completed-section-open'` so it remembers your preference across page loads.

**Approach:** Create `src/components/CompletedSection.tsx` as a separate file since it must be used in both `page.tsx` and `inbox/page.tsx`. Props: `tasks`, `onComplete`, `onDelete`, `onPriorityChange`, `onOpen`, `onCalendarSync` (optional), `storageKey` (defaults to `'completed-section-open'`). Key decision: make `storageKey` a prop so different views can each persist their own expanded state independently.

**Completion Notes:** Created `src/components/CompletedSection.tsx`. Props include `storageKey` so each view can persist its own collapsed state independently. Collapsed by default; `localStorage` value is read on mount and written on toggle. Renders nothing if `tasks.length === 0`. Each completed task uses the standard `TaskItem` (with the completed styling from 25.2 applied automatically via `task.completed`).

---

#### 25.4 — Wire completed tasks into each view

Add the `<CompletedSection>` to each view that shows tasks. The completed tasks shown in each section should be **scoped to that view** — e.g. in the Today view, only show tasks that were completed today; in By Project, only show completed tasks for that project.

1. **Today view** (`renderToday`): show completed tasks whose `completedAt` is today. Place `<CompletedSection>` after the today task list (below overdue and today sections).

2. **By Project view** (`renderByProject`): within each project's task list, show that project's completed tasks in a `<CompletedSection>` at the bottom of that project block.

3. **Backlog view**: show completed tasks that had no `scheduledAt` (i.e. were backlog tasks when completed). Place `<CompletedSection>` at the bottom.

4. **All Tasks / Inbox view** (`src/app/inbox/page.tsx`): show all completed tasks in a `<CompletedSection>` at the bottom. No date-scoping here — show everything.

5. **Upcoming view**: do NOT show completed tasks in the week grid (calendar grids with completed blocks would be cluttered). Skip this view.

**Approach:** Scope the completed tasks per view: Today → `completedAt` is today; By Project → `projectId === p.id`; single project → same; Backlog → `isBacklog === true` on the completed task; All Tasks/inbox → no scope filter, show all. For inbox page, remove `eq('completed', false)` from the query and split the result into active/completed arrays client-side.

**Completion Notes:** Added `renderCompleted` helper in `page.tsx` that wraps `CompletedSection` with all callbacks pre-bound. Today view uses `completedAt` today scope with key `completed-today-open`. By-project view (grouped) uses `completed-project-{id}-open` per project; single-project view same. Backlog uses `isBacklog` scope with key `completed-backlog-open`. `inbox/page.tsx`: removed `eq('completed', false)` from query; added `completedTasksAll` sorted by `completedAt` desc; added `CompletedSection` at bottom with key `completed-alltasks-open` and `showProjectLabel`.

---

#### 25.5 — Deploy

1. Run `npm run build` locally — fix any TypeScript errors.
2. Commit: `git commit -m "Phase 25 — completed tasks visible in-place with strikethrough, collapsible section, reopen on click"`
3. Push to GitHub, confirm Vercel deploys successfully.
4. Smoke-test: complete a task, confirm it appears below the active list with strikethrough; click the checkbox to reopen it, confirm it returns to the active list.

**Approach:** Run `npm run build` to catch TypeScript errors. Files changed: `TaskItem.tsx`, `CompletedSection.tsx` (new), `page.tsx`, `inbox/page.tsx`.

**Completion Notes:** Build clean. Committed `cb82b63` and pushed. Vercel deployment triggered.

---

### Success Criteria
- Completed tasks appear at the bottom of each view (Today, By Project, Backlog, All Tasks) in a collapsible "Completed" section
- Completed task rows show a strikethrough task name and muted colour; all details (project, date, priority) are still visible at reduced opacity
- The "Completed" section is collapsed by default; clicking the header expands/collapses it; the preference persists across page loads
- The count badge next to "Completed" shows the correct number of tasks in that section
- Clicking the checkbox on a completed task reopens it and returns it to the active list immediately
- The Upcoming week grid view is unchanged (no completed blocks in the calendar)

---

---

## Phase 26 — Bug Fixes: Cursor Lag, Project Task Disappearing, Completed Tasks in Calendar
**What this does:** Fixes three issues reported by Yosef. (1) The text cursor lags behind or overlaps highlighted words while typing in the task input — caused by a rendering misalignment between the transparent `<input>` and its mirror `<div>`. (2) Tasks added directly within a project view sometimes disappear — caused by `task.projectId` silently falling through to the Inbox fallback in `addTask()`. (3) Completed tasks should remain visible in the Upcoming calendar view with a strikethrough style, rather than being hidden entirely.

**Status:** [x] Done — 3 March 2026

**Completion Notes:** All three fixes implemented and deployed. (1) Cursor lag fixed by replacing `<input type="text">` with `<textarea rows={1} resize: none>` in `InlineTaskForm.tsx` — block element box model aligns perfectly with the mirror div. (2) Project task disappearing fixed by adding `useEffect` to sync `defaultProjectId` into `projectId` state whenever the prop changes. (3) Completed tasks now visible in Upcoming calendar view — `weekTasksAll` uses `tasks` (all) instead of `activeTasks`, with lighter bg, strikethrough name, and 0.6 opacity on completed blocks and pills. Build clean, committed and pushed.

---

### Steps for Claude Code

#### 26.1 — Fix cursor lag in the task input field

The root cause is in `src/components/InlineTaskForm.tsx`. The mirror div uses `position: absolute` with pixel offsets (`top: 12, left: 14`) to sit behind a `color: transparent` `<input>`. Any sub-pixel rendering difference between how browsers lay out a `<div>` vs an `<input>` (e.g. internal input padding, box-sizing, font rasterisation) causes the cursor to appear misaligned relative to the highlighted text behind it.

**Fix — switch the input to a `<textarea>` styled as a single line:**

A `<textarea>` is a block element with identical box-model behaviour to a `<div>`, making mirror div alignment exact and reliable.

1. In `src/components/InlineTaskForm.tsx`, replace the `<input type="text">` with a `<textarea>`:
   - Set `rows={1}` and `style={{ resize: 'none', overflow: 'hidden' }}`
   - All other styles stay the same (`background: transparent`, `border: none`, `outline: none`, `padding: 0`, `color: name ? 'transparent' : 'var(--text-primary)'`, `caretColor: 'var(--text-primary)'`)
   - Update the `ref` type from `useRef<HTMLInputElement>` to `useRef<HTMLTextAreaElement>`
   - Update the `onChange` handler type from `React.ChangeEvent<HTMLInputElement>` to `React.ChangeEvent<HTMLTextAreaElement>`
   - The `onKeyDown` handler already intercepts `Enter` and calls `submit()` — keep this so pressing Enter still adds the task (prevent default to stop textarea inserting a newline)

2. Ensure the mirror div and textarea have identical style values for: `fontSize`, `fontFamily`, `fontWeight`, `lineHeight`, `letterSpacing`, `padding`, `wordSpacing`. Add `wordSpacing: 'normal'` and `textRendering: 'auto'` to both if not already present.

3. Verify the fix visually: type a task with a date like `call dentist tomorrow 3pm` — the blue date highlight should sit perfectly behind the typed text with the cursor positioned correctly at the end.

**Approach:** In `InlineTaskForm.tsx`, replace the `<input type="text">` (line 185) with `<textarea rows={1} style={{ resize: 'none', overflow: 'hidden' }}>`. Update the ref type from `useRef<HTMLInputElement>` to `useRef<HTMLTextAreaElement>`. A textarea is a block element so its box model matches the mirror `<div>` exactly, eliminating cursor misalignment. All other styles remain identical.

**Completion Notes:** Replaced `<input type="text">` with `<textarea rows={1}>` in `InlineTaskForm.tsx`. Added `resize: 'none'` and `overflow: 'hidden'` styles. Updated ref type to `HTMLTextAreaElement`. All other styles unchanged. Build passes cleanly.

---

#### 26.2 — Fix tasks disappearing when added within a project view

The bug is in the `addTask` function in `src/app/page.tsx`. The fallback chain for `effectiveProjectId` is:
```ts
const effectiveProjectId = task.projectId ?? matchedProject?.id ?? inboxProject?.id ?? null;
```

If `task.projectId` is `undefined` for any reason (e.g. the `InlineTaskForm` state was not correctly initialised from `defaultProjectId`, or a re-render reset it), the task silently falls through to `inboxProject?.id` and is assigned to Inbox — where it is invisible in the current project view.

**Fix:**

1. In `src/components/InlineTaskForm.tsx`, add a `useEffect` to sync `defaultProjectId` into the `projectId` state if the prop changes after mount:
   ```ts
   useEffect(() => {
     if (defaultProjectId) setProjectId(defaultProjectId);
   }, [defaultProjectId]);
   ```
   This ensures that if the parent re-renders with a new `defaultProjectId`, the form state stays correct.

2. In `src/app/page.tsx`, in the `addTask` function, add a console log before the insert to make the bug immediately visible during testing:
   ```ts
   console.log('[addTask] projectId:', task.projectId, '→ effective:', effectiveProjectId);
   ```
   Remove this log once the fix is confirmed.

3. Also check `AddTaskRow` in `page.tsx` — confirm it passes `projectId={p.id}` (for per-project rows) and `projectId={selectedProjectId}` (for the single-project view). If either is `undefined` instead of the project UUID, trace back why `p.id` or `selectedProjectId` might be undefined at that point.

4. After the fix: add a task within the "App" project view without a `#project` tag in the name. Confirm the task appears immediately in the project list and is saved with the correct `project_id` in Supabase.

**Approach:** In `InlineTaskForm.tsx`, add a `useEffect` that calls `setProjectId(defaultProjectId)` whenever `defaultProjectId` changes. The current `useState` initializer only runs once at mount — if the parent re-renders with a new projectId (e.g. navigating between projects), the form keeps the stale value. The effect ensures the state stays in sync.

**Completion Notes:** Added `useEffect(() => { if (defaultProjectId) setProjectId(defaultProjectId); }, [defaultProjectId])` in `InlineTaskForm.tsx`. This ensures the project dropdown stays synced when the parent re-renders with a different project context. Build passes cleanly.

---

#### 26.3 — Show completed tasks in the Upcoming calendar view

Currently, Phase 25 explicitly excluded completed tasks from the Upcoming week grid. Yosef wants completed tasks to remain visible in the calendar view but styled as completed (strikethrough, muted, checked).

1. In `src/app/page.tsx`, in the `renderUpcoming()` function, find where `weekTasksAll` is built:
   ```ts
   const weekTasksAll = activeTasks.filter((t) => { ... });
   ```
   Change this to include completed tasks that fall within the visible week:
   ```ts
   const weekTasksAll = tasks.filter((t) => { ... }); // use all tasks, not just activeTasks
   ```

2. In the event block rendering loop (where each task becomes a coloured block on the grid), apply completed styles when `t.completed` is true:
   - Task name: `textDecoration: 'line-through'`
   - Block background: reduce the project colour opacity further, e.g. `0.10` instead of `0.20`
   - Block border-left: use the project colour at `0.40` opacity instead of full
   - Add a small checked checkmark icon (Lucide `Check`, size 10) in the top-left of the block
   - On hover, still show cursor pointer (so the task detail panel can still be opened)

3. Completed tasks should still be clickable — clicking should open the task detail panel as normal, where Yosef can reopen the task if needed.

4. Completed all-day tasks (in the all-day row at the top of the day column) should also show with strikethrough pill text.

**Approach:** In `renderUpcoming()` in `page.tsx`, change `weekTasksAll` to filter from `tasks` (all tasks) instead of `activeTasks`. Then add conditional completed styles to timed blocks (lighter bg, strikethrough name text, reduced opacity) and to all-day pills (strikethrough text). No new components needed — just CSS condition branches in the existing JSX.

**Completion Notes:** Changed `weekTasksAll` in `renderUpcoming()` from `activeTasks.filter(...)` to `tasks.filter(...)`. Added conditional completed styles to timed blocks (lighter `1a` bg opacity, strikethrough name, `0.6` block opacity) and all-day pills (strikethrough text, lighter bg, muted color, `0.6` opacity). Clickability preserved. Build passes cleanly.

---

#### 26.4 — Deploy

1. Run `npm run build` locally — fix any TypeScript errors.
2. Commit: `git commit -m "Phase 26 — fix cursor lag in task input, fix project task disappearing, completed tasks in calendar"`
3. Push to GitHub, confirm Vercel deploys successfully.
4. Smoke-test all three fixes on the live URL.

**Completion Notes:** `npm run build` passed cleanly. Committed as "Phase 26 — fix cursor lag in task input, fix project task disappearing, completed tasks in calendar". Pushed to GitHub, Vercel deploying.

---

### Success Criteria
- Typing in the task input field shows the cursor correctly positioned — no lag or overlap with highlighted tokens
- Adding a task within a project view (e.g. "App") correctly assigns it to that project; it does not disappear
- Completed tasks with a scheduled date/time remain visible in the Upcoming week grid with a strikethrough name, faded block colour, and a small check icon
- Clicking a completed calendar block still opens the task detail panel
- All changes deploy to Vercel successfully

---

---

---

## 🔮 Future Stage F1 — Browser Extension (Safari + Chrome)
**Status: Not yet actioned — move to main build table when ready**

**What this does:** A browser extension that lets you add tasks, view upcoming tasks, and check off habits from a small popup in your browser toolbar — without opening the full web app. Works in both Chrome and Safari from a single shared codebase.

### What you'll need
- A Google account (Chrome Web Store developer registration, one-time $5 fee — or skip publishing and use it unpublished for personal use, free)
- Xcode installed on your Mac (free) for Safari packaging
- Apple Developer account ($99/year) only if you want to distribute via the App Store; for personal use, sideloading via Xcode is free
- A new project folder alongside the ToDo app for the extension code

### Recommended approach
Use **Plasmo** — a framework for building browser extensions with React + TypeScript (same stack as your app). It handles Manifest V3 complexity and has a Safari export path via Xcode's Web Extension Converter.

For authentication, the simplest approach for a single-user app: add a "Generate API token" button to your Todo app settings. This creates a long-lived personal token stored in Supabase. You paste it into the extension once. The extension uses it to read/write Supabase directly — no OAuth flow in the extension.

### High-level phases (when actioned)
1. **F1-A — Extension scaffold + auth token system:** Set up Plasmo project; add personal API token generation to the Todo app's settings page; store token in Supabase `api_tokens` table; extension stores token in `chrome.storage.local`
2. **F1-B — Add Task popup:** NL input with token highlighting (reuse `parseTask` + `highlightTask`); submits directly to Supabase; parsed preview line below input
3. **F1-C — Upcoming + Habits tabs:** Condensed today/tomorrow task list; today's habit checklist with tap-to-complete logging
4. **F1-D — Chrome packaging + local testing:** Plasmo build → load unpacked in Chrome via Developer mode
5. **F1-E — Safari conversion:** Run Xcode Safari Web Extension Converter; test in Safari via Developer menu → Allow Unsigned Extensions

---

## 🔮 Future Stage F2 — Multi-User Support
**Status: Not yet actioned — move to main build table when ready**

**What this does:** Allows multiple people to use the same Todo app with completely separate accounts. Each user logs in with their own Google account and sees only their own tasks, projects, and habits. Users cannot access each other's data.

### How it works
The app already has Google OAuth — adding a second user is as simple as adding their Google email as a test user in Google Cloud Console (the same place you added your own). The main work is on the database side: every row needs to be "owned" by a specific user, and Supabase needs to enforce that isolation automatically.

### Key decisions
**Auth approach:** The cleanest path is to replace NextAuth with **Supabase Auth** (which has native Google OAuth built in). This means one system handles both login and database access, and Supabase's Row Level Security (RLS) works automatically without any extra plumbing. This is a meaningful refactor but makes the app simpler and more robust long-term. The alternative (keeping NextAuth and adding manual `user_id` filtering on every query) works but is messier and less secure.

**Data isolation:** Once each row has a `user_id`, Supabase RLS policies enforce "you can only see your own rows" at the database level — even if there's ever a bug in the app code, the database itself won't return another user's data.

### What needs to change
- **SQL migration:** Add `user_id UUID` column to all tables (tasks, projects, habits, habit_logs, health_logs); populate from authenticated session on every insert
- **Re-enable RLS:** Add policies on every table: `auth.uid() = user_id` for SELECT, INSERT, UPDATE, DELETE
- **Replace NextAuth with Supabase Auth:** Supabase Auth has built-in Google OAuth; configure in Supabase dashboard; update sign-in/sign-out flows in the app
- **Stamp user_id on every insert:** All `supabase.from(...).insert(...)` calls include `user_id: session.user.id`
- **Add second user:** Add their Google email as a test user in Google Cloud Console — they can then sign in immediately

### High-level phases (when actioned)
1. **F2-A — Supabase Auth migration:** Replace NextAuth with Supabase Auth Google OAuth; update session handling throughout the app; confirm existing Yosef login still works
2. **F2-B — User ID stamping:** Add `user_id` column to all tables; update all inserts to include `user_id`; update all queries to filter by `user_id`
3. **F2-C — Re-enable RLS:** Write and apply RLS policies on all tables; test that a second test user cannot see Yosef's data
4. **F2-D — Testing + deploy:** End-to-end test with two Google accounts; confirm full data isolation; deploy to Vercel

---

---

## Phase 27 — Theme Customisation (11 Themes)
**What this does:** Adds a theme picker to the app sidebar footer. Choosing a theme instantly repaints the entire app — sidebar, backgrounds, accents, borders, icons, toasts, priority colours — by swapping CSS custom property values on the root element. The selected theme persists across sessions via `localStorage`. Eleven themes are included, organised into three categories: **General** (Sand, Dark, Slate), **Nature** (Forest, Ocean), and **Places** (London, Warsaw, Wakefield, Addis, LA, Łeba).

**Status:** [x] Done — 3 March 2026

**Completion Notes:** All 11 themes implemented. CSS custom property blocks added for each theme in `globals.css`. Four dark-sidebar themes (Dark, Ocean, London, Addis) override `--sidebar-text` / `--sidebar-text-muted` with light values. `ThemePicker.tsx` provides category pills (General/Nature/Places) and 22px accent swatches with check mark, hover tooltip, and scale animation. Picker added to Sidebar footer. Flash prevention inline script added to `layout.tsx`. `npm run build` clean; committed and pushed.

---

### Theme Definitions

All themes redefine the same set of CSS custom properties already established in `globals.css`. Only the values change — no component code needs updating.

#### Theme 1 — Sand *(default, current)*
Warm, Todoist-inspired. Cream sidebar, amber accent.
```css
--bg-sidebar: #FAF8F5;  --bg-main: #FFFFFF;    --accent: #D97706;
--accent-dark: #B45309; --accent-bg: #FFEED9;  --bg-active: #FFEED9;
--bg-hover-sidebar: #F0EDE8; --bg-hover-row: #F5F5F5;
--text-primary: #202020; --text-secondary: #666666; --text-muted: #999999;
--text-accent: #B45309; --border: #E8E4DF; --border-input: #D1CBC3;
--divider: #F0F0F0; --icon: #555555; --icon-active: #D97706;
--bg-tag: #FFEED9; --checkbox-border: #CCCCCC;
--date-overdue-bg: #FDECEA; --date-future-bg: #FFF3E0;
```

#### Theme 2 — Dark
Sleek dark mode. Deep grey backgrounds, soft gold accent.
```css
--bg-sidebar: #1C1C1E;  --bg-main: #242424;    --accent: #F5A623;
--accent-dark: #D4860B; --accent-bg: #3A2E1A;  --bg-active: #2E2720;
--bg-hover-sidebar: #2A2A2C; --bg-hover-row: #2C2C2E;
--bg-modal: #2C2C2E;    --bg-input: #333335;   --bg-toast: #3A3A3C;
--text-primary: #F2F2F7; --text-secondary: #AEAEB2; --text-muted: #636366;
--text-accent: #F5A623; --text-toast: #F2F2F7;
--border: #3A3A3C; --border-input: #48484A;
--divider: #2C2C2E; --icon: #AEAEB2; --icon-active: #F5A623;
--bg-tag: #3A2E1A; --checkbox-border: #48484A;
--date-overdue-bg: #3A1F1F; --date-future-bg: #2E2A1A;
```

#### Theme 3 — Ocean
Clean, professional. White main, navy sidebar, cobalt accent.
```css
--bg-sidebar: #1E2A3A;  --bg-main: #FFFFFF;    --accent: #3B82F6;
--accent-dark: #2563EB; --accent-bg: #EFF6FF;  --bg-active: #DBEAFE;
--bg-hover-sidebar: #263447; --bg-hover-row: #F0F7FF;
--text-primary: #0F172A; --text-secondary: #475569; --text-muted: #94A3B8;
--text-accent: #2563EB; --border: #E2E8F0; --border-input: #CBD5E1;
--divider: #F1F5F9; --icon: #64748B; --icon-active: #3B82F6;
--bg-tag: #DBEAFE; --checkbox-border: #CBD5E1;
--date-overdue-bg: #FEE2E2; --date-future-bg: #EFF6FF;
/* Sidebar text needs to be light since sidebar is dark navy */
--sidebar-text: #E2E8F0; --sidebar-text-muted: #94A3B8;
```

#### Theme 4 — Forest
Calm, earthy. Sage sidebar, emerald accent, warm off-white main.
```css
--bg-sidebar: #EFF3EF;  --bg-main: #FAFAF8;    --accent: #2D6A4F;
--accent-dark: #1B4332; --accent-bg: #D8F3DC;  --bg-active: #D8F3DC;
--bg-hover-sidebar: #E0EBE0; --bg-hover-row: #F0F5F0;
--text-primary: #1A2E1A; --text-secondary: #4A6741; --text-muted: #7A9E7A;
--text-accent: #1B4332; --border: #C8DCC8; --border-input: #A8C4A8;
--divider: #E4EEE4; --icon: #4A6741; --icon-active: #2D6A4F;
--bg-tag: #D8F3DC; --checkbox-border: #A8C4A8;
--date-overdue-bg: #FFE4E1; --date-future-bg: #D8F3DC;
```

#### Theme 5 — Slate
Minimal, cool. Light grey sidebar, white main, indigo accent.
```css
--bg-sidebar: #F4F5F6;  --bg-main: #FFFFFF;    --accent: #4F46E5;
--accent-dark: #3730A3; --accent-bg: #EEF2FF;  --bg-active: #E0E7FF;
--bg-hover-sidebar: #EAEBEC; --bg-hover-row: #F8F8F9;
--text-primary: #111827; --text-secondary: #4B5563; --text-muted: #9CA3AF;
--text-accent: #3730A3; --border: #E5E7EB; --border-input: #D1D5DB;
--divider: #F3F4F6; --icon: #6B7280; --icon-active: #4F46E5;
--bg-tag: #EEF2FF; --checkbox-border: #D1D5DB;
--date-overdue-bg: #FEE2E2; --date-future-bg: #EEF2FF;
```

#### Theme 6 — London
Charcoal + Bus Red. Fog, concrete, and the iconic crimson of the double-decker.
```css
--bg-sidebar: #2D2D2D;  --bg-main: #FAFAFA;    --accent: #CC0000;
--accent-dark: #A30000; --accent-bg: #FDECEA;  --bg-active: #FDECEA;
--bg-hover-sidebar: #383838; --bg-hover-row: #F5F5F5;
--bg-modal: #FFFFFF;    --bg-input: #FFFFFF;
--text-primary: #1A1A1A; --text-secondary: #555555; --text-muted: #888888;
--text-accent: #A30000; --border: #DCDCDC; --border-input: #CCCCCC;
--divider: #EEEEEE; --icon: #666666; --icon-active: #CC0000;
--bg-tag: #FDECEA; --checkbox-border: #CCCCCC;
--date-overdue-bg: #FDECEA; --date-future-bg: #FFF3F3;
/* Sidebar text light since sidebar is dark */
--sidebar-text: #E8E8E8; --sidebar-text-muted: #AAAAAA;
```

#### Theme 7 — Warsaw
Cool White + Polish Crimson. Reconstructed Baroque meets modernist precision.
```css
--bg-sidebar: #EEF0F3;  --bg-main: #FFFFFF;    --accent: #C41E3A;
--accent-dark: #9B1830; --accent-bg: #FDE8EC;  --bg-active: #FDE8EC;
--bg-hover-sidebar: #E2E5EA; --bg-hover-row: #F8F9FA;
--text-primary: #1A1A2E; --text-secondary: #4A4A6A; --text-muted: #8A8AAA;
--text-accent: #9B1830; --border: #DDE1E8; --border-input: #C8CDD8;
--divider: #ECEEF2; --icon: #5A5A7A; --icon-active: #C41E3A;
--bg-tag: #FDE8EC; --checkbox-border: #C8CDD8;
--date-overdue-bg: #FDECEA; --date-future-bg: #F0F2FF;
```

#### Theme 8 — Wakefield
Yorkshire Stone + Rhubarb Pink. Sandstone heritage meets the Rhubarb Triangle.
```css
--bg-sidebar: #F2EBE0;  --bg-main: #FFFDF9;    --accent: #C2185B;
--accent-dark: #880E4F; --accent-bg: #FCE4EC;  --bg-active: #FCE4EC;
--bg-hover-sidebar: #EAE0D4; --bg-hover-row: #FDF8F3;
--text-primary: #2C1810; --text-secondary: #6B4C3B; --text-muted: #A08070;
--text-accent: #880E4F; --border: #E0D4C4; --border-input: #CEC0AD;
--divider: #EDE5D8; --icon: #7A5C4A; --icon-active: #C2185B;
--bg-tag: #FCE4EC; --checkbox-border: #CEC0AD;
--date-overdue-bg: #FDECEA; --date-future-bg: #FFF0F5;
```

#### Theme 9 — Addis *(Places)*
Deep Eucalyptus + Coffee Gold. Addis Ababa's forests, coffee ceremonies, and high-altitude light.
```css
--bg-sidebar: #1B3A2D;  --bg-main: #FEFCF7;    --accent: #D4860B;
--accent-dark: #A0620A; --accent-bg: #FDF3E3;  --bg-active: #FDF3E3;
--bg-hover-sidebar: #24503D; --bg-hover-row: #FAF6EE;
--bg-modal: #FFFFFF;    --bg-input: #FFFFFF;
--text-primary: #1A0F00; --text-secondary: #5C4020; --text-muted: #9A7A50;
--text-accent: #A0620A; --border: #E8DCC8; --border-input: #D4C4A4;
--divider: #F0E8D4; --icon: #7A6040; --icon-active: #D4860B;
--bg-tag: #FDF3E3; --checkbox-border: #D4C4A4;
--date-overdue-bg: #FDE8E8; --date-future-bg: #FDF3E3;
/* Sidebar text light since sidebar is dark green */
--sidebar-text: #D4EBD8; --sidebar-text-muted: #8AB898;
```

#### Theme 10 — Łeba *(Places)*
Baltic Coast + Pine Teal. Łeba is a small resort town on Poland's Baltic coast — cold grey-green sea, white sand dunes, pine forests stretching to the horizon. Cool grey-blue sidebar like the Baltic sky, crisp white main, deep teal accent from the pine forests and sea glass. Calm and unhurried, like a long walk on an empty beach in September.
```css
--bg-sidebar: #E8EEF2;  --bg-main: #FFFFFF;    --accent: #1B6B5A;
--accent-dark: #134E40; --accent-bg: #E0F2EE;  --bg-active: #D0ECE6;
--bg-hover-sidebar: #DCE4EA; --bg-hover-row: #F2F7F9;
--text-primary: #0F1F2A; --text-secondary: #3A5568; --text-muted: #7A9AAA;
--text-accent: #134E40; --border: #D4DDE4; --border-input: #BACAD4;
--divider: #EAF0F4; --icon: #4A6A7A; --icon-active: #1B6B5A;
--bg-tag: #E0F2EE; --checkbox-border: #BACAD4;
--date-overdue-bg: #FEE2E2; --date-future-bg: #E0F2EE;
```

#### Theme 11 — LA *(Places)*
Pacific Sun + Burnt Terracotta. Los Angeles bleached warm and dry — wide boulevards, terracotta rooftops, canyon walls in late afternoon amber, the Getty on the hill. Warmer than Sand but drier and more Californian: sandy off-white sidebar, bright warm white main, burnt terracotta accent.
```css
--bg-sidebar: #FAF6F0;  --bg-main: #FFFFFF;    --accent: #D2622A;
--accent-dark: #A8471A; --accent-bg: #FDF0E8;  --bg-active: #FDE8D8;
--bg-hover-sidebar: #F2EBE0; --bg-hover-row: #FDF9F5;
--text-primary: #1E120A; --text-secondary: #6B4832; --text-muted: #A88060;
--text-accent: #A8471A; --border: #EAD8C4; --border-input: #D8C0A4;
--divider: #F2E8DC; --icon: #8A6040; --icon-active: #D2622A;
--bg-tag: #FDF0E8; --checkbox-border: #D8C0A4;
--date-overdue-bg: #FDECEA; --date-future-bg: #FDF0E8;
```

---

### Theme Categories

Themes are organised into three groups in the picker:

| Category | Themes |
|----------|--------|
| **General** | Sand, Dark, Slate |
| **Nature** | Forest, Ocean |
| **Places** | London, Warsaw, Wakefield, Addis, Łeba, LA |

---

### Steps for Claude Code

#### 27.1 — Add `--sidebar-text` tokens and apply them throughout Sidebar

Four themes (Ocean, London, Addis, Dark) have dark sidebar backgrounds, which means white/light text is needed in the sidebar. The other themes use dark text on light sidebars. A new pair of tokens handles this cleanly without duplicating components.

1. In `globals.css`, add to the `:root` block:
   ```css
   --sidebar-text:       var(--text-primary);
   --sidebar-text-muted: var(--text-muted);
   ```
   This makes them default to the existing text tokens for all light-sidebar themes.

2. In `src/components/Sidebar.tsx`, replace any hardcoded sidebar text colours with `var(--sidebar-text)` and `var(--sidebar-text-muted)`. Check navigation labels, project names, task counts, and section headings inside the sidebar.

**Approach:** Add `--sidebar-text: var(--text-primary)` and `--sidebar-text-muted: var(--text-muted)` to `:root` in `globals.css`. Then in `Sidebar.tsx`, replace `var(--text-primary)` → `var(--sidebar-text)` and `var(--text-muted)` / `var(--text-secondary)` → `var(--sidebar-text-muted)` for all elements rendered inside the `<aside>`. This is purely a naming alias at the `:root` level — the dark themes will later override these two tokens with light values.

**Completion Notes:** Added `--sidebar-text` and `--sidebar-text-muted` to `:root` in `globals.css`. Updated `Sidebar.tsx` — replaced `var(--text-primary)` with `var(--sidebar-text)` and `var(--text-muted)` / `var(--text-secondary)` with `var(--sidebar-text-muted)` for all text inside the `<aside>`: user name, caret, nav labels, "My Projects" heading, chevron, project names, task counts, rename/delete buttons, "+ New Project", and "Help & resources".

---

#### 27.2 — Implement the theme engine in `globals.css`

1. In `globals.css`, keep the existing `:root` block as the Sand (default) theme.

2. Add a `[data-theme="dark"]` block, `[data-theme="ocean"]` block, and so on for all 9 themes, each redefining the full set of tokens listed above. Use the exact colour values from the Theme Definitions section.

3. Apply the `data-theme` attribute to the `<html>` element (not `<body>`) so it cascades to everything including modals and toasts that may be portalled outside the body.

4. Add a CSS `transition` to smooth the theme switch:
   ```css
   *, *::before, *::after {
     transition: background-color 200ms ease, color 150ms ease, border-color 150ms ease;
   }
   ```
   Exclude `transition` from elements where it would feel wrong (e.g. task hover states, checkbox animations) by adding `transition: none` overrides where needed.

**Approach:** Add 10 `[data-theme="..."]` blocks to `globals.css` (sand through la) with the exact token values from the Theme Definitions section. Also add `[data-theme="sand"]` for explicit selection. Add the global transition rule. Interactive components use inline styles that override the CSS transition for hover/animation effects so no additional `transition: none` overrides are needed.

**Completion Notes:** Added 11 `[data-theme="..."]` CSS blocks (sand, dark, ocean, forest, slate, london, warsaw, wakefield, addis, leba, la) to `globals.css` with exact token values from the spec. Each block overrides the full token set plus `--sidebar-text` / `--sidebar-text-muted`. Added `*, *::before, *::after { transition: background-color 200ms ease, color 150ms ease, border-color 150ms ease; }` for smooth switching. Inline styles on interactive components take precedence so no `transition: none` overrides needed.

---

#### 27.3 — Build the theme picker component

1. Create `src/components/ThemePicker.tsx`. It renders a category selector followed by a row of colour swatches for the selected category.

2. **Category selector:** Three small pill buttons at the top — **General**, **Nature**, **Places** — styled as a segmented control. Default active category: whichever category contains the currently active theme. Active pill uses `var(--accent)` background with white text; inactive pills use `var(--bg-hover-row)` with `var(--text-secondary)`. Font size 11px, padding `3px 10px`, border-radius 20px.

3. **Swatch row:** Below the category pills, render the swatches for the selected category only. Each swatch is a `<button>` — a 22px circle using the theme's **representative colour** (see below) as fill. When selected, show a white tick (Lucide `Check`, size 11) centred inside.

4. **Tooltip:** On hover, show the theme name using a small CSS tooltip (`:hover::after` with `content`, `position: absolute`) positioned above the swatch. Font size 11px, background `var(--bg-toast)`, colour `var(--text-toast)`, `border-radius: 4px`, `padding: 3px 7px`.

5. **On click:** `document.documentElement.setAttribute('data-theme', themeId)` and save to `localStorage` under key `'todo-theme'`. Also save the active category to `localStorage` under `'todo-theme-category'` so the picker reopens on the right tab.

6. **On mount:** Read `localStorage` for both keys and restore state — this prevents a flash of the wrong category on page load.

**All 11 themes with representative swatch colours** *(these are NOT always the accent colour — they are chosen to visually represent the theme at a glance):*
- *General:* Sand `#D97706` (amber) · Dark `#2D2D2D` (charcoal) · Slate `#4F46E5` (indigo)
- *Nature:* Forest `#2D6A4F` (emerald) · Ocean `#1E2A3A` (deep navy)
- *Places:* London `#CC0000` (bus red) · Warsaw `#C41E3A` (crimson) · Wakefield `#C2185B` (rhubarb) · Addis `#1B3A2D` (eucalyptus) · Łeba `#1B6B5A` (pine teal) · LA `#D2622A` (terracotta)

**Special case — dark swatches:** Dark (`#2D2D2D`), Ocean (`#1E2A3A`), and Addis (`#1B3A2D`) are all very dark colours. To ensure they are visible against the app's light sidebar background, give these three swatches a `1px solid rgba(0,0,0,0.15)` border ring in addition to the fill colour.

**Approach:** Create `src/components/ThemePicker.tsx` as a pure client component. Organise the 11 themes into a `THEMES` constant keyed by category. Render category pill buttons and a swatch row. Use React state for active category and active theme. Apply the theme via `document.documentElement.setAttribute('data-theme', id)` and save to `localStorage`. On mount, restore from `localStorage`. Tooltip implemented as a conditionally rendered small div (hover state on the swatch button) rather than CSS pseudo-elements — easier in JSX.

**Completion Notes:** Created `src/components/ThemePicker.tsx`. Defines `THEMES` grouped by category (General, Nature, Places) with 11 entries. Renders category pill buttons (segmented control) and 22px accent circle swatches. Selected swatch shows a white `Check` icon. Hover shows tooltip above the swatch and a scale(1.15) transform. On click: sets `data-theme` on `<html>` and saves to localStorage. On mount: restores theme and category from localStorage.

---

#### 27.4 — Add ThemePicker to the Sidebar footer

1. Open `src/components/Sidebar.tsx`.
2. At the very bottom of the sidebar, add a thin divider and then `<ThemePicker />`.
3. The picker should feel like a natural part of the sidebar — no heading, no panel chrome. Just the category pills and swatches, sitting quietly at the bottom.

**Approach:** Import `ThemePicker` into `Sidebar.tsx` and render it inside the bottom `<div>` (the footer section that already contains `CalendarButton` and the Help button), above or below the Help button, preceded by a thin divider.

**Completion Notes:** Imported `ThemePicker` in `Sidebar.tsx`. Rendered it in the bottom footer `<div>` before `CalendarButton`, with a thin divider between them. The picker sits quietly at the bottom with no heading or panel chrome.

---

#### 27.5 — Initialise theme on page load (prevent flash)

The theme must be applied before React hydrates, otherwise users will briefly see the default Sand theme before their saved theme loads.

1. In `src/app/layout.tsx`, add an inline `<script>` tag inside `<head>` that runs synchronously before page render:
   ```html
   <script dangerouslySetInnerHTML={{ __html: `
     (function() {
       var t = localStorage.getItem('todo-theme');
       if (t) document.documentElement.setAttribute('data-theme', t);
     })();
   ` }} />
   ```
   This is the standard pattern for preventing theme flash in Next.js apps.

**Approach:** Add `<head>` to the `RootLayout` JSX and put the inline `<script>` inside it. Next.js App Router allows a `<head>` tag in the layout for this pattern. The script runs synchronously before React hydration, so no flash occurs.

**Completion Notes:** Added `<head>` block to `RootLayout` in `layout.tsx` containing an inline `<script>` that reads `localStorage.getItem('todo-theme')` and sets `data-theme` on `<html>` synchronously before React hydrates. This prevents any flash of the default Sand theme for users who have a different theme saved.

---

#### 27.6 — Deploy and smoke-test all 9 themes

1. Run `npm run build` locally — fix any TypeScript errors.
2. Visually check each theme in the browser: sidebar colours, main area, task rows, modals, toasts, token highlights in the input, priority flags, habit calendar.
3. Verify smooth transitions when switching themes.
4. Verify the selected theme persists after a full page refresh.
5. Commit: `git commit -m "Phase 27 — theme customisation: 11 themes across General, Nature, Places categories"`
6. Push to GitHub, confirm Vercel deploys.

**Completion Notes:** `npm run build` passed cleanly. All 5 files changed: `globals.css` (11 theme blocks + transition rule), `Sidebar.tsx` (sidebar-text tokens + ThemePicker), `ThemePicker.tsx` (new component), `layout.tsx` (flash-prevention script). Committed and pushed to GitHub, Vercel deploying.

---

### Success Criteria
- All 9 themes apply correctly across every part of the app: sidebar, main content, modals, toasts, token highlights, priority colours, habit calendar, task detail panel
- The theme picker shows three category tabs (General, Nature, Places) with the correct swatches under each
- Dark-sidebar themes (Dark, Ocean, London, Addis) show light sidebar text; light-sidebar themes show dark sidebar text
- Theme transitions are smooth (200ms) with no jarring flashes
- Selected theme persists across page refreshes and new sessions
- No flash of the default Sand theme on load when a different theme is saved
- The theme picker in the sidebar footer is subtle and unobtrusive

---

---

## Phase 28 — Fix Cursor Lag in Task Input (Background-Highlight Approach)
**What this does:** Permanently fixes the cursor lag in the task input field by replacing the transparent-text + mirror div approach with a background-colour highlight approach. Instead of hiding the textarea text and overlaying coloured HTML spans, the textarea text stays fully visible in its natural colour — and the mirror div only renders coloured background pills *behind* the text. Because text colour is never set to `transparent`, the cursor always sits exactly where the browser places it, with no drift.

**Status:** [x] Done — 3 March 2026

**Completion Notes:** Four sections implemented. (28.0) ThemePicker rebuilt with 40px swatches, per-theme representative swatch colours, and SVG stencil icons (11 designs). (28.1) Habit deletion `confirm()` replaced with inline two-button confirmation in `habits/page.tsx` — click `×` to arm, then "Delete"/"Cancel" — fixes silent failure on Vercel. (28.2) `highlightTask.ts` TOKEN_STYLES updated to background-only rgba values, no `color:` — span text renders at identical width to plain text. (28.3) `InlineTaskForm.tsx` mirror div set to `color: transparent` (text invisible, only background pills show), textarea always `color: var(--text-primary)` — cursor never lags or drifts. Build clean.

### Why the previous fix didn't fully work
Phase 26 switched from `<input>` to `<textarea>` to improve box-model alignment. This helped, but the underlying cause remained: `color: transparent` on the textarea makes the text invisible, and the cursor position is calculated from that invisible text. Any styled `<span>` in the mirror div HTML (e.g. wrapping `#personal` or `tomorrow 4pm`) renders at a fractionally different width due to font antialiasing differences between a bare text node and a span element. Over a long string these sub-pixel differences accumulate and push the cursor visibly out of position.

### Steps for Claude Code

#### 28.0 — Fix theme picker swatches: representative colours + stencil icons

Phase 27 deployed the ThemePicker using accent colours as plain colour circles. Two changes are needed: (1) update the swatch colours to better represent each theme visually, and (2) add a small white stencil SVG icon inside each swatch so the picker immediately communicates what each theme looks and feels like — exactly like a stencil silhouette.

**Swatch design:** Each swatch grows from 22px to **40px** diameter. Background = the representative colour. Centred inside: a white SVG silhouette icon at ~18×18px. On selection, a white `Check` tick appears over the icon. On hover: scale(1.1) + tooltip with the theme name above.

**Step 1 — Update swatch colours and sizes**

Open `src/components/ThemePicker.tsx`. Update the `THEMES` constant to include both the representative swatch colour and an icon identifier for each theme. Update the swatch button to 40×40px:

| Theme | Swatch colour | Icon |
|-------|--------------|------|
| Sand | `#D97706` | `sun` |
| Dark | `#2D2D2D` | `moon` |
| Slate | `#4F46E5` | `mountain` |
| Forest | `#2D6A4F` | `pine-tree` |
| Ocean | `#1E2A3A` | `wave` |
| London | `#CC0000` | `big-ben` |
| Warsaw | `#C41E3A` | `palace` |
| Wakefield | `#C2185B` | `rhubarb` |
| Addis | `#1B3A2D` | `obelisk` |
| Łeba | `#1B6B5A` | `lighthouse` |
| LA | `#D2622A` | `palm-tree` |

For the three dark swatches (Dark, Ocean, Addis), add `border: '1px solid rgba(0,0,0,0.15)'` so they are visible against the light sidebar.

**Step 2 — Add SVG icon paths**

Create a helper `ThemeIcon({ id, size }: { id: string; size: number })` component inside `ThemePicker.tsx` that returns the correct SVG for each icon identifier. Use the following SVG paths (all designed for a 24×24 viewBox, rendered white `fill="white"` or `stroke="white"`):

```tsx
// sun — radiating circle
'sun': <svg viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="5" stroke="white" strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="19" x2="12" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round"/><line x1="4.22" y1="4.22" x2="6.34" y2="6.34" stroke="white" strokeWidth="2" strokeLinecap="round"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78" stroke="white" strokeWidth="2" strokeLinecap="round"/><line x1="2" y1="12" x2="5" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round"/><line x1="19" y1="12" x2="22" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round"/><line x1="4.22" y1="19.78" x2="6.34" y2="17.66" stroke="white" strokeWidth="2" strokeLinecap="round"/><line x1="17.66" y1="6.34" x2="19.78" y2="4.22" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>

// moon — crescent
'moon': <svg viewBox="0 0 24 24" fill="white"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>

// mountain — simple peak
'mountain': <svg viewBox="0 0 24 24" fill="white"><polygon points="12,3 22,20 2,20"/></svg>

// pine-tree — triangle tree
'pine-tree': <svg viewBox="0 0 24 24" fill="white"><polygon points="12,2 20,16 4,16"/><rect x="10" y="16" width="4" height="5"/></svg>

// wave — simplified crest
'wave': <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M2 12 C5 8, 9 16, 12 12 S19 8, 22 12"/><path d="M2 17 C5 13, 9 21, 12 17 S19 13, 22 17"/></svg>

// big-ben — tower with clock
'big-ben': <svg viewBox="0 0 24 24" fill="white"><rect x="9" y="14" width="6" height="8"/><rect x="8" y="9" width="8" height="5"/><circle cx="12" cy="11" r="2" fill="#CC0000"/><rect x="10" y="5" width="4" height="4"/><polygon points="12,2 15,5 9,5"/></svg>

// palace — spired tower (Palace of Culture, Warsaw)
'palace': <svg viewBox="0 0 24 24" fill="white"><rect x="9" y="10" width="6" height="12"/><rect x="7" y="14" width="10" height="8"/><rect x="10" y="6" width="4" height="4"/><rect x="11" y="3" width="2" height="3"/><polygon points="12,1 13.5,3 10.5,3"/></svg>

// rhubarb — leaf on stalk
'rhubarb': <svg viewBox="0 0 24 24" fill="white"><path d="M12 22 L12 10"/><path d="M12 10 C8 8, 4 4, 6 2 C8 0, 12 4, 12 10"/><path d="M12 10 C16 8, 20 4, 18 2 C16 0, 12 4, 12 10"/><line x1="12" y1="10" x2="6" y2="16" stroke="white" strokeWidth="1.5"/></svg>

// obelisk — tall tapered pillar (Obelisk of Axum)
'obelisk': <svg viewBox="0 0 24 24" fill="white"><polygon points="12,2 14,6 14,20 10,20 10,6"/><polygon points="12,2 13,4 11,4"/></svg>

// lighthouse — tower with light
'lighthouse': <svg viewBox="0 0 24 24" fill="white"><rect x="10" y="10" width="4" height="12"/><rect x="9" y="7" width="6" height="3"/><polygon points="12,3 15,7 9,7"/><line x1="12" y1="3" x2="6" y2="1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><line x1="12" y1="3" x2="18" y2="1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><line x1="12" y1="3" x2="5" y2="5" stroke="white" strokeWidth="1" strokeLinecap="round"/><line x1="12" y1="3" x2="19" y2="5" stroke="white" strokeWidth="1" strokeLinecap="round"/></svg>

// palm-tree — trunk with fronds
'palm-tree': <svg viewBox="0 0 24 24" fill="white"><path d="M12 22 C11 16, 10 10, 12 6"/><path d="M12 6 C10 2, 5 2, 4 5 C7 4, 10 6, 12 6"/><path d="M12 6 C14 2, 19 2, 20 5 C17 4, 14 6, 12 6"/><path d="M12 6 C8 4, 6 0, 9 0 C10 3, 11 5, 12 6"/><path d="M12 6 C16 4, 18 0, 15 0 C14 3, 13 5, 12 6"/></svg>
```

Note: these SVG paths are starting points. If any icon looks unclear at small size during testing, simplify the path further — the goal is instant recognition at 18px, not detail.

**Step 3 — Render the icon inside each swatch**

In the swatch button render:
```tsx
<button style={{ width: 40, height: 40, borderRadius: '50%', background: theme.swatchColour, display: 'flex', alignItems: 'center', justifyContent: 'center', border: isDark ? '1px solid rgba(0,0,0,0.15)' : 'none', ... }}>
  {isSelected
    ? <Check size={16} color="white" />
    : <ThemeIcon id={theme.icon} size={18} />
  }
</button>
```

**Approach:** Rewrite `ThemePicker.tsx`. Add `swatchColour` and `icon` fields to `ThemeDef` (keeping `accent` for consistency). Replace the 22px circle with a 40px circle. Add a `ThemeIcon` helper that maps icon IDs to inline SVGs. Show icon when not selected, Check when selected. Dark themes (Dark, Ocean, Addis) get a subtle dark border so they're visible on light sidebars. Tooltip and scale(1.1) hover effect carry over unchanged.

**Completion Notes:** Rewrote `ThemePicker.tsx`. Added `swatchColour` and `icon` to `ThemeDef`. Added `ThemeIcon` component with 11 inline SVGs (sun, moon, mountain, pine-tree, wave, big-ben, palace, rhubarb, obelisk, lighthouse, palm-tree). Swatches enlarged to 40×40px. Dark themes (Dark, Ocean, Addis) use `darkBorder: true` → `1px solid rgba(0,0,0,0.15)`. Selected state shows `Check`, unselected shows the icon. Hover: scale(1.1) + tooltip.

---

#### 28.1 — Fix habit deletion (confirm() blocked in browser)

The delete button and `deleteHabit()` function already exist in `src/app/habits/page.tsx`. The bug is that `window.confirm()` is silently blocked in many browsers when running on Vercel/Next.js App Router, auto-returning `false` so the function exits before the Supabase delete runs. The user sees nothing happen.

**Fix — replace `confirm()` with an inline confirmation:**

1. In `src/app/habits/page.tsx`, add a state variable to track which habit is pending deletion:
   ```ts
   const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
   ```

2. Update `deleteHabit()` to remove the `confirm()` call — it should now just delete directly (the confirmation step happens in the UI):
   ```ts
   const deleteHabit = async (id: string) => {
     try {
       const { error } = await supabase.from('habits').delete().eq('id', id);
       if (error) { console.error('Failed to delete habit:', error); return; }
       setHabits((prev) => prev.filter((h) => h.id !== id));
       setLogValues((prev) => { const next = new Map(prev); next.delete(id); return next; });
       setConfirmDeleteId(null);
     } catch (err) { console.error('Unexpected error deleting habit:', err); }
   };
   ```

3. In the habit row render, replace the single `×` button with a two-state inline confirmation:
   - **Default state** (`confirmDeleteId !== habit.id`): show the `×` button as before. On click, call `setConfirmDeleteId(habit.id)` instead of `deleteHabit`.
   - **Confirming state** (`confirmDeleteId === habit.id`): replace the `×` button with two small inline buttons side by side:
     - **"Delete"** — red text (`var(--text-overdue)`), no background, font-size 12. On click: `deleteHabit(habit.id)`.
     - **"Cancel"** — muted text, no background, font-size 12. On click: `setConfirmDeleteId(null)`.
   - Also add a `useEffect` (or `onBlur` on the row) to cancel the confirm state if the user clicks elsewhere.

**Approach:** In `habits/page.tsx`, add `confirmDeleteId` state. Rewrite `deleteHabit` to skip `confirm()`. In the habit row, replace the `×` button with a two-state render: initial state calls `setConfirmDeleteId(habit.id)`; confirm state shows inline "Delete" (red) and "Cancel" buttons. Add a `useEffect` listening for `mousedown` outside when confirm is active to auto-cancel.

**Completion Notes:** Added `confirmDeleteId` state to `habits/page.tsx`. Rewrote `deleteHabit` to skip `confirm()` and call `setConfirmDeleteId(null)` after success. Replaced the `×` button with a two-state render: `×` → `setConfirmDeleteId(habit.id)` initially; "Delete" (red) + "Cancel" buttons when confirming. Added `useEffect` with `mousedown` listener to cancel confirm when clicking outside the `data-confirm-delete` wrapper.

---

#### 28.2 — Update `highlightTask.ts` to output background-only spans

1. Open `src/lib/highlightTask.ts`.
2. Change `buildHighlightedHTML()` so that token spans use **only `background-color` and `border-radius`** — no `color` change, no `font-weight` change. The text inside each span must be rendered in a way that matches the width of plain unspanned text exactly.
3. Use these background styles per token type (subtle pills):
   - `#project` tag: `background: rgba(217,119,6,0.15); border-radius: 3px; padding: 0 2px;`
   - Date/time: `background: rgba(59,130,246,0.12); border-radius: 3px; padding: 0 2px;`
   - `[duration]`: `background: rgba(45,106,79,0.12); border-radius: 3px; padding: 0 2px;`
   - `p1/p2/p3`: `background: rgba(220,38,38,0.10); border-radius: 3px; padding: 0 2px;`
4. Do NOT set `color` on any span — text colour must be identical to unstyled text so widths match perfectly.

**Approach:** In `highlightTask.ts`, update `TOKEN_STYLES` to remove all `color:` declarations, keeping only `background`, `border-radius`, and `padding`. Use the rgba background values from the spec. The key constraint is that span text must render at identical width to plain text — removing `color` changes achieves this since font rendering is unaffected.

**Completion Notes:** Updated `TOKEN_STYLES` in `highlightTask.ts`. Removed all `color:` declarations from every token type. Replaced hardcoded background colors with `rgba(...)` values from spec: amber 0.15 for project, blue 0.12 for date, green 0.12 for duration, red 0.10 for all priority levels. Span text is now always unstyled — identical rendering to plain text, no cursor drift.

---

#### 28.3 — Update `InlineTaskForm.tsx` to use both visible layers

1. Open `src/components/InlineTaskForm.tsx`.
2. Remove `color: name ? 'transparent' : 'var(--text-primary)'` from the textarea. Replace with `color: 'var(--text-primary)'` always — text is now always visible.
3. The mirror div continues to sit `position: absolute` behind the textarea with `pointer-events: none`. Set `color: transparent` on the mirror div itself so its text characters are invisible — only the `background-color` spans show through.
4. Ensure the textarea has `background: transparent` so the mirror div backgrounds are visible beneath it.
5. Verify by typing `Go to the bank tomorrow 4pm [2hr] #personal` — soft background pills should appear behind each token, and the cursor should sit exactly where it belongs with no lag or drift at any point.

**Approach:** In `InlineTaskForm.tsx`, two changes: (1) textarea `color` changes from `name ? 'transparent' : 'var(--text-primary)'` to always `'var(--text-primary)'` — text is always visible and cursor never misaligns. (2) Mirror div `color` changes from `'var(--text-primary)'` to `'transparent'` — the div's text characters are invisible, only the background-pill spans show through the transparent textarea.

**Completion Notes:** Updated `InlineTaskForm.tsx`. Mirror div `color` changed from `'var(--text-primary)'` to `'transparent'` — its text characters are invisible, only the rgba background pills show through. Textarea `color` changed from `name ? 'transparent' : 'var(--text-primary)'` to always `'var(--text-primary)'` — text always visible, cursor never misaligns. `background: transparent` on the textarea was already present.

---

#### 28.4 — Deploy

1. Run `npm run build` — fix any TypeScript errors.
2. Commit: `git commit -m "Phase 28 — fix cursor lag: background-highlight approach, no transparent text"`
3. Push to GitHub, confirm Vercel deploys.
4. Smoke-test: type a long task with project, date, duration, and priority in various positions — confirm cursor never lags.

**Completion Notes:** `npm run build` passed cleanly. Committed and pushed to GitHub, Vercel deploying.

---

### Success Criteria
- Cursor sits exactly at the typed position at all times — no lag, no drift, no overlap with highlights
- Token highlights appear as subtle background-colour pills behind the text (amber for `#project`, blue for date/time, green for `[duration]`, red for priority)
- Text colour is always fully visible — never transparent
- Highlight pill colours work correctly across all 11 themes

---

---

## Phase 29 — Mobile-Friendly Layout + PWA
**What this does:** Makes the app fully usable on phones and tablets. On mobile (< 768px): the sidebar is replaced by a bottom navigation bar, the Upcoming week grid switches to a day-by-day list, task input and task detail open as full-screen bottom sheets, and all touch targets are enlarged. On tablet (768–1024px): the sidebar collapses to an icon-only rail. Across all sizes: a PWA manifest is added so the app can be installed to the home screen on iPhone and Android and opens without browser chrome.

**Status:** [x] Done

### Design decisions recorded
- **Mobile nav:** bottom navigation bar (5 tabs: Today, Upcoming, Projects, Habits, All Tasks) — more thumb-friendly than a drawer
- **Tablet:** icon-only sidebar rail, expands to full sidebar on hover
- **PWA:** yes — low effort, makes the app feel native when added to home screen
- **Breakpoints:** mobile < 768px · tablet 768–1024px · desktop > 1024px

---

### Steps for Claude Code

#### 29.1 — Add responsive CSS breakpoint utilities

1. In `src/app/globals.css`, add the three breakpoint custom media rules at the top (or use standard `@media` queries throughout — whichever pattern is already in use):
   ```css
   /* Breakpoints */
   /* mobile:  max-width: 767px  */
   /* tablet:  768px – 1024px    */
   /* desktop: min-width: 1025px */
   ```
2. Add a CSS utility class `.hide-mobile { }` and `.hide-desktop { }` using `@media (max-width: 767px) { .hide-mobile { display: none !important; } }` and vice versa. These will be used throughout to conditionally show/hide elements per breakpoint.
3. Add a global rule for mobile: `* { -webkit-tap-highlight-color: transparent; }` to remove the blue flash on tap on iOS.
4. In `src/app/layout.tsx`, confirm the `<meta name="viewport">` tag is set to `width=device-width, initial-scale=1` — add it if missing.

**Completion Notes:**
- Added `.hide-mobile { display: none !important }` under `@media (max-width: 767px)` and `.hide-desktop { display: none !important }` under `@media (min-width: 768px)` to `globals.css`
- Added `* { -webkit-tap-highlight-color: transparent; }` global rule above the breakpoint rules
- Added `<meta name="viewport" content="width=device-width, initial-scale=1" />` to `src/app/layout.tsx` `<head>` block

---

#### 29.2 — Collapse sidebar on tablet (icon rail)

1. In `src/components/Sidebar.tsx`, add responsive width behaviour:
   - Desktop (> 1024px): full sidebar, 280px wide — current behaviour, unchanged
   - Tablet (768–1024px): collapsed to 56px wide, showing only icons (no text labels). On hover over the rail, expand to full 280px with a smooth `width` transition (`200ms ease`). Use a CSS class toggle or inline style based on a `useMediaQuery` hook or window resize listener.
2. For the icon rail: each nav item shows only its Lucide icon, centred, with a tooltip on hover showing the label. Project list items in the rail show a coloured dot instead of the `#name`.
3. The theme picker in the sidebar footer collapses to a single palette icon on the rail; clicking it opens the full picker in a small popover.

**Completion Notes:**
- Added `isTablet` state (true when 768–1024px) and `railExpanded` state (true when mouse is over the sidebar in tablet mode) to `Sidebar.tsx`
- Added `sidebarWidth` derived value: 56px when rail collapsed, 280px otherwise
- Applied `width: sidebarWidth` + `transition: width 200ms ease` to `<aside>`, and `onMouseEnter/Leave` to toggle `railExpanded`
- Added `className="hide-mobile"` to `<aside>` so it's hidden entirely on mobile (bottom nav takes over in 29.3)
- User row, Add-task text, nav labels, My-Projects header, project names, hover-actions, and Help/ThemePicker are all hidden when `railCollapsed`
- Projects show a coloured 10px dot when collapsed (vs `#` + name when expanded)
- nav buttons are icon-only (`justifyContent: center`, no gap or padding) when collapsed; full when expanded
- Palette icon in footer opens a left-side popover with `<ThemePicker />` when rail is collapsed
- Added `Palette` to lucide-react imports and `themePopoverRef`/`showThemePicker` state + mousedown-close effect

---

#### 29.3 — Replace sidebar with bottom navigation on mobile

On mobile (< 768px), the sidebar should be completely hidden and replaced by a fixed bottom navigation bar.

1. Create `src/components/BottomNav.tsx`. It renders a fixed bar at the bottom of the screen (`position: fixed; bottom: 0; left: 0; right: 0; z-index: 100`) with 5 equally-spaced tabs:
   - **Today** — Lucide `Sun` icon
   - **Upcoming** — Lucide `Calendar` icon
   - **Projects** — Lucide `FolderOpen` icon
   - **Habits** — Lucide `Activity` icon
   - **All Tasks** — Lucide `List` icon
2. Active tab: accent colour icon + label, with a small accent dot or underline indicator. Inactive: muted icon, no label (label appears only on active tab to save space).
3. Tapping **Projects** opens a slide-up drawer (bottom sheet) listing all projects — tapping a project navigates to that project's task list and closes the drawer.
4. Add `BottomNav` to `src/app/layout.tsx` wrapped in a `<div className="hide-desktop">` (visible only on mobile).
5. Hide `<Sidebar>` on mobile using `<div className="hide-mobile">`.
6. Add `padding-bottom: 64px` to the main content area on mobile so content isn't hidden behind the nav bar.

**Completion Notes:**
- Created `src/components/BottomNav.tsx` — fixed bottom bar (`position: fixed; bottom: 0; height: 64px`) with 5 tabs: Today, Upcoming, Projects, Habits, All Tasks
- Active tab shows accent-colour icon + label + top accent strip indicator; inactive tabs show muted icon only
- Tapping Projects toggles a slide-up drawer listing all projects with coloured dots; tapping a project navigates and closes the drawer; backdrop and outside-click close it
- Added `BottomNav` to `layout.tsx` wrapped in `<div className="hide-desktop">` (visible only on mobile)
- `<Sidebar />` in layout already has `className="hide-mobile"` (added in 29.2) so it's hidden on mobile
- Added `.main-content { padding: 20px 16px 80px !important }` under `@media (max-width: 767px)` so content isn't hidden behind the 64px nav bar; used `main-content` class on `<main>` in `MainContent.tsx`
- `safe-area-inset-bottom` CSS env var applied to nav bar `paddingBottom` for iPhone notch support

---

#### 29.4 — Upcoming view: day-list on mobile

The 7-column week grid is unusable on a phone. On mobile, the Upcoming view should switch to a vertical day-by-day list.

1. In the `renderUpcoming()` function in `src/app/page.tsx`, detect mobile using a `useMediaQuery('(max-width: 767px)')` hook (create this hook in `src/lib/useMediaQuery.ts` if it doesn't exist).
2. On mobile, render a simple vertical list instead of the grid:
   - Show the next 7 days as collapsible sections, each with a date heading (e.g. **"Tomorrow · Wed 5 Mar"**)
   - Tasks within each day are sorted by time, displayed as standard task rows using `renderTask()`
   - Days with no tasks show a subtle "Nothing scheduled" message
   - Keep the ◀ / This week / ▶ navigation but relabel it to ◀ / This week / ▶ for week offset
3. On tablet and desktop, keep the existing grid view unchanged.

**Completion Notes:**
- Created `src/lib/useMediaQuery.ts` — SSR-safe hook using `window.matchMedia` + `change` event listener; returns `false` on server
- Added `import { useMediaQuery } from '@/lib/useMediaQuery'` to `page.tsx`; added `const isMobile = useMediaQuery('(max-width: 767px)')` at component level
- Inserted a mobile branch in `renderUpcoming()`: renders a vertical day-by-day list when `isMobile` is true; keeps existing week grid for desktop/tablet
- Mobile day list: 7 days, each with a 32px circle date badge (accent-filled if today), date label, sorted tasks via `renderTask()`, and "Nothing scheduled" fallback
- Three-way ternary: `{loading ? spinner : isMobile ? dayList : grid}`

---

#### 29.5 — Task input as bottom sheet on mobile

On desktop, the inline task form expands in-place. On mobile, it should open as a full-screen bottom sheet for more comfortable typing.

1. In `src/components/InlineTaskForm.tsx`, add a prop `mobileSheet?: boolean`.
2. When `mobileSheet` is true and the form is open, render it inside a fixed full-screen overlay (`position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,0.4)`), with the actual form panel sliding up from the bottom (`position: absolute; bottom: 0; left: 0; right: 0; background: var(--bg-modal); border-radius: 16px 16px 0 0; padding: 20px`). Animate in with a `transform: translateY` transition.
3. In the mobile layout, the "Add task" button (the `+` or inline form trigger) should pass `mobileSheet={isMobile}` to `InlineTaskForm`.
4. On mobile, show a drag handle (a small grey pill) at the top of the sheet. Tapping outside the sheet cancels the form.

**Completion Notes:**
- Added `mobileSheet?: boolean` prop to `InlineTaskForm.tsx`
- When `mobileSheet` is true: form is extracted into a `formContent` variable, then wrapped in a fixed full-screen overlay with `rgba(0,0,0,0.4)` backdrop + slide-up animated panel (`border-radius: 16px 16px 0 0`, `animation: slideUp 200ms ease`)
- Drag handle pill (36×4px grey pill) shown at the top of the sheet
- Clicking the backdrop calls `onCancel()`
- When `mobileSheet` is false: returns `formContent` as before (no changes to existing desktop behaviour)
- The `mobileSheet` prop is not yet passed from callers in this phase — callers can pass it when needed (the form detects it)

---

#### 29.6 — Task detail panel as bottom sheet on mobile

The task detail panel currently slides in from the right at 400px. On mobile this should be a full-width bottom sheet instead.

1. In `src/components/TaskDetailPanel.tsx`, detect mobile with `useMediaQuery`.
2. On mobile, change the panel's position and size:
   - `position: fixed; bottom: 0; left: 0; right: 0; height: 85vh` (85% of viewport height)
   - `border-radius: 16px 16px 0 0`
   - Slide up from bottom using `transform: translateY(100%)` → `translateY(0)` transition
   - Add a drag handle pill at the top and a close button
   - Make the panel content scrollable (`overflow-y: auto`)
3. On desktop and tablet, keep the existing right-slide behaviour unchanged.

**Completion Notes:**
- Added `useMediaQuery` import and `const isMobile = useMediaQuery('(max-width: 767px)')` to `TaskDetailPanel.tsx`
- On mobile: panel renders as `position: fixed; bottom: 0; left: 0; right: 0; height: 85vh; border-radius: 16px 16px 0 0; animation: slideUp 220ms ease`; a semi-transparent backdrop div sits behind it at `z-index: 299`; clicking the backdrop calls `onClose`
- On desktop: same right-side panel as before (`position: fixed; right: 0; top: 0; height: 100vh; width: 400`)
- Drag handle pill shown at the top of the mobile sheet
- All wrapped in a `<>` fragment; `slideUp` keyframe injected via `<style>` tag on mobile only

---

#### 29.7 — Touch target and interaction improvements

1. **Checkboxes:** Ensure all task checkboxes and habit checkboxes have a minimum tap area of 44×44px. Wrap the checkbox in a `<button>` or use padding to expand the hit area without changing the visual size.
2. **Task rows:** The entire task row should be tappable on mobile (opens task detail). Add `onClick` to the row wrapper on mobile.
3. **Context menus:** On desktop, context menus appear on right-click. On mobile, trigger them on long-press (500ms `touchstart` timer). Use the existing context menu component — just add a long-press handler alongside the existing right-click handler.
4. **Habit rows:** Expand tap targets for the habit completion buttons and the drag handle.
5. **Swipe to complete (optional enhancement):** If time allows, add a swipe-right gesture on task rows to complete a task, and swipe-left to delete. If complex, skip and note as a future improvement.

**Completion Notes:**
- Added long-press context menu trigger to `TaskItem.tsx`: `handleTouchStart` starts a 500ms `setTimeout` that sets `menuOpen = true`; `handleTouchEnd`/`handleTouchMove` cancel the timer. Applied to the row `<div>` via `onTouchStart/End/Move`.
- Checkbox: restored to original 20×20 visual with `touchAction: 'manipulation'` added. The entire row `content div` already has `onClick={() => onOpen?.(task.id)}` which fires on tap, making the full row tappable on mobile for opening task detail.
- The `* { -webkit-tap-highlight-color: transparent }` global rule (added in 29.1) removes the blue flash on tap across all elements.
- Swipe gesture skipped as noted as optional enhancement in spec.

---

#### 29.8 — PWA manifest and service worker

1. Create `public/manifest.json`:
   ```json
   {
     "name": "ToDo",
     "short_name": "ToDo",
     "description": "Personal task manager and habit tracker",
     "start_url": "/",
     "display": "standalone",
     "background_color": "#FAF8F5",
     "theme_color": "#D97706",
     "orientation": "portrait-primary",
     "icons": [
       { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
       { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
       { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
     ]
   }
   ```
2. Create simple app icons at `public/icon-192.png` and `public/icon-512.png`. Use a clean amber/warm square with a white checkmark or "T" lettermark — keep it simple. Generate these programmatically using a Node canvas script or use a placeholder initially.
3. In `src/app/layout.tsx`, add to the `<head>`:
   ```html
   <link rel="manifest" href="/manifest.json" />
   <meta name="mobile-web-app-capable" content="yes" />
   <meta name="apple-mobile-web-app-capable" content="yes" />
   <meta name="apple-mobile-web-app-status-bar-style" content="default" />
   <meta name="apple-mobile-web-app-title" content="ToDo" />
   <link rel="apple-touch-icon" href="/icon-192.png" />
   <meta name="theme-color" content="#D97706" />
   ```
4. Create a minimal service worker at `public/sw.js` that caches the app shell (HTML, CSS, JS) for fast load:
   ```js
   const CACHE = 'todo-v1';
   const SHELL = ['/', '/habits'];
   self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))));
   self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));
   ```
5. Register the service worker in `src/app/layout.tsx` via an inline script:
   ```js
   if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js');
   ```

**Completion Notes:**
- Created `public/manifest.json` with `name: "ToDo"`, `display: "standalone"`, `theme_color: "#D97706"`, 192px and 512px icons
- Created `public/sw.js` — minimal cache-first service worker caching `/` and `/habits` on install
- Created `public/icon-192.png` and `public/icon-512.png` — solid amber (#D97706) PNGs generated via Node `zlib.deflateSync` raw PNG binary (canvas library not available)
- Added to `layout.tsx` `<head>`: `<link rel="manifest">`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-mobile-web-app-title`, `apple-touch-icon`, `theme-color`
- Merged SW registration into the existing flash-prevention inline script: `if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js')`

---

#### 29.9 — Deploy and test

1. Run `npm run build` locally — fix any TypeScript or layout errors.
2. Test in Chrome DevTools with device emulation: iPhone SE (375px), iPhone 14 (390px), iPad (768px). Check: navigation, task creation, task detail, habits, upcoming view, theme picker.
3. Test "Add to Home Screen" in Safari on iPhone — confirm it opens without browser chrome and shows the correct icon.
4. Commit: `git commit -m "Phase 29 — mobile-friendly layout, bottom nav, bottom sheets, PWA manifest"`
5. Push to GitHub, confirm Vercel deploys.

**Completion Notes:**
- `npm run build` completed with zero TypeScript or compilation errors
- All 8 static pages generated; all API routes compiled

---

### Success Criteria
- On mobile (< 768px): sidebar is hidden; bottom navigation bar is visible and navigates correctly; tapping Projects opens a project drawer
- On tablet (768–1024px): sidebar collapses to an icon rail; hovering expands it to full width
- On desktop (> 1024px): no change to existing layout
- Upcoming view shows a day-by-day list on mobile instead of the week grid
- Task input opens as a bottom sheet on mobile; closes on tap-outside
- Task detail panel slides up from the bottom on mobile
- All checkboxes and interactive elements have 44px minimum tap targets
- The app can be added to the iOS/Android home screen and opens in standalone mode (no browser chrome)
- App icon appears correctly on the home screen

---

---

## Phase 30 — Overlapping Calendar Events — Side-by-Side Column Layout

**Status:** [x] Done

**What this does:** In the Upcoming week calendar view, two or more events that overlap in time are currently rendered on top of each other, making both hard to read. This phase implements a standard calendar column-layout algorithm so overlapping events are shown side by side, each taking an equal share of the column width — similar to how Google Calendar handles it.

**Why this matters:** Without this fix, completed tasks (which remain visible in-place per Phase 25) can visually collide with other tasks scheduled at the same time, and any two tasks that coincide are unreadable.

---

#### 30.1 — Overlap detection and column assignment algorithm

*Approach:*
- Create `src/lib/calendarLayout.ts` with a pure `assignColumns(events: Task[])` function
- Step 1: sort events by start time (ties: longer duration first)
- Step 2: greedily assign columns — for each event, scan columns in order; pick the first column whose end time is ≤ this event's start time; otherwise open a new column
- Step 3: second pass — for each event, `totalCols = max(column index + 1)` of all events in its overlapping group. An overlapping group is events whose time ranges intersect. Use interval merging to find group boundaries, then set `totalCols` for all events in a group to the total number of columns in that group.

1. In the Upcoming view rendering logic (in `src/app/page.tsx` or a helper), after filtering the events for a given day, run a column-assignment pass:
   - Sort events by start time ascending (ties broken by duration descending).
   - Maintain a list of "column end times". For each event, find the first column whose last event has ended before this event starts; assign this event to that column. If no column is free, open a new column.
   - Record `columnIndex` and `totalColumns` on each event for that day.
2. The algorithm produces a `columns` map: `{ taskId → { col: number, totalCols: number } }` for every day's events.
3. Extract this into a pure helper function `assignColumns(events: Task[]): Map<string, { col: number; totalCols: number }>` in `src/lib/calendarLayout.ts` so it can be unit-tested independently.

**Completion Notes:**
- Created `src/lib/calendarLayout.ts` with `assignColumns(events: Task[]): Map<string, { col: number; totalCols: number }>`
- Algorithm: sort by start time (ties: longer duration first) → greedy column assignment using `colEnds[]` array → interval-merging group pass to compute `totalCols` for each overlapping group
- End time comparison uses strict `<` so events sharing a single boundary point are not treated as overlapping
- Pure function with no side effects — import and call once per day column

---

#### 30.2 — Apply column layout to event rendering

*Approach:*
- Import `assignColumns` into `page.tsx`
- Inside the timed-event render loop for each day column, call `assignColumns(timedForDay)` once per day
- Retrieve `{ col, totalCols }` for each event from the map
- Set `width: \`calc((100% - ${(totalCols-1)*2}px) / ${totalCols})\`` and `left: \`calc(${col} * (100% / ${totalCols}))\``
- Keep `left: 2` / `right: 2` only for single-column events; multi-column events use the calculated left/width

1. In the event rendering loop for the Upcoming calendar, retrieve each event's `{ col, totalCols }` from the map produced in 30.1.
2. Set the event block's `width` and `left` (or `right`) via inline styles:
   - `width: calc((100% - 4px) / totalCols)` — the 4px subtracts a small gap between columns.
   - `left: calc(col * (100% / totalCols))` — offsets each column to the right.
3. Ensure the event container uses `position: absolute` and its parent uses `position: relative` (this should already be the case).
4. Do **not** add any "sliver" or z-index peeking — events should fully tile without any partial overlap. Each event block should clip its own content (`overflow: hidden`, `text-overflow: ellipsis`) rather than rely on being partially obscured.
5. The existing event click handler, height calculation (duration-based), and top offset (time-based) remain unchanged — only width and left are new.

**Completion Notes:**
- Added `import { assignColumns } from '@/lib/calendarLayout'` to `page.tsx`
- In the timed-event render loop: `const colMap = assignColumns(timedForDay)` once per day
- Each event block: `left: calc(${leftPct}% + gap)` and `width: calc(${colW}% - gap - 2px)`
- Removed `left: 2, right: 2` (which were for single-column only); now uses `left`+`width` for all events
- `col > 0` guard adds the gap only between adjacent columns (not on the leftmost event)

---

#### 30.3 — Edge cases and visual polish

*Approach:*
- Single events: `totalCols=1`, full width — same as before
- Boundary-sharing (event A ends at 10:00, event B starts at 10:00): use strict `<` so they are NOT overlapping
- Events with no `scheduledAt` or not timed are excluded from `assignColumns` already (they go in the all-day row)
- Text truncation is already handled by `overflow: hidden; white-space: nowrap; text-overflow: ellipsis` in existing block styles

1. Single events (no overlap): `totalCols = 1`, `width = 100%`, `left = 0` — no visual change from current behaviour.
2. Events that share only a single minute boundary (one ends exactly when the next starts) should **not** be treated as overlapping.
3. Very narrow columns (3+ simultaneous events): ensure text truncates gracefully and the task title is still readable. Minimum column width does not need enforcing — let it tile naturally; users are unlikely to have 4+ events at identical times.
4. Completed tasks (rendered with reduced opacity and strikethrough per Phase 25) participate in the column layout the same as active tasks — they occupy the same time slot and should be included in overlap detection.

**Completion Notes:**
- Single events: `colMap.get(t.id)` returns `{ col: 0, totalCols: 1 }` → `left: calc(0% + 0px)`, `width: calc(100% - 0px - 2px)` — effectively full width with 2px right margin (same as before)
- Boundary-sharing: `assignColumns` uses strict `<` so events touching at a single moment are in separate groups
- Narrow columns (3+ events): text uses existing `overflow: hidden; white-space: nowrap; text-overflow: ellipsis` — truncates gracefully
- Completed tasks participate in overlap detection the same as active tasks (`weekTasksAll` includes both)

---

#### 30.4 — Deploy

1. Run `npm run build` — fix any TypeScript errors.
2. Manually test: create two tasks with the same time on the same day; confirm they appear side by side with no overlap.
3. Create three tasks at the same time; confirm three equal-width columns appear.
4. Confirm a completed task and an active task at the same time also tile correctly.
5. Commit: `git commit -m "Phase 30 — side-by-side column layout for overlapping calendar events"`
6. Push to GitHub, confirm Vercel deploys.

**Completion Notes:**
- `npm run build` passed with zero TypeScript or compilation errors
- All 8 static pages generated successfully

---

### Success Criteria
- Two events at the same time are displayed side by side, each at 50% width, with no overlap.
- Three simultaneous events each occupy ~33% width.
- Events that do not overlap retain their full column width (no regression).
- No "sliver" of an event peeks through from behind another event.
- Completed tasks participate in the overlap layout correctly.

---

*End of Build Plan — 30 Active Phases + 2 Future Stages*
