'use client';

import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

type ThemeId =
  | 'sand' | 'dark' | 'slate'
  | 'forest' | 'ocean'
  | 'london' | 'warsaw' | 'wakefield' | 'addis' | 'leba' | 'la';

type Category = 'General' | 'Nature' | 'Places';

type ThemeDef = {
  id: ThemeId;
  label: string;
  accent: string;
};

const THEMES: Record<Category, ThemeDef[]> = {
  General: [
    { id: 'sand',  label: 'Sand',  accent: '#D97706' },
    { id: 'dark',  label: 'Dark',  accent: '#F5A623' },
    { id: 'slate', label: 'Slate', accent: '#4F46E5' },
  ],
  Nature: [
    { id: 'forest', label: 'Forest', accent: '#2D6A4F' },
    { id: 'ocean',  label: 'Ocean',  accent: '#3B82F6' },
  ],
  Places: [
    { id: 'london',    label: 'London',    accent: '#CC0000' },
    { id: 'warsaw',    label: 'Warsaw',    accent: '#C41E3A' },
    { id: 'wakefield', label: 'Wakefield', accent: '#C2185B' },
    { id: 'addis',     label: 'Addis',     accent: '#D4860B' },
    { id: 'leba',      label: 'Łeba',      accent: '#1B6B5A' },
    { id: 'la',        label: 'LA',        accent: '#D2622A' },
  ],
};

const CATEGORIES: Category[] = ['General', 'Nature', 'Places'];
const THEME_KEY = 'todo-theme';
const CATEGORY_KEY = 'todo-theme-category';

function categoryForTheme(id: ThemeId): Category {
  for (const cat of CATEGORIES) {
    if (THEMES[cat].some((t) => t.id === id)) return cat;
  }
  return 'General';
}

export default function ThemePicker() {
  const [activeTheme, setActiveTheme] = useState<ThemeId>('sand');
  const [activeCategory, setActiveCategory] = useState<Category>('General');
  const [hoveredTheme, setHoveredTheme] = useState<ThemeId | null>(null);

  // Restore from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) as ThemeId | null;
    const savedCat = localStorage.getItem(CATEGORY_KEY) as Category | null;
    if (saved) {
      setActiveTheme(saved);
      setActiveCategory(savedCat ?? categoryForTheme(saved));
    }
  }, []);

  const applyTheme = (id: ThemeId) => {
    document.documentElement.setAttribute('data-theme', id);
    localStorage.setItem(THEME_KEY, id);
    const cat = categoryForTheme(id);
    localStorage.setItem(CATEGORY_KEY, cat);
    setActiveTheme(id);
    setActiveCategory(cat);
  };

  const switchCategory = (cat: Category) => {
    setActiveCategory(cat);
    localStorage.setItem(CATEGORY_KEY, cat);
  };

  return (
    <div style={{ padding: '8px 12px 4px' }}>
      {/* Category pills */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {CATEGORIES.map((cat) => {
          const isActive = cat === activeCategory;
          return (
            <button
              key={cat}
              onClick={() => switchCategory(cat)}
              style={{
                fontSize: 11,
                padding: '3px 10px',
                borderRadius: 20,
                border: 'none',
                cursor: 'pointer',
                background: isActive ? 'var(--accent)' : 'var(--bg-hover-row)',
                color: isActive ? 'white' : 'var(--sidebar-text-muted)',
                fontWeight: isActive ? 600 : 400,
                transition: 'background 80ms ease, color 80ms ease',
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Swatches */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {THEMES[activeCategory].map((theme) => {
          const isSelected = theme.id === activeTheme;
          const isHovered = hoveredTheme === theme.id;
          return (
            <div key={theme.id} style={{ position: 'relative' }}>
              {/* Tooltip */}
              {isHovered && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 5px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--bg-toast)',
                    color: 'var(--text-toast)',
                    fontSize: 11,
                    padding: '3px 7px',
                    borderRadius: 4,
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    zIndex: 200,
                  }}
                >
                  {theme.label}
                </div>
              )}
              <button
                onClick={() => applyTheme(theme.id)}
                onMouseEnter={() => setHoveredTheme(theme.id)}
                onMouseLeave={() => setHoveredTheme(null)}
                title={theme.label}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: theme.accent,
                  border: isSelected ? '2px solid var(--sidebar-text)' : '2px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  outline: isHovered && !isSelected ? `2px solid ${theme.accent}44` : 'none',
                  outlineOffset: 1,
                  transition: 'transform 80ms ease',
                  transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                }}
              >
                {isSelected && <Check size={11} color="white" strokeWidth={3} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
