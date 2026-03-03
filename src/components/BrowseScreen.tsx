'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, X, Plus, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ThemePicker from './ThemePicker';
import ProjectModal from './ProjectModal';

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
  const [projectError, setProjectError] = useState<string | null>(null);

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

  const createProject = async (name: string, colour: string) => {
    setProjectError(null);
    const { error } = await supabase.from('projects').insert([{ name, colour }]);
    if (error) {
      setProjectError(`Couldn't save project: ${error.message}`);
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
    <>
      {showAddProject && (
        <ProjectModal
          onSave={createProject}
          onClose={() => setShowAddProject(false)}
          error={projectError}
        />
      )}

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
            <button
              onClick={() => { setProjectError(null); setShowAddProject(true); }}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
              aria-label="Add project"
            >
              <Plus size={18} />
            </button>
          </div>

          {projects.length === 0 ? (
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
    </>
  );
}
