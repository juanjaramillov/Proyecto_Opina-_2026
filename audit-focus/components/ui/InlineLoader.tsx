import React from 'react';

interface InlineLoaderProps {
    label?: string;
}

export const InlineLoader: React.FC<InlineLoaderProps> = ({ label = 'Cargando...' }) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4 animate-in fade-in duration-500">
            <span className="material-symbols-outlined animate-spin text-ink/70 text-3xl">
                progress_activity
            </span>
            <p className="text-sm font-medium text-muted">
                {label}
            </p>
        </div>
    );
};
