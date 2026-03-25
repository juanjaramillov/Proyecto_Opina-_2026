import { createContext } from 'react';

export type ToastType = 'success' | 'info' | 'award' | 'error';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  points?: number;
}

export interface ToastContextType {
  showToast: (message: string, type?: ToastType, points?: number) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);
