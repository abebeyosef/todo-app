'use client';

import { useState, useEffect, useRef } from 'react';
import { CalendarClock, Flag, Bell } from 'lucide-react';
import { parseTask } from '@/lib/parseTask';
import { buildHighlightedHTML } from '@/lib/highlightTask';
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
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatPreview(name: string, overrideDate?: Date): string {
  if (!name.trim()) return '';
  const parsed = parseTask(name);
  const parts: string[] = [];
  if (parsed.project) {
    parts.push(parsed.project.charAt(0).toUpperCase() + parsed.project.slice(1));
  }
  const dateToUse = overrideDate ?? parsed.scheduledAt;
  if (dateToUse) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const sd = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    let label = sd(dateToUse, today)
      ? 'Today'
      : sd(dateToUse, tomorrow)
      ? 'Tomorrow'
      : dateToUse.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    if (dateToUse.getHours() !== 0 || dateToUse.getMinutes() !== 0) {
      label += ' ' + dateToUse.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    }
    parts.push(label);
  }
  if (parsed.duration) parts.push(`${parsed.duration} min`);
  if (parsed.priority !== 'p2') parts.push(`Priority ${parsed.priority[1]}`);
  return parts.length > 0 ? '→ ' + parts.join(' · ') : '';
}

export default function InlineTaskForm({ projects, onAdd, onCancel, defaultProjectId, error }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'p1' | 'p2' | 'p3'>('p2');
  const [scheduledAt, setScheduledAt] = useState<Date | undefined>();
  const [projectId, setProjectId] = useState<string | undefined>(defaultProjectId);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);

  // Sync defaultProjectId if parent re-renders with a new project (fixes task disappearing bug)
  useEffect(() => {
    if (defaultProjectId) setProjectId(defaultProjectId);
  }, [defaultProjectId]);

  // Bug 19.0.3: ignore stale error from before mount; only show errors triggered after mount
  const [localError, setLocalError] = useState<string | null>(null);
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return; }
    setLocalError(error ?? null);
  }, [error]);

  const nameRef = useRef<HTMLTextAreaElement>(null);
  const priorityMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { nameRef.current?.focus(); }, []);

  useEffect(() => {
    const handler = () => nameRef.current?.focus();
    window.addEventListener('open-task-form', handler);
    return () => window.removeEventListener('open-task-form', handler);
  }, []);

  // Close priority menu on outside click
  useEffect(() => {
    if (!showPriorityMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (priorityMenuRef.current && !priorityMenuRef.current.contains(e.target as Node)) {
        setShowPriorityMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showPriorityMenu]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (localError) setLocalError(null); // Bug 19.0.3: clear on first keystroke after error
    if (val.trim()) {
      const parsed = parseTask(val);
      if (parsed.scheduledAt) setScheduledAt(parsed.scheduledAt);
      if (parsed.priority !== 'p2') setPriority(parsed.priority);
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
      duration: parsed.duration,
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
  const projectNames = projects.map((p) => p.name);
  const previewText = formatPreview(name, scheduledAt);
  const currentPriority = PRIORITY_FLAGS.find((f) => f.value === priority)!;

  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: 8,
        background: 'var(--bg-input)',
        boxShadow: 'var(--shadow-dropdown)',
        overflow: 'visible',
        marginBottom: 4,
        position: 'relative',
      }}
    >
      {/* Task name with inline token highlighting */}
      <div style={{ padding: '12px 14px 4px', position: 'relative' }}>
        {/* Mirror div — sits behind the textarea; text is transparent so only background-pill spans show through */}
        {name && (
          <div
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: buildHighlightedHTML(name, projectNames) }}
            style={{
              position: 'absolute',
              top: 12,
              left: 14,
              right: 14,
              fontSize: 15,
              fontFamily: 'inherit',
              fontWeight: 'inherit',
              lineHeight: 'normal',
              letterSpacing: 'normal',
              whiteSpace: 'pre',
              overflow: 'hidden',
              pointerEvents: 'none',
              color: 'transparent',
              userSelect: 'none',
            }}
          />
        )}
        <textarea
          ref={nameRef}
          rows={1}
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Task name"
          style={{
            position: 'relative',
            width: '100%',
            fontSize: 15,
            fontFamily: 'inherit',
            fontWeight: 'inherit',
            lineHeight: 'normal',
            letterSpacing: 'normal',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            padding: 0,
            margin: 0,
            resize: 'none',
            overflow: 'hidden',
            // Text always visible — mirror div uses transparent color, only background pills show through
            color: 'var(--text-primary)',
            caretColor: 'var(--text-primary)',
          }}
        />
      </div>

      {/* Parsed preview line — shows detected tokens as a summary */}
      {previewText && (
        <div style={{ padding: '0 14px 2px', fontSize: 12, color: 'var(--text-muted)' }}>
          {previewText}
        </div>
      )}

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
          gap: 4,
        }}
      >
        {/* Deadline button (CalendarClock) */}
        <button
          type="button"
          onClick={() => {
            if (scheduledAt) { setScheduledAt(undefined); }
            else { const d = new Date(); d.setHours(9, 0, 0, 0); setScheduledAt(d); }
          }}
          title="Set deadline"
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
          <CalendarClock size={13} />
          {scheduledAt ? formatDatePill(scheduledAt) : 'Deadline'}
          {scheduledAt && (
            <span
              onClick={(e) => { e.stopPropagation(); setScheduledAt(undefined); }}
              style={{ marginLeft: 2, lineHeight: 1 }}
            >
              ×
            </span>
          )}
        </button>

        {/* Priority button (Flag) with dropdown */}
        <div ref={priorityMenuRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowPriorityMenu((v) => !v)}
            title="Set priority"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              padding: '3px 8px',
              borderRadius: 4,
              border: `1px solid ${priority !== 'p2' ? currentPriority.colour : 'var(--border)'}`,
              background: 'transparent',
              color: priority !== 'p2' ? currentPriority.colour : 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            <Flag size={13} />
            {priority !== 'p2' ? `P${priority[1]}` : 'Priority'}
          </button>

          {showPriorityMenu && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                zIndex: 200,
                background: 'var(--bg-modal)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                boxShadow: 'var(--shadow-dropdown)',
                padding: 4,
                minWidth: 130,
              }}
            >
              {PRIORITY_FLAGS.map(({ value, colour, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => { setPriority(value); setShowPriorityMenu(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 10px',
                    borderRadius: 6,
                    fontSize: 13,
                    color: colour,
                    background: priority === value ? 'var(--bg-hover-row)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover-row)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = priority === value ? 'var(--bg-hover-row)' : 'transparent')}
                >
                  <Flag size={13} color={colour} />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reminders button (Bell) */}
        <button
          type="button"
          title="Set reminder (coming soon)"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            padding: '3px 8px',
            borderRadius: 4,
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          <Bell size={13} />
          Reminders
        </button>

        {localError && (
          <span style={{ fontSize: 12, color: '#DB4035', marginLeft: 4 }}>{localError}</span>
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
