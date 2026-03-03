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
  accent: string;       // used by CSS themes in globals.css
  swatchColour: string; // representative colour shown in the swatch circle
  icon: string;         // identifier for ThemeIcon
  darkBorder?: boolean; // true for dark swatches that need a visible border
};

const THEMES: Record<Category, ThemeDef[]> = {
  General: [
    { id: 'sand',  label: 'Sand',  accent: '#D97706', swatchColour: '#D97706', icon: 'sun' },
    { id: 'dark',  label: 'Dark',  accent: '#F5A623', swatchColour: '#2D2D2D', icon: 'moon',     darkBorder: true },
    { id: 'slate', label: 'Slate', accent: '#4F46E5', swatchColour: '#4F46E5', icon: 'mountain' },
  ],
  Nature: [
    { id: 'forest', label: 'Forest', accent: '#2D6A4F', swatchColour: '#2D6A4F', icon: 'pine-tree' },
    { id: 'ocean',  label: 'Ocean',  accent: '#3B82F6', swatchColour: '#1E2A3A', icon: 'wave',     darkBorder: true },
  ],
  Places: [
    { id: 'london',    label: 'London',    accent: '#CC0000', swatchColour: '#CC0000', icon: 'big-ben' },
    { id: 'warsaw',    label: 'Warsaw',    accent: '#C41E3A', swatchColour: '#C41E3A', icon: 'palace' },
    { id: 'wakefield', label: 'Wakefield', accent: '#C2185B', swatchColour: '#C2185B', icon: 'rhubarb' },
    { id: 'addis',     label: 'Addis',     accent: '#D4860B', swatchColour: '#1B3A2D', icon: 'obelisk', darkBorder: true },
    { id: 'leba',      label: 'Łeba',      accent: '#1B6B5A', swatchColour: '#1B6B5A', icon: 'lighthouse' },
    { id: 'la',        label: 'LA',        accent: '#D2622A', swatchColour: '#D2622A', icon: 'palm-tree' },
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

function ThemeIcon({ id, size }: { id: string; size: number }) {
  const s = size;
  switch (id) {
    case 'sun':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="white">
          <circle cx="12" cy="12" r="4"/>
          <line x1="12" y1="2" x2="12" y2="5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <line x1="12" y1="19" x2="12" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <line x1="2" y1="12" x2="5" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <line x1="19" y1="12" x2="22" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    case 'moon':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="white">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      );
    case 'mountain':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="white">
          <polygon points="12,3 22,20 2,20"/>
        </svg>
      );
    case 'pine-tree':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="white">
          <polygon points="12,2 20,16 4,16"/>
          <rect x="10" y="16" width="4" height="5"/>
        </svg>
      );
    case 'wave':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <path d="M2 12 C5 8, 9 16, 12 12 S19 8, 22 12"/>
          <path d="M2 17 C5 13, 9 21, 12 17 S19 13, 22 17"/>
        </svg>
      );
    case 'big-ben':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="white">
          <rect x="9" y="14" width="6" height="8"/>
          <rect x="8" y="9" width="8" height="5"/>
          <circle cx="12" cy="11" r="2" fill="rgba(255,255,255,0.5)"/>
          <rect x="10" y="5" width="4" height="4"/>
          <polygon points="12,2 15,5 9,5"/>
        </svg>
      );
    case 'palace':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="white">
          <rect x="9" y="10" width="6" height="12"/>
          <rect x="7" y="14" width="10" height="8"/>
          <rect x="10" y="6" width="4" height="4"/>
          <rect x="11" y="3" width="2" height="3"/>
          <polygon points="12,1 13.5,3 10.5,3"/>
        </svg>
      );
    case 'rhubarb':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="white">
          <line x1="12" y1="22" x2="12" y2="10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <path d="M12 10 C8 8, 4 4, 6 2 C8 0, 12 4, 12 10" fill="white"/>
          <path d="M12 10 C16 8, 20 4, 18 2 C16 0, 12 4, 12 10" fill="white"/>
        </svg>
      );
    case 'obelisk':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="white">
          <polygon points="12,2 14,6 14,20 10,20 10,6"/>
          <polygon points="12,2 13,4 11,4"/>
        </svg>
      );
    case 'lighthouse':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="white">
          <rect x="10" y="10" width="4" height="12"/>
          <rect x="9" y="7" width="6" height="3"/>
          <polygon points="12,3 15,7 9,7"/>
          <line x1="12" y1="3" x2="6" y2="1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="12" y1="3" x2="18" y2="1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="12" y1="3" x2="5" y2="5" stroke="white" strokeWidth="1" strokeLinecap="round"/>
          <line x1="12" y1="3" x2="19" y2="5" stroke="white" strokeWidth="1" strokeLinecap="round"/>
        </svg>
      );
    case 'palm-tree':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="white">
          <path d="M12 22 C11 16, 10 10, 12 6"/>
          <path d="M12 6 C10 2, 5 2, 4 5 C7 4, 10 6, 12 6"/>
          <path d="M12 6 C14 2, 19 2, 20 5 C17 4, 14 6, 12 6"/>
          <path d="M12 6 C8 4, 6 0, 9 0 C10 3, 11 5, 12 6"/>
          <path d="M12 6 C16 4, 18 0, 15 0 C14 3, 13 5, 12 6"/>
        </svg>
      );
    default:
      return null;
  }
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
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingBottom: 4 }}>
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
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: theme.swatchColour,
                  border: isSelected
                    ? '2.5px solid var(--sidebar-text)'
                    : theme.darkBorder
                    ? '1px solid rgba(0,0,0,0.15)'
                    : '2px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  outline: isHovered && !isSelected ? `2px solid ${theme.swatchColour}66` : 'none',
                  outlineOffset: 2,
                  transition: 'transform 80ms ease',
                  transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                {isSelected
                  ? <Check size={16} color="white" strokeWidth={3} />
                  : <ThemeIcon id={theme.icon} size={18} />
                }
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
