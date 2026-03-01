'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Task } from '@/types/task';
import { Project } from '@/types/project';
import TaskInput from '@/components/TaskInput';
import TaskItem from '@/components/TaskItem';
import { supabase } from '@/lib/supabase';

// ── Calendar API helpers (server-side route) ───────────────────────────────
async function calendarCreate(task: Task, accessToken: string): Promise<string | null> {
  try {
    const res = await fetch('/api/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', accessToken, task }),
    });
    return (await res.json()).id ?? null;
  } catch (err) {
    console.error('Failed to create calendar event:', err);
    return null;
  }
}
async function calendarUpdate(task: Task, googleEventId: string, accessToken: string) {
  try {
    await fetch('/api/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', accessToken, task, googleEventId }),
    });
  } catch (err) {
    console.error('Failed to update calendar event:', err);
  }
}
async function calendarDelete(googleEventId: string, accessToken: string) {
  try {
    await fetch('/api/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', accessToken, googleEventId }),
    });
  } catch (err) {
    console.error('Failed to delete calendar event:', err);
  }
}

// ── DB → app type ──────────────────────────────────────────────────────────
type DbTask = {
  id: string;
  name: string;
  project: string | null;
  project_id: string | null;
  scheduled_at: string | null;
  duration: number | null;
  priority: string;
  is_backlog: boolean;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  google_event_id: string | null;
  projects: { name: string; colour: string } | null;
};

function dbToTask(row: DbTask): Task {
  return {
    id: row.id,
    name: row.name,
    project: row.projects?.name ?? row.project ?? undefined,
    projectId: row.project_id ?? undefined,
    projectColour: row.projects?.colour ?? undefined,
    scheduledAt: row.scheduled_at ? new Date(row.scheduled_at) : undefined,
    duration: row.duration ?? undefined,
    priority: (row.priority as Task['priority']) ?? 'p2',
    isBacklog: row.is_backlog,
    completed: row.completed,
    completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
    googleEventId: row.google_event_id ?? undefined,
    createdAt: new Date(row.created_at),
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────
const PRIORITY_ORDER = { p1: 0, p2: 1, p3: 2 };
const byPriority = (a: Task, b: Task) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];

function isoDate(d: Date) { return d.toISOString().slice(0, 10); }

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function formatDayHeader(date: Date): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (sameDay(date, today)) return 'Today';
  if (sameDay(date, tomorrow)) return 'Tomorrow';
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
}

// ── View type ──────────────────────────────────────────────────────────────
type View = 'today' | 'upcoming' | 'by-project' | 'backlog';
const VIEWS: { id: View; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'by-project', label: 'By Project' },
  { id: 'backlog', label: 'Backlog' },
];

// ── Page ───────────────────────────────────────────────────────────────────
export default function TasksPage() {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  const searchParams = useSearchParams();
  const selectedProjectId = searchParams.get('project');

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showP3, setShowP3] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [view, setView] = useState<View>('today');
  const [taskError, setTaskError] = useState<string | null>(null);

  // Load persisted view from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('lastView') as View | null;
    if (saved && VIEWS.find((v) => v.id === saved)) setView(saved);
  }, []);

  const changeView = (v: View) => {
    setView(v);
    localStorage.setItem('lastView', v);
  };

  const loadData = useCallback(async () => {
    try {
      const [{ data: taskData, error: tErr }, { data: projectData, error: pErr }] = await Promise.all([
        supabase.from('tasks').select('*, projects(name, colour)').order('created_at', { ascending: false }),
        supabase.from('projects').select('*'),
      ]);
      if (tErr) console.error('Failed to load tasks:', tErr);
      if (pErr) console.error('Failed to load projects:', pErr);
      if (taskData) setTasks((taskData as DbTask[]).map(dbToTask));
      if (projectData) {
        setProjects(projectData.map((p) => ({
          id: p.id, name: p.name, colour: p.colour, createdAt: new Date(p.created_at),
        })));
      }
    } catch (err) {
      console.error('Unexpected error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Mutations ────────────────────────────────────────────────────────────
  const addTask = async (task: Task) => {
    setTaskError(null);
    try {
      const matchedProject = task.project
        ? projects.find((p) => p.name.toLowerCase() === task.project!.toLowerCase())
        : null;

      let googleEventId: string | null = null;
      if (accessToken && task.scheduledAt) {
        googleEventId = await calendarCreate(task, accessToken);
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          name: task.name,
          project: task.project ?? null,
          project_id: matchedProject?.id ?? null,
          scheduled_at: task.scheduledAt?.toISOString() ?? null,
          duration: task.duration ?? null,
          priority: task.priority,
          is_backlog: task.isBacklog,
          completed: false,
          google_event_id: googleEventId,
        }])
        .select('*, projects(name, colour)')
        .single();

      if (error) {
        console.error('Failed to insert task:', error);
        setTaskError("Couldn't save task — please try again.");
        return;
      }
      if (data) {
        setTasks((prev) => [dbToTask(data as DbTask), ...prev]);
        window.dispatchEvent(new Event('tasks-changed'));
      }
    } catch (err) {
      console.error('Unexpected error adding task:', err);
      setTaskError("Couldn't save task — please try again.");
    }
  };

  const completeTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const nowCompleted = !task.completed;
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: nowCompleted, completed_at: nowCompleted ? new Date().toISOString() : null })
        .eq('id', id);
      if (error) { console.error('Failed to complete task:', error); return; }
      const updated = { ...task, completed: nowCompleted, completedAt: nowCompleted ? new Date() : undefined };
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      window.dispatchEvent(new Event('tasks-changed'));
      if (accessToken && task.googleEventId && task.scheduledAt) {
        await calendarUpdate(updated, task.googleEventId, accessToken);
      }
    } catch (err) {
      console.error('Unexpected error completing task:', err);
    }
  };

  const deleteTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) { console.error('Failed to delete task:', error); return; }
      setTasks((prev) => prev.filter((t) => t.id !== id));
      window.dispatchEvent(new Event('tasks-changed'));
      if (accessToken && task?.googleEventId) {
        await calendarDelete(task.googleEventId, accessToken);
      }
    } catch (err) {
      console.error('Unexpected error deleting task:', err);
    }
  };

  const updatePriority = async (id: string, priority: 'p1' | 'p2' | 'p3') => {
    try {
      const { error } = await supabase.from('tasks').update({ priority }).eq('id', id);
      if (error) { console.error('Failed to update priority:', error); return; }
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, priority } : t)));
    } catch (err) {
      console.error('Unexpected error updating priority:', err);
    }
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const allActive = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  const viewTasks = selectedProjectId
    ? allActive.filter((t) => t.projectId === selectedProjectId)
    : allActive;

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const today = new Date();
  const in7Days = new Date(today);
  in7Days.setDate(today.getDate() + 7);

  const renderTask = (task: Task) => (
    <TaskItem key={task.id} task={task} onComplete={completeTask} onDelete={deleteTask} onPriorityChange={updatePriority} />
  );

  const high = (list: Task[]) => [...list.filter((t) => t.priority !== 'p3')].sort(byPriority);
  const low  = (list: Task[]) => [...list.filter((t) => t.priority === 'p3')];

  // ── View renderers ────────────────────────────────────────────────────────
  function renderToday() {
    const todayTasks = viewTasks.filter((t) => t.scheduledAt && sameDay(t.scheduledAt, today));
    const hi = high(todayTasks);
    const lo = low(todayTasks);
    return renderPriorityGroups(hi, lo, 'Nothing scheduled for today. Add one above ↑');
  }

  function renderUpcoming() {
    const upcoming = viewTasks
      .filter((t) => t.scheduledAt && t.scheduledAt >= today && t.scheduledAt <= in7Days)
      .sort((a, b) => (a.scheduledAt!.getTime() - b.scheduledAt!.getTime()) || byPriority(a, b));

    if (upcoming.length === 0) {
      return <p className="px-2 text-sm" style={{ color: 'var(--text-muted)' }}>Your next 7 days are clear.</p>;
    }

    const groups = new Map<string, Task[]>();
    for (const t of upcoming) {
      const key = isoDate(t.scheduledAt!);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(t);
    }

    return (
      <div>
        {Array.from(groups.entries()).map(([dateStr, group]) => (
          <div key={dateStr} className="mb-6">
            <h2
              className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              {formatDayHeader(new Date(dateStr + 'T12:00:00'))}
            </h2>
            {group.map(renderTask)}
          </div>
        ))}
      </div>
    );
  }

  function renderByProject() {
    if (projects.length === 0) {
      return <p className="px-2 text-sm" style={{ color: 'var(--text-muted)' }}>No projects yet.</p>;
    }

    const inboxTasks = viewTasks.filter((t) => !t.projectId);
    const hasContent = projects.some((p) => viewTasks.some((t) => t.projectId === p.id)) || inboxTasks.length > 0;
    if (!hasContent) {
      const msg = selectedProject ? `No tasks in ${selectedProject.name} yet.` : 'No tasks in this project.';
      return <p className="px-2 text-sm" style={{ color: 'var(--text-muted)' }}>{msg}</p>;
    }

    return (
      <div>
        {projects.map((p) => {
          const pts = viewTasks.filter((t) => t.projectId === p.id);
          if (pts.length === 0) return null;
          return (
            <div key={p.id} className="mb-8">
              <div className="mb-2 flex items-center gap-2 px-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.colour }} />
                <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  {p.name}
                </h2>
              </div>
              {[...pts].sort(byPriority).map(renderTask)}
            </div>
          );
        })}
        {inboxTasks.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Inbox
            </h2>
            {[...inboxTasks].sort(byPriority).map(renderTask)}
          </div>
        )}
      </div>
    );
  }

  function renderBacklog() {
    const backlog = viewTasks.filter((t) => t.isBacklog);
    const hi = high(backlog);
    const lo = low(backlog);
    return renderPriorityGroups(hi, lo, 'No tasks in your backlog.');
  }

  function renderPriorityGroups(hi: Task[], lo: Task[], emptyMsg: string) {
    const p3Count = lo.length;
    return (
      <>
        {hi.length > 0 && <div className="mb-6">{hi.map(renderTask)}</div>}
        {p3Count > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setShowP3((v) => !v)}
              className="mb-2 flex items-center gap-1 px-2 text-xs font-semibold uppercase tracking-wider transition-colors focus:outline-none"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <span className={`transition-transform ${showP3 ? 'rotate-90' : ''}`}>▶</span>
              Low priority ({p3Count})
            </button>
            {showP3 && lo.map(renderTask)}
          </div>
        )}
        {hi.length === 0 && p3Count === 0 && (
          <p className="px-2 text-sm" style={{ color: 'var(--text-muted)' }}>{emptyMsg}</p>
        )}
      </>
    );
  }

  // ── Completed section ──────────────────────────────────────────────────────
  const scopedCompleted = selectedProjectId
    ? completedTasks.filter((t) => t.projectId === selectedProjectId)
    : completedTasks;

  function formatCompletedDate(date: Date): string {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  }

  const pageTitle = selectedProject ? selectedProject.name : 'Tasks';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 680 }}>
      {/* Header: title left, view pills right */}
      <div className="mb-5 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{pageTitle}</h1>

        {!selectedProjectId && (
          <div className="flex gap-0.5 rounded-xl p-1" style={{ background: 'var(--bg-hover)' }}>
            {VIEWS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => changeView(id)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-100 focus:outline-none"
                style={{
                  background: view === id ? 'var(--bg-card)' : 'transparent',
                  color: view === id ? 'var(--text-primary)' : 'var(--text-secondary)',
                  boxShadow: view === id ? 'var(--shadow-sm)' : undefined,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <TaskInput onAdd={addTask} error={taskError} />

      {loading ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</p>
      ) : (
        <>
          {/* Main view */}
          {selectedProjectId ? renderByProject() : (
            view === 'today'      ? renderToday()      :
            view === 'upcoming'   ? renderUpcoming()   :
            view === 'by-project' ? renderByProject()  :
                                    renderBacklog()
          )}

          {/* Completed section */}
          {scopedCompleted.length > 0 && (
            <div className="mt-6">
              <button
                onClick={() => setShowCompleted((v) => !v)}
                className="mb-2 flex items-center gap-1 px-2 text-xs font-semibold uppercase tracking-wider transition-colors focus:outline-none"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <span className={`transition-transform ${showCompleted ? 'rotate-90' : ''}`}>▶</span>
                Completed ({scopedCompleted.length})
              </button>
              {showCompleted && (
                <div>
                  {scopedCompleted.map((task) => (
                    <div
                      key={task.id}
                      className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors"
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                      style={{ borderBottom: '1px solid var(--divider)' }}
                    >
                      <span
                        className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2"
                        style={{ borderColor: 'var(--text-muted)', background: 'var(--text-muted)' }}
                      >
                        <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span className="flex-1 text-sm line-through" style={{ color: 'var(--text-muted)' }}>
                        {task.name}
                      </span>
                      {task.project && (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>#{task.project}</span>
                      )}
                      {task.completedAt && (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {formatCompletedDate(task.completedAt)}
                        </span>
                      )}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="hidden text-lg leading-none transition-colors group-hover:block focus:outline-none"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
