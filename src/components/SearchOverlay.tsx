'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type SearchTask = {
  id: string;
  name: string;
  scheduled_at: string | null;
  projects: { name: string; colour: string } | null;
};

type Props = {
  onClose: () => void;
  onSelectTask: (taskId: string) => void;
};

export default function SearchOverlay({ onClose, onSelectTask }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchTask[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setSearching(true);
    try {
      const { data } = await supabase
        .from('tasks')
        .select('id, name, scheduled_at, projects(name, colour)')
        .ilike('name', `%${q}%`)
        .eq('completed', false)
        .limit(20);
      setResults((data ?? []) as unknown as SearchTask[]);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 250);
  };

  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const isTomorrow = d.toDateString() === tomorrow.toDateString();
    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-modal)',
          borderRadius: 12,
          width: 560,
          maxHeight: '70vh',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '0 16px',
            borderBottom: '1px solid var(--divider)',
            position: 'relative',
          }}
        >
          <Search size={18} color="var(--text-muted)" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search tasks…"
            style={{
              flex: 1,
              padding: '16px 0',
              fontSize: 16,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
            }}
          />
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: 20,
              color: 'var(--text-muted)',
              lineHeight: 1,
              padding: '0 4px',
            }}
            aria-label="Close search"
          >
            ×
          </button>
        </div>

        {/* Results */}
        <div style={{ overflowY: 'auto', maxHeight: 'calc(70vh - 60px)' }}>
          {query.length < 2 ? (
            <div style={{ padding: '24px 16px', fontSize: 14, color: 'var(--text-muted)', textAlign: 'center' }}>
              Type to search…
            </div>
          ) : searching ? (
            <div style={{ padding: '24px 16px', fontSize: 14, color: 'var(--text-muted)', textAlign: 'center' }}>
              Searching…
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: '40px 16px', fontSize: 14, color: 'var(--text-muted)', textAlign: 'center' }}>
              No tasks matching &apos;{query}&apos;
            </div>
          ) : (
            results.map((task) => {
              const projectData = Array.isArray(task.projects) ? task.projects[0] : task.projects;
              return (
                <button
                  key={task.id}
                  onClick={() => { onSelectTask(task.id); onClose(); }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    width: '100%',
                    padding: '12px 16px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--divider)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    gap: 4,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover-row)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ fontSize: 15, color: 'var(--text-primary)' }}>{task.name}</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {projectData && (
                      <span style={{ fontSize: 13, color: projectData.colour, fontWeight: 500 }}>
                        # {projectData.name}
                      </span>
                    )}
                    {task.scheduled_at && (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {formatDate(task.scheduled_at)}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
