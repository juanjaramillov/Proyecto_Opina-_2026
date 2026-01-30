import React, { ReactNode, useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toast, ToastContext, ToastType } from './Toast.types';

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info', points?: number) => {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = { id, message, type, points };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-24 left-0 right-0 z-[100] flex flex-col items-center gap-2 pointer-events-none px-4">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="bg-slate-900 border border-slate-700 text-white shadow-xl rounded-full pl-4 pr-6 py-3 flex items-center gap-3 min-w-[200px] backdrop-blur-md"
            >
              {toast.points ? (
                <div className="bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white text-xs font-black px-2 py-1 rounded-full shadow-lg">
                  +{toast.points}
                </div>
              ) : (
                <span className="material-symbols-outlined text-cyan-400">
                  {toast.type === 'success' ? 'check_circle' : 'info'}
                </span>
              )}
              <span className="text-sm font-bold">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
