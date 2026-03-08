import React from 'react';

interface FilterChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
    isActive?: boolean;
    icon?: React.ReactNode;
}

export const FilterChip: React.FC<FilterChipProps> = ({
    label,
    isActive = false,
    icon,
    className = '',
    ...props
}) => {
    return (
        <button
            className={`
                inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 border
                ${isActive
                    ? 'bg-primary/10 text-primary border-primary/20 shadow-sm'
                    : 'bg-white text-text-secondary border-stroke hover:border-primary/30 hover:shadow-sm hover:text-ink'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
                ${className}
            `}
            {...props}
        >
            {icon && <span className={`flex items-center ${isActive ? 'text-primary' : 'text-text-muted'}`}>{icon}</span>}
            {label}
        </button>
    );
};
