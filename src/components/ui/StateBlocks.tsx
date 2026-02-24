import React from "react";

type Action = {
    label: string;
    onClick: () => void;
};

type StateType = "loading" | "error" | "empty";

type BaseProps = {
    type: StateType;
    title?: string;
    description?: string;
    icon?: string;
    loadingLabel?: string;
    className?: string;
};

type PageStateProps = BaseProps & {
    primaryAction?: Action;
    secondaryAction?: Action;
};

export const PageState: React.FC<PageStateProps> = ({
    type,
    title,
    description,
    icon = "info",
    loadingLabel = "Cargando...",
    primaryAction,
    secondaryAction,
    className,
}) => {
    if (type === "loading") {
        return (
            <div className={["min-h-[60vh] flex items-center justify-center", className].filter(Boolean).join(" ")}>
                <div className="flex flex-col items-center justify-center p-10 space-y-4 animate-in fade-in duration-500">
                    <span className="material-symbols-outlined animate-spin text-ink/70 text-4xl">
                        progress_activity
                    </span>
                    <p className="text-sm font-medium text-muted">{loadingLabel}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={["min-h-[60vh] flex items-center justify-center", className].filter(Boolean).join(" ")}>
            <div className="w-full max-w-xl bg-white border border-slate-100 rounded-3xl shadow-sm p-8 text-center animate-in fade-in duration-500">
                <div className="w-16 h-16 bg-slate-50 flex items-center justify-center rounded-2xl mx-auto mb-6">
                    <span className="material-symbols-outlined text-4xl text-slate-300">{icon}</span>
                </div>

                <h3 className="text-xl font-black text-ink mb-2">
                    {title || (type === "error" ? "Algo falló" : "Nada por aquí (aún)")}
                </h3>

                {description ? (
                    <p className="text-muted font-medium max-w-sm mx-auto mb-6">{description}</p>
                ) : null}

                {(primaryAction || secondaryAction) ? (
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        {primaryAction ? (
                            <button
                                onClick={primaryAction.onClick}
                                className="px-6 py-3 bg-ink hover:bg-slate-800 active:bg-slate-900 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
                            >
                                {primaryAction.label}
                            </button>
                        ) : null}

                        {secondaryAction ? (
                            <button
                                onClick={secondaryAction.onClick}
                                className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl transition-all hover:bg-slate-50 active:scale-95"
                            >
                                {secondaryAction.label}
                            </button>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export const CardState: React.FC<BaseProps> = ({
    type,
    title,
    description,
    icon = "info",
    loadingLabel = "Cargando...",
    className,
}) => {
    if (type === "loading") {
        return (
            <div className={["w-full flex items-center justify-center p-10", className].filter(Boolean).join(" ")}>
                <div className="flex flex-col items-center justify-center space-y-3 animate-in fade-in duration-500">
                    <span className="material-symbols-outlined animate-spin text-ink/60 text-3xl">
                        progress_activity
                    </span>
                    <p className="text-xs font-bold text-muted uppercase tracking-widest">{loadingLabel}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={["w-full rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 p-8 text-center", className].filter(Boolean).join(" ")}>
            <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-2xl text-slate-300">{icon}</span>
            </div>

            <div className="text-sm font-black text-ink">
                {title || (type === "error" ? "No pudimos cargar esto" : "Aún no hay datos")}
            </div>

            {description ? (
                <p className="text-xs text-muted font-medium mt-2 max-w-md mx-auto">{description}</p>
            ) : null}
        </div>
    );
};
