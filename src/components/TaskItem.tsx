'use client';

import { useState } from 'react';
import { CalendarX2 } from 'lucide-react';
import { Task } from '@/types/task';

type Props = {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onPriorityChange: (id: string, priority: 'p1' | 'p2' | 'p3') => void;
  onOpen?: (id: string) => void;
  showProjectLabel?: boolean;
  onCalendarSync?: (id: string) => Promise<void>;
};

function formatDate(date: Date): { text: string; overdue: boolean } {
  const now = new Date();
  const isOverdue = date < now && !sameDay(date, now);
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  let text: string;
  if (sameDay(date, now)) {
    text = `Today ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (sameDay(date, tomorrow)) {
    text = `Tomorrow ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    text =
      date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) +
      ` ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  }
  return { text, overdue: isOverdue };
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const PRIORITY_COLOUR: Record<string, string> = {
  p1: '#DB4035',
  p2: '#D97706',
  p3: '#4073FF',
};

const NEXT_PRIORITY: Record<string, 'p1' | 'p2' | 'p3'> = {
  p1: 'p2', p2: 'p3', p3: 'p1',
};

type ContextMenuProps = {
  task: Task;
  onDelete: () => void;
  onPriorityChange: (p: 'p1' | 'p2' | 'p3') => void;
  onClose: () => void;
  style?: React.CSSProperties;
};

function ContextMenu({ task, onDelete, onPriorityChange, onClose, style }: ContextMenuProps) {
  const priorities: Array<{ value: 'p1' | 'p2' | 'p3'; colour: string; label: string }> = [
    { value: 'p1', colour: '#DB4035', label: 'Priority 1' },
    { value: 'p2', colour: '#D97706', label: 'Priority 2' },
    { value: 'p3', colour: '#4073FF', label: 'Priority 3' },
  ];

  const menuItem = (label: string, onClick: () => void, danger = false) => (
    <button
      onClick={() => { onClick(); onClose(); }}
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        padding: '7px 12px',
        fontSize: 14,
        color: danger ? 'var(--text-overdue)' : 'var(--text-primary)',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        borderRadius: 4,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover-row)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {label}
    </button>
  );

  return (
    <div
      style={{
        position: 'absolute',
        right: 0,
        top: '100%',
        zIndex: 100,
        background: 'var(--bg-modal)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        boxShadow: 'var(--shadow-dropdown)',
        minWidth: 200,
        padding: '4px',
        ...style,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Priority */}
      <div style={{ padding: '6px 12px 4px', fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
        Priority
      </div>
      <div style={{ display: 'flex', gap: 6, padding: '4px 12px 8px' }}>
        {priorities.map(({ value, colour, label }) => (
          <button
            key={value}
            onClick={() => { onPriorityChange(value); onClose(); }}
            title={label}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: `2px solid ${task.priority === value ? colour : 'var(--border)'}`,
              background: task.priority === value ? colour + '22' : 'transparent',
              cursor: 'pointer',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colour,
            }}
          >
            🚩
          </button>
        ))}
        <button
          onClick={() => { onPriorityChange('p3'); onClose(); }}
          title="No priority"
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            border: '2px solid var(--border)',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 14,
            color: 'var(--text-muted)',
          }}
        >
          🏳
        </button>
      </div>
      <div style={{ height: 1, background: 'var(--divider)', margin: '2px 0' }} />
      {menuItem('🗑 Delete task', onDelete, true)}
    </div>
  );
}

export default function TaskItem({ task, onComplete, onDelete, onPriorityChange, onOpen, showProjectLabel, onCalendarSync }: Props) {
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Long-press to open context menu on touch devices
  const longPressTimer = { current: null as ReturnType<typeof setTimeout> | null };
  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => setMenuOpen(true), 500);
  };
  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const dateInfo = task.scheduledAt ? formatDate(task.scheduledAt) : null;

  const isCompleted = task.completed;

  const handleComplete = () => {
    if (isCompleted) {
      // Reopening — no fade animation needed
      onComplete(task.id);
    } else {
      setCompleting(true);
      setTimeout(() => onComplete(task.id), 200);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 0,
        minHeight: dateInfo ? 56 : 48,
        padding: '8px 0',
        borderBottom: '1px solid var(--divider)',
        background: hovered ? 'var(--bg-hover-row)' : 'transparent',
        borderRadius: hovered ? 6 : 0,
        transition: 'background 80ms ease, opacity 200ms ease',
        opacity: completing ? 0 : 1,
        cursor: 'default',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMenuOpen(false); }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd}
    >
      {/* Drag handle — visible on hover */}
      <div
        style={{
          width: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 2,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 80ms ease',
          color: 'var(--text-muted)',
          cursor: 'grab',
          flexShrink: 0,
          fontSize: 14,
          userSelect: 'none',
        }}
        title="Drag to reorder"
      >
        ⠿
      </div>

      {/* Checkbox — visual is 20px; transparent padding extends hit area to ~44px without layout change */}
      <button
        onClick={(e) => { e.stopPropagation(); handleComplete(); }}
        aria-label={isCompleted ? 'Reopen task' : 'Mark complete'}
        title={isCompleted ? 'Click to reopen' : undefined}
        style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          border: `1.5px solid ${isCompleted ? 'var(--accent)' : hovered ? 'var(--accent)' : 'var(--checkbox-border)'}`,
          background: isCompleted ? 'var(--accent)' : 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: 2,
          transition: 'border-color 80ms ease',
          padding: 0,
          color: 'white',
          fontSize: 11,
          lineHeight: 1,
          /* Extend touch target without changing layout */
          outline: 'none',
          touchAction: 'manipulation',
        }}
      >
        {isCompleted && '✓'}
      </button>
      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, paddingLeft: 12, cursor: onOpen ? 'pointer' : 'default' }} onClick={() => onOpen?.(task.id)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: isCompleted ? 0.45 : 1 }}>
          {task.projectColour && (
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: task.projectColour,
                flexShrink: 0,
              }}
            />
          )}
          <span
            style={{
              fontSize: 15,
              fontWeight: 400,
              color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
              textDecoration: isCompleted ? 'line-through' : 'none',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {task.name}
          </span>
        </div>
        {dateInfo && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              marginTop: 3,
              fontSize: 12,
              color: dateInfo.overdue ? 'var(--text-overdue)' : 'var(--text-upcoming)',
              opacity: isCompleted ? 0.45 : 1,
            }}
          >
            <span>📅</span>
            <span>{dateInfo.text}</span>
          </div>
        )}
        {showProjectLabel && task.project && task.project.toLowerCase() !== 'inbox' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3, opacity: isCompleted ? 0.45 : 1 }}>
            {task.projectColour && (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: task.projectColour,
                  flexShrink: 0,
                }}
              />
            )}
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{task.project}</span>
          </div>
        )}
      </div>

      {/* Right side: priority flag (p1 always, others on hover) + action icons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          paddingRight: 8,
          flexShrink: 0,
          marginTop: 2,
          opacity: isCompleted ? 0.45 : 1,
        }}
      >
        {/* Unsynced calendar indicator — task has a date but no google_event_id */}
        {task.scheduledAt && !task.googleEventId && onCalendarSync && (hovered || syncing) && (
          <button
            onClick={async (e) => {
              e.stopPropagation();
              setSyncing(true);
              await onCalendarSync(task.id);
              setSyncing(false);
            }}
            title="Sync to Google Calendar"
            disabled={syncing}
            style={{
              background: 'none',
              border: 'none',
              cursor: syncing ? 'default' : 'pointer',
              padding: 2,
              color: 'var(--text-muted)',
              lineHeight: 1,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              opacity: syncing ? 0.5 : 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <CalendarX2 size={14} />
          </button>
        )}

        {/* Priority flag */}
        {(task.priority === 'p1' || hovered) && (
          <button
            onClick={(e) => { e.stopPropagation(); onPriorityChange(task.id, NEXT_PRIORITY[task.priority]); }}
            title={`Priority: ${task.priority.toUpperCase()} — click to change`}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              fontSize: 14,
              color: PRIORITY_COLOUR[task.priority],
              opacity: task.priority === 'p1' ? 1 : hovered ? 1 : 0,
              transition: 'opacity 80ms ease',
              lineHeight: 1,
            }}
          >
            🚩
          </button>
        )}

        {/* Action icons — on hover only */}
        {hovered && (
          <>
            {/* Edit (no-op visual) */}
            <button
              onClick={(e) => { e.stopPropagation(); onOpen?.(task.id); }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 2,
                color: 'var(--icon)',
                fontSize: 14,
                lineHeight: 1,
                borderRadius: 4,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--icon)')}
              title="Edit"
            >
              ✏
            </button>

            {/* Three-dot menu */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px 4px',
                  color: 'var(--icon)',
                  fontSize: 14,
                  lineHeight: 1,
                  borderRadius: 4,
                  letterSpacing: 1,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--icon)')}
                title="More options"
              >
                ···
              </button>
              {menuOpen && (
                <ContextMenu
                  task={task}
                  onDelete={() => onDelete(task.id)}
                  onPriorityChange={(p) => onPriorityChange(task.id, p)}
                  onClose={() => setMenuOpen(false)}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
