'use client';

import { Task } from '@/types/task';

type Props = {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onPriorityChange: (id: string, priority: 'p1' | 'p2' | 'p3') => void;
};

const PRIORITY_STYLES: Record<string, string> = {
  p1: 'bg-red-100 text-red-600 hover:bg-red-200',
  p2: 'bg-amber-100 text-amber-600 hover:bg-amber-200',
  p3: 'bg-gray-100 text-gray-400 hover:bg-gray-200',
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
  return (
    <div className="group flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-gray-50">
      {/* Checkbox */}
      <button
        onClick={() => onComplete(task.id)}
        className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1 ${
          task.completed ? 'border-gray-300 bg-gray-300' : 'border-gray-300 hover:border-gray-500'
        }`}
        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {task.completed && (
          <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          {task.projectColour && (
            <span className="inline-block h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: task.projectColour }} />
          )}
          {task.project && (
            <span className="text-xs font-medium text-gray-400">#{task.project}</span>
          )}
          <span className={`text-sm ${task.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
            {task.name}
          </span>
        </div>
        {(task.scheduledAt || task.duration) && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {task.scheduledAt && <span>{formatDate(task.scheduledAt)}</span>}
            {task.duration && <span>· {formatDuration(task.duration)}</span>}
          </div>
        )}
      </div>

      {/* Priority badge */}
      <button
        onClick={() => onPriorityChange(task.id, NEXT_PRIORITY[task.priority])}
        title="Click to change priority"
        className={`flex-shrink-0 rounded px-1.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 ${PRIORITY_STYLES[task.priority]}`}
      >
        {task.priority.toUpperCase()}
      </button>

      {/* Delete */}
      <button
        onClick={() => onDelete(task.id)}
        className="mt-0.5 hidden h-5 w-5 flex-shrink-0 items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 group-hover:flex focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
        aria-label="Delete task"
      >
        ×
      </button>
    </div>
  );
}
