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
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-stroke rounded-[2rem] shadow-sm animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-surface2 border border-stroke flex items-center justify-center rounded-2xl mb-6 shadow-inner">
                <span className="material-symbols-outlined text-4xl text-text-muted">
                    {icon}
                </span>
            </div>

            <h3 className="h3 mb-2">
                {title}
            </h3>

            {description && (
                <p className="body-base max-w-sm mx-auto mb-6">
                    {description}
                </p>
            )}

            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="btn-primary px-6 py-3"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};
