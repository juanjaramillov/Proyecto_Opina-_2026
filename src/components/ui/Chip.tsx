export type ChipVariant =
    | 'neutral'
    | 'accent'
    | 'success'
    | 'warning'
    | 'error'
    // Semantic Statuses for Trends
    | 'status-up'
    | 'status-down'
    | 'status-split'
    | 'status-stable';

export type ChipSize = 'sm' | 'md';

interface ChipProps {
    label: string;
    variant?: ChipVariant;
    size?: ChipSize;
    icon?: React.ReactNode;
    className?: string; // Escape hatch
}

const VARIANTS: Record<ChipVariant, string> = {
    neutral: 'bg-slate-100 text-slate-600 border-slate-200',
    accent: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    warning: 'bg-amber-50 text-amber-600 border-amber-100',
    error: 'bg-rose-50 text-rose-600 border-rose-100',
    // Statuses
    'status-up': 'bg-emerald-50 text-emerald-600 border-emerald-100 uppercase tracking-wider font-black',
    'status-down': 'bg-rose-50 text-rose-600 border-rose-100 uppercase tracking-wider font-black',
    'status-split': 'bg-amber-50 text-amber-600 border-amber-100 uppercase tracking-wider font-black',
    'status-stable': 'bg-slate-50 text-slate-500 border-slate-200 uppercase tracking-wider font-black',
};

const SIZES: Record<ChipSize, string> = {
    sm: 'text-[9px] px-1.5 py-0.5 rounded-md',
    md: 'text-xs px-2.5 py-1 rounded-full',
};

export default function Chip({ label, variant = 'neutral', size = 'sm', icon, className = '' }: ChipProps) {
    const variantClasses = VARIANTS[variant];
    const sizeClasses = SIZES[size];

    return (
        <span className={`inline-flex items-center gap-1.5 border font-bold leading-none ${variantClasses} ${sizeClasses} ${className}`}>
            {icon}
            {label}
        </span>
    );
}
