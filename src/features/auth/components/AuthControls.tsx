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
            ? "bg-emerald-50 border-emerald-100 text-emerald-700"
            : variant === "info"
                ? "bg-primary-50 border-primary-100 text-primary-700"
                : "bg-rose-50 border-rose-100 text-rose-600";

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
            ? "bg-primary-50/30 border-primary-100 text-primary-900 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 font-black uppercase tracking-wider"
            : "bg-slate-50/50 border-slate-100 text-slate-700 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10";

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

type AuthSelectProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    placeholder?: string;
    options: string[];
    hint?: React.ReactNode;
};

export function AuthSelect({
    label,
    value,
    onChange,
    required,
    placeholder = "Selecciona una opción",
    options,
    hint,
}: AuthSelectProps) {
    return (
        <div className="space-y-2">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                {label}
            </label>

            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                className="w-full px-5 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition-all font-bold text-slate-700"
            >
                <option value="">{placeholder}</option>
                {options.map((o) => (
                    <option key={o} value={o}>
                        {o}
                    </option>
                ))}
            </select>

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
            className="btn-primary w-full py-4 rounded-2xl font-black uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
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
