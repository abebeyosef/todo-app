'use client';

import { useEffect, useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { supabase } from '@/lib/supabase';
import { Habit } from '@/types/habit';
import HabitCalendar from '@/components/HabitCalendar';
import HealthLog from '@/components/HealthLog';
import { calculateStreaks, StreakResult } from '@/lib/streaks';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [streaks, setStreaks] = useState<StreakResult>({ current: 0, best: 0 });
  const [showSettings, setShowSettings] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('');
  const [habitError, setHabitError] = useState<string | null>(null);

  const today = todayISO();

  const loadData = useCallback(async () => {
    try {
      const [{ data: habitData, error: hErr }, { data: logData, error: lErr }, { data: allLogs, error: aErr }] = await Promise.all([
        supabase.from('habits').select('*').order('sort_order'),
        supabase.from('habit_logs').select('habit_id').eq('completed_on', today),
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
          }))
        );
      }
      if (logData) {
        setChecked(new Set(logData.map((l) => l.habit_id)));
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

  const refreshStreaks = useCallback(async (currentHabitCount: number) => {
    try {
      const { data: allLogs, error } = await supabase.from('habit_logs').select('completed_on');
      if (error) { console.error('Failed to load streak data:', error); return; }
      if (allLogs) setStreaks(calculateStreaks(allLogs, currentHabitCount));
    } catch (err) {
      console.error('Unexpected error refreshing streaks:', err);
    }
  }, []);

  const toggleHabit = async (habitId: string) => {
    try {
      if (checked.has(habitId)) {
        const { error } = await supabase.from('habit_logs').delete().eq('habit_id', habitId).eq('completed_on', today);
        if (error) { console.error('Failed to uncheck habit:', error); return; }
        setChecked((prev) => {
          const next = new Set(prev);
          next.delete(habitId);
          return next;
        });
      } else {
        const { error } = await supabase.from('habit_logs').insert([{ habit_id: habitId, completed_on: today }]);
        if (error) { console.error('Failed to check habit:', error); return; }
        setChecked((prev) => new Set(prev).add(habitId));
      }
      refreshStreaks(habits.length);
    } catch (err) {
      console.error('Unexpected error toggling habit:', err);
    }
  };

  const addHabit = async () => {
    const name = newName.trim();
    if (!name) return;
    setHabitError(null);
    try {
      const maxOrder = habits.length ? Math.max(...habits.map((h) => h.sortOrder)) : -1;
      const { data, error } = await supabase
        .from('habits')
        .insert([{ name, emoji: newEmoji.trim() || null, sort_order: maxOrder + 1 }])
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
          { id: data.id, name: data.name, emoji: data.emoji ?? undefined, sortOrder: data.sort_order, createdAt: new Date(data.created_at) },
        ]);
        setNewName('');
        setNewEmoji('');
      }
    } catch (err) {
      console.error('Unexpected error adding habit:', err);
      setHabitError("Couldn't add habit — please try again.");
    }
  };

  const deleteHabit = async (id: string) => {
    if (!confirm('Delete this habit? Historical logs will be kept.')) return;
    try {
      const { error } = await supabase.from('habits').delete().eq('id', id);
      if (error) { console.error('Failed to delete habit:', error); return; }
      setHabits((prev) => prev.filter((h) => h.id !== id));
      setChecked((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (err) {
      console.error('Unexpected error deleting habit:', err);
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

  const completedCount = habits.filter((h) => checked.has(h.id)).length;
  const total = habits.length;

  return (
    <div style={{ maxWidth: 600 }}>
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Habits</h1>
          {!loading && total > 0 && (
            <p className="mt-0.5 text-sm" style={{ color: 'var(--text-muted)' }}>
              {completedCount} of {total} done today
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Streak cards */}
          {!loading && (streaks.current > 0 || streaks.best > 0) && (
            <div className="flex gap-2">
              <div
                className="rounded-xl px-3 py-2 text-center"
                style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)', minWidth: 72 }}
              >
                <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Streak
                </p>
                <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                  🔥 {streaks.current}d
                </p>
              </div>
              <div
                className="rounded-xl px-3 py-2 text-center"
                style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)', minWidth: 72 }}
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
            className="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none"
            style={{
              background: showSettings ? 'var(--accent)' : 'var(--bg-hover)',
              color: showSettings ? '#fff' : 'var(--text-secondary)',
            }}
          >
            {showSettings ? 'Done' : 'Manage'}
          </button>
        </div>
      </div>

      {!loading && <HabitCalendar habitCount={habits.length} />}

      {loading ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</p>
      ) : (
        <>
          {/* Daily checklist */}
          {!showSettings && (
            <div>
              {habits.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  No habits set up yet. Add your first one below.
                </p>
              ) : (
                <div className="flex flex-col">
                  {habits.map((habit) => {
                    const done = checked.has(habit.id);
                    return (
                      <button
                        key={habit.id}
                        onClick={() => toggleHabit(habit.id)}
                        className="flex items-center gap-3 rounded-lg px-2 text-left transition-colors hover:bg-[var(--bg-hover)] focus:outline-none"
                        style={{ minHeight: 44, borderBottom: '1px solid var(--divider)' }}
                      >
                        <span
                          className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors"
                          style={{
                            borderColor: done ? '#16a34a' : 'var(--border)',
                            background: done ? '#16a34a' : 'transparent',
                          }}
                        >
                          {done && (
                            <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        {habit.emoji && (
                          <span className="text-lg leading-none">{habit.emoji}</span>
                        )}
                        <span
                          className="text-sm font-medium"
                          style={{
                            color: done ? 'var(--text-muted)' : 'var(--text-primary)',
                            textDecoration: done ? 'line-through' : undefined,
                          }}
                        >
                          {habit.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Health log */}
          {!showSettings && <HealthLog />}

          {/* Settings / manage panel */}
          {showSettings && (
            <div>
              {/* Add new habit */}
              <div className="mb-2 flex gap-2">
                <input
                  type="text"
                  value={newEmoji}
                  onChange={(e) => setNewEmoji(e.target.value)}
                  placeholder="😀"
                  maxLength={2}
                  className="w-14 rounded-lg px-2 py-2 text-center text-sm outline-none transition-all"
                  style={{ border: '1.5px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                />
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => { setNewName(e.target.value); setHabitError(null); }}
                  onKeyDown={(e) => e.key === 'Enter' && addHabit()}
                  placeholder="New habit name…"
                  className="flex-1 rounded-lg px-3 py-2 text-sm outline-none transition-all"
                  style={{ border: `1.5px solid ${habitError ? 'var(--p1)' : 'var(--border)'}`, background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = habitError ? 'var(--p1)' : 'var(--accent)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = habitError ? 'var(--p1)' : 'var(--border)')}
                />
                <button
                  onClick={addHabit}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors focus:outline-none"
                  style={{ background: 'var(--accent)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--accent)')}
                >
                  Add
                </button>
              </div>
              {habitError && (
                <p className="mb-4 text-xs" style={{ color: 'var(--p1)' }}>{habitError}</p>
              )}
              {!habitError && <div className="mb-4" />}

              {/* Drag-and-drop list */}
              {habits.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Add your first habit above.</p>
              ) : (
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="habits">
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="flex flex-col gap-1"
                      >
                        {habits.map((habit, index) => (
                          <Draggable key={habit.id} draggableId={habit.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="flex items-center gap-3 rounded-lg px-3 py-2.5"
                                style={{
                                  // draggableProps.style MUST come first so transforms work
                                  ...provided.draggableProps.style,
                                  border: `1px solid ${snapshot.isDragging ? 'var(--border)' : 'transparent'}`,
                                  background: snapshot.isDragging ? 'var(--bg-card)' : 'var(--bg-input)',
                                  boxShadow: snapshot.isDragging ? 'var(--shadow-md)' : undefined,
                                }}
                              >
                                <span
                                  {...provided.dragHandleProps}
                                  className="cursor-grab"
                                  style={{ color: 'var(--text-muted)' }}
                                >
                                  ⠿
                                </span>
                                {habit.emoji && (
                                  <span className="text-lg leading-none">{habit.emoji}</span>
                                )}
                                <span className="flex-1 text-sm" style={{ color: 'var(--text-primary)' }}>
                                  {habit.name}
                                </span>
                                <button
                                  onClick={() => deleteHabit(habit.id)}
                                  className="transition-colors focus:outline-none"
                                  style={{ color: 'var(--text-muted)' }}
                                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--p1)')}
                                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                                  aria-label="Delete habit"
                                >
                                  ×
                                </button>
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
