import React from 'react';

interface EmptyAction {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: React.ElementType | string;
    primaryAction?: EmptyAction;
    secondaryAction?: EmptyAction;
    className?: string;
}

export function EmptyState({
    title,
    description,
    icon: Icon,
    primaryAction,
    secondaryAction,
    className = ''
}: EmptyStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center p-8 md:p-12 text-center bg-white border border-stroke rounded-[2rem] shadow-sm animate-in fade-in duration-500 ${className}`}>
            {Icon && (
              <div className="w-16 h-16 bg-surface2 border border-stroke flex items-center justify-center rounded-2xl mb-6 shadow-inner">
                  {typeof Icon === 'string' ? (
                      <span className="material-symbols-outlined text-4xl text-text-muted">
                          {Icon}
                      </span>
                  ) : (
                      <Icon className="w-8 h-8 text-text-muted" />
                  )}
              </div>
            )}

            <h3 className="text-xl md:text-2xl font-black tracking-tight text-ink mb-2">
                {title}
            </h3>

            {description && (
                <p className="text-sm font-medium text-text-secondary max-w-md mx-auto mb-6 leading-relaxed">
                    {description}
                </p>
            )}

            {(primaryAction || secondaryAction) && (
              <div className="flex items-center justify-center gap-3 w-full">
                {secondaryAction && (
                    <button
                        onClick={secondaryAction.onClick}
                        className="btn-secondary px-6 py-2.5 text-sm font-bold shrink-0"
                    >
                        {secondaryAction.label}
                    </button>
                )}
                {primaryAction && (
                    <button
                        onClick={primaryAction.onClick}
                        className="btn-primary px-6 py-2.5 text-sm font-bold shrink-0"
                    >
                        {primaryAction.label}
                    </button>
                )}
              </div>
            )}
        </div>
    );
}
