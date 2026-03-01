'use client';

import { useState } from 'react';
import { parseTask } from '@/lib/parseTask';
import { Task } from '@/types/task';

type Props = {
  onAdd: (task: Task) => void;
};

export default function TaskInput({ onAdd }: Props) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);

  const submit = () => {
    if (!value.trim()) return;
    const parsed = parseTask(value.trim());
    const task: Task = {
      id: crypto.randomUUID(),
      completed: false,
      createdAt: new Date(),
      ...parsed,
    };
    onAdd(task);
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit();
  };

  return (
    <div
      className="mb-6 flex items-center gap-3 rounded-xl px-4 transition-all duration-150"
      style={{
        height: 52,
        background: 'var(--bg-card)',
        border: `1.5px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
        boxShadow: focused ? 'var(--shadow-md)' : 'var(--shadow-sm)',
      }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Add a task… e.g. #health Morning run today 7am [45min] p1"
        className="flex-1 bg-transparent text-sm outline-none"
        style={{ color: 'var(--text-primary)' }}
      />
      {value.trim() && (
        <button
          onClick={submit}
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-white transition-colors"
          style={{ background: 'var(--accent)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--accent)')}
          aria-label="Add task"
        >
          →
        </button>
      )}
    </div>
  );
}
