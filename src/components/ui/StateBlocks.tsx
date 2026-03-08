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
                    <span className="material-symbols-outlined text-[32px] text-primary-500 animate-[spin_2s_linear_infinite] drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                        progress_activity
                    </span>
                    <p className="text-sm font-bold text-slate-400 tracking-wide">{loadingLabel}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={["min-h-[60vh] flex items-center justify-center", className].filter(Boolean).join(" ")}>
            <div className="w-full max-w-xl bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-[2rem] shadow-2xl shadow-slate-900/50 p-8 text-center animate-in fade-in duration-500">
                <div className="w-16 h-16 bg-slate-900/50 border border-slate-700 flex items-center justify-center rounded-2xl mx-auto mb-6 shadow-inner">
                    <span className="material-symbols-outlined text-4xl text-slate-400">{icon}</span>
                </div>

                <h3 className="text-xl font-black text-white mb-2">
                    {title || (type === "error" ? "Algo falló" : "Nada por aquí (aún)")}
                </h3>

                {description ? (
                    <p className="text-slate-400 font-medium max-w-sm mx-auto mb-6">{description}</p>
                ) : null}

                {(primaryAction || secondaryAction) ? (
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        {primaryAction ? (
                            <button
                                onClick={primaryAction.onClick}
                                className="px-6 py-3 bg-primary-600 hover:bg-primary-500 active:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-primary-500/20 active:scale-95"
                            >
                                {primaryAction.label}
                            </button>
                        ) : null}

                        {secondaryAction ? (
                            <button
                                onClick={secondaryAction.onClick}
                                className="px-6 py-3 bg-slate-800 border border-slate-700 text-slate-300 font-bold rounded-xl transition-all hover:bg-slate-700 hover:text-white active:scale-95 shadow-sm"
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
                    <span className="material-symbols-outlined animate-spin text-primary-500/70 text-3xl">
                        progress_activity
                    </span>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{loadingLabel}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={["w-full rounded-2xl border border-dashed border-slate-700 bg-slate-800/40 p-8 text-center", className].filter(Boolean).join(" ")}>
            <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-2xl text-slate-500">{icon}</span>
            </div>

            <div className="text-sm font-black text-white">
                {title || (type === "error" ? "No pudimos cargar esto" : "Aún no hay datos")}
            </div>

            {description ? (
                <p className="text-xs text-slate-400 font-medium mt-2 max-w-md mx-auto">{description}</p>
            ) : null}
        </div>
    );
};
