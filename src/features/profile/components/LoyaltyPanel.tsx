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
        <section className="card p-6 lg:p-8 shadow-sm relative overflow-hidden group hover:border-primary/20 transition-all">
            <div className={`absolute inset-0 bg-gradient-to-br ${current.accentClass} pointer-events-none opacity-[0.03] transition-opacity group-hover:opacity-[0.06]`} />

            <div className="relative z-10">
                <div className="flex flex-col gap-1 mb-6">
                    <h3 className="text-sm font-black text-ink uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-lg">workspace_premium</span>
                        Tu Nivel Opina+
                    </h3>
                    <p className="text-xs text-text-secondary font-medium">Cada señal te hace avanzar de nivel.</p>
                </div>

                {/* Level Display */}
                <div className="bg-surface2 border border-stroke rounded-2xl p-5 mb-6 flex items-center gap-4 group-hover:bg-white transition-colors">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${current.badgeClass === 'bg-white text-slate-400 border border-slate-200' ? 'bg-white text-text-muted border-stroke' : current.badgeClass}`}>
                        <span className="material-symbols-outlined text-2xl">trophy</span>
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-0.5">Nivel Actual</div>
                        <div className="text-xl font-black text-ink leading-tight tracking-tight">{current.name}</div>
                        <div className="mt-1 text-xs font-bold text-text-secondary">
                            {formatPoints(props.totalSignals)} señales
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-between text-[11px] font-bold text-text-muted mb-3">
                        {next ? (
                            <>
                                <span className="uppercase tracking-widest">Progreso a {next.name}</span>
                                <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">Faltan {formatPoints(missing)} señales</span>
                            </>
                        ) : (
                            <span className="uppercase tracking-widest">Alcanzaste el máximo nivel</span>
                        )}
                    </div>
                    <div className="h-3 rounded-full bg-surface2 overflow-hidden border border-stroke shadow-inner">
                        <div
                            className="h-full rounded-full bg-brand-gradient transition-all duration-1000 ease-out"
                            style={{ width: `${Math.round(progress * 100)}%` }}
                        />
                    </div>
                </div>

                {/* Benefits */}
                <div className="space-y-6">
                    <div>
                        <div className="text-[10px] uppercase tracking-widest font-black text-text-muted mb-4 border-b border-stroke pb-2">
                            Beneficios Desbloqueados
                        </div>
                        <ul className="space-y-2.5">
                            {current.benefits.map((b) => (
                                <li key={b} className="text-sm font-bold text-ink flex gap-3 items-center">
                                    <span className="material-symbols-outlined text-[18px] text-secondary shrink-0">check_circle</span>
                                    {b}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {current.upcomingBenefits.length > 0 && (
                        <div className="pt-2">
                            <div className="text-[10px] uppercase tracking-widest font-black text-text-muted mb-4 border-b border-stroke pb-2">
                                Próximo Nivel ({next?.name})
                            </div>
                            <ul className="space-y-2.5">
                                {current.upcomingBenefits.map((b) => (
                                    <li key={b} className="text-sm font-medium text-text-secondary flex gap-3 items-center">
                                        <span className="material-symbols-outlined text-[18px] text-text-muted shrink-0">lock</span>
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
