'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export default function CalendarButton() {
  const { data: session } = useSession();

  if (session?.accessToken) {
    return (
      <button
        onClick={() => signOut({ redirect: false })}
        className="w-full rounded-md px-2 py-1.5 text-left text-xs transition-colors focus:outline-none"
        style={{ color: '#16a34a' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover-sidebar)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        title="Click to disconnect Google Calendar"
      >
        ✓ Calendar connected
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn('google')}
      className="w-full rounded-md px-2 py-1.5 text-left text-xs transition-colors focus:outline-none"
      style={{ color: 'var(--text-muted)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--bg-hover-sidebar)';
        e.currentTarget.style.color = 'var(--text-secondary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = 'var(--text-muted)';
      }}
    >
      + Connect Google Calendar
    </button>
  );
}
