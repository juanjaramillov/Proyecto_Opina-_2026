
import React from 'react';

interface SignalChipProps {
    label: string;
    icon?: string;
    active?: boolean;
    variant?: 'default' | 'signal' | 'outline';
    onClick?: () => void;
    className?: string; // Added className prop
}

const SignalChip: React.FC<SignalChipProps> = ({ label, icon, active, variant = 'default', onClick, className = '' }) => {
    const baseStyles = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-default select-none";
    const clickableStyles = onClick ? "cursor-pointer hover:opacity-80 active:scale-95" : "";

    let variantStyles = "";

    if (active) {
        variantStyles = "bg-cyan-50 border-cyan-200 text-cyan-700 shadow-sm";
    } else {
        switch (variant) {
            case 'signal':
                variantStyles = "bg-cyan-500/10 border-cyan-500/20 text-cyan-700";
                break;
            case 'outline':
                variantStyles = "bg-transparent border-slate-200 text-slate-500";
                break;
            default: // default
                variantStyles = "bg-slate-50 border-slate-200 text-slate-600";
                break;
        }
    }

    return (
        <div
            className={`${baseStyles} ${variantStyles} ${clickableStyles} ${className}`}
            onClick={onClick}
        >
            {icon && <span className="material-symbols-outlined text-[14px]">{icon}</span>}
            <span className="tracking-wide uppercase text-[10px]">{label}</span>
        </div>
    );
};

export default SignalChip;
