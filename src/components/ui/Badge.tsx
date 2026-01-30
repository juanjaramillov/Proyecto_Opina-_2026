import React, { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'brand' | 'success' | 'warning' | 'error' | 'outline';
    size?: 'sm' | 'md';
    icon?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    size = 'md',
    icon,
    className = '',
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center font-bold tracking-wide uppercase rounded-full whitespace-nowrap";

    const variants = {
        default: "bg-slate-100 text-slate-600",
        brand: "bg-indigo-50 text-indigo-700 border border-indigo-100",
        success: "bg-emerald-50 text-emerald-700 border border-emerald-100",
        warning: "bg-amber-50 text-amber-700 border border-amber-100",
        error: "bg-red-50 text-red-700 border border-red-100",
        outline: "bg-transparent border border-slate-200 text-slate-500"
    };

    const sizes = {
        sm: "text-[10px] px-2 py-0.5",
        md: "text-xs px-3 py-1"
    };

    return (
        <span
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {icon && <span className="material-symbols-outlined text-[1.2em] mr-1 -ml-0.5">{icon}</span>}
            {children}
        </span>
    );
};
