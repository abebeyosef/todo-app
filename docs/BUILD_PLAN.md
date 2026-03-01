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

*End of Build Plan — 17 Phases*
