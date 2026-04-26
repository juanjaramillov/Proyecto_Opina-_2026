import React from 'react';
import { Activity, Clock, AlertCircle } from 'lucide-react';

export type MetricStatus = 'available' | 'pending' | 'insufficient_data';

export interface MetricAvailabilityCardProps {
    label: string;
    status: MetricStatus;
    value?: React.ReactNode;
    helperText?: string;
    icon?: React.ElementType;
    compact?: boolean;
}

export function MetricAvailabilityCard({
    label,
    status,
    value,
    helperText,
    icon: Icon,
    compact = false
}: MetricAvailabilityCardProps) {
    
    // Configuraciones visuales por estado
    const statusConfig = {
        available: {
            bg: 'bg-white',
            border: 'border-stroke hover:border-accent/50',
            iconColor: 'text-accent',
            labelColor: 'text-slate-500',
            valueColor: 'text-ink',
            DefaultIcon: Activity
        },
        pending: {
            bg: 'bg-surface2 border-dashed',
            border: 'border-stroke',
            iconColor: 'text-slate-500/70',
            labelColor: 'text-slate-500',
            valueColor: 'text-slate-500/70',
            DefaultIcon: Clock
        },
        insufficient_data: {
            bg: 'bg-surface2 border-dashed',
            border: 'border-stroke',
            iconColor: 'text-slate-500',
            labelColor: 'text-slate-500',
            valueColor: 'text-ink',
            DefaultIcon: AlertCircle
        }
    };

    const config = statusConfig[status];
    const CurrentIcon = Icon || config.DefaultIcon;

    if (compact) {
        return (
            <div className={`flex items-center gap-1.5 text-sm ${config.labelColor}`} title={helperText}>
                <CurrentIcon className={`w-4 h-4 ${config.iconColor}`} />
                {status === 'available' && value ? (
                    <>
                        <span className={`font-bold ${config.valueColor}`}>{value}</span>
                        <span className="text-xs hidden sm:inline">{label}</span>
                    </>
                ) : status === 'pending' ? (
                    <span className="italic text-xs">En preparación</span>
                ) : (
                    <span className="italic text-xs">Sin telemetría consolidada</span>
                )}
            </div>
        );
    }

    return (
        <div className={`flex flex-col p-4 md:p-5 rounded-2xl border ${config.bg} ${config.border} transition-colors`}>
            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2 ${config.labelColor}`}>
                <CurrentIcon className={`w-4 h-4 ${config.iconColor}`} />
                {label}
            </div>
            
            {status === 'available' ? (
                <div className={`text-2xl md:text-3xl font-black mb-1 tracking-tight ${config.valueColor}`}>
                    {value}
                </div>
            ) : status === 'pending' ? (
                <div className={`text-lg md:text-xl font-bold mb-1 tracking-tight ${config.valueColor}`}>
                    En preparación
                </div>
            ) : (
                <div className={`text-lg md:text-xl font-bold mb-1 tracking-tight ${config.valueColor}`}>
                    Masa crítica insuficiente
                </div>
            )}
            
            {helperText && (
                <div className={`text-xs md:text-sm font-medium leading-snug ${status === 'available' ? 'text-slate-500' : config.labelColor}`}>
                    {helperText}
                </div>
            )}
        </div>
    );
}
