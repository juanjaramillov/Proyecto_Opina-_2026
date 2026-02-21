

interface SkeletonProps {
    className?: string;
    variant?: 'card' | 'text' | 'circular' | 'pill';
    animate?: boolean;
}

export function Skeleton({ className = '', variant = 'text', animate = true }: SkeletonProps) {
    const baseClass = animate ? 'animate-pulse bg-slate-200/80' : 'bg-slate-200/50';

    const variantStyles = {
        card: 'rounded-2xl',
        text: 'rounded-md',
        circular: 'rounded-full aspect-square',
        pill: 'rounded-full',
    };

    return (
        <div className={`${baseClass} ${variantStyles[variant]} ${className}`} />
    );
}

export function SkeletonHeroCard() {
    return (
        <div className="w-full h-full min-h-[400px] flex flex-col justify-between p-6 rounded-[2.5rem] bg-slate-50 border border-slate-100 shadow-sm overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-100/50 to-slate-50 opacity-50" />
            <Skeleton variant="circular" className="w-16 h-16 mb-4" />
            <div className="space-y-3 mt-auto w-full z-10">
                <Skeleton variant="text" className="w-3/4 h-8 bg-white/60" />
                <Skeleton variant="text" className="w-1/2 h-4 bg-white/60" />
                <div className="flex gap-2 pt-4">
                    <Skeleton variant="pill" className="w-20 h-6 bg-white/60" />
                    <Skeleton variant="pill" className="w-24 h-6 bg-white/60" />
                </div>
            </div>
            {/* Shimmer effect overlay */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        </div>
    );
}

export function SkeletonModuleCard() {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full relative overflow-hidden">
            <Skeleton variant="circular" className="w-12 h-12 mb-4 bg-slate-100" />
            <Skeleton variant="text" className="w-2/3 h-6 mb-3 bg-slate-200" />
            <Skeleton variant="text" className="w-full h-3 mb-2" />
            <Skeleton variant="text" className="w-4/5 h-3 mb-6" />
            <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                <Skeleton variant="text" className="w-16 h-3" />
                <Skeleton variant="text" className="w-20 h-3" />
            </div>
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        </div>
    );
}

export function SkeletonRankingTopCard() {
    return (
        <div className="relative p-8 rounded-[40px] border bg-white border-slate-100 shadow-xl overflow-hidden">
            <Skeleton variant="circular" className="absolute -top-4 -left-4 w-12 h-12 border-4 border-white bg-slate-200" />
            <div className="flex flex-col items-center text-center gap-4">
                <Skeleton variant="card" className="w-20 h-20 rounded-2xl bg-slate-100" />
                <div className="space-y-3 w-full flex flex-col items-center">
                    <Skeleton variant="text" className="w-24 h-5 bg-slate-200" />
                    <Skeleton variant="text" className="w-32 h-3" />
                </div>
            </div>
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        </div>
    );
}

export function SkeletonRankingRow() {
    return (
        <div className="px-8 py-5 flex items-center justify-between bg-white relative overflow-hidden">
            <div className="flex items-center gap-6 w-full">
                <Skeleton variant="text" className="w-4 h-5 animate-pulse bg-slate-200" />
                <Skeleton variant="card" className="w-10 h-10 rounded-lg bg-slate-100" />
                <Skeleton variant="text" className="w-32 h-4 bg-slate-200" />
            </div>
            <Skeleton variant="pill" className="w-16 h-4 hidden sm:block" />
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        </div>
    );
}
