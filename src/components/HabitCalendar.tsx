'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { calculateStreaks } from '@/lib/streaks';

type DayData = {
  date: string; // YYYY-MM-DD
  count: number;
  total: number;
  habits: string[];
};

function colourForPct(pct: number | null): string {
  if (pct === null || pct === 0) return 'var(--habit-grey)';
  if (pct < 0.2) return 'var(--habit-red)';
  if (pct < 0.6) return 'var(--habit-amber)';
  if (pct < 1) return 'var(--habit-lgreen)';
  return 'var(--habit-green)';
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year: number, month: number): number {
  // 0 = Sunday; shift so Monday = 0
  return (new Date(year, month, 1).getDay() + 6) % 7;
}

type Props = { habitCount: number; fullScreen?: boolean };

export default function HabitCalendar({ habitCount, fullScreen }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [dayData, setDayData] = useState<Map<string, DayData>>(new Map());
  const [tooltip, setTooltip] = useState<{ date: string; data: DayData } | null>(null);
  const [popover, setPopover] = useState<{ date: string; data: DayData } | null>(null);
  const [streaks, setStreaks] = useState<{ current: number; best: number }>({ current: 0, best: 0 });
  const popoverRef = useRef<HTMLDivElement>(null);

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

  const loadStreaks = useCallback(async () => {
    if (!fullScreen) return;
    try {
      const { data: allLogs } = await supabase.from('habit_logs').select('completed_on');
      if (allLogs) {
        const result = calculateStreaks(allLogs, habitCount);
        setStreaks(result);
      }
    } catch { /* ignore */ }
  }, [fullScreen, habitCount]);

  useEffect(() => {
    loadMonth();
  }, [loadMonth]);

  useEffect(() => {
    loadStreaks();
  }, [loadStreaks]);

  // Close popover on outside click
  useEffect(() => {
    if (!popover) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopover(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [popover]);

  const prevMonth = () => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  };
  const goToday = () => {
    setYear(now.getFullYear());
    setMonth(now.getMonth());
  };

  const totalDays = daysInMonth(year, month);
  const startOffset = firstDayOfMonth(year, month);
  const monthName = new Date(year, month).toLocaleString('en-GB', { month: 'long', year: 'numeric' });

  const totalCells = startOffset + totalDays;
  const numWeekRows = Math.ceil(totalCells / 7);

  const todayStr = new Date().toISOString().slice(0, 10);

  if (fullScreen) {
    return (
      <div style={{ width: '100%' }}>
        {/* Streak cards */}
        {(streaks.current > 0 || streaks.best > 0) && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <div
              style={{
                flex: 1,
                borderRadius: 12,
                padding: '16px 20px',
                background: 'var(--bg-card)',
                boxShadow: 'var(--shadow-dropdown)',
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                🔥 Current Streak
              </p>
              <p style={{ fontSize: 36, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                {streaks.current}<span style={{ fontSize: 18, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 4 }}>days</span>
              </p>
            </div>
            <div
              style={{
                flex: 1,
                borderRadius: 12,
                padding: '16px 20px',
                background: 'var(--bg-card)',
                boxShadow: 'var(--shadow-dropdown)',
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                🏆 Best Streak
              </p>
              <p style={{ fontSize: 36, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                {streaks.best}<span style={{ fontSize: 18, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 4 }}>days</span>
              </p>
            </div>
          </div>
        )}

        {/* Month navigation */}
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={prevMonth}
            style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >◀</button>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-secondary)' }}>{monthName}</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={goToday}
              style={{
                fontSize: 13,
                color: 'var(--text-accent)',
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '3px 10px',
                cursor: 'pointer',
              }}
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >▶</button>
          </div>
        </div>

        {/* Day-of-week headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4, textAlign: 'center' }}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <span key={i} style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d}</span>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`e-${i}`} />
          ))}
          {Array.from({ length: totalDays }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const data = dayData.get(dateStr);
            const pct = data && habitCount > 0 ? data.count / habitCount : null;
            const colour = colourForPct(pct);
            const isToday = dateStr === todayStr;
            const cellHeight = `calc((100vh - 280px) / ${numWeekRows})`;

            return (
              <div
                key={day}
                style={{ position: 'relative' }}
                ref={popover?.date === dateStr ? popoverRef : undefined}
              >
                <div
                  onClick={() => data && setPopover(popover?.date === dateStr ? null : { date: dateStr, data })}
                  style={{
                    height: cellHeight,
                    minHeight: 48,
                    width: '100%',
                    borderRadius: 6,
                    backgroundColor: colour,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: data ? 'pointer' : 'default',
                    outline: isToday ? '2px solid var(--accent)' : undefined,
                    outlineOffset: isToday ? 2 : undefined,
                    transition: 'opacity 80ms',
                    position: 'relative',
                    padding: 4,
                  }}
                >
                  <span style={{ position: 'absolute', top: 4, left: 6, fontSize: 13, color: pct && pct >= 0.6 ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)' }}>
                    {day}
                  </span>
                  {data && habitCount > 0 && (
                    <span style={{ fontSize: 12, color: pct && pct >= 0.6 ? 'white' : 'var(--text-secondary)', marginTop: 12 }}>
                      {data.count}/{habitCount}
                    </span>
                  )}
                </div>

                {/* Popover */}
                {popover?.date === dateStr && popover.data && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 'calc(100% + 4px)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'var(--bg-modal)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      padding: '8px 12px',
                      zIndex: 50,
                      minWidth: 140,
                      boxShadow: 'var(--shadow-dropdown)',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                      {popover.data.count}/{habitCount} habits
                    </p>
                    {popover.data.habits.map((h) => (
                      <p key={h} style={{ fontSize: 12, color: 'var(--text-muted)' }}>· {h}</p>
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

  // Regular (small) calendar
  return (
    <div style={{ marginBottom: 32 }}>
      {/* Month navigation */}
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={prevMonth}
          style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4 }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >◀</button>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>{monthName}</span>
        <button
          onClick={nextMonth}
          style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4 }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >▶</button>
      </div>

      {/* Day-of-week headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4, textAlign: 'center' }}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <span key={i} style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d}</span>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}
        {Array.from({ length: totalDays }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const data = dayData.get(dateStr);
          const pct = data && habitCount > 0 ? data.count / habitCount : null;
          const colour = colourForPct(pct);
          const isToday = dateStr === todayStr;

          return (
            <div
              key={day}
              style={{ position: 'relative' }}
              onMouseEnter={() => data && setTooltip({ date: dateStr, data })}
              onMouseLeave={() => setTooltip(null)}
            >
              <div
                style={{
                  height: 36,
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 500,
                  backgroundColor: colour,
                  color: pct && pct >= 0.6 ? '#fff' : 'var(--text-secondary)',
                  outline: isToday ? '2px solid var(--text-muted)' : undefined,
                  outlineOffset: isToday ? 1 : undefined,
                  cursor: data ? 'pointer' : 'default',
                  transition: 'opacity 80ms',
                }}
              >
                {day}
              </div>

              {/* Tooltip */}
              {tooltip?.date === dateStr && tooltip.data && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 4px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--text-primary)',
                    borderRadius: 8,
                    padding: '6px 10px',
                    zIndex: 10,
                    minWidth: 144,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    color: 'white',
                    fontSize: 12,
                    pointerEvents: 'none',
                  }}
                >
                  <p style={{ marginBottom: 4, fontWeight: 500 }}>{tooltip.data.count}/{habitCount} habits</p>
                  {tooltip.data.habits.map((h) => (
                    <p key={h} style={{ color: 'rgba(255,255,255,0.7)' }}>· {h}</p>
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
