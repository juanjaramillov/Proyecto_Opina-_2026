

export type TagType = 'battle' | 'review' | 'trend' | 'signal';

type Props = {
    type: TagType;
    label?: string; // Optional override
    size?: 'sm' | 'md';
};

export default function TagBadge({ type, label, size = 'md' }: Props) {
    let styles = '';
    let icon = '';
    let defaultLabel = '';

    switch (type) {
        case 'battle':
            styles = 'bg-rose-50 text-rose-700 border-rose-100';
            icon = 'swords';
            defaultLabel = 'Batalla';
            break;
        case 'review':
            styles = 'bg-emerald-50 text-emerald-700 border-emerald-100';
            icon = 'verified';
            defaultLabel = 'Reseña';
            break;
        case 'trend':
            styles = 'bg-indigo-50 text-indigo-700 border-indigo-100';
            icon = 'trending_up';
            defaultLabel = 'Tendencia';
            break;
        case 'signal':
        default:
            styles = 'bg-slate-100 text-slate-700 border-slate-200';
            icon = 'wifi';
            defaultLabel = 'Señal';
            break;
    }

    const sizeClasses = size === 'sm'
        ? 'px-1.5 py-0.5 text-[10px] gap-1'
        : 'px-2.5 py-1 text-xs gap-1.5';

    const iconSize = size === 'sm' ? 'text-[12px]' : 'text-[14px]';

    return (
        <span className={`inline-flex items-center rounded-md font-bold uppercase tracking-wider border ${styles} ${sizeClasses}`}>
            <span className={`material-symbols-outlined ${iconSize}`}>
                {icon}
            </span>
            {label || defaultLabel}
        </span>
    );
}
