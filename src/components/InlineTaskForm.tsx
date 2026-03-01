'use client';

import { useState, useEffect, useRef } from 'react';
import { parseTask } from '@/lib/parseTask';
import { Task } from '@/types/task';
import { Project } from '@/types/project';

type Props = {
  projects: Project[];
  onAdd: (task: Task) => void;
  onCancel: () => void;
  defaultProjectId?: string;
  error?: string | null;
};

const PRIORITY_FLAGS: { value: 'p1' | 'p2' | 'p3'; colour: string; label: string }[] = [
  { value: 'p1', colour: '#DB4035', label: 'Priority 1' },
  { value: 'p2', colour: '#D97706', label: 'Priority 2' },
  { value: 'p3', colour: '#4073FF', label: 'Priority 3' },
];

function formatDatePill(d: Date): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (sameDay(d, today)) return 'Today';
  if (sameDay(d, tomorrow)) return 'Tomorrow';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function InlineTaskForm({ projects, onAdd, onCancel, defaultProjectId, error }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'p1' | 'p2' | 'p3'>('p2');
  const [scheduledAt, setScheduledAt] = useState<Date | undefined>();
  const [projectId, setProjectId] = useState<string | undefined>(defaultProjectId);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  // Listen for sidebar "Add task" button
  useEffect(() => {
    const handler = () => nameRef.current?.focus();
    window.addEventListener('open-task-form', handler);
    return () => window.removeEventListener('open-task-form', handler);
  }, []);

  // Parse NL from name input on the fly
  const handleNameChange = (val: string) => {
    setName(val);
    if (val.trim()) {
      const parsed = parseTask(val);
      if (parsed.scheduledAt) setScheduledAt(parsed.scheduledAt);
      if (parsed.priority !== 'p2') setPriority(parsed.priority);
      // Auto-select project by name
      if (parsed.project) {
        const match = projects.find((p) => p.name.toLowerCase() === parsed.project!.toLowerCase());
        if (match) setProjectId(match.id);
      }
    }
  };

  const submit = () => {
    const rawName = name.trim();
    if (!rawName) return;
    const parsed = parseTask(rawName);
    const selectedProject = projects.find((p) => p.id === projectId);
    const task: Task = {
      id: crypto.randomUUID(),
      completed: false,
      createdAt: new Date(),
      name: parsed.name || rawName,
      project: selectedProject?.name ?? parsed.project,
      projectId: projectId ?? undefined,
      projectColour: selectedProject?.colour,
      scheduledAt: scheduledAt ?? parsed.scheduledAt,
      priority,
      isBacklog: !scheduledAt && !parsed.scheduledAt,
    };
    onAdd(task);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
    if (e.key === 'Escape') onCancel();
  };

  const selectedProject = projects.find((p) => p.id === projectId);

  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: 8,
        background: 'var(--bg-input)',
        boxShadow: 'var(--shadow-dropdown)',
        overflow: 'hidden',
        marginBottom: 4,
      }}
    >
      {/* Task name */}
      <div style={{ padding: '12px 14px 4px' }}>
        <input
          ref={nameRef}
          type="text"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Task name"
          style={{
            width: '100%',
            fontSize: 15,
            color: 'var(--text-primary)',
            background: 'transparent',
            border: 'none',
            outline: 'none',
          }}
        />
      </div>

      {/* Description */}
      <div style={{ padding: '0 14px 8px' }}>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Description"
          style={{
            width: '100%',
            fontSize: 13,
            color: 'var(--text-secondary)',
            background: 'transparent',
            border: 'none',
            outline: 'none',
          }}
        />
      </div>

      {/* Toolbar row */}
      <div
        style={{
          padding: '8px 12px',
          borderTop: '1px solid var(--divider)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexWrap: 'wrap',
        }}
      >
        {/* Date pill */}
        <button
          type="button"
          onClick={() => {
            // simple: toggle today
            if (scheduledAt) { setScheduledAt(undefined); }
            else { const d = new Date(); d.setHours(9, 0, 0, 0); setScheduledAt(d); }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            padding: '3px 8px',
            borderRadius: 4,
            border: '1px solid var(--border)',
            background: scheduledAt ? 'var(--accent-bg)' : 'transparent',
            color: scheduledAt ? 'var(--text-accent)' : 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          📅 {scheduledAt ? formatDatePill(scheduledAt) : 'Date'}
          {scheduledAt && (
            <span
              onClick={(e) => { e.stopPropagation(); setScheduledAt(undefined); }}
              style={{ marginLeft: 2, lineHeight: 1 }}
            >
              ×
            </span>
          )}
        </button>

        {/* Priority pills */}
        {PRIORITY_FLAGS.map(({ value, colour, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setPriority(value)}
            title={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              padding: '3px 8px',
              borderRadius: 4,
              border: `1px solid ${priority === value ? colour : 'var(--border)'}`,
              background: priority === value ? 'transparent' : 'transparent',
              color: priority === value ? colour : 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            🚩
          </button>
        ))}

        {error && (
          <span style={{ fontSize: 12, color: 'var(--p1)', marginLeft: 4 }}>{error}</span>
        )}
      </div>

      {/* Footer row: project selector + Cancel / Add task */}
      <div
        style={{
          padding: '8px 12px',
          borderTop: '1px solid var(--divider)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {/* Project selector */}
        <select
          value={projectId ?? ''}
          onChange={(e) => setProjectId(e.target.value || undefined)}
          style={{
            fontSize: 13,
            color: selectedProject ? selectedProject.colour : 'var(--text-secondary)',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            cursor: 'pointer',
            flex: 1,
          }}
        >
          <option value="">Inbox</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              # {p.name}
            </option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              fontSize: 14,
              color: 'var(--text-secondary)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 10px',
              borderRadius: 6,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover-row)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!name.trim()}
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'white',
              background: name.trim() ? 'var(--accent)' : 'var(--bg-hover-row)',
              border: 'none',
              cursor: name.trim() ? 'pointer' : 'default',
              padding: '6px 12px',
              borderRadius: 6,
            }}
          >
            Add task
          </button>
        </div>
      </div>
    </div>
  );
}
