'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

type HealthData = {
  sleep_hours: number | null;
  mood_score: number | null;
  water_litres: number | null;
};

const MOODS = [
  { value: 1, label: '😞' },
  { value: 2, label: '😕' },
  { value: 3, label: '😐' },
  { value: 4, label: '🙂' },
  { value: 5, label: '😄' },
];

export default function HealthLog() {
  const [today, setToday] = useState(() => new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<HealthData>({ sleep_hours: null, mood_score: null, water_litres: null });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setData({ sleep_hours: null, mood_score: null, water_litres: null });
    supabase
      .from('health_logs')
      .select('sleep_hours, mood_score, water_litres')
      .eq('logged_on', today)
      .maybeSingle()
      .then(({ data: row }) => { if (row) setData(row as HealthData); });
  }, [today]);

  // Detect day change on window focus and reset selectors
  useEffect(() => {
    const checkDate = () => {
      const d = new Date().toISOString().slice(0, 10);
      setToday(prev => prev !== d ? d : prev);
    };
    window.addEventListener('focus', checkDate);
    return () => window.removeEventListener('focus', checkDate);
  }, []);

  const scheduleUpsert = (merged: HealthData) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSaving(true);
    setSaved(false);
    debounceRef.current = setTimeout(async () => {
      await supabase.from('health_logs').upsert({ logged_on: today, ...merged }, { onConflict: 'logged_on' });
      setSaving(false);
      setSaved(true);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setSaved(false), 1500);
    }, 500);
  };

  const handleChange = (update: Partial<HealthData>) => {
    const merged = { ...data, ...update };
    setData(merged); // optimistic update
    scheduleUpsert(merged);
  };

  return (
    <div
      className="mt-8 rounded-xl p-5"
      style={{ border: '1px solid var(--border)', background: 'var(--bg-input)' }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Daily Health Log</h2>
        {saved ? (
          <span style={{ fontSize: 12, color: '#16a34a' }}>Saved ✓</span>
        ) : saving ? (
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Saving…</span>
        ) : null}
      </div>

      <div className="flex flex-col gap-5">
        {/* Sleep */}
        <div className="flex items-center justify-between gap-4">
          <label className="text-sm" style={{ color: 'var(--text-secondary)' }}>😴 Sleep</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0} max={24} step={0.5}
              value={data.sleep_hours ?? ''}
              onChange={(e) => handleChange({ sleep_hours: e.target.value ? parseFloat(e.target.value) : null })}
              placeholder="0"
              className="w-20 rounded-lg px-3 py-1.5 text-right text-sm outline-none transition-all"
              style={{ border: '1.5px solid var(--border)', background: 'var(--bg-modal)', color: 'var(--text-primary)' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
            <span className="w-6 text-sm" style={{ color: 'var(--text-muted)' }}>hrs</span>
          </div>
        </div>

        {/* Mood */}
        <div className="flex items-center justify-between gap-4">
          <label className="text-sm" style={{ color: 'var(--text-secondary)' }}>💭 Mood</label>
          <div className="flex gap-1">
            {MOODS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleChange({ mood_score: data.mood_score === value ? null : value })}
                className="rounded-lg px-2 py-1 text-lg transition-all focus:outline-none"
                style={{
                  transform: data.mood_score === value ? 'scale(1.1)' : undefined,
                  background: data.mood_score === value ? 'var(--bg-modal)' : 'transparent',
                  boxShadow: data.mood_score === value ? 'var(--shadow-dropdown)' : undefined,
                  opacity: data.mood_score === value ? 1 : 0.4,
                }}
                title={`Mood ${value}/5`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Water */}
        <div className="flex items-center justify-between gap-4">
          <label className="text-sm" style={{ color: 'var(--text-secondary)' }}>💧 Water</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0} max={10} step={0.25}
              value={data.water_litres ?? ''}
              onChange={(e) => handleChange({ water_litres: e.target.value ? parseFloat(e.target.value) : null })}
              placeholder="0"
              className="w-20 rounded-lg px-3 py-1.5 text-right text-sm outline-none transition-all"
              style={{ border: '1.5px solid var(--border)', background: 'var(--bg-modal)', color: 'var(--text-primary)' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
            <span className="w-6 text-sm" style={{ color: 'var(--text-muted)' }}>L</span>
          </div>
        </div>
      </div>
    </div>
  );
}
