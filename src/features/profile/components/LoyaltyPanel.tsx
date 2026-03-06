import { useMemo } from "react";
import { formatPoints, getTierForSignals, clamp01 } from "../loyalty/loyaltyModel";

type Props = {
    totalSignals: number;
    profileCompleteness: number; // Retained for compatibility if needed elsewhere
    tier?: string;
    hasCI?: boolean;
    onGoMissions?: () => void;
};

export default function LoyaltyPanel(props: Props) {
    const { current, next } = useMemo(() => getTierForSignals(props.totalSignals), [props.totalSignals]);

    const progress = useMemo(() => {
        if (!next) return 1;
        const span = Math.max(1, next.minSignals - current.minSignals);
        return clamp01((props.totalSignals - current.minSignals) / span);
    }, [props.totalSignals, current.minSignals, next]);

    const missing = next ? Math.max(0, next.minSignals - props.totalSignals) : 0;

    return (
        <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${current.accentClass} pointer-events-none opacity-50`} />

            <div className="relative z-10">
                <div className="flex flex-col gap-1 mb-6">
                    <h3 className="text-sm font-black text-ink uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary-500 text-lg">workspace_premium</span>
                        Tu Nivel Opina+
                    </h3>
                    <p className="text-xs text-muted font-medium">Cada señal te hace avanzar de nivel.</p>
                </div>

                {/* Level Display */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-5 flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-sm ${current.badgeClass}`}>
                        <span className="material-symbols-outlined text-2xl">trophy</span>
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Nivel Actual</div>
                        <div className="text-xl font-black text-ink leading-tight">{current.name}</div>
                        <div className="mt-1 text-xs font-bold text-slate-500">
                            {formatPoints(props.totalSignals)} señales
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-2">
                        {next ? (
                            <>
                                <span>Progreso a {next.name}</span>
                                <span className="text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">Faltan {formatPoints(missing)} señales</span>
                            </>
                        ) : (
                            <span>Alcanzaste el máximo nivel</span>
                        )}
                    </div>
                    <div className="h-3 rounded-full bg-slate-100 overflow-hidden border border-slate-100/50 shadow-inner">
                        <div
                            className="h-full rounded-full bg-brand-gradient transition-all duration-1000 ease-out"
                            style={{ width: `${Math.round(progress * 100)}%` }}
                        />
                    </div>
                </div>

                {/* Benefits */}
                <div className="space-y-4">
                    <div>
                        <div className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-3 border-b border-slate-100 pb-2">
                            Beneficios Desbloqueados
                        </div>
                        <ul className="space-y-2">
                            {current.benefits.map((b) => (
                                <li key={b} className="text-sm font-medium text-slate-700 flex gap-2.5 items-center">
                                    <span className="material-symbols-outlined text-[18px] text-emerald-500 shrink-0">check_circle</span>
                                    {b}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {current.upcomingBenefits.length > 0 && (
                        <div className="pt-2">
                            <div className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-3 border-b border-slate-100 pb-2">
                                Próximo Nivel ({next?.name})
                            </div>
                            <ul className="space-y-2">
                                {current.upcomingBenefits.map((b) => (
                                    <li key={b} className="text-sm font-medium text-slate-400 flex gap-2.5 items-center">
                                        <span className="material-symbols-outlined text-[18px] text-slate-300 shrink-0">lock</span>
                                        {b}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
