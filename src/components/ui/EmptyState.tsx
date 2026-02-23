import React from 'react';

interface EmptyStateProps {
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    icon?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title,
    description,
    actionLabel,
    onAction,
    icon = 'inbox'
}) => {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-100 rounded-3xl shadow-sm animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-slate-50 flex items-center justify-center rounded-2xl mb-6">
                <span className="material-symbols-outlined text-4xl text-slate-300">
                    {icon}
                </span>
            </div>

            <h3 className="text-xl font-black text-ink mb-2">
                {title}
            </h3>

            {description && (
                <p className="text-muted font-medium max-w-sm mx-auto mb-6">
                    {description}
                </p>
            )}

            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="px-6 py-3 bg-ink hover:bg-slate-800 active:bg-slate-900 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};
