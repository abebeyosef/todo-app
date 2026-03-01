'use client';

import { useState } from 'react';

const PRESET_COLOURS = [
  '#4F46E5', '#16A34A', '#DC2626', '#D97706', '#7C3AED', '#0891B2',
];

type Props = {
  initial?: { name: string; colour: string };
  onSave: (name: string, colour: string) => void;
  onClose: () => void;
};

export default function ProjectModal({ initial, onSave, onClose }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [colour, setColour] = useState(initial?.colour ?? PRESET_COLOURS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onSave(name.trim(), colour);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={onClose}>
      <div className="w-80 rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 text-base font-semibold text-gray-900">
          {initial ? 'Rename project' : 'New project'}
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
            className="mb-4 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm transition-colors focus:border-gray-400 focus:outline-none"
          />
          {/* Colour swatches */}
          <div className="mb-5 flex gap-2">
            {PRESET_COLOURS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColour(c)}
                className={`h-6 w-6 rounded-full transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${colour === c ? 'scale-125' : 'hover:scale-110'}`}
                style={{ backgroundColor: c, outlineColor: c }}
                aria-label={`Select colour ${c}`}
              />
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm text-white transition-colors hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
            >
              {initial ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
