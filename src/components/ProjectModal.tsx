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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.15)' }}
      onClick={onClose}
    >
      <div
        className="w-80 rounded-xl p-6"
        style={{ background: 'var(--bg-card)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', animation: 'slideUp 200ms ease' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
          {initial ? 'Rename project' : 'New project'}
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
            className="mb-4 w-full rounded-lg px-3 py-2 text-sm outline-none transition-all"
            style={{ border: '1.5px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.background = 'var(--bg-card)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'var(--bg-input)';
            }}
          />
          {/* Colour swatches */}
          <div className="mb-5 flex gap-2">
            {PRESET_COLOURS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColour(c)}
                className="h-6 w-6 rounded-full transition-transform focus:outline-none"
                style={{
                  backgroundColor: c,
                  transform: colour === c ? 'scale(1.25)' : undefined,
                  outline: colour === c ? `2px solid ${c}` : undefined,
                  outlineOffset: colour === c ? '2px' : undefined,
                }}
                aria-label={`Select colour ${c}`}
              />
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-sm transition-colors focus:outline-none"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg px-3 py-1.5 text-sm text-white transition-colors focus:outline-none"
              style={{ background: 'var(--accent)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--accent)')}
            >
              {initial ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
