'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Inbox,
  CalendarCheck,
  CalendarRange,
  ListTodo,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Project } from '@/types/project';
import ProjectModal from './ProjectModal';
import CalendarButton from './CalendarButton';

type SidebarProject = Project & { taskCount: number };

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedProject = searchParams.get('project');
  const currentView = searchParams.get('view') ?? 'today';

  const [projects, setProjects] = useState<SidebarProject[]>([]);
  const [inboxCount, setInboxCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [renaming, setRenaming] = useState<SidebarProject | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [projectsCollapsed, setProjectsCollapsed] = useState(false);

  const loadProjects = useCallback(async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const [
        { data: projectRows, error: pErr },
        { data: taskRows, error: tErr },
      ] = await Promise.all([
        supabase.from('projects').select('*').order('created_at'),
        supabase.from('tasks').select('project_id, scheduled_at').eq('completed', false),
      ]);
      if (pErr) { console.error('Failed to load projects:', pErr); return; }
      if (tErr) { console.error('Failed to load task counts:', tErr); return; }
      if (!projectRows) return;

      const counts: Record<string, number> = {};
      let inbox = 0;
      let todayAmt = 0;
      for (const t of taskRows ?? []) {
        if (t.project_id) counts[t.project_id] = (counts[t.project_id] ?? 0) + 1;
        else inbox++;
        if (t.scheduled_at && t.scheduled_at.startsWith(today)) todayAmt++;
      }
      setInboxCount(inbox);
      setTodayCount(todayAmt);
      setProjects(
        projectRows.map((p) => ({
          id: p.id, name: p.name, colour: p.colour,
          createdAt: new Date(p.created_at), taskCount: counts[p.id] ?? 0,
        }))
      );
    } catch (err) {
      console.error('Unexpected error loading projects:', err);
    }
  }, []);

  useEffect(() => {
    loadProjects();
    window.addEventListener('tasks-changed', loadProjects);
    return () => window.removeEventListener('tasks-changed', loadProjects);
  }, [loadProjects]);

  const createProject = async (name: string, colour: string) => {
    setProjectError(null);
    try {
      const { error } = await supabase.from('projects').insert([{ name, colour }]);
      if (error) {
        console.error('Failed to create project:', error);
        setProjectError("Couldn't save project — please try again.");
        return;
      }
      setShowModal(false);
      loadProjects();
    } catch (err) {
      console.error('Unexpected error creating project:', err);
      setProjectError("Couldn't save project — please try again.");
    }
  };

  const renameProject = async (name: string, colour: string) => {
    if (!renaming) return;
    setProjectError(null);
    try {
      const { error } = await supabase.from('projects').update({ name, colour }).eq('id', renaming.id);
      if (error) {
        console.error('Failed to rename project:', error);
        setProjectError("Couldn't save changes — please try again.");
        return;
      }
      setRenaming(null);
      loadProjects();
    } catch (err) {
      console.error('Unexpected error renaming project:', err);
      setProjectError("Couldn't save changes — please try again.");
    }
  };

  const deleteProject = async (project: SidebarProject) => {
    if (!confirm(`Delete "${project.name}"? Its tasks will move to Inbox.`)) return;
    try {
      const { error: moveErr } = await supabase.from('tasks').update({ project_id: null }).eq('project_id', project.id);
      if (moveErr) { console.error('Failed to move tasks to Inbox:', moveErr); return; }
      const { error: delErr } = await supabase.from('projects').delete().eq('id', project.id);
      if (delErr) { console.error('Failed to delete project:', delErr); return; }
      if (selectedProject === project.id) router.push('/');
      loadProjects();
    } catch (err) {
      console.error('Unexpected error deleting project:', err);
    }
  };

  const isTasksPage = pathname === '/';
  const isHabitsPage = pathname === '/habits';

  // Determine which nav item is active
  const activeNav = isHabitsPage
    ? 'habits'
    : selectedProject
    ? 'project-' + selectedProject
    : isTasksPage
    ? currentView
    : '';

  const navBtn = (
    id: string,
    icon: React.ReactNode,
    label: string,
    onClick: () => void,
    count?: number
  ) => {
    const active = activeNav === id;
    return (
      <button
        key={id}
        onClick={onClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          height: 36,
          padding: '0 12px',
          borderRadius: 8,
          fontSize: 15,
          fontWeight: active ? 600 : 400,
          color: 'var(--text-primary)',
          background: active ? 'var(--bg-active)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'background 80ms ease',
        }}
        onMouseEnter={(e) => {
          if (!active) e.currentTarget.style.background = 'var(--bg-hover-sidebar)';
        }}
        onMouseLeave={(e) => {
          if (!active) e.currentTarget.style.background = 'transparent';
        }}
      >
        <span style={{ color: active ? 'var(--icon-active)' : 'var(--icon)', display: 'flex', flexShrink: 0 }}>
          {icon}
        </span>
        <span style={{ flex: 1 }}>{label}</span>
        {count != null && count > 0 && (
          <span style={{ fontSize: 13, color: 'var(--text-overdue)', fontWeight: 400 }}>{count}</span>
        )}
      </button>
    );
  };

  return (
    <>
      <aside
        style={{
          width: 280,
          minWidth: 280,
          background: 'var(--bg-sidebar)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        {/* User row */}
        <div style={{ padding: '16px 16px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#0D9488',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              color: 'white',
              flexShrink: 0,
              letterSpacing: '-0.01em',
            }}
          >
            YA
          </div>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>Yosef</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 2 }}>▾</span>
        </div>

        {/* Add task button */}
        <div style={{ padding: '4px 12px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => window.dispatchEvent(new Event('open-task-form'))}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'var(--accent)',
              color: 'white',
              fontSize: 22,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
              flexShrink: 0,
              lineHeight: 1,
              paddingBottom: 2,
            }}
            aria-label="Add task"
          >
            +
          </button>
          <button
            onClick={() => window.dispatchEvent(new Event('open-task-form'))}
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--text-accent)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-dark)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-accent)')}
          >
            Add task
          </button>
        </div>

        {/* Primary navigation */}
        <nav style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 1, marginTop: 8 }}>
          {navBtn('search', <Search size={16} />, 'Search', () => {}, undefined)}
          {navBtn(
            'inbox',
            <Inbox size={16} />,
            'Inbox',
            () => router.push('/'),
            inboxCount || undefined
          )}
          {navBtn(
            'today',
            <CalendarCheck size={16} />,
            'Today',
            () => router.push('/?view=today'),
            todayCount || undefined
          )}
          {navBtn(
            'upcoming',
            <CalendarRange size={16} />,
            'Upcoming',
            () => router.push('/?view=upcoming')
          )}
          {navBtn(
            'habits',
            <ListTodo size={16} />,
            'Habits',
            () => router.push('/habits')
          )}
        </nav>

        {/* My Projects section */}
        <div style={{ marginTop: 24, padding: '0 8px', flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '4px 12px',
              cursor: 'pointer',
            }}
            onClick={() => setProjectsCollapsed((v) => !v)}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                flex: 1,
              }}
            >
              My Projects
            </span>
            <span style={{ color: 'var(--text-muted)', display: 'flex' }}>
              {projectsCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </span>
          </div>

          {!projectsCollapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginTop: 2 }}>
              {projects.map((p) => {
                const active = selectedProject === p.id;
                return (
                  <div key={p.id} style={{ position: 'relative' }} className="group">
                    <button
                      onClick={() => router.push(`/?project=${p.id}`)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        width: '100%',
                        height: 36,
                        padding: '0 12px',
                        borderRadius: 8,
                        fontSize: 15,
                        fontWeight: active ? 600 : 400,
                        color: 'var(--text-primary)',
                        background: active ? 'var(--bg-active)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 80ms ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!active) e.currentTarget.style.background = 'var(--bg-hover-sidebar)';
                      }}
                      onMouseLeave={(e) => {
                        if (!active) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {/* # in project colour */}
                      <span
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: p.colour,
                          lineHeight: 1,
                          flexShrink: 0,
                          width: 16,
                          textAlign: 'center',
                        }}
                      >
                        #
                      </span>
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.name}
                      </span>
                      {p.taskCount > 0 && (
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{p.taskCount}</span>
                      )}
                    </button>

                    {/* Hover actions */}
                    <div
                      className="absolute right-2 top-1.5 hidden gap-0.5 group-hover:flex"
                      style={{ gap: 2 }}
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); setProjectError(null); setRenaming(p); }}
                        style={{
                          fontSize: 12,
                          color: 'var(--text-muted)',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: 4,
                          padding: '2px 4px',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover-sidebar)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        title="Rename"
                      >
                        ✎
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteProject(p); }}
                        style={{
                          fontSize: 14,
                          color: 'var(--text-muted)',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: 4,
                          padding: '2px 4px',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover-sidebar)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        title="Delete"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* New project */}
              <button
                onClick={() => { setProjectError(null); setShowModal(true); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  width: '100%',
                  height: 32,
                  padding: '0 12px',
                  borderRadius: 8,
                  fontSize: 14,
                  color: 'var(--text-muted)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginTop: 2,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover-sidebar)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                + New Project
              </button>
            </div>
          )}
        </div>

        {/* Bottom — Google Calendar + Help */}
        <div
          style={{
            padding: '12px 8px',
            borderTop: '1px solid var(--divider)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <CalendarButton />
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 13,
              color: 'var(--text-muted)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover-sidebar)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            ❓ Help & resources
          </button>
        </div>
      </aside>

      {showModal && (
        <ProjectModal
          onSave={createProject}
          onClose={() => setShowModal(false)}
          error={projectError}
        />
      )}
      {renaming && (
        <ProjectModal
          initial={{ name: renaming.name, colour: renaming.colour }}
          onSave={renameProject}
          onClose={() => setRenaming(null)}
          error={projectError}
        />
      )}
    </>
  );
}
