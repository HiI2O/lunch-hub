import { createContext } from 'react';

export type ToastType = 'success' | 'error';

export type ToastItem = {
  readonly id: number;
  readonly type: ToastType;
  readonly message: string;
};

export type ShowOptions = {
  readonly type: ToastType;
  readonly message: string;
};

export type ToastContextValue = {
  readonly show: (options: ShowOptions) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);
