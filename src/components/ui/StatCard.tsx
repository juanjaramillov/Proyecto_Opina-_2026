import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
    label: string;
    value: string | number;
    subtext?: string;
    icon?: string;
    variant?: 'white' | 'dark';
    className?: string;
    delay?: number;
    footer?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    subtext,
    icon,
    variant = 'white',
    className = '',
    delay = 0,
    footer
}) => {
    const isDark = variant === 'dark';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className={`
                p-6 rounded-3xl relative overflow-hidden
                ${isDark ? 'bg-slate-900 shadow-lg' : 'bg-white border border-slate-200 shadow-sm'}
                ${className}
            `}
        >
            <div className={`relative z-10 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                    {label}
                </div>
                <div className={`text-4xl font-black mb-1 ${isDark ? 'text-cyan-400' : 'text-slate-900'}`}>
                    {value}
                </div>
                {subtext && (
                    <div className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                        {subtext}
                    </div>
                )}
                {footer}
            </div>

            {icon && (
                <div className={`absolute top-4 right-4 ${isDark ? 'text-slate-100 opacity-20' : 'text-slate-100'}`}>
                    <span className="material-symbols-outlined text-6xl">{icon}</span>
                </div>
            )}

            {/* Dark mode background effect */}
            {isDark && (
                <div className="absolute -right-4 -top-4 w-32 h-32 bg-cyan-500 rounded-full blur-3xl opacity-20"></div>
            )}
        </motion.div>
    );
};
