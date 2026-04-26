import React from "react";
import { AnimatePresence, motion } from "framer-motion";

type NoticeVariant = "error" | "success" | "info";

export function AuthNotice({
    message,
    variant = "error",
}: {
    message?: string | null;
    variant?: NoticeVariant;
}) {
    const styles =
        variant === "success"
            ? "bg-accent/10 border-accent-100 text-accent"
            : variant === "info"
                ? "bg-brand/10 border-brand/20 text-brand"
                : "bg-danger-50 border-danger-100 text-danger-600";

    const icon =
        variant === "success" ? "check_circle" : variant === "info" ? "info" : "error";

    return (
        <AnimatePresence>
            {!!message && (
                <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 20 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className={`p-4 border rounded-2xl text-sm text-center font-medium overflow-hidden ${styles}`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">{icon}</span>
                        <span>{message}</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

type AuthTextInputProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: "text" | "email" | "password" | "number";
    placeholder?: string;
    required?: boolean;
    autoComplete?: string;
    right?: React.ReactNode;
    hint?: React.ReactNode;
    tone?: "default" | "invite";
    min?: string;
    max?: string;
};

export function AuthTextInput({
    label,
    value,
    onChange,
    type = "text",
    placeholder,
    required,
    autoComplete,
    right,
    hint,
    tone = "default",
    min,
    max,
}: AuthTextInputProps) {
    const base =
        "w-full px-5 py-4 border-2 rounded-2xl outline-none transition-all font-medium";

    const toneCls =
        tone === "invite"
            ? "bg-brand-50/30 border-brand/20 text-brand focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand-500/10 font-black uppercase tracking-wider"
            : "bg-slate-50/50 border-slate-100 text-slate-700 focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand-500/10";

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 ml-1">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
                    {label}
                </label>
                {right ? <div className="shrink-0">{right}</div> : null}
            </div>

            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                autoComplete={autoComplete}
                min={min}
                max={max}
                className={`${base} ${toneCls}`}
            />

            {hint ? <div className="text-[11px] text-slate-400 ml-1 font-medium">{hint}</div> : null}
        </div>
    );
}



export function AuthPrimaryButton({
    children,
    disabled,
    loading,
    loadingLabel = "Cargando...",
}: {
    children: React.ReactNode;
    disabled?: boolean;
    loading?: boolean;
    loadingLabel?: string;
}) {
    return (
        <button
            type="submit"
            disabled={disabled || loading}
            className="btn-primary w-full uppercase tracking-wider text-sm flex items-center justify-center gap-2"
        >
            {loading ? (
                <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {loadingLabel}
                </>
            ) : (
                children
            )}
        </button>
    );
}
