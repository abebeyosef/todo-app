'use client';

import { useEffect, useState } from 'react';
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
  const today = new Date().toISOString().slice(0, 10);
  const [data, setData] = useState<HealthData>({ sleep_hours: null, mood_score: null, water_litres: null });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from('health_logs')
      .select('sleep_hours, mood_score, water_litres')
      .eq('logged_on', today)
      .maybeSingle()
      .then(({ data: row }) => { if (row) setData(row as HealthData); });
  }, [today]);

  const save = async (update: Partial<HealthData>) => {
    const merged = { ...data, ...update };
    setData(merged);
    setSaving(true);
    await supabase.from('health_logs').upsert({ logged_on: today, ...merged }, { onConflict: 'logged_on' });
    setSaving(false);
  };

  return (
    <div
      className="mt-8 rounded-xl p-5"
      style={{ border: '1px solid var(--border)', background: 'var(--bg-input)' }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Daily Health Log</h2>
        {saving && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Saving…</span>}
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
              onChange={(e) => save({ sleep_hours: e.target.value ? parseFloat(e.target.value) : null })}
              placeholder="0"
              className="w-20 rounded-lg px-3 py-1.5 text-right text-sm outline-none transition-all"
              style={{ border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
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
                onClick={() => save({ mood_score: data.mood_score === value ? null : value })}
                className="rounded-lg px-2 py-1 text-lg transition-all focus:outline-none"
                style={{
                  transform: data.mood_score === value ? 'scale(1.1)' : undefined,
                  background: data.mood_score === value ? 'var(--bg-card)' : 'transparent',
                  boxShadow: data.mood_score === value ? 'var(--shadow-sm)' : undefined,
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
              onChange={(e) => save({ water_litres: e.target.value ? parseFloat(e.target.value) : null })}
              placeholder="0"
              className="w-20 rounded-lg px-3 py-1.5 text-right text-sm outline-none transition-all"
              style={{ border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
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
