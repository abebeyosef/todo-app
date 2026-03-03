'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, X, Plus, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ThemePicker from './ThemePicker';

const COLOUR_OPTIONS = [
  { name: 'Charcoal',         hex: '#374151' },
  { name: 'Berry Red',        hex: '#DC2626' },
  { name: 'Forest Green',     hex: '#16A34A' },
  { name: 'Sky Blue',         hex: '#0891B2' },
  { name: 'Grape Purple',     hex: '#7C3AED' },
  { name: 'Tangerine Orange', hex: '#D97706' },
  { name: 'Salmon Pink',      hex: '#F472B6' },
];

type BrowseProject = {
  id: string;
  name: string;
  colour: string;
  taskCount: number;
};

type Props = {
  onClose: () => void;
};

export default function BrowseScreen({ onClose }: Props) {
  const router = useRouter();
  const [projects, setProjects] = useState<BrowseProject[]>([]);
  const [showAddProject, setShowAddProject] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColour, setNewColour] = useState(COLOUR_OPTIONS[0].hex);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const loadProjects = useCallback(async () => {
    const [{ data: projectData }, { data: taskData }] = await Promise.all([
      supabase.from('projects').select('*').order('created_at'),
      supabase.from('tasks').select('project_id').eq('completed', false),
    ]);
    const counts: Record<string, number> = {};
    for (const t of taskData ?? []) {
      if (t.project_id) counts[t.project_id] = (counts[t.project_id] ?? 0) + 1;
    }
    if (projectData) {
      setProjects(
        projectData
          .filter((p: { name: string }) => p.name.toLowerCase() !== 'inbox')
          .map((p: { id: string; name: string; colour: string }) => ({
            id: p.id,
            name: p.name,
            colour: p.colour,
            taskCount: counts[p.id] ?? 0,
          }))
      );
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Focus name input when form opens
  useEffect(() => {
    if (showAddProject) {
      setTimeout(() => nameInputRef.current?.focus(), 50);
    }
  }, [showAddProject]);

  const openAddForm = () => {
    setNewName('');
    setNewColour(COLOUR_OPTIONS[0].hex);
    setProjectError(null);
    setShowAddProject(true);
  };

  const cancelAdd = () => {
    setShowAddProject(false);
    setProjectError(null);
  };

  const submitAdd = async () => {
    const name = newName.trim();
    if (!name) { setProjectError('Please enter a project name.'); return; }
    setSaving(true);
    setProjectError(null);
    const { error } = await supabase.from('projects').insert([{ name, colour: newColour }]);
    setSaving(false);
    if (error) {
      setProjectError(`Couldn't save: ${error.message}`);
      return;
    }
    setShowAddProject(false);
    loadProjects();
    window.dispatchEvent(new Event('tasks-changed'));
  };

  const handleSearchTap = () => {
    window.dispatchEvent(new Event('open-search'));
  };

  const handleUpcoming = () => {
    router.push('/?view=upcoming');
    onClose();
  };

  const handleProject = (id: string) => {
    router.push(`/?project=${id}`);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 64,
        background: 'var(--bg-main)',
        zIndex: 200,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px 20px 12px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', flex: 1 }}>
          Browse
        </span>
        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
          aria-label="Close"
        >
          <X size={22} />
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
        <button
          onClick={handleSearchTap}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            width: '100%',
            height: 44,
            borderRadius: 10,
            background: 'var(--bg-input)',
            border: '1px solid var(--border)',
            padding: '0 14px',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <Search size={16} color="var(--text-muted)" />
          <span style={{ fontSize: 15, color: 'var(--text-muted)' }}>Search tasks…</span>
        </button>
      </div>

      {/* Upcoming */}
      <button
        onClick={handleUpcoming}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          width: '100%',
          minHeight: 52,
          padding: '0 20px',
          background: 'transparent',
          border: 'none',
          borderBottom: '1px solid var(--border)',
          cursor: 'pointer',
          textAlign: 'left',
          fontSize: 16,
          color: 'var(--text-primary)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover-row)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <Calendar size={20} color="var(--text-muted)" />
        Upcoming
      </button>

      {/* Appearance */}
      <div style={{ borderBottom: '1px solid var(--border)' }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            padding: '16px 20px 4px',
            margin: 0,
          }}
        >
          Appearance
        </p>
        <div style={{ padding: '0 8px 8px' }}>
          <ThemePicker />
        </div>
      </div>

      {/* My Projects */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px 8px' }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              flex: 1,
              margin: 0,
            }}
          >
            My Projects
          </p>
          {!showAddProject && (
            <button
              onClick={openAddForm}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
              aria-label="Add project"
            >
              <Plus size={18} />
            </button>
          )}
        </div>

        {/* Inline add-project form */}
        {showAddProject && (
          <div style={{ padding: '4px 20px 16px' }}>
            <input
              ref={nameInputRef}
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitAdd(); if (e.key === 'Escape') cancelAdd(); }}
              placeholder="Project name"
              maxLength={120}
              style={{
                display: 'block',
                width: '100%',
                fontSize: 15,
                padding: '10px 12px',
                border: '1px solid var(--border-input)',
                borderRadius: 8,
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                outline: 'none',
                marginBottom: 10,
                boxSizing: 'border-box',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-input)')}
            />

            {/* Colour swatches */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {COLOUR_OPTIONS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setNewColour(c.hex)}
                  title={c.name}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: c.hex,
                    border: newColour === c.hex ? '3px solid var(--text-primary)' : '2px solid transparent',
                    cursor: 'pointer',
                    padding: 0,
                    outline: 'none',
                  }}
                />
              ))}
            </div>

            {projectError && (
              <p style={{ fontSize: 12, color: 'var(--p1)', marginBottom: 8 }}>{projectError}</p>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={submitAdd}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '9px 0',
                  background: 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: saving ? 'default' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? 'Saving…' : 'Create'}
              </button>
              <button
                onClick={cancelAdd}
                style={{
                  flex: 1,
                  padding: '9px 0',
                  background: 'var(--bg-hover-row)',
                  color: 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {projects.length === 0 && !showAddProject ? (
          <p style={{ fontSize: 14, color: 'var(--text-muted)', padding: '4px 20px 16px', margin: 0 }}>
            No projects yet
          </p>
        ) : (
          projects.map((p) => (
            <button
              key={p.id}
              onClick={() => handleProject(p.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                width: '100%',
                minHeight: 52,
                padding: '0 20px',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--border)',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: 15,
                color: 'var(--text-primary)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover-row)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: p.colour,
                  flexShrink: 0,
                }}
              />
              <span style={{ flex: 1 }}># {p.name}</span>
              {p.taskCount > 0 && (
                <span
                  style={{
                    fontSize: 12,
                    color: 'var(--text-muted)',
                    background: 'var(--bg-input)',
                    borderRadius: 10,
                    padding: '2px 8px',
                    flexShrink: 0,
                  }}
                >
                  {p.taskCount}
                </span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
