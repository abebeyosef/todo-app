'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export default function CalendarButton() {
  const { data: session } = useSession();

  if (session?.accessToken) {
    return (
      <button
        onClick={() => signOut({ redirect: false })}
        className="w-full rounded-md px-2 py-1.5 text-left text-xs text-green-600 transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
        title="Click to disconnect Google Calendar"
      >
        ✓ Calendar connected
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn('google')}
      className="w-full rounded-md px-2 py-1.5 text-left text-xs text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
    >
      + Connect Google Calendar
    </button>
  );
}
