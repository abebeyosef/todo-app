'use client';

import { useEffect, useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { supabase } from '@/lib/supabase';
import { Habit, TrackingType } from '@/types/habit';
import HabitCalendar from '@/components/HabitCalendar';
import HealthLog from '@/components/HealthLog';
import { calculateStreaks, StreakResult } from '@/lib/streaks';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

type LogValue = { value: number; textValue: string };

const TRACKING_TYPES: { value: TrackingType; label: string }[] = [
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'yesno', label: 'Yes / No' },
  { value: 'count', label: 'Count' },
  { value: 'duration', label: 'Duration (min)' },
  { value: 'amount', label: 'Amount' },
  { value: 'rating', label: 'Rating (1–10)' },
  { value: 'mood', label: 'Mood (5 options)' },
];

const MOOD_OPTIONS = ['😞', '😕', '😐', '🙂', '😄'];

function isHabitComplete(habit: Habit, logValue: LogValue | undefined): boolean {
  if (!logValue) return false;
  const { value } = logValue;
  switch (habit.trackingType) {
    case 'checkbox':
    case 'yesno':
      return value === 1;
    case 'count':
    case 'duration':
    case 'amount':
      if (habit.goal && habit.goal > 0) return value >= habit.goal;
      return value > 0;
    case 'rating':
    case 'mood':
      return value > 0;
    default:
      return false;
  }
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logValues, setLogValues] = useState<Map<string, LogValue>>(new Map());
  const [loading, setLoading] = useState(true);
  const [streaks, setStreaks] = useState<StreakResult>({ current: 0, best: 0 });
  const [showSettings, setShowSettings] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('');
  const [newType, setNewType] = useState<TrackingType>('checkbox');
  const [newGoal, setNewGoal] = useState<string>('');
  const [newUnit, setNewUnit] = useState('');
  const [habitError, setHabitError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'today' | 'calendar'>('today');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const today = todayISO();

  const loadData = useCallback(async () => {
    try {
      const [{ data: habitData, error: hErr }, { data: logData, error: lErr }, { data: allLogs, error: aErr }] = await Promise.all([
        supabase.from('habits').select('*').order('sort_order'),
        supabase.from('habit_logs').select('habit_id, value, text_value').eq('completed_on', today),
        supabase.from('habit_logs').select('completed_on'),
      ]);
      if (hErr) console.error('Failed to load habits:', hErr);
      if (lErr) console.error('Failed to load habit logs:', lErr);
      if (aErr) console.error('Failed to load all habit logs:', aErr);

      if (habitData) {
        setHabits(
          habitData.map((h) => ({
            id: h.id,
            name: h.name,
            emoji: h.emoji ?? undefined,
            sortOrder: h.sort_order,
            createdAt: new Date(h.created_at),
            trackingType: (h.tracking_type ?? 'checkbox') as TrackingType,
            unit: h.unit ?? undefined,
            goal: h.goal ?? undefined,
          }))
        );
      }
      if (logData) {
        const map = new Map<string, LogValue>();
        for (const l of logData) {
          map.set(l.habit_id, { value: l.value ?? 1, textValue: l.text_value ?? '' });
        }
        setLogValues(map);
      }
      if (habitData && allLogs) {
        setStreaks(calculateStreaks(allLogs, habitData.length));
      }
    } catch (err) {
      console.error('Unexpected error loading habit data:', err);
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Cancel inline delete confirmation if user clicks elsewhere
  useEffect(() => {
    if (!confirmDeleteId) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-confirm-delete]')) setConfirmDeleteId(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [confirmDeleteId]);

  const refreshStreaks = useCallback(async (currentHabitCount: number) => {
    try {
      const { data: allLogs, error } = await supabase.from('habit_logs').select('completed_on');
      if (error) { console.error('Failed to load streak data:', error); return; }
      if (allLogs) setStreaks(calculateStreaks(allLogs, currentHabitCount));
    } catch (err) {
      console.error('Unexpected error refreshing streaks:', err);
    }
  }, []);

  const logHabit = async (habitId: string, value: number, textValue = '') => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    try {
      // For checkbox/yesno: toggling off means deleting
      const currentLog = logValues.get(habitId);
      if ((habit.trackingType === 'checkbox' || habit.trackingType === 'yesno') && currentLog?.value === 1 && value === 1) {
        // Toggle off
        const { error } = await supabase.from('habit_logs').delete().eq('habit_id', habitId).eq('completed_on', today);
        if (error) { console.error('Failed to unlog habit:', error); return; }
        setLogValues((prev) => {
          const next = new Map(prev);
          next.delete(habitId);
          return next;
        });
      } else if (value === 0 && (habit.trackingType === 'checkbox' || habit.trackingType === 'yesno')) {
        // Delete
        const { error } = await supabase.from('habit_logs').delete().eq('habit_id', habitId).eq('completed_on', today);
        if (error) { console.error('Failed to unlog habit:', error); return; }
        setLogValues((prev) => {
          const next = new Map(prev);
          next.delete(habitId);
          return next;
        });
      } else {
        // Upsert
        const upsertPayload: Record<string, unknown> = {
          habit_id: habitId,
          completed_on: today,
          value,
          text_value: textValue || null,
        };
        const { error } = await supabase.from('habit_logs').upsert(upsertPayload, { onConflict: 'habit_id,completed_on' });
        if (error) { console.error('Failed to log habit:', error); return; }
        setLogValues((prev) => new Map(prev).set(habitId, { value, textValue }));
      }
      refreshStreaks(habits.length);
    } catch (err) {
      console.error('Unexpected error logging habit:', err);
    }
  };

  const addHabit = async () => {
    const name = newName.trim();
    if (!name) return;
    setHabitError(null);
    try {
      const maxOrder = habits.length ? Math.max(...habits.map((h) => h.sortOrder)) : -1;
      const insertPayload: Record<string, unknown> = {
        name,
        emoji: newEmoji.trim() || null,
        sort_order: maxOrder + 1,
        tracking_type: newType,
        unit: newUnit.trim() || null,
        goal: newGoal ? parseFloat(newGoal) : null,
      };
      const { data, error } = await supabase
        .from('habits')
        .insert([insertPayload])
        .select()
        .single();
      if (error) {
        console.error('Failed to add habit:', error);
        setHabitError("Couldn't add habit — please try again.");
        return;
      }
      if (data) {
        setHabits((prev) => [
          ...prev,
          {
            id: data.id,
            name: data.name,
            emoji: data.emoji ?? undefined,
            sortOrder: data.sort_order,
            createdAt: new Date(data.created_at),
            trackingType: (data.tracking_type ?? 'checkbox') as TrackingType,
            unit: data.unit ?? undefined,
            goal: data.goal ?? undefined,
          },
        ]);
        setNewName('');
        setNewEmoji('');
        setNewType('checkbox');
        setNewGoal('');
        setNewUnit('');
      }
    } catch (err) {
      console.error('Unexpected error adding habit:', err);
      setHabitError("Couldn't add habit — please try again.");
    }
  };

  const deleteHabit = async (id: string) => {
    setDeleteError(null);
    try {
      // Step 1: delete all logs for this habit first (avoids FK violation)
      const { error: logsError } = await supabase
        .from('habit_logs')
        .delete()
        .eq('habit_id', id);
      if (logsError) {
        console.error('Failed to delete habit logs:', logsError);
        setDeleteError('Could not delete habit logs. Please try again.');
        return;
      }
      // Step 2: delete the habit itself
      const { error } = await supabase.from('habits').delete().eq('id', id);
      if (error) {
        console.error('Failed to delete habit:', error);
        setDeleteError('Could not delete habit. Please try again.');
        return;
      }
      setHabits((prev) => prev.filter((h) => h.id !== id));
      setLogValues((prev) => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
      setConfirmDeleteId(null);
      setDeleteError(null);
    } catch (err) {
      console.error('Unexpected error deleting habit:', err);
      setDeleteError('An unexpected error occurred.');
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(habits);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    const updated = reordered.map((h, i) => ({ ...h, sortOrder: i }));
    setHabits(updated);
    try {
      await Promise.all(
        updated.map((h) =>
          supabase.from('habits').update({ sort_order: h.sortOrder }).eq('id', h.id)
        )
      );
    } catch (err) {
      console.error('Failed to persist habit order:', err);
    }
  };

  const completedCount = habits.filter((h) => isHabitComplete(h, logValues.get(h.id))).length;
  const total = habits.length;

  // Render the appropriate input control for a habit
  const renderHabitInput = (habit: Habit) => {
    const logVal = logValues.get(habit.id);
    const currentValue = logVal?.value ?? 0;
    const done = isHabitComplete(habit, logVal);

    switch (habit.trackingType) {
      case 'checkbox': {
        return (
          <button
            onClick={() => logHabit(habit.id, 1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              width: '100%',
              textAlign: 'left',
            }}
          >
            <span
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: `2px solid ${done ? '#16a34a' : 'var(--border)'}`,
                background: done ? '#16a34a' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 120ms',
              }}
            >
              {done && (
                <svg style={{ width: 12, height: 12, color: 'white' }} viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            {habit.emoji && <span style={{ fontSize: 18, lineHeight: 1 }}>{habit.emoji}</span>}
            <span style={{ fontSize: 14, fontWeight: 500, color: done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: done ? 'line-through' : undefined }}>
              {habit.name}
            </span>
          </button>
        );
      }

      case 'yesno': {
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
              {habit.emoji && <span style={{ fontSize: 18 }}>{habit.emoji}</span>}
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{habit.name}</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => logHabit(habit.id, 1)}
                style={{
                  padding: '4px 14px',
                  borderRadius: 20,
                  border: `1.5px solid ${currentValue === 1 ? '#16a34a' : 'var(--border)'}`,
                  background: currentValue === 1 ? '#16a34a' : 'transparent',
                  color: currentValue === 1 ? 'white' : 'var(--text-secondary)',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Yes
              </button>
              <button
                onClick={() => {
                  // "No" means value = 0 (just delete the log)
                  if (currentValue === 1) logHabit(habit.id, 0);
                }}
                style={{
                  padding: '4px 14px',
                  borderRadius: 20,
                  border: `1.5px solid ${logVal && currentValue === 0 ? '#DB4035' : 'var(--border)'}`,
                  background: logVal && currentValue === 0 ? '#DB4035' : 'transparent',
                  color: logVal && currentValue === 0 ? 'white' : 'var(--text-secondary)',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                No
              </button>
            </div>
          </div>
        );
      }

      case 'count': {
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
              {habit.emoji && <span style={{ fontSize: 18 }}>{habit.emoji}</span>}
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{habit.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => { const v = Math.max(0, currentValue - 1); logHabit(habit.id, v); }}
                style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}
              >−</button>
              <span style={{ fontSize: 15, fontWeight: 600, minWidth: 28, textAlign: 'center', color: done ? '#16a34a' : 'var(--text-primary)' }}>
                {habit.goal ? `${currentValue}/${habit.goal}` : currentValue}
              </span>
              <button
                onClick={() => logHabit(habit.id, currentValue + 1)}
                style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}
              >+</button>
            </div>
          </div>
        );
      }

      case 'duration':
      case 'amount': {
        const suffix = habit.trackingType === 'duration' ? 'min' : (habit.unit || '');
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
              {habit.emoji && <span style={{ fontSize: 18 }}>{habit.emoji}</span>}
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{habit.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="number"
                min={0}
                value={currentValue || ''}
                onChange={(e) => {
                  const v = e.target.value ? parseFloat(e.target.value) : 0;
                  logHabit(habit.id, v);
                }}
                placeholder="0"
                style={{
                  width: 64,
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: '1.5px solid var(--border)',
                  background: 'var(--bg-modal)',
                  color: 'var(--text-primary)',
                  fontSize: 14,
                  textAlign: 'right',
                  outline: 'none',
                }}
              />
              {suffix && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{suffix}</span>}
              {habit.goal && habit.goal > 0 && (
                <span style={{ fontSize: 12, color: done ? '#16a34a' : 'var(--text-muted)' }}>/ {habit.goal}</span>
              )}
            </div>
          </div>
        );
      }

      case 'rating': {
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
              {habit.emoji && <span style={{ fontSize: 18 }}>{habit.emoji}</span>}
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{habit.name}</span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => logHabit(habit.id, currentValue === n ? 0 : n)}
                  title={String(n)}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    border: 'none',
                    background: n <= currentValue ? '#16a34a' : 'var(--border)',
                    cursor: 'pointer',
                    padding: 0,
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
          </div>
        );
      }

      case 'mood': {
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
              {habit.emoji && <span style={{ fontSize: 18 }}>{habit.emoji}</span>}
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{habit.name}</span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {MOOD_OPTIONS.map((emoji, idx) => {
                const moodVal = idx + 1;
                return (
                  <button
                    key={idx}
                    onClick={() => logHabit(habit.id, currentValue === moodVal ? 0 : moodVal)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 20,
                      padding: '2px',
                      opacity: currentValue === moodVal ? 1 : 0.35,
                      transform: currentValue === moodVal ? 'scale(1.15)' : undefined,
                      transition: 'all 120ms',
                    }}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      {/* Header */}
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-primary)' }}>Habits</h1>
          {!loading && total > 0 && (
            <p style={{ marginTop: 2, fontSize: 14, color: 'var(--text-muted)' }}>
              {completedCount} of {total} done today
            </p>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Streak cards */}
          {!loading && (streaks.current > 0 || streaks.best > 0) && (
            <div style={{ display: 'flex', gap: 8 }}>
              <div
                style={{ borderRadius: 12, padding: '8px 12px', textAlign: 'center', background: 'var(--bg-card)', boxShadow: 'var(--shadow-dropdown)', minWidth: 72 }}
              >
                <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Streak
                </p>
                <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                  🔥 {streaks.current}d
                </p>
              </div>
              <div
                style={{ borderRadius: 12, padding: '8px 12px', textAlign: 'center', background: 'var(--bg-card)', boxShadow: 'var(--shadow-dropdown)', minWidth: 72 }}
              >
                <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Best
                </p>
                <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                  🏆 {streaks.best}d
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => setShowSettings((v) => !v)}
            style={{
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 14,
              fontWeight: 500,
              background: showSettings ? 'var(--accent)' : 'var(--bg-hover)',
              color: showSettings ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {showSettings ? 'Done' : 'Manage'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      {!showSettings && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {(['today', 'calendar'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '6px 16px',
                borderRadius: 20,
                fontSize: 14,
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === tab ? 'var(--accent)' : 'transparent',
                color: activeTab === tab ? 'white' : 'var(--text-secondary)',
                transition: 'all 120ms',
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Loading…</p>
      ) : (
        <>
          {/* Calendar tab */}
          {!showSettings && activeTab === 'calendar' && (
            <HabitCalendar habitCount={habits.length} fullScreen />
          )}

          {/* Today tab */}
          {!showSettings && activeTab === 'today' && (
            <div>
              {habits.length === 0 ? (
                <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                  No habits set up yet. Add your first one below.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {habits.map((habit) => (
                    <div
                      key={habit.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        minHeight: 44,
                        padding: '8px 8px',
                        borderBottom: '1px solid var(--divider)',
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = '')}
                    >
                      {renderHabitInput(habit)}
                    </div>
                  ))}
                </div>
              )}

              {/* Health log */}
              <HealthLog />
            </div>
          )}

          {/* Settings / manage panel */}
          {showSettings && (
            <div>
              {/* Add new habit */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={newEmoji}
                    onChange={(e) => setNewEmoji(e.target.value)}
                    placeholder="😀"
                    maxLength={2}
                    style={{
                      width: 56,
                      borderRadius: 8,
                      padding: '8px',
                      textAlign: 'center',
                      fontSize: 14,
                      outline: 'none',
                      border: '1.5px solid var(--border)',
                      background: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                  />
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => { setNewName(e.target.value); setHabitError(null); }}
                    onKeyDown={(e) => e.key === 'Enter' && addHabit()}
                    placeholder="New habit name…"
                    style={{
                      flex: 1,
                      borderRadius: 8,
                      padding: '8px 12px',
                      fontSize: 14,
                      outline: 'none',
                      border: `1.5px solid ${habitError ? 'var(--text-overdue)' : 'var(--border)'}`,
                      background: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = habitError ? 'var(--text-overdue)' : 'var(--accent)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = habitError ? 'var(--text-overdue)' : 'var(--border)')}
                  />
                  <button
                    onClick={addHabit}
                    style={{
                      borderRadius: 8,
                      padding: '8px 12px',
                      fontSize: 14,
                      fontWeight: 500,
                      color: 'white',
                      background: 'var(--accent)',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--accent)')}
                  >
                    Add
                  </button>
                </div>

                {/* Type selector */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <label style={{ fontSize: 13, color: 'var(--text-secondary)', minWidth: 40 }}>Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as TrackingType)}
                    style={{
                      flex: 1,
                      borderRadius: 8,
                      padding: '6px 10px',
                      fontSize: 13,
                      border: '1.5px solid var(--border)',
                      background: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                    }}
                  >
                    {TRACKING_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* Goal and Unit for numeric types */}
                {(newType === 'count' || newType === 'duration' || newType === 'amount') && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flex: 1 }}>
                      <label style={{ fontSize: 13, color: 'var(--text-secondary)', minWidth: 40 }}>Goal</label>
                      <input
                        type="number"
                        min={0}
                        value={newGoal}
                        onChange={(e) => setNewGoal(e.target.value)}
                        placeholder="Optional"
                        style={{
                          flex: 1,
                          borderRadius: 8,
                          padding: '6px 10px',
                          fontSize: 13,
                          border: '1.5px solid var(--border)',
                          background: 'var(--bg-input)',
                          color: 'var(--text-primary)',
                          outline: 'none',
                        }}
                      />
                    </div>
                    {newType === 'amount' && (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flex: 1 }}>
                        <label style={{ fontSize: 13, color: 'var(--text-secondary)', minWidth: 40 }}>Unit</label>
                        <input
                          type="text"
                          value={newUnit}
                          onChange={(e) => setNewUnit(e.target.value)}
                          placeholder="e.g. km"
                          style={{
                            flex: 1,
                            borderRadius: 8,
                            padding: '6px 10px',
                            fontSize: 13,
                            border: '1.5px solid var(--border)',
                            background: 'var(--bg-input)',
                            color: 'var(--text-primary)',
                            outline: 'none',
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {habitError && (
                <p style={{ marginBottom: 16, fontSize: 12, color: 'var(--text-overdue)' }}>{habitError}</p>
              )}
              {!habitError && <div style={{ marginBottom: 16 }} />}

              {/* Drag-and-drop list */}
              {habits.length === 0 ? (
                <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Add your first habit above.</p>
              ) : (
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="habits">
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
                      >
                        {habits.map((habit, index) => (
                          <Draggable key={habit.id} draggableId={habit.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 12,
                                  borderRadius: 8,
                                  padding: '10px 12px',
                                  border: `1px solid ${snapshot.isDragging ? 'var(--border)' : 'transparent'}`,
                                  background: snapshot.isDragging ? 'var(--bg-card)' : 'var(--bg-input)',
                                  boxShadow: snapshot.isDragging ? 'var(--shadow-md)' : undefined,
                                }}
                              >
                                <span
                                  {...provided.dragHandleProps}
                                  style={{ color: 'var(--text-muted)', cursor: 'grab' }}
                                >
                                  ⠿
                                </span>
                                {habit.emoji && (
                                  <span style={{ fontSize: 18, lineHeight: 1 }}>{habit.emoji}</span>
                                )}
                                <span style={{ flex: 1, fontSize: 14, color: 'var(--text-primary)' }}>
                                  {habit.name}
                                </span>
                                <span style={{ fontSize: 12, color: 'var(--text-muted)', marginRight: 8 }}>
                                  {TRACKING_TYPES.find((t) => t.value === habit.trackingType)?.label ?? habit.trackingType}
                                </span>
                                {confirmDeleteId === habit.id ? (
                                  <span data-confirm-delete style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    {deleteError && (
                                      <span style={{ fontSize: 11, color: 'var(--text-overdue)' }}>{deleteError}</span>
                                    )}
                                    <button
                                      onClick={() => deleteHabit(habit.id)}
                                      style={{ fontSize: 12, color: 'var(--text-overdue)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px 4px', borderRadius: 4 }}
                                    >
                                      Delete
                                    </button>
                                    <button
                                      onClick={() => { setConfirmDeleteId(null); setDeleteError(null); }}
                                      style={{ fontSize: 12, color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px 4px', borderRadius: 4 }}
                                    >
                                      Cancel
                                    </button>
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => { setConfirmDeleteId(habit.id); setDeleteError(null); }}
                                    style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16 }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-overdue)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                                    aria-label="Delete habit"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
