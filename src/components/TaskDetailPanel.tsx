'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Task } from '@/types/task';
import { supabase } from '@/lib/supabase';

type Subtask = {
  id: string;
  name: string;
  completed: boolean;
  sort_order: number;
};

type Comment = {
  id: string;
  body: string;
  created_at: string;
};

type Props = {
  task: Task | null;
  onClose: () => void;
  onTaskUpdate: (updated: Task) => void;
  onTaskDelete: (id: string) => void;
};

const PRIORITY_COLOUR: Record<string, string> = {
  p1: '#DB4035',
  p2: '#D97706',
  p3: '#4073FF',
};

function formatTimestamp(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatDate(date: Date): string {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  if (isToday) return 'Today';
  if (isTomorrow) return 'Tomorrow';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function TaskDetailPanel({ task, onClose, onTaskUpdate, onTaskDelete }: Props) {
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState('');
  const [description, setDescription] = useState('');
  const [descSaved, setDescSaved] = useState(false);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentBody, setCommentBody] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const descTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load subtasks and comments
  const loadExtras = useCallback(async (taskId: string) => {
    try {
      const [subtaskRes, commentRes] = await Promise.all([
        supabase.from('subtasks').select('*').eq('task_id', taskId).order('sort_order'),
        supabase.from('task_comments').select('*').eq('task_id', taskId).order('created_at'),
      ]);
      if (!subtaskRes.error && subtaskRes.data) setSubtasks(subtaskRes.data as Subtask[]);
      if (!commentRes.error && commentRes.data) setComments(commentRes.data as Comment[]);
    } catch {
      // Tables may not exist yet — silently ignore
    }
  }, []);

  useEffect(() => {
    if (task) {
      setNameVal(task.name);
      setDescription(task.description ?? '');
      setDescSaved(false);
      setSubtasks([]);
      setComments([]);
      loadExtras(task.id);
    }
  }, [task, loadExtras]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    if (editingName) nameInputRef.current?.focus();
  }, [editingName]);

  if (!task) return null;

  const saveName = async () => {
    const trimmed = nameVal.trim();
    if (!trimmed || trimmed === task.name) { setEditingName(false); return; }
    try {
      const { error } = await supabase.from('tasks').update({ name: trimmed }).eq('id', task.id);
      if (!error) onTaskUpdate({ ...task, name: trimmed });
    } catch { /* ignore */ }
    setEditingName(false);
  };

  const saveDescription = async () => {
    try {
      const { error } = await supabase.from('tasks').update({ description: description || null }).eq('id', task.id);
      if (!error) {
        onTaskUpdate({ ...task, description: description || undefined });
        setDescSaved(true);
        if (descTimerRef.current) clearTimeout(descTimerRef.current);
        descTimerRef.current = setTimeout(() => setDescSaved(false), 1500);
      }
    } catch { /* ignore */ }
  };

  const addSubtask = async () => {
    const name = newSubtask.trim();
    if (!name) return;
    try {
      const maxOrder = subtasks.length ? Math.max(...subtasks.map((s) => s.sort_order)) : -1;
      const { data, error } = await supabase
        .from('subtasks')
        .insert([{ task_id: task.id, name, sort_order: maxOrder + 1 }])
        .select()
        .single();
      if (!error && data) {
        setSubtasks((prev) => [...prev, data as Subtask]);
        setNewSubtask('');
      }
    } catch { /* ignore */ }
  };

  const toggleSubtask = async (id: string) => {
    const st = subtasks.find((s) => s.id === id);
    if (!st) return;
    try {
      const { error } = await supabase.from('subtasks').update({ completed: !st.completed }).eq('id', id);
      if (!error) setSubtasks((prev) => prev.map((s) => s.id === id ? { ...s, completed: !s.completed } : s));
    } catch { /* ignore */ }
  };

  const deleteSubtask = async (id: string) => {
    try {
      const { error } = await supabase.from('subtasks').delete().eq('id', id);
      if (!error) setSubtasks((prev) => prev.filter((s) => s.id !== id));
    } catch { /* ignore */ }
  };

  const addComment = async () => {
    const body = commentBody.trim();
    if (!body) return;
    try {
      const { data, error } = await supabase
        .from('task_comments')
        .insert([{ task_id: task.id, body }])
        .select()
        .single();
      if (!error && data) {
        setComments((prev) => [...prev, data as Comment]);
        setCommentBody('');
      }
    } catch { /* ignore */ }
  };

  return (
    <div
      style={{
        position: 'fixed',
        right: 0,
        top: 0,
        height: '100vh',
        width: 400,
        background: 'var(--bg-modal)',
        borderLeft: '1px solid var(--border)',
        boxShadow: '-4px 0 16px rgba(0,0,0,0.1)',
        zIndex: 300,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '12px 16px 0' }}>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: 20,
            color: 'var(--text-muted)',
            lineHeight: 1,
            padding: '4px 6px',
          }}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div style={{ padding: '8px 20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Task name */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <button
            onClick={() => {
              // Complete task
              const confirmed = confirm('Mark this task as complete?');
              if (confirmed) { onTaskUpdate({ ...task, completed: true }); onClose(); }
            }}
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: '1.5px solid var(--checkbox-border)',
              background: 'transparent',
              cursor: 'pointer',
              flexShrink: 0,
              marginTop: 3,
              padding: 0,
            }}
            aria-label="Mark complete"
          />
          {editingName ? (
            <input
              ref={nameInputRef}
              value={nameVal}
              onChange={(e) => setNameVal(e.target.value)}
              onBlur={saveName}
              onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') { setEditingName(false); setNameVal(task.name); } }}
              style={{
                flex: 1,
                fontSize: 18,
                fontWeight: 600,
                color: 'var(--text-primary)',
                background: 'transparent',
                border: 'none',
                borderBottom: '2px solid var(--accent)',
                outline: 'none',
                padding: '0 0 2px',
              }}
            />
          ) : (
            <h2
              onClick={() => setEditingName(true)}
              style={{
                flex: 1,
                fontSize: 18,
                fontWeight: 600,
                color: 'var(--text-primary)',
                cursor: 'text',
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {task.name}
            </h2>
          )}
        </div>

        {/* Metadata pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {task.scheduledAt && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '3px 10px',
                borderRadius: 12,
                fontSize: 12,
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              📅 {formatDate(task.scheduledAt)}
            </span>
          )}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 10px',
              borderRadius: 12,
              fontSize: 12,
              background: 'var(--bg-input)',
              border: `1px solid ${PRIORITY_COLOUR[task.priority]}`,
              color: PRIORITY_COLOUR[task.priority],
            }}
          >
            🚩 {task.priority.toUpperCase()}
          </span>
          {task.project && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '3px 10px',
                borderRadius: 12,
                fontSize: 12,
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                color: task.projectColour ?? 'var(--text-secondary)',
              }}
            >
              # {task.project}
            </span>
          )}
        </div>

        {/* Description */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Description</span>
            {descSaved && <span style={{ fontSize: 12, color: '#16a34a' }}>Saved ✓</span>}
          </div>
          <textarea
            ref={descRef}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={saveDescription}
            placeholder="Add a description…"
            rows={3}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: '1.5px solid var(--border)',
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              fontSize: 14,
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit',
              lineHeight: 1.5,
              boxSizing: 'border-box',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onBlurCapture={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
        </div>

        {/* Sub-tasks */}
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>Sub-tasks</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
            {subtasks.map((st) => (
              <div
                key={st.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 4px',
                  borderBottom: '1px solid var(--divider)',
                }}
              >
                <button
                  onClick={() => toggleSubtask(st.id)}
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    border: `1.5px solid ${st.completed ? '#16a34a' : 'var(--border)'}`,
                    background: st.completed ? '#16a34a' : 'transparent',
                    cursor: 'pointer',
                    flexShrink: 0,
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-label="Toggle subtask"
                >
                  {st.completed && (
                    <svg style={{ width: 8, height: 8 }} viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <span
                  style={{
                    flex: 1,
                    fontSize: 14,
                    color: st.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                    textDecoration: st.completed ? 'line-through' : undefined,
                  }}
                >
                  {st.name}
                </span>
                <button
                  onClick={() => deleteSubtask(st.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 16,
                    color: 'var(--text-muted)',
                    lineHeight: 1,
                    padding: '0 2px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-overdue)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                  aria-label="Delete subtask"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <input
            type="text"
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addSubtask(); }}
            placeholder="+ Add sub-task"
            style={{
              width: '100%',
              padding: '6px 10px',
              borderRadius: 6,
              border: '1.5px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontSize: 13,
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
        </div>

        {/* Comments */}
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>Comments</h3>
          <div style={{ marginBottom: 12 }}>
            <textarea
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addComment(); }}
              placeholder="Add a comment… (Cmd+Enter to post)"
              rows={2}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                border: '1.5px solid var(--border)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: 13,
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onBlurCapture={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
            <button
              onClick={addComment}
              disabled={!commentBody.trim()}
              style={{
                marginTop: 6,
                padding: '5px 12px',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 500,
                background: commentBody.trim() ? 'var(--accent)' : 'var(--bg-hover-row)',
                color: commentBody.trim() ? 'white' : 'var(--text-muted)',
                border: 'none',
                cursor: commentBody.trim() ? 'pointer' : 'default',
              }}
            >
              Post
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {comments.map((c) => (
              <div key={c.id} style={{ borderBottom: '1px solid var(--divider)', paddingBottom: 10 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                  YA · {formatTimestamp(c.created_at)}
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Delete task */}
        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--divider)' }}>
          <button
            onClick={() => {
              if (confirm('Delete this task?')) {
                onTaskDelete(task.id);
                onClose();
              }
            }}
            style={{
              fontSize: 14,
              color: 'var(--text-overdue)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 0',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
          >
            🗑 Delete task
          </button>
        </div>
      </div>
    </div>
  );
}
