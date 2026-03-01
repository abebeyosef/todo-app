'use client';

import { useState } from 'react';
import { parseTask } from '@/lib/parseTask';
import { Task } from '@/types/task';

type Props = {
  onAdd: (task: Task) => void;
};

export default function TaskInput({ onAdd }: Props) {
  const [value, setValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      const parsed = parseTask(value.trim());
      const task: Task = {
        id: crypto.randomUUID(),
        completed: false,
        createdAt: new Date(),
        ...parsed,
      };
      onAdd(task);
      setValue('');
    }
  };

  return (
    <div className="mb-6">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add a task… e.g. #health Morning run today 7am [45min] p1"
        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-gray-400 focus:bg-white focus:outline-none"
      />
    </div>
  );
}
