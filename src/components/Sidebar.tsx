'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Search,
  Inbox,
  CalendarCheck,
  CalendarRange,
  ListTodo,
  ChevronDown,
  ChevronRight,
  Palette,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Project } from '@/types/project';
import ProjectModal from './ProjectModal';
import CalendarButton from './CalendarButton';
import ThemePicker from './ThemePicker';

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

  // Tablet rail: collapsed to 56px when 768–1024px, expands on hover
  const [isTablet, setIsTablet] = useState(false);
  const [railExpanded, setRailExpanded] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const themePopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsTablet(window.innerWidth >= 768 && window.innerWidth <= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close theme popover on outside click (rail mode)
  useEffect(() => {
    if (!showThemePicker) return;
    const handler = (e: MouseEvent) => {
      if (themePopoverRef.current && !themePopoverRef.current.contains(e.target as Node)) {
        setShowThemePicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showThemePicker]);

  const sidebarWidth = isTablet ? (railExpanded ? 280 : 56) : 280;

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

      if (pErr) {
        console.error('Failed to load projects:', {
          message: pErr.message, code: pErr.code, details: pErr.details, hint: pErr.hint,
        });
        return;
      }
      if (!projectRows) return;

      // tErr is non-fatal: task counts fall back to 0 rather than blocking the project list
      if (tErr) {
        console.error('Failed to load task counts (non-fatal):', {
          message: tErr.message, code: tErr.code, details: tErr.details, hint: tErr.hint,
        });
      }

      const inboxProjectId = projectRows.find((p: { name: string }) => p.name.toLowerCase() === 'inbox')?.id ?? null;

      const counts: Record<string, number> = {};
      let inbox = 0;
      let todayAmt = 0;
      for (const t of taskRows ?? []) {
        if (t.project_id) counts[t.project_id] = (counts[t.project_id] ?? 0) + 1;
        inbox++; // All Tasks count = every incomplete task
        if (t.scheduled_at && t.scheduled_at.startsWith(today)) todayAmt++;
      }
      setInboxCount(inbox);
      setTodayCount(todayAmt);
      setProjects(
        projectRows
          .filter((p: { name: string }) => p.name.toLowerCase() !== 'inbox')
          .map((p: { id: string; name: string; colour: string; created_at: string }) => ({
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
        console.error('Failed to create project — full error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          payload: { name, colour },
        });
        // Surface the actual Supabase message so the user can see it without devtools
        setProjectError(`Couldn't save project: ${error.message}`);
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
        console.error('Failed to rename project — full error:', {
          message: error.message, code: error.code, details: error.details, hint: error.hint,
        });
        setProjectError(`Couldn't save changes: ${error.message}`);
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
  const isInboxPage = pathname === '/inbox';

  // Determine which nav item is active
  const activeNav = isHabitsPage
    ? 'habits'
    : isInboxPage
    ? 'inbox'
    : selectedProject
    ? 'project-' + selectedProject
    : isTasksPage
    ? currentView
    : '';

  const railCollapsed = isTablet && !railExpanded;

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
        title={railCollapsed ? label : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: railCollapsed ? 'center' : 'flex-start',
          gap: 8,
          width: '100%',
          height: 36,
          padding: railCollapsed ? '0' : '0 12px',
          borderRadius: 8,
          fontSize: 15,
          fontWeight: active ? 600 : 400,
          color: 'var(--sidebar-text)',
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
        {!railCollapsed && <span style={{ flex: 1 }}>{label}</span>}
        {!railCollapsed && count != null && count > 0 && (
          <span style={{ fontSize: 13, color: 'var(--text-overdue)', fontWeight: 400 }}>{count}</span>
        )}
      </button>
    );
  };

  return (
    <>
      <aside
        className="hide-mobile"
        onMouseEnter={() => isTablet && setRailExpanded(true)}
        onMouseLeave={() => { isTablet && setRailExpanded(false); setShowThemePicker(false); }}
        style={{
          width: sidebarWidth,
          minWidth: sidebarWidth,
          background: 'var(--bg-sidebar)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflowY: 'auto',
          overflow: 'hidden',
          transition: 'width 200ms ease, min-width 200ms ease',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        {/* User row */}
        <div style={{ padding: '16px 16px 8px', display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
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
          {(!isTablet || railExpanded) && (
            <>
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--sidebar-text)' }}>Yosef</span>
              <span style={{ fontSize: 11, color: 'var(--sidebar-text-muted)', marginLeft: 2 }}>▾</span>
            </>
          )}
        </div>

        {/* Add task button */}
        <div style={{ padding: '4px 12px 8px', display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
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
          {(!isTablet || railExpanded) && (
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
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-dark)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-accent)')}
            >
              Add task
            </button>
          )}
        </div>

        {/* Primary navigation */}
        <nav style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 1, marginTop: 8 }}>
          {navBtn('search', <Search size={16} />, 'Search', () => window.dispatchEvent(new Event('open-search')), undefined)}
          {navBtn(
            'inbox',
            <Inbox size={16} />,
            'All Tasks',
            () => router.push('/inbox'),
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
          {!railCollapsed && (
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
                  color: 'var(--sidebar-text-muted)',
                  flex: 1,
                }}
              >
                My Projects
              </span>
              <span style={{ color: 'var(--sidebar-text-muted)', display: 'flex' }}>
                {projectsCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
              </span>
            </div>
          )}

          {(!projectsCollapsed || railCollapsed) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginTop: 2 }}>
              {projects.map((p) => {
                const active = selectedProject === p.id;
                return (
                  <div key={p.id} style={{ position: 'relative' }} className="group">
                    <button
                      onClick={() => router.push(`/?project=${p.id}`)}
                      title={railCollapsed ? p.name : undefined}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: railCollapsed ? 'center' : 'flex-start',
                        gap: 8,
                        width: '100%',
                        height: 36,
                        padding: railCollapsed ? '0' : '0 12px',
                        borderRadius: 8,
                        fontSize: 15,
                        fontWeight: active ? 600 : 400,
                        color: 'var(--sidebar-text)',
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
                      {/* Coloured dot (rail) or # (full) */}
                      {railCollapsed ? (
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.colour, flexShrink: 0 }} />
                      ) : (
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
                      )}
                      {!railCollapsed && (
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.name}
                        </span>
                      )}
                      {!railCollapsed && p.taskCount > 0 && (
                        <span style={{ fontSize: 13, color: 'var(--sidebar-text-muted)' }}>{p.taskCount}</span>
                      )}
                    </button>

                    {/* Hover actions — only show when expanded */}
                    {!railCollapsed && (
                      <div
                        className="absolute right-2 top-1.5 hidden gap-0.5 group-hover:flex"
                        style={{ gap: 2 }}
                      >
                        <button
                          onClick={(e) => { e.stopPropagation(); setProjectError(null); setRenaming(p); }}
                          style={{
                            fontSize: 12,
                            color: 'var(--sidebar-text-muted)',
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
                            color: 'var(--sidebar-text-muted)',
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
                    )}
                  </div>
                );
              })}

              {/* New project — only show when expanded */}
              {!railCollapsed && (
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
                    color: 'var(--sidebar-text-muted)',
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
              )}
            </div>
          )}
        </div>

        {/* Bottom — Theme picker + Google Calendar + Help */}
        <div
          style={{
            padding: '12px 8px',
            borderTop: '1px solid var(--divider)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {railCollapsed ? (
            /* Rail: palette icon opens a popover */
            <div ref={themePopoverRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowThemePicker((v) => !v)}
                title="Theme"
                style={{
                  width: '100%',
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: 8,
                  color: 'var(--icon)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover-sidebar)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Palette size={18} />
              </button>
              {showThemePicker && (
                <div
                  style={{
                    position: 'absolute',
                    left: '100%',
                    bottom: 0,
                    marginLeft: 8,
                    background: 'var(--bg-modal)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    boxShadow: 'var(--shadow-dropdown)',
                    zIndex: 300,
                    minWidth: 220,
                  }}
                >
                  <ThemePicker />
                </div>
              )}
            </div>
          ) : (
            <>
              <ThemePicker />
              <div style={{ height: 1, background: 'var(--divider)', margin: '6px 4px' }} />
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
                  color: 'var(--sidebar-text-muted)',
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
            </>
          )}
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
