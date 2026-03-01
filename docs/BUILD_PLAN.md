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
| 1 | Connect to GitHub | [ ] Pending |
| 2 | App Shell & Layout | [ ] Pending |
| 3 | Basic Task List | [ ] Pending |
| 4 | Natural Language Input | [ ] Pending |
| 5 | Supabase Database | [ ] Pending |
| 6 | Project Categories | [ ] Pending |
| 7 | Priority Levels | [ ] Pending |
| 8 | Task Completion & Archive | [ ] Pending |
| 9 | Habit Tracker Screen | [ ] Pending |
| 10 | Monthly Habit Calendar | [ ] Pending |
| 11 | Streak Counters | [ ] Pending |
| 12 | Health Metric Logging | [ ] Pending |
| 13 | Google Calendar Sync | [ ] Pending |
| 14 | Customisable Views | [ ] Pending |
| 15 | Polish & Deploy to Vercel | [ ] Pending |

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

**Status:** [ ] Pending

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

**Status:** [ ] Pending

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

**Status:** [ ] Pending

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

**Status:** [ ] Pending

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

**Status:** [ ] Pending

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

**Status:** [ ] Pending

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

**Status:** [ ] Pending

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

**Status:** [ ] Pending

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

**Status:** [ ] Pending

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

**Status:** [ ] Pending

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

**Status:** [ ] Pending

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

**Status:** [ ] Pending

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

**Status:** [ ] Pending

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

**Status:** [ ] Pending

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

**Status:** [ ] Pending

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

*End of Build Plan — 15 Phases | Start at Phase 1*
