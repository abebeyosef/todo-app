'use client';

import { useState, useEffect } from 'react';
import SearchOverlay from './SearchOverlay';

export default function GlobalOverlays() {
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const handler = () => setShowSearch(true);
    window.addEventListener('open-search', handler);
    return () => window.removeEventListener('open-search', handler);
  }, []);

  const handleSelectTask = (taskId: string) => {
    window.dispatchEvent(new CustomEvent('open-task-detail', { detail: { taskId } }));
  };

  if (!showSearch) return null;

  return (
    <SearchOverlay
      onClose={() => setShowSearch(false)}
      onSelectTask={handleSelectTask}
    />
  );
}
