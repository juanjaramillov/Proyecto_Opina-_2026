import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    /** Si true, el botón de confirmación usa el token semántico danger en lugar de brand. */
    danger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

/**
 * Diálogo de confirmación reutilizable. Reemplaza `window.confirm()` con UX
 * consistente con el resto del admin (framer-motion + tokens brand/slate).
 *
 * - Backdrop click → cancela
 * - ESC → cancela
 * - Foco automático en el botón de confirmación al abrir
 * - z-index 60 (por encima de modales de página, bajo Toaster)
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    open,
    title,
    message,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    danger = false,
    onConfirm,
    onCancel,
}) => {
    const confirmBtnRef = useRef<HTMLButtonElement>(null);

    // ESC para cancelar
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onCancel]);

    // Foco inicial en el botón de confirmar
    useEffect(() => {
        if (open) {
            // Delay mínimo para que el motion termine de mountear
            const t = setTimeout(() => confirmBtnRef.current?.focus(), 50);
            return () => clearTimeout(t);
        }
    }, [open]);

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={onCancel}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="confirm-dialog-title"
                    >
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                {danger && (
                                    <div className="shrink-0 w-10 h-10 rounded-full bg-danger-50 text-danger flex items-center justify-center">
                                        <AlertTriangle className="w-5 h-5" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h2 id="confirm-dialog-title" className="text-lg font-black text-slate-900 mb-2">
                                        {title}
                                    </h2>
                                    <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                            <button
                                onClick={onCancel}
                                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                            >
                                {cancelLabel}
                            </button>
                            <button
                                ref={confirmBtnRef}
                                onClick={onConfirm}
                                className={`px-5 py-2 text-sm font-bold text-white rounded-xl shadow-sm hover:shadow transition-all ${
                                    danger
                                        ? 'bg-danger hover:bg-danger-600'
                                        : 'bg-brand hover:bg-brand-600'
                                }`}
                            >
                                {confirmLabel}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmDialog;
