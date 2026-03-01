'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
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

  const [projects, setProjects] = useState<SidebarProject[]>([]);
  const [inboxCount, setInboxCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [renaming, setRenaming] = useState<SidebarProject | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    try {
      const [{ data: projectRows, error: pErr }, { data: taskRows, error: tErr }] = await Promise.all([
        supabase.from('projects').select('*').order('created_at'),
        supabase.from('tasks').select('project_id').eq('completed', false),
      ]);
      if (pErr) { console.error('Failed to load projects:', pErr); return; }
      if (tErr) { console.error('Failed to load task counts:', tErr); return; }
      if (!projectRows) return;

      const counts: Record<string, number> = {};
      let inbox = 0;
      for (const t of taskRows ?? []) {
        if (t.project_id) counts[t.project_id] = (counts[t.project_id] ?? 0) + 1;
        else inbox++;
      }
      setInboxCount(inbox);
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

  const navLinkClass = (active: boolean) =>
    `relative flex h-9 w-full items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors duration-100 ${
      active
        ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]'
        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
    }`;

  return (
    <>
      <aside
        className="flex h-screen flex-col overflow-y-auto"
        style={{ width: 240, minWidth: 240, background: 'var(--bg-sidebar)' }}
      >
        {/* App name */}
        <div style={{ padding: '24px 24px 16px' }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            ToDo
          </span>
        </div>

        {/* Module nav */}
        <nav className="flex flex-col gap-0.5 px-3">
          {[{ label: 'Tasks', href: '/' }, { label: 'Habits', href: '/habits' }].map(({ label, href }) => {
            const active = pathname === href && !selectedProject;
            return (
              <Link key={href} href={href} className={navLinkClass(active)}>
                {active && (
                  <span
                    className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full"
                    style={{ background: 'var(--accent)' }}
                  />
                )}
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Projects — only on tasks page */}
        {isTasksPage && (
          <>
            <div
              className="mx-3 my-4"
              style={{ height: 1, background: 'var(--divider)' }}
            />
            <div className="px-3">
              <p
                className="mb-1 px-2"
                style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}
              >
                Projects
              </p>

              {/* Inbox */}
              <button
                onClick={() => router.push('/')}
                className={navLinkClass(isTasksPage && !selectedProject)}
              >
                {isTasksPage && !selectedProject && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full" style={{ background: 'var(--accent)' }} />
                )}
                <span className="flex-1 text-left">Inbox</span>
                {inboxCount > 0 && (
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{inboxCount}</span>
                )}
              </button>

              {/* Project list */}
              {projects.map((p) => (
                <div key={p.id} className="group relative">
                  <button
                    onClick={() => router.push(`/?project=${p.id}`)}
                    className={navLinkClass(selectedProject === p.id)}
                  >
                    {selectedProject === p.id && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full" style={{ background: 'var(--accent)' }} />
                    )}
                    <span
                      className="flex-shrink-0 rounded-full"
                      style={{ width: 10, height: 10, background: p.colour }}
                    />
                    <span className="flex-1 truncate text-left">{p.name}</span>
                    {p.taskCount > 0 && (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.taskCount}</span>
                    )}
                  </button>
                  {/* Hover actions */}
                  <div className="absolute right-2 top-1.5 hidden gap-0.5 group-hover:flex">
                    <button
                      onClick={(e) => { e.stopPropagation(); setProjectError(null); setRenaming(p); }}
                      className="rounded p-1 transition-colors hover:bg-[var(--bg-hover)]"
                      style={{ fontSize: 12, color: 'var(--text-muted)' }}
                      title="Rename"
                    >✎</button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteProject(p); }}
                      className="rounded p-1 transition-colors hover:bg-[var(--bg-hover)]"
                      style={{ fontSize: 14, color: 'var(--text-muted)' }}
                      title="Delete"
                    >×</button>
                  </div>
                </div>
              ))}

              {/* New project */}
              <button
                onClick={() => { setProjectError(null); setShowModal(true); }}
                className="mt-1 flex h-8 w-full items-center gap-1 rounded-lg px-3 text-xs transition-colors hover:bg-[var(--bg-hover)]"
                style={{ color: 'var(--text-muted)' }}
              >
                + New Project
              </button>
            </div>
          </>
        )}

        {/* Spacer + Calendar button */}
        <div className="mt-auto border-t px-3 py-3" style={{ borderColor: 'var(--divider)' }}>
          <CalendarButton />
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
