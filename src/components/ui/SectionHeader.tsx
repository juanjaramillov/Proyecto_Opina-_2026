import React from 'react';
import { Button } from './Button';

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    action?: {
        label: string;
        onClick?: () => void;
        href?: string;
        icon?: string;
    };
    centered?: boolean;
    className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    subtitle,
    action,
    centered = false,
    className = ''
}) => {
    return (
        <div className={`mb-8 ${centered ? 'text-center' : 'flex flex-col md:flex-row md:justify-between md:items-end'} ${className}`}>
            <div className={`max-w-2xl ${centered ? 'mx-auto' : ''}`}>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                    {title}
                </h2>
                {subtitle && (
                    <p className={`mt-2 text-lg text-slate-500 font-medium leading-relaxed ${centered ? 'mx-auto' : ''}`}>
                        {subtitle}
                    </p>
                )}
            </div>
            {action && (
                <div className={`mt-4 md:mt-0 ${centered ? 'flex justify-center' : ''}`}>
                    <Button
                        variant="ghost"
                        size="sm"
                        href={action.href}
                        onClick={action.onClick}
                        icon={action.icon}
                    >
                        {action.label}
                    </Button>
                </div>
            )}
        </div>
    );
};
