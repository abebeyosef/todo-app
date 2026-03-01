'use client';

import { Task } from '@/types/task';

type Props = {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onPriorityChange: (id: string, priority: 'p1' | 'p2' | 'p3') => void;
};

const PRIORITY_COLOUR: Record<string, string> = {
  p1: 'var(--p1)',
  p2: 'var(--p2)',
  p3: 'var(--p3)',
};

const NEXT_PRIORITY: Record<string, 'p1' | 'p2' | 'p3'> = {
  p1: 'p2', p2: 'p3', p3: 'p1',
};

function formatDate(date: Date): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  if (sameDay(date, today)) return `Today ${timeStr}`;
  if (sameDay(date, tomorrow)) return `Tomorrow ${timeStr}`;
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) + ` ${timeStr}`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export default function TaskItem({ task, onComplete, onDelete, onPriorityChange }: Props) {
  const isAlwaysVisible = task.priority === 'p1';

  return (
    <div
      className="group flex items-center gap-3 rounded-lg px-2 transition-colors duration-100"
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = '')}
      style={{
        minHeight: 44,
        borderBottom: '1px solid var(--divider)',
        opacity: task.completed ? 0.55 : 1,
        transition: 'opacity 250ms ease, background-color 100ms ease',
      }}
    >
      {/* Checkbox */}
      <button
        onClick={() => onComplete(task.id)}
        className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150 focus:outline-none"
        style={{
          borderColor: task.completed ? 'var(--text-muted)' : 'var(--border)',
          background: task.completed ? 'var(--text-muted)' : 'transparent',
        }}
        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {task.completed && (
          <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col py-2.5">
        <div className="flex items-center gap-1.5">
          {task.projectColour && (
            <span
              className="inline-block flex-shrink-0 rounded-full"
              style={{ width: 8, height: 8, backgroundColor: task.projectColour }}
            />
          )}
          <span
            className="truncate text-sm font-medium"
            style={{
              color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
              textDecoration: task.completed ? 'line-through' : undefined,
            }}
          >
            {task.name}
          </span>
        </div>
        {(task.project || task.scheduledAt || task.duration) && (
          <div className="flex items-center gap-2 pt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            {task.project && <span>#{task.project}</span>}
            {task.scheduledAt && <span>{formatDate(task.scheduledAt)}</span>}
            {task.duration && <span>· {formatDuration(task.duration)}</span>}
          </div>
        )}
      </div>

      {/* Priority dot */}
      <button
        onClick={() => onPriorityChange(task.id, NEXT_PRIORITY[task.priority])}
        title={`Priority: ${task.priority.toUpperCase()} — click to change`}
        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full transition-opacity duration-100 focus:outline-none ${
          isAlwaysVisible ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <span
          className="block rounded-full transition-transform duration-100 active:scale-150"
          style={{ width: 8, height: 8, background: PRIORITY_COLOUR[task.priority] }}
        />
      </button>

      {/* Delete */}
      <button
        onClick={() => onDelete(task.id)}
        className="hidden h-5 w-5 flex-shrink-0 items-center justify-center rounded text-lg leading-none transition-colors group-hover:flex focus:outline-none"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        aria-label="Delete task"
      >
        ×
      </button>
    </div>
  );
}
