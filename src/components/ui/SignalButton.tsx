
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface SignalButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    to?: string;
    variant?: 'primary' | 'secondary' | 'ghost';
    className?: string;
    icon?: string;
    fullWidth?: boolean;
    disabled?: boolean;
}

const SignalButton: React.FC<SignalButtonProps> = ({
    children,
    onClick,
    to,
    variant = 'primary',
    className = '',
    icon,
    fullWidth = false,
    disabled = false
}) => {
    const baseStyles = "relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        primary: "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:brightness-110 border border-cyan-400/20",
        secondary: "bg-white text-slate-700 border border-slate-200 hover:border-cyan-300 hover:text-cyan-700 hover:bg-cyan-50/30",
        ghost: "bg-transparent text-slate-500 hover:text-cyan-600 hover:bg-cyan-50/50"
    };

    const widthClass = fullWidth ? "w-full" : "";
    const combinedClassName = `${baseStyles} ${variants[variant]} ${widthClass} ${className}`;

    const content = (
        <>
            {icon && <span className="material-symbols-outlined text-[20px]">{icon}</span>}
            {children}
            {variant === 'primary' && (
                <span className="absolute inset-0 rounded-2xl ring-1 ring-white/20 pointer-events-none"></span>
            )}
        </>
    );

    if (to && !disabled) {
        return (
            <Link to={to} className={combinedClassName}>
                {content}
            </Link>
        );
    }

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            disabled={disabled}
            className={combinedClassName}
        >
            {content}
        </motion.button>
    );
};

export default SignalButton;
