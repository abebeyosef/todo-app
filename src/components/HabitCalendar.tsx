'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

type DayData = {
  date: string; // YYYY-MM-DD
  count: number;
  total: number;
  habits: string[];
};

function colourForPct(pct: number | null): string {
  if (pct === null) return 'bg-gray-100';
  if (pct === 0) return 'bg-gray-100';
  if (pct < 0.2) return 'bg-red-300';
  if (pct < 0.6) return 'bg-amber-300';
  if (pct < 1) return 'bg-green-200';
  return 'bg-green-400';
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year: number, month: number): number {
  // 0 = Sunday; shift so Monday = 0
  return (new Date(year, month, 1).getDay() + 6) % 7;
}

type Props = { habitCount: number };

export default function HabitCalendar({ habitCount }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [dayData, setDayData] = useState<Map<string, DayData>>(new Map());
  const [tooltip, setTooltip] = useState<{ date: string; data: DayData } | null>(null);

  const loadMonth = useCallback(async () => {
    const start = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const lastDay = daysInMonth(year, month);
    const end = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const { data: logs } = await supabase
      .from('habit_logs')
      .select('habit_id, completed_on, habits(name)')
      .gte('completed_on', start)
      .lte('completed_on', end);

    const map = new Map<string, DayData>();
    for (const log of logs ?? []) {
      const d = log.completed_on as string;
      if (!map.has(d)) map.set(d, { date: d, count: 0, total: habitCount, habits: [] });
      const entry = map.get(d)!;
      entry.count += 1;
      const habitRow = log.habits as { name: string } | { name: string }[] | null;
      const habitName = Array.isArray(habitRow) ? habitRow[0]?.name : habitRow?.name;
      if (habitName) entry.habits.push(habitName);
    }
    setDayData(map);
  }, [year, month, habitCount]);

  useEffect(() => {
    loadMonth();
  }, [loadMonth]);

  const prevMonth = () => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  };

  const totalDays = daysInMonth(year, month);
  const startOffset = firstDayOfMonth(year, month);
  const monthName = new Date(year, month).toLocaleString('en-GB', { month: 'long', year: 'numeric' });

  return (
    <div className="mb-8">
      {/* Month navigation */}
      <div className="mb-3 flex items-center justify-between">
        <button onClick={prevMonth} className="rounded p-1 text-gray-400 hover:text-gray-700">◀</button>
        <span className="text-sm font-semibold text-gray-700">{monthName}</span>
        <button onClick={nextMonth} className="rounded p-1 text-gray-400 hover:text-gray-700">▶</button>
      </div>

      {/* Day-of-week headers */}
      <div className="mb-1 grid grid-cols-7 gap-1 text-center">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <span key={i} className="text-xs text-gray-400">{d}</span>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for offset */}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}
        {/* Day cells */}
        {Array.from({ length: totalDays }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const data = dayData.get(dateStr);
          const pct = data && habitCount > 0 ? data.count / habitCount : null;
          const colour = colourForPct(pct);
          const isToday = dateStr === new Date().toISOString().slice(0, 10);

          return (
            <div
              key={day}
              className="relative"
              onMouseEnter={() => data && setTooltip({ date: dateStr, data })}
              onMouseLeave={() => setTooltip(null)}
            >
              <div
                className={`flex h-9 w-full items-center justify-center rounded text-xs font-medium transition-colors ${colour} ${
                  isToday ? 'ring-2 ring-gray-400 ring-offset-1' : ''
                } ${data ? 'cursor-pointer' : ''}`}
              >
                {day}
              </div>

              {/* Tooltip */}
              {tooltip?.date === dateStr && tooltip.data && (
                <div className="absolute bottom-full left-1/2 z-10 mb-1 w-36 -translate-x-1/2 rounded-lg bg-gray-900 px-2 py-1.5 text-xs text-white shadow-lg">
                  <p className="mb-1 font-medium">{tooltip.data.count}/{habitCount} habits</p>
                  {tooltip.data.habits.map((h) => (
                    <p key={h} className="text-gray-300">· {h}</p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
