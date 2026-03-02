'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Task } from '@/types/task';
import { Project } from '@/types/project';
import TaskItem from '@/components/TaskItem';
import InlineTaskForm from '@/components/InlineTaskForm';
import TaskDetailPanel from '@/components/TaskDetailPanel';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/lib/toast';

// ── Calendar API helpers ────────────────────────────────────────────────────
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

// ── DB → app type ───────────────────────────────────────────────────────────
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
  description: string | null;
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
    description: row.description ?? undefined,
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────────
const PRIORITY_ORDER = { p1: 0, p2: 1, p3: 2 };
const byPriority = (a: Task, b: Task) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];

function isoDate(d: Date) { return d.toISOString().slice(0, 10); }

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDayHeader(date: Date): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const weekday = date.toLocaleDateString('en-GB', { weekday: 'long' });
  if (sameDay(date, today)) return `${dateStr} · Today · ${weekday}`;
  if (sameDay(date, tomorrow)) return `${dateStr} · Tomorrow · ${weekday}`;
  return `${dateStr} · ${weekday}`;
}

type View = 'today' | 'upcoming' | 'by-project' | 'backlog' | 'inbox';

// ── Page ────────────────────────────────────────────────────────────────────
export default function TasksPage() {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;
  const { showToast } = useToast();

  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedProjectId = searchParams.get('project');
  const viewParam = (searchParams.get('view') as View | null) ?? 'today';

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskError, setTaskError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  // Listen for sidebar "Add task" button
  useEffect(() => {
    const handler = () => setFormOpen(true);
    window.addEventListener('open-task-form', handler);
    return () => window.removeEventListener('open-task-form', handler);
  }, []);

  // Listen for 'open-task-detail' custom event (from search overlay)
  useEffect(() => {
    const handler = (e: Event) => {
      const taskId = (e as CustomEvent).detail?.taskId;
      if (taskId) setSelectedTaskId(taskId);
    };
    window.addEventListener('open-task-detail', handler);
    return () => window.removeEventListener('open-task-detail', handler);
  }, []);

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

  // ── Mutations ──────────────────────────────────────────────────────────────
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
      const inboxProject = projects.find((p) => p.name.toLowerCase() === 'inbox');
      const effectiveProjectId = task.projectId ?? matchedProject?.id ?? inboxProject?.id ?? null;
      const insertPayload: Record<string, unknown> = {
        name: task.name,
        project: task.project ?? null,
        project_id: effectiveProjectId,
        scheduled_at: task.scheduledAt?.toISOString() ?? null,
        duration: task.duration ?? null,
        priority: task.priority,
        is_backlog: task.isBacklog,
        completed: false,
      };
      // Only include google_event_id if the column exists (Phase 13 migration may not have run)
      if (googleEventId) insertPayload.google_event_id = googleEventId;

      const { data, error } = await supabase
        .from('tasks')
        .insert([insertPayload])
        .select('*, projects(name, colour)')
        .single();
      if (error) {
        console.error('Task insert failed:', error.code, error.message, error.details, error.hint);
        setTaskError("Couldn't save task — please try again.");
        return;
      }
      if (data) {
        const newTask = dbToTask(data as DbTask);
        setTasks((prev) => [newTask, ...prev]);
        window.dispatchEvent(new Event('tasks-changed'));
        const projectName = newTask.project ? ` to ${newTask.project}` : '';
        showToast(`Task added${projectName}`);
        setFormOpen(false);
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
      if (nowCompleted) {
        // Remove from active list immediately, show undo toast
        setTasks((prev) => prev.filter((t) => t.id !== id).concat(updated));
        showToast('1 task completed', 'undo', () => {
          // Undo: mark incomplete
          completeTask(id);
        });
      } else {
        setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      }
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

  const updateTask = async (updated: Task) => {
    try {
      const { error } = await supabase.from('tasks').update({
        name: updated.name,
        description: updated.description ?? null,
        completed: updated.completed,
        completed_at: updated.completedAt?.toISOString() ?? null,
      }).eq('id', updated.id);
      if (error) { console.error('Failed to update task:', error); return; }
      if (updated.completed) {
        setTasks((prev) => prev.filter((t) => t.id !== updated.id).concat(updated));
      } else {
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      }
      window.dispatchEvent(new Event('tasks-changed'));
    } catch (err) {
      console.error('Unexpected error updating task:', err);
    }
  };

  // ── Derived data ────────────────────────────────────────────────────────────
  const activeTasks = tasks.filter((t) => !t.completed);

  const viewTasks = selectedProjectId
    ? activeTasks.filter((t) => t.projectId === selectedProjectId)
    : activeTasks;

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const today = new Date();
  const in7Days = new Date(today);
  in7Days.setDate(today.getDate() + 7);

  const renderTask = (task: Task) => (
    <TaskItem
      key={task.id}
      task={task}
      onComplete={completeTask}
      onDelete={deleteTask}
      onPriorityChange={updatePriority}
      onOpen={(id) => setSelectedTaskId(id)}
    />
  );

  const AddTaskRow = ({ projectId }: { projectId?: string }) => {
    const [open, setOpen] = useState(false);
    if (open) {
      return (
        <InlineTaskForm
          projects={projects}
          onAdd={addTask}
          onCancel={() => setOpen(false)}
          defaultProjectId={projectId}
          error={taskError}
        />
      );
    }
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 4px',
          fontSize: 15,
          color: 'var(--text-muted)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          width: '100%',
          textAlign: 'left',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-accent)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
        }}
      >
        <span style={{ fontSize: 18, lineHeight: 1, marginTop: -1 }}>+</span>
        Add task
      </button>
    );
  };

  // ── Today view ─────────────────────────────────────────────────────────────
  function renderToday() {
    const now = new Date();
    const overdue = viewTasks.filter((t) => t.scheduledAt && t.scheduledAt < now && !sameDay(t.scheduledAt, now));
    const todayTasks = viewTasks.filter((t) => t.scheduledAt && sameDay(t.scheduledAt, now));
    const sorted = (list: Task[]) => [...list].sort(byPriority);
    const todayCount = activeTasks.filter((t) => t.scheduledAt && sameDay(t.scheduledAt, now)).length;

    return (
      <>
        {/* Page header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Today
          </h1>
          {!loading && (
            <p style={{ marginTop: 4, fontSize: 13, color: 'var(--text-muted)' }}>
              ✓ {todayCount} task{todayCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Global inline form (from sidebar Add task button) */}
        {formOpen && (
          <InlineTaskForm
            projects={projects}
            onAdd={addTask}
            onCancel={() => setFormOpen(false)}
            error={taskError}
          />
        )}

        {loading ? (
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Loading…</p>
        ) : (
          <>
            {/* Overdue section */}
            {overdue.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ height: 1, background: 'var(--divider)', marginBottom: 12 }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Overdue</span>
                  <span style={{ fontSize: 13, color: 'var(--text-accent)', cursor: 'pointer' }}>Reschedule</span>
                </div>
                {sorted(overdue).map(renderTask)}
              </div>
            )}

            {/* Today section */}
            <div>
              <div style={{ height: 1, background: 'var(--divider)', marginBottom: 12 }} />
              <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                {formatDayHeader(now)}
              </h2>
              {sorted(todayTasks).map(renderTask)}
              {todayTasks.length === 0 && overdue.length === 0 && (
                <p style={{ fontSize: 14, color: 'var(--text-muted)', padding: '8px 0' }}>
                  Nothing scheduled for today.
                </p>
              )}
              <AddTaskRow />
            </div>
          </>
        )}
      </>
    );
  }

  // ── Upcoming view — 7-day week grid ────────────────────────────────────────
  function renderUpcoming() {
    const HOUR_HEIGHT = 60; // px per hour
    const START_HOUR = 7;
    const END_HOUR = 22;

    function getWeekStart(offset: number): Date {
      const d = new Date();
      const day = d.getDay();
      const diff = day === 0 ? -6 : 1 - day; // Monday = 0
      d.setDate(d.getDate() + diff + offset * 7);
      d.setHours(0, 0, 0, 0);
      return d;
    }

    const weekStart = getWeekStart(weekOffset);
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d;
    });

    const totalGridHeight = (END_HOUR - START_HOUR + 1) * HOUR_HEIGHT;
    const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

    // Current week check
    const currentWeekStart = getWeekStart(0);
    const isCurrentWeek = weekStart.getTime() === currentWeekStart.getTime();

    // Current time position
    const now2 = new Date();
    const currentTimeTop = (now2.getHours() - START_HOUR + now2.getMinutes() / 60) * HOUR_HEIGHT;
    const showTimeLine = isCurrentWeek && now2.getHours() >= START_HOUR && now2.getHours() <= END_HOUR;

    // Week label
    const weekLabel = weekOffset === 0 ? 'This week' :
      weekOffset === -1 ? 'Last week' :
      weekOffset === 1 ? 'Next week' :
      `${days[0].toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${days[6].toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;

    // Tasks for the week
    const weekTasksAll = activeTasks.filter((t) => {
      if (!t.scheduledAt) return false;
      const d = t.scheduledAt;
      return d >= days[0] && d < new Date(days[6].getTime() + 86400000);
    });

    // Timed tasks: has non-midnight time
    const isTimedTask = (t: Task) => {
      if (!t.scheduledAt) return false;
      return t.scheduledAt.getHours() !== 0 || t.scheduledAt.getMinutes() !== 0;
    };

    // All-day: scheduled but time is midnight
    const isAllDayTask = (t: Task) => t.scheduledAt && !isTimedTask(t);

    const dayOfWeekIndex = (d: Date) => {
      // Mon=0, Tue=1, ..., Sun=6
      return (d.getDay() + 6) % 7;
    };

    const formatHour = (h: number) => {
      if (h === 12) return '12pm';
      if (h < 12) return `${h}am`;
      return `${h - 12}pm`;
    };

    const todayStr2 = new Date().toISOString().slice(0, 10);

    return (
      <>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Upcoming
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 14, color: 'var(--text-secondary)' }}
            >◀</button>
            <button
              onClick={() => setWeekOffset(0)}
              style={{ background: weekOffset === 0 ? 'var(--accent)' : 'transparent', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 14, color: weekOffset === 0 ? 'white' : 'var(--text-secondary)', fontWeight: weekOffset === 0 ? 600 : 400 }}
            >
              {weekLabel}
            </button>
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 14, color: 'var(--text-secondary)' }}
            >▶</button>
          </div>
        </div>

        {formOpen && (
          <InlineTaskForm projects={projects} onAdd={addTask} onCancel={() => setFormOpen(false)} error={taskError} />
        )}

        {loading ? (
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Loading…</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            {/* All-day row */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--divider)', marginBottom: 0 }}>
              {/* Time axis space */}
              <div style={{ width: 52, flexShrink: 0 }} />
              {days.map((day, di) => {
                const dayStr = day.toISOString().slice(0, 10);
                const isToday = dayStr === todayStr2;
                const allDayForDay = weekTasksAll.filter((t) => isAllDayTask(t) && dayOfWeekIndex(t.scheduledAt!) === di);
                return (
                  <div
                    key={di}
                    style={{
                      flex: 1,
                      minWidth: 80,
                      padding: '6px 4px',
                      borderLeft: di > 0 ? '1px solid var(--divider)' : undefined,
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>
                      {day.toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase()}
                    </div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: isToday ? 700 : 400,
                        color: isToday ? 'white' : 'var(--text-primary)',
                        background: isToday ? 'var(--accent)' : 'transparent',
                        borderRadius: '50%',
                        width: 28,
                        height: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 4px',
                      }}
                    >
                      {day.getDate()}
                    </div>
                    {allDayForDay.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTaskId(t.id)}
                        style={{
                          background: (t.projectColour ?? 'var(--accent)') + '33',
                          borderLeft: `3px solid ${t.projectColour ?? 'var(--accent)'}`,
                          borderRadius: '0 4px 4px 0',
                          padding: '2px 4px',
                          fontSize: 11,
                          color: 'var(--text-primary)',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          cursor: 'pointer',
                          marginBottom: 2,
                        }}
                      >
                        {t.name}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Time grid */}
            <div style={{ display: 'flex', position: 'relative', overflowY: 'auto', maxHeight: 'calc(100vh - 240px)' }}>
              {/* Time axis */}
              <div style={{ width: 52, flexShrink: 0, position: 'relative', height: totalGridHeight }}>
                {hours.map((h) => (
                  <div
                    key={h}
                    style={{
                      position: 'absolute',
                      top: (h - START_HOUR) * HOUR_HEIGHT - 8,
                      left: 0,
                      width: '100%',
                      fontSize: 11,
                      color: 'var(--text-muted)',
                      textAlign: 'right',
                      paddingRight: 8,
                    }}
                  >
                    {formatHour(h)}
                  </div>
                ))}
              </div>

              {/* Day columns */}
              <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
                {/* Current time line */}
                {showTimeLine && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: currentTimeTop,
                      height: 2,
                      background: '#DB4035',
                      zIndex: 20,
                      pointerEvents: 'none',
                    }}
                  />
                )}

                {days.map((day, di) => {
                  const timedForDay = weekTasksAll.filter((t) => isTimedTask(t) && dayOfWeekIndex(t.scheduledAt!) === di);
                  return (
                    <div
                      key={di}
                      style={{
                        flex: 1,
                        minWidth: 80,
                        position: 'relative',
                        height: totalGridHeight,
                        borderLeft: '1px solid var(--divider)',
                      }}
                    >
                      {/* Hour grid lines */}
                      {hours.map((h) => (
                        <div
                          key={h}
                          style={{
                            position: 'absolute',
                            top: (h - START_HOUR) * HOUR_HEIGHT,
                            left: 0,
                            right: 0,
                            height: 1,
                            background: 'var(--divider)',
                            opacity: 0.5,
                          }}
                        />
                      ))}

                      {/* Timed task blocks */}
                      {timedForDay.map((t) => {
                        const h = t.scheduledAt!.getHours();
                        const m = t.scheduledAt!.getMinutes();
                        const top = (h - START_HOUR + m / 60) * HOUR_HEIGHT;
                        const height = Math.max(((t.duration ?? 30) / 60) * HOUR_HEIGHT, 28);
                        const colour = t.projectColour ?? 'var(--accent)';
                        return (
                          <div
                            key={t.id}
                            onClick={() => setSelectedTaskId(t.id)}
                            title={t.name}
                            style={{
                              position: 'absolute',
                              top,
                              left: 2,
                              right: 2,
                              height,
                              background: colour + '33',
                              borderLeft: `3px solid ${colour}`,
                              borderRadius: '0 4px 4px 0',
                              padding: '2px 5px',
                              cursor: 'pointer',
                              overflow: 'hidden',
                              zIndex: 10,
                            }}
                          >
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                              {t.name}
                            </div>
                            {t.duration && (
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.duration} min</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // ── By-project view ────────────────────────────────────────────────────────
  function renderByProject() {
    const pageTitle = selectedProject ? selectedProject.name : 'By Project';
    return (
      <>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {pageTitle}
          </h1>
        </div>

        {formOpen && (
          <InlineTaskForm
            projects={projects}
            onAdd={addTask}
            onCancel={() => setFormOpen(false)}
            defaultProjectId={selectedProjectId ?? undefined}
            error={taskError}
          />
        )}

        {loading ? (
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Loading…</p>
        ) : (
          <>
            {selectedProjectId ? (
              // Single project view
              <>
                {viewTasks.length === 0 && (
                  <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                    No tasks in {selectedProject?.name ?? 'this project'} yet.
                  </p>
                )}
                {[...viewTasks].sort(byPriority).map(renderTask)}
                <AddTaskRow projectId={selectedProjectId} />
              </>
            ) : (
              // All projects grouped
              <>
                {projects.map((p) => {
                  const pts = viewTasks.filter((t) => t.projectId === p.id);
                  if (pts.length === 0) return null;
                  return (
                    <div key={p.id} style={{ marginBottom: 32 }}>
                      <div style={{ height: 1, background: 'var(--divider)', marginBottom: 12 }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: p.colour }}>#</span>
                        <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>
                          {p.name}
                        </h2>
                      </div>
                      {[...pts].sort(byPriority).map(renderTask)}
                      <AddTaskRow projectId={p.id} />
                    </div>
                  );
                })}
                {viewTasks.filter((t) => !t.projectId).length > 0 && (
                  <div style={{ marginBottom: 32 }}>
                    <div style={{ height: 1, background: 'var(--divider)', marginBottom: 12 }} />
                    <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
                      Inbox
                    </h2>
                    {[...viewTasks.filter((t) => !t.projectId)].sort(byPriority).map(renderTask)}
                    <AddTaskRow />
                  </div>
                )}
                {viewTasks.length === 0 && (
                  <>
                    <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>No tasks yet.</p>
                    <AddTaskRow />
                  </>
                )}
              </>
            )}
          </>
        )}
      </>
    );
  }

  // ── Backlog view ───────────────────────────────────────────────────────────
  function renderBacklog() {
    const backlog = viewTasks.filter((t) => t.isBacklog);
    return (
      <>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Backlog
          </h1>
        </div>

        {formOpen && (
          <InlineTaskForm projects={projects} onAdd={addTask} onCancel={() => setFormOpen(false)} error={taskError} />
        )}

        {loading ? (
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Loading…</p>
        ) : (
          <>
            {backlog.length === 0 && (
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>No tasks in your backlog.</p>
            )}
            {[...backlog].sort(byPriority).map(renderTask)}
            <AddTaskRow />
          </>
        )}
      </>
    );
  }

  // ── Inbox view (no project filter, show all without project) ───────────────
  function renderInbox() {
    const inboxProject = projects.find((p) => p.name.toLowerCase() === 'inbox');
    const inbox = activeTasks.filter((t) => !t.projectId || t.projectId === inboxProject?.id);
    return (
      <>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Inbox
          </h1>
        </div>

        {formOpen && (
          <InlineTaskForm projects={projects} onAdd={addTask} onCancel={() => setFormOpen(false)} error={taskError} />
        )}

        {loading ? (
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Loading…</p>
        ) : (
          <>
            {inbox.length === 0 && (
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Inbox is empty.</p>
            )}
            {[...inbox].sort(byPriority).map(renderTask)}
            <AddTaskRow />
          </>
        )}
      </>
    );
  }

  // ── Route to correct view ──────────────────────────────────────────────────
  let content: React.ReactNode;
  if (selectedProjectId) {
    content = renderByProject();
  } else {
    switch (viewParam) {
      case 'upcoming':   content = renderUpcoming(); break;
      case 'by-project': content = renderByProject(); break;
      case 'backlog':    content = renderBacklog(); break;
      case 'inbox':      content = renderInbox(); break;
      default:           content = renderToday();
    }
  }

  return (
    <>
      {content}
      <TaskDetailPanel
        task={tasks.find((t) => t.id === selectedTaskId) ?? null}
        onClose={() => setSelectedTaskId(null)}
        onTaskUpdate={updateTask}
        onTaskDelete={deleteTask}
      />
    </>
  );
}
