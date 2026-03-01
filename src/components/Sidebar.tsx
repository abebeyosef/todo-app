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

  const loadProjects = useCallback(async () => {
    const { data: projectRows } = await supabase
      .from('projects')
      .select('*')
      .order('created_at');

    const { data: taskRows } = await supabase
      .from('tasks')
      .select('project_id')
      .eq('completed', false);

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
        id: p.id,
        name: p.name,
        colour: p.colour,
        createdAt: new Date(p.created_at),
        taskCount: counts[p.id] ?? 0,
      }))
    );
  }, []);

  useEffect(() => {
    loadProjects();
    window.addEventListener('tasks-changed', loadProjects);
    return () => window.removeEventListener('tasks-changed', loadProjects);
  }, [loadProjects]);

  const createProject = async (name: string, colour: string) => {
    await supabase.from('projects').insert([{ name, colour }]);
    setShowModal(false);
    loadProjects();
  };

  const renameProject = async (name: string, colour: string) => {
    if (!renaming) return;
    await supabase.from('projects').update({ name, colour }).eq('id', renaming.id);
    setRenaming(null);
    loadProjects();
  };

  const deleteProject = async (project: SidebarProject) => {
    if (!confirm(`Delete "${project.name}"? Its tasks will move to Inbox.`)) return;
    await supabase.from('tasks').update({ project_id: null }).eq('project_id', project.id);
    await supabase.from('projects').delete().eq('id', project.id);
    if (selectedProject === project.id) router.push('/');
    loadProjects();
  };

  const isTasksPage = pathname === '/';

  return (
    <>
      <aside className="flex h-screen w-52 flex-shrink-0 flex-col border-r border-gray-100 bg-white px-3 py-6">
        {/* App name */}
        <div className="mb-6 px-2">
          <span className="text-lg font-semibold tracking-tight text-gray-900">ToDo</span>
        </div>

        {/* Module nav */}
        <nav className="mb-5 flex flex-col gap-1">
          {[
            { label: 'Tasks', href: '/' },
            { label: 'Habits', href: '/habits' },
          ].map(({ label, href }) => {
            const active = pathname === href && !selectedProject;
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Projects section — only on tasks page */}
        {isTasksPage && (
          <>
            <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Projects
            </p>

            {/* Inbox */}
            <button
              onClick={() => router.push('/')}
              className={`group flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${
                isTasksPage && !selectedProject
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span>Inbox</span>
              {inboxCount > 0 && (
                <span className="text-xs text-gray-400">{inboxCount}</span>
              )}
            </button>

            {/* Project list */}
            {projects.map((p) => (
              <div key={p.id} className="group relative">
                <button
                  onClick={() => router.push(`/?project=${p.id}`)}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                    selectedProject === p.id
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span
                    className="h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: p.colour }}
                  />
                  <span className="flex-1 truncate text-left">{p.name}</span>
                  {p.taskCount > 0 && (
                    <span className="text-xs text-gray-400">{p.taskCount}</span>
                  )}
                </button>

                {/* Hover actions */}
                <div className="absolute right-1 top-1 hidden gap-1 group-hover:flex">
                  <button
                    onClick={(e) => { e.stopPropagation(); setRenaming(p); }}
                    className="rounded p-0.5 text-gray-400 hover:text-gray-700"
                    title="Rename"
                  >
                    ✎
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteProject(p); }}
                    className="rounded p-0.5 text-gray-400 hover:text-red-500"
                    title="Delete"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}

            {/* New project */}
            <button
              onClick={() => setShowModal(true)}
              className="mt-1 flex w-full items-center gap-1 rounded-md px-2 py-1.5 text-xs text-gray-400 hover:bg-gray-50 hover:text-gray-600"
            >
              + New Project
            </button>
          </>
        )}

        {/* Google Calendar */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <CalendarButton />
        </div>
      </aside>

      {showModal && (
        <ProjectModal
          onSave={createProject}
          onClose={() => setShowModal(false)}
        />
      )}
      {renaming && (
        <ProjectModal
          initial={{ name: renaming.name, colour: renaming.colour }}
          onSave={renameProject}
          onClose={() => setRenaming(null)}
        />
      )}
    </>
  );
}
