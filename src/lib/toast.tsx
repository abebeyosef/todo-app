'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastAction = 'undo' | 'open' | null;

type ToastItem = {
  id: string;
  message: string;
  action: ToastAction;
  onAction?: () => void;
};

type ToastContextType = {
  showToast: (message: string, action?: ToastAction, onAction?: () => void) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, action: ToastAction = null, onAction?: () => void) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, action, onAction }]);
      setTimeout(() => removeToast(id), 5000);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast stack */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          left: 24,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              background: 'var(--bg-toast)',
              color: 'var(--text-toast)',
              borderRadius: 8,
              padding: '12px 16px',
              boxShadow: 'var(--shadow-toast)',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              minWidth: 220,
              maxWidth: 360,
              animation: 'slideUp 200ms ease',
            }}
          >
            <span style={{ flex: 1 }}>{toast.message}</span>
            {toast.action && (
              <button
                onClick={() => {
                  toast.onAction?.();
                  removeToast(toast.id);
                }}
                style={{
                  color: 'white',
                  fontWeight: 600,
                  textDecoration: 'underline',
                  fontSize: 13,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                {toast.action === 'undo' ? 'Undo' : 'Open'}
              </button>
            )}
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: 16,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                lineHeight: 1,
                flexShrink: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'white')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
