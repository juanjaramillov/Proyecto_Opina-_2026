import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PromptDialogProps {
    open: boolean;
    title: string;
    message?: string;
    inputLabel?: string;
    placeholder?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    /** Si true, el campo es obligatorio (botón disabled hasta que tenga valor). */
    required?: boolean;
    /** Valor inicial del input cuando se abre el diálogo. */
    initialValue?: string;
    /** Si true, el botón de confirmación usa el token semántico danger. */
    danger?: boolean;
    onConfirm: (value: string) => void;
    onCancel: () => void;
}

/**
 * Diálogo de confirmación con input de texto. Reemplaza `window.prompt()`.
 *
 * - Backdrop click / ESC → cancela
 * - Enter en el input → confirma (si no está disabled)
 * - Foco automático en el input al abrir
 * - El estado del input se resetea cada vez que el diálogo se abre
 */
export const PromptDialog: React.FC<PromptDialogProps> = ({
    open,
    title,
    message,
    inputLabel,
    placeholder,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    required = false,
    initialValue = '',
    danger = false,
    onConfirm,
    onCancel,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [value, setValue] = useState(initialValue);

    // Resetear input cada vez que se abre
    useEffect(() => {
        if (open) {
            setValue(initialValue);
            const t = setTimeout(() => inputRef.current?.focus(), 50);
            return () => clearTimeout(t);
        }
    }, [open, initialValue]);

    // ESC para cancelar
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onCancel]);

    const trimmed = value.trim();
    const canConfirm = required ? trimmed.length > 0 : true;

    const handleConfirm = () => {
        if (!canConfirm) return;
        onConfirm(trimmed);
    };

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
                        aria-labelledby="prompt-dialog-title"
                    >
                        <div className="p-6">
                            <h2 id="prompt-dialog-title" className="text-lg font-black text-slate-900 mb-2">
                                {title}
                            </h2>
                            {message && <p className="text-sm text-slate-600 leading-relaxed mb-4">{message}</p>}

                            {inputLabel && (
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    {inputLabel}
                                </label>
                            )}
                            <input
                                ref={inputRef}
                                type="text"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleConfirm();
                                    }
                                }}
                                placeholder={placeholder}
                                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand/50 focus:border-brand outline-none transition"
                            />
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                            <button
                                onClick={onCancel}
                                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                            >
                                {cancelLabel}
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={!canConfirm}
                                className={`px-5 py-2 text-sm font-bold text-white rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
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

export default PromptDialog;
