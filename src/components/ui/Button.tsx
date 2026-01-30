import React, { ButtonHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    icon?: string;
    isActive?: boolean; // For toggle states
    href?: string; // If provided, renders as Link
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    icon,
    isActive = false,
    href,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center font-bold transition-all rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

    const variants = {
        primary: "bg-gradient-to-r from-indigo-600 to-emerald-500 text-white hover:opacity-90 shadow-lg shadow-indigo-500/20 focus:ring-indigo-500 border-0",
        secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 focus:ring-indigo-500",
        ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-400",
        danger: "bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-500 border border-transparent"
    };

    const activeStyles = isActive ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "";

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-5 py-3 text-sm",
        lg: "px-8 py-4 text-base md:text-lg"
    };

    const widthStyle = fullWidth ? "w-full" : "";

    const combinedClassName = `
        ${baseStyles} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${widthStyle} 
        ${activeStyles}
        ${className}
    `.trim();

    const content = (
        <>
            {icon && <span className={`material-symbols-outlined ${children ? 'mr-2' : ''} text-[1.2em]`}>{icon}</span>}
            {children}
        </>
    );

    if (href) {
        return (
            <Link to={href} className={combinedClassName}>
                {content}
            </Link>
        );
    }

    return (
        <button className={combinedClassName} disabled={disabled} {...props}>
            {content}
        </button>
    );
};
