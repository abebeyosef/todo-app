'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Task } from '@/types/task';
import { Project } from '@/types/project';
import TaskItem from '@/components/TaskItem';
import InlineTaskForm from '@/components/InlineTaskForm';
import CompletedSection from '@/components/CompletedSection';
import TaskDetailPanel from '@/components/TaskDetailPanel';
import { useToast } from '@/lib/toast';

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

type SortOption = 'priority' | 'date' | 'date-added' | 'alphabetical';

const SORT_KEY = 'inbox-sort';

const PRIORITY_ORDER = { p1: 0, p2: 1, p3: 2 };

function sortTasks(tasks: Task[], sort: SortOption): Task[] {
  const arr = [...tasks];
  switch (sort) {
    case 'priority':
      return arr.sort((a, b) => {
        const pa = PRIORITY_ORDER[a.priority];
        const pb = PRIORITY_ORDER[b.priority];
        if (pa !== pb) return pa - pb;
        return a.createdAt.getTime() - b.createdAt.getTime();
      });
    case 'date':
      return arr.sort((a, b) => {
        if (a.scheduledAt && b.scheduledAt) return a.scheduledAt.getTime() - b.scheduledAt.getTime();
        if (a.scheduledAt) return -1;
        if (b.scheduledAt) return 1;
        return 0;
      });
    case 'date-added':
      return arr.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    case 'alphabetical':
      return arr.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return arr;
  }
}

export default function InboxPage() {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskError, setTaskError] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(SORT_KEY) as SortOption) ?? 'priority';
    }
    return 'priority';
  });

  const loadData = useCallback(async () => {
    try {
      const { data: allProjectData } = await supabase.from('projects').select('*');

      if (allProjectData) {
        setProjects(
          allProjectData.map((p) => ({
            id: p.id,
            name: p.name,
            colour: p.colour,
            createdAt: new Date(p.created_at),
          }))
        );
      }

      // Fetch ALL tasks (active + completed) — no project filter
      const { data: taskData, error: tErr } = await supabase
        .from('tasks')
        .select('*, projects(name, colour)');

      if (tErr) console.error('Failed to load all tasks:', tErr);
      if (taskData) setTasks((taskData as DbTask[]).map(dbToTask));
    } catch (err) {
      console.error('Unexpected error loading all tasks data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const handler = () => loadData();
    window.addEventListener('tasks-changed', handler);
    return () => window.removeEventListener('tasks-changed', handler);
  }, [loadData]);

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
    localStorage.setItem(SORT_KEY, newSort);
  };

  // ── Mutations ──────────────────────────────────────────────────────────────
  const addTask = async (task: Task) => {
    setTaskError(null);
    try {
      const matchedProject = task.project
        ? projects.find((p) => p.name.toLowerCase() === task.project!.toLowerCase())
        : null;
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

      const { data, error } = await supabase
        .from('tasks')
        .insert([insertPayload])
        .select('*, projects(name, colour)')
        .single();

      if (error) {
        console.error('Task insert failed:', error);
        setTaskError("Couldn't save task — please try again.");
        return;
      }
      if (data) {
        const newTask = dbToTask(data as DbTask);
        setTasks((prev) => [newTask, ...prev]);
        window.dispatchEvent(new Event('tasks-changed'));
        showToast('Task added to Inbox');
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
        setTasks((prev) => prev.filter((t) => t.id !== id).concat(updated));
        showToast('1 task completed', 'undo', () => { completeTask(id); });
      } else {
        setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      }
      window.dispatchEvent(new Event('tasks-changed'));
    } catch (err) {
      console.error('Unexpected error completing task:', err);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) { console.error('Failed to delete task:', error); return; }
      setTasks((prev) => prev.filter((t) => t.id !== id));
      window.dispatchEvent(new Event('tasks-changed'));
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

  const updateTask = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasksAll = [...tasks.filter((t) => t.completed)].sort(
    (a, b) => (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0)
  );
  const sortedTasks = sortTasks(activeTasks, sort);

  const [formOpen, setFormOpen] = useState(false);

  const AddTaskRow = () => {
    const [open, setOpen] = useState(false);
    if (open) {
      return (
        <InlineTaskForm
          projects={projects}
          onAdd={addTask}
          onCancel={() => setOpen(false)}
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
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-accent)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
      >
        <span style={{ fontSize: 18, lineHeight: 1, marginTop: -1 }}>+</span>
        Add task
      </button>
    );
  };

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null;

  return (
    <>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.02em' }}>
              All Tasks
            </h1>
            {!loading && (
              <p style={{ marginTop: 4, fontSize: 13, color: 'var(--text-muted)' }}>
                Every task, across all projects.
              </p>
            )}
          </div>
          <select
            value={sort}
            onChange={(e) => handleSortChange(e.target.value as SortOption)}
            style={{
              fontSize: 13,
              color: 'var(--text-secondary)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '4px 8px',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="priority">Priority</option>
            <option value="date">Date</option>
            <option value="date-added">Date added</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>
      </div>

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
      ) : sortedTasks.length === 0 ? (
        <>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', padding: '8px 0' }}>
            No tasks yet. Add one from any project view.
          </p>
          <AddTaskRow />
        </>
      ) : (
        <>
          {sortedTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onComplete={completeTask}
              onDelete={deleteTask}
              onPriorityChange={updatePriority}
              onOpen={(id) => setSelectedTaskId(id)}
              showProjectLabel
            />
          ))}
          <AddTaskRow />
          <CompletedSection
            tasks={completedTasksAll}
            onComplete={completeTask}
            onDelete={deleteTask}
            onPriorityChange={updatePriority}
            onOpen={(id) => setSelectedTaskId(id)}
            showProjectLabel
            storageKey="completed-alltasks-open"
          />
        </>
      )}
      <TaskDetailPanel
        task={selectedTask}
        onClose={() => setSelectedTaskId(null)}
        onTaskUpdate={updateTask}
        onTaskDelete={deleteTask}
      />
    </>
  );
}
