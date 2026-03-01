'use client';

import { useState } from 'react';

const COLOUR_OPTIONS = [
  { name: 'Charcoal',        hex: '#374151' },
  { name: 'Berry Red',       hex: '#DC2626' },
  { name: 'Forest Green',    hex: '#16A34A' },
  { name: 'Sky Blue',        hex: '#0891B2' },
  { name: 'Grape Purple',    hex: '#7C3AED' },
  { name: 'Tangerine Orange',hex: '#D97706' },
  { name: 'Salmon Pink',     hex: '#F472B6' },
];

type Props = {
  initial?: { name: string; colour: string };
  onSave: (name: string, colour: string) => void;
  onClose: () => void;
  error?: string | null;
};

export default function ProjectModal({ initial, onSave, onClose, error }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [colour, setColour] = useState(initial?.colour ?? COLOUR_OPTIONS[0].hex);
  const [colourOpen, setColourOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onSave(name.trim(), colour);
  };

  const selectedColour = COLOUR_OPTIONS.find((c) => c.hex === colour) ?? COLOUR_OPTIONS[0];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.25)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 440,
          background: 'var(--bg-modal)',
          borderRadius: 12,
          boxShadow: 'var(--shadow-dropdown)',
          padding: '20px 24px 24px',
          animation: 'slideUp 200ms ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>
            {initial ? 'Rename project' : 'Add project'}
          </h2>
          <button
            onClick={onClose}
            style={{
              fontSize: 20,
              color: 'var(--text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              lineHeight: 1,
              padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name field */}
          <label
            style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}
          >
            Name
          </label>
          <div style={{ position: 'relative', marginBottom: error ? 4 : 16 }}>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 120))}
              placeholder="Project name"
              maxLength={120}
              style={{
                width: '100%',
                fontSize: 15,
                padding: '10px 52px 10px 12px',
                border: '1px solid var(--border-input)',
                borderRadius: 6,
                outline: 'none',
                color: 'var(--text-primary)',
                background: 'var(--bg-input)',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-input)')}
            />
            <span
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 12,
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            >
              {name.length}/120
            </span>
          </div>

          {error && (
            <p style={{ fontSize: 12, color: 'var(--p1)', marginBottom: 12 }}>{error}</p>
          )}

          {/* Color dropdown */}
          <label
            style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}
          >
            Color
          </label>
          <div style={{ position: 'relative', marginBottom: 24 }}>
            <button
              type="button"
              onClick={() => setColourOpen((v) => !v)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 12px',
                border: '1px solid var(--border-input)',
                borderRadius: 6,
                background: 'var(--bg-input)',
                cursor: 'pointer',
                fontSize: 14,
                color: 'var(--text-primary)',
                textAlign: 'left',
              }}
            >
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: colour,
                  flexShrink: 0,
                }}
              />
              <span style={{ flex: 1 }}>{selectedColour.name}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>▾</span>
            </button>

            {colourOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '110%',
                  left: 0,
                  right: 0,
                  background: 'var(--bg-modal)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  boxShadow: 'var(--shadow-dropdown)',
                  zIndex: 10,
                  overflow: 'hidden',
                }}
              >
                {COLOUR_OPTIONS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => { setColour(c.hex); setColourOpen(false); }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '9px 14px',
                      background: colour === c.hex ? 'var(--bg-hover-row)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 14,
                      color: 'var(--text-primary)',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover-row)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = colour === c.hex ? 'var(--bg-hover-row)' : 'transparent')}
                  >
                    <span style={{ width: 14, height: 14, borderRadius: '50%', background: c.hex, flexShrink: 0 }} />
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                fontSize: 14,
                color: 'var(--text-secondary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: 6,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover-row)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'white',
                background: 'var(--accent)',
                border: 'none',
                cursor: 'pointer',
                padding: '8px 16px',
                borderRadius: 6,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-dark)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--accent)')}
            >
              {initial ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
