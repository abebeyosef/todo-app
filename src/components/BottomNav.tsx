'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Sun, Activity, List, LayoutGrid } from 'lucide-react';
import BrowseScreen from './BrowseScreen';

type Tab = 'all-tasks' | 'today' | 'habits' | 'browse';

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentView = searchParams.get('view') ?? 'today';

  const [showBrowse, setShowBrowse] = useState(false);

  const activeTab: Tab | null = showBrowse
    ? 'browse'
    : pathname === '/habits'
    ? 'habits'
    : pathname === '/inbox'
    ? 'all-tasks'
    : currentView === 'upcoming' || searchParams.get('project')
    ? null
    : 'today';

  const tabs: { id: Tab; icon: ReactNode; label: string }[] = [
    { id: 'all-tasks', icon: <List size={22} />,       label: 'All Tasks' },
    { id: 'today',     icon: <Sun size={22} />,        label: 'Today' },
    { id: 'habits',    icon: <Activity size={22} />,   label: 'Habits' },
    { id: 'browse',    icon: <LayoutGrid size={22} />, label: 'Browse' },
  ];

  const handleTab = (id: Tab) => {
    if (id === 'browse') {
      setShowBrowse((v) => !v);
      return;
    }
    setShowBrowse(false);
    if (id === 'habits') router.push('/habits');
    else if (id === 'all-tasks') router.push('/inbox');
    else if (id === 'today') router.push('/?view=today');
  };

  return (
    <>
      {showBrowse && <BrowseScreen onClose={() => setShowBrowse(false)} />}

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
