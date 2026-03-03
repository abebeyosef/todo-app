'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Sun, Calendar, FolderOpen, Activity, List, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Project } from '@/types/project';

type Tab = 'today' | 'upcoming' | 'projects' | 'habits' | 'inbox';

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentView = searchParams.get('view') ?? 'today';
  const selectedProject = searchParams.get('project');

  const [showProjects, setShowProjects] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  const loadProjects = useCallback(async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('created_at');
    if (data) {
      setProjects(
        data
          .filter((p: { name: string }) => p.name.toLowerCase() !== 'inbox')
          .map((p: { id: string; name: string; colour: string; created_at: string }) => ({
            id: p.id,
            name: p.name,
            colour: p.colour,
            createdAt: new Date(p.created_at),
          }))
      );
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Close project drawer on outside click
  useEffect(() => {
    if (!showProjects) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-projects-drawer]') && !target.closest('[data-projects-btn]')) {
        setShowProjects(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showProjects]);

  const activeTab: Tab = pathname === '/habits'
    ? 'habits'
    : pathname === '/inbox'
    ? 'inbox'
    : selectedProject
    ? 'projects'
    : currentView === 'upcoming'
    ? 'upcoming'
    : 'today';

  const tabs: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: 'today',    icon: <Sun size={22} />,       label: 'Today' },
    { id: 'upcoming', icon: <Calendar size={22} />,   label: 'Upcoming' },
    { id: 'projects', icon: <FolderOpen size={22} />, label: 'Projects' },
    { id: 'habits',   icon: <Activity size={22} />,   label: 'Habits' },
    { id: 'inbox',    icon: <List size={22} />,        label: 'All Tasks' },
  ];

  const handleTab = (id: Tab) => {
    if (id === 'projects') {
      setShowProjects((v) => !v);
      return;
    }
    setShowProjects(false);
    if (id === 'habits') router.push('/habits');
    else if (id === 'inbox') router.push('/inbox');
    else if (id === 'today') router.push('/?view=today');
    else if (id === 'upcoming') router.push('/?view=upcoming');
  };

  return (
    <>
      {/* Project drawer */}
      {showProjects && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.3)',
              zIndex: 149,
            }}
            onClick={() => setShowProjects(false)}
          />
          {/* Drawer */}
          <div
            data-projects-drawer
            style={{
              position: 'fixed',
              bottom: 64,
              left: 0,
              right: 0,
              background: 'var(--bg-modal)',
              borderRadius: '16px 16px 0 0',
              boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
              zIndex: 150,
              padding: '16px 0 8px',
              maxHeight: '60vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 20px 12px' }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', flex: 1 }}>
                Projects
              </span>
              <button
                onClick={() => setShowProjects(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => { router.push(`/?project=${p.id}`); setShowProjects(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                  padding: '12px 20px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: 15,
                  color: 'var(--text-primary)',
                }}
              >
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.colour, flexShrink: 0 }} />
                {p.name}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Nav bar */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 64,
          background: 'var(--bg-modal)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'stretch',
          zIndex: 100,
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {tabs.map(({ id, icon, label }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              data-projects-btn={id === 'projects' ? true : undefined}
              onClick={() => handleTab(id)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: 10,
                fontWeight: isActive ? 600 : 400,
                padding: '8px 4px 4px',
                position: 'relative',
              }}
            >
              {isActive && (
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 24,
                    height: 2,
                    background: 'var(--accent)',
                    borderRadius: '0 0 2px 2px',
                  }}
                />
              )}
              {icon}
              {isActive && <span>{label}</span>}
            </button>
          );
        })}
      </nav>
    </>
  );
}
