'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Task } from '@/types/task';
import TaskItem from './TaskItem';

type Props = {
  tasks: Task[];
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onPriorityChange: (id: string, priority: 'p1' | 'p2' | 'p3') => void;
  onOpen?: (id: string) => void;
  onCalendarSync?: (id: string) => Promise<void>;
  showProjectLabel?: boolean;
  storageKey?: string;
};

export default function CompletedSection({
  tasks,
  onComplete,
  onDelete,
  onPriorityChange,
  onOpen,
  onCalendarSync,
  showProjectLabel,
  storageKey = 'completed-section-open',
}: Props) {
  const [expanded, setExpanded] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(storageKey) === 'true';
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, String(expanded));
  }, [expanded, storageKey]);

  if (tasks.length === 0) return null;

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ height: 1, background: 'var(--divider)', marginBottom: 8 }} />
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          width: '100%',
          padding: '4px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ color: 'var(--text-muted)', display: 'flex' }}>
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>
          Completed
        </span>
        <span
          style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            background: 'var(--bg-hover-row)',
            borderRadius: 10,
            padding: '1px 7px',
            marginLeft: 2,
          }}
        >
          {tasks.length}
        </span>
      </button>

      {expanded && (
        <div style={{ marginTop: 4 }}>
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onComplete={onComplete}
              onDelete={onDelete}
              onPriorityChange={onPriorityChange}
              onOpen={onOpen}
              onCalendarSync={onCalendarSync}
              showProjectLabel={showProjectLabel}
            />
          ))}
        </div>
      )}
    </div>
  );
}
