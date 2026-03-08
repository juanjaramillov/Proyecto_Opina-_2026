import React from 'react';

interface KpiCardProps {
    title: string;
    value: string | number;
    trend?: {
        value: number; // Percentage or absolute value
        isPositive: boolean;
        label?: string;
    };
    icon?: React.ReactNode;
    className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({ title, value, trend, icon, className = '' }) => {
    return (
        <div className={`card card-pad ${className}`}>
            <div className="flex items-start justify-between mb-4">
                <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider">{title}</h3>
                {icon && (
                    <div className="text-text-muted opacity-60">
                        {icon}
                    </div>
                )}
            </div>

            <div className="flex items-baseline gap-3">
                <div className="h2">{value}</div>
                {trend && (
                    <div className={`flex items-center gap-1 text-sm font-bold ${trend.isPositive ? 'text-secondary' : 'text-rose-500'}`}>
                        <span className="material-symbols-outlined text-[16px]">
                            {trend.isPositive ? 'trending_up' : 'trending_down'}
                        </span>
                        <span>{trend.value}%</span>
                        {trend.label && <span className="text-text-muted font-medium ml-1">{trend.label}</span>}
                    </div>
                )}
            </div>
        </div>
    );
};
