

type Props = {
    label: string;
    value: string | number;
    icon?: string;
    variant?: 'default' | 'highlight';
    subtext?: string;
    className?: string;
};

export default function StatPill({ label, value, icon, variant = 'default', subtext, className = '' }: Props) {
    const isHighlight = variant === 'highlight';

    return (
        <div className={`
            inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors
            ${isHighlight
                ? 'bg-indigo-50 border-indigo-100 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-600'}
            ${className}
        `}>
            {icon && (
                <span className={`material-symbols-outlined text-[16px] ${isHighlight ? 'text-indigo-500' : 'text-slate-400'}`}>
                    {icon}
                </span>
            )}
            <span className={isHighlight ? 'text-indigo-800/80' : 'text-slate-500'}>{label}:</span>
            <span className={`font-bold ${isHighlight ? 'text-indigo-900' : 'text-slate-900'}`}>{value}</span>
            {subtext && <span className="text-slate-400 pl-1 border-l border-slate-200 ml-1">{subtext}</span>}
        </div>
    );
}
