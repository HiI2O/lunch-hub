import { useContext } from 'react';
import { ToastContext } from '../contexts/toast-context-value';
import type { ToastContextValue } from '../contexts/toast-context-value';

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (context === null) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
