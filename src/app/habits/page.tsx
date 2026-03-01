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

  const today = todayISO();

  const loadData = useCallback(async () => {
    const [{ data: habitData }, { data: logData }, { data: allLogs }] = await Promise.all([
      supabase.from('habits').select('*').order('sort_order'),
      supabase.from('habit_logs').select('habit_id').eq('completed_on', today),
      supabase.from('habit_logs').select('completed_on'),
    ]);

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
    setLoading(false);
  }, [today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshStreaks = useCallback(async (currentHabitCount: number) => {
    const { data: allLogs } = await supabase.from('habit_logs').select('completed_on');
    if (allLogs) setStreaks(calculateStreaks(allLogs, currentHabitCount));
  }, []);

  const toggleHabit = async (habitId: string) => {
    if (checked.has(habitId)) {
      await supabase.from('habit_logs').delete().eq('habit_id', habitId).eq('completed_on', today);
      setChecked((prev) => {
        const next = new Set(prev);
        next.delete(habitId);
        return next;
      });
    } else {
      await supabase.from('habit_logs').insert([{ habit_id: habitId, completed_on: today }]);
      setChecked((prev) => new Set(prev).add(habitId));
    }
    refreshStreaks(habits.length);
  };

  const addHabit = async () => {
    const name = newName.trim();
    if (!name) return;
    const maxOrder = habits.length ? Math.max(...habits.map((h) => h.sortOrder)) : -1;
    const { data, error } = await supabase
      .from('habits')
      .insert([{ name, emoji: newEmoji.trim() || null, sort_order: maxOrder + 1 }])
      .select()
      .single();
    if (!error && data) {
      setHabits((prev) => [
        ...prev,
        { id: data.id, name: data.name, emoji: data.emoji ?? undefined, sortOrder: data.sort_order, createdAt: new Date(data.created_at) },
      ]);
      setNewName('');
      setNewEmoji('');
    }
  };

  const deleteHabit = async (id: string) => {
    if (!confirm('Delete this habit? Historical logs will be kept.')) return;
    await supabase.from('habits').delete().eq('id', id);
    setHabits((prev) => prev.filter((h) => h.id !== id));
    setChecked((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(habits);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    const updated = reordered.map((h, i) => ({ ...h, sortOrder: i }));
    setHabits(updated);
    // Persist new sort order
    await Promise.all(
      updated.map((h) =>
        supabase.from('habits').update({ sort_order: h.sortOrder }).eq('id', h.id)
      )
    );
  };

  const completedCount = habits.filter((h) => checked.has(h.id)).length;
  const total = habits.length;

  return (
    <div className="max-w-xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Habits</h1>
          {!loading && total > 0 && (
            <p className="mt-0.5 text-sm text-gray-400">
              {completedCount} of {total} done today
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          {!loading && (streaks.current > 0 || streaks.best > 0) && (
            <div className="flex gap-3 text-sm text-gray-700">
              <span title="Current streak">🔥 {streaks.current}d</span>
              <span title="Best streak" className="text-gray-400">🏆 {streaks.best}d</span>
            </div>
          )}
          <button
            onClick={() => setShowSettings((v) => !v)}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 ${
              showSettings
                ? 'bg-gray-900 text-white'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            {showSettings ? 'Done' : 'Manage'}
          </button>
        </div>
      </div>

      {!loading && <HabitCalendar habitCount={habits.length} />}

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : (
        <>
          {/* Daily checklist */}
          {!showSettings && (
            <div>
              {habits.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No habits yet. Click <strong>Manage</strong> to add some.
                </p>
              ) : (
                <div className="flex flex-col gap-1">
                  {habits.map((habit) => {
                    const done = checked.has(habit.id);
                    return (
                      <button
                        key={habit.id}
                        onClick={() => toggleHabit(habit.id)}
                        className="flex items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                      >
                        <span
                          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                            done
                              ? 'border-green-400 bg-green-400'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {done && (
                            <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        {habit.emoji && (
                          <span className="text-lg leading-none">{habit.emoji}</span>
                        )}
                        <span
                          className={`text-sm font-medium ${
                            done ? 'text-gray-400 line-through' : 'text-gray-800'
                          }`}
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

          {/* Health log — only shown on checklist view */}
          {!showSettings && <HealthLog />}

          {/* Settings / manage panel */}
          {showSettings && (
            <div>
              {/* Add new habit */}
              <div className="mb-6 flex gap-2">
                <input
                  type="text"
                  value={newEmoji}
                  onChange={(e) => setNewEmoji(e.target.value)}
                  placeholder="😀"
                  maxLength={2}
                  className="w-14 rounded-lg border border-gray-200 bg-gray-50 px-2 py-2 text-center text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                />
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addHabit()}
                  placeholder="New habit name…"
                  className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                />
                <button
                  onClick={addHabit}
                  className="rounded-lg bg-gray-900 px-3 py-2 text-sm text-white transition-colors hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
                >
                  Add
                </button>
              </div>

              {/* Drag-and-drop list */}
              {habits.length === 0 ? (
                <p className="text-sm text-gray-400">Add your first habit above.</p>
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
                                className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${
                                  snapshot.isDragging
                                    ? 'border-gray-300 bg-white shadow-md'
                                    : 'border-transparent bg-gray-50'
                                }`}
                              >
                                {/* Drag handle */}
                                <span
                                  {...provided.dragHandleProps}
                                  className="cursor-grab text-gray-300 hover:text-gray-500"
                                >
                                  ⠿
                                </span>
                                {habit.emoji && (
                                  <span className="text-lg leading-none">{habit.emoji}</span>
                                )}
                                <span className="flex-1 text-sm text-gray-800">{habit.name}</span>
                                <button
                                  onClick={() => deleteHabit(habit.id)}
                                  className="text-gray-300 hover:text-red-500"
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
