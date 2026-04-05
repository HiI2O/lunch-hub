import { useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ToastContext } from './toast-context-value';
import type { ToastItem, ShowOptions, ToastContextValue } from './toast-context-value';

let nextId = 0;

export function ToastProvider({ children }: { readonly children: ReactNode }): React.JSX.Element {
  const [toasts, setToasts] = useState<readonly ToastItem[]>([]);

  const dismiss = useCallback((id: number): void => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((options: ShowOptions): void => {
    const id = nextId++;
    const toast: ToastItem = { id, ...options };
    setToasts((prev) => [...prev, toast]);

    if (options.type === 'success') {
      setTimeout(() => dismiss(id), 3000);
    }
  }, [dismiss]);

  const value = useMemo<ToastContextValue>(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="toast-container">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast toast-${toast.type}`} role="alert">
              <span className="toast-message">{toast.message}</span>
              {toast.type === 'error' && (
                <button
                  type="button"
                  className="toast-close"
                  aria-label="閉じる"
                  onClick={() => dismiss(toast.id)}
                >
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}
