import { Building2, Target, TrendingDown, TrendingUp } from "lucide-react";
import type { DeepDiveContestant } from "../utils/deepDiveHelpers";

interface DeepDiveB2BContestantCardProps {
    contestant: DeepDiveContestant;
    variant: 'leader' | 'challenger';
}

/**
 * Tarjeta comparativa usada dos veces en Deep Dive (líder y retador). Se parametriza
 * con `variant` para controlar el chip de la esquina, el color del icono y el énfasis
 * del porcentaje. El resto es idéntico, así que una sola fuente de verdad evita que
 * los dos lados se desalineen visualmente cuando hagamos cambios de copy o estilo.
 */
export function DeepDiveB2BContestantCard({ contestant, variant }: DeepDiveB2BContestantCardProps) {
    const isLeader = variant === 'leader';

    const containerClass = isLeader
        ? "bg-white rounded-3xl border-2 border-brand/20 shadow-xl overflow-hidden relative"
        : "bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative opacity-95";

    const badgeClass = isLeader
        ? "absolute top-0 right-0 px-4 py-1 bg-brand text-white text-xs font-bold rounded-bl-xl z-20"
        : "absolute top-0 right-0 px-4 py-1 bg-slate-600 text-white text-xs font-bold rounded-bl-xl z-20";

    const headerBgClass = isLeader
        ? "p-8 text-center bg-gradient-to-b from-brand-50/50 to-white relative z-10"
        : "p-8 text-center bg-gradient-to-b from-slate-50/50 to-white relative z-10";

    const iconContainerClass = isLeader
        ? "w-20 h-20 bg-white rounded-2xl border border-brand/20 shadow-md flex items-center justify-center mx-auto mb-6 transform rotate-3"
        : "w-20 h-20 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center mx-auto mb-6 transform -rotate-3";

    const iconClass = isLeader ? "w-10 h-10 text-brand" : "w-10 h-10 text-slate-400";

    const shareClass = isLeader ? "text-5xl font-black text-brand" : "text-5xl font-black text-slate-700";

    const statusClass = (label: DeepDiveContestant['stabilityLabel']) =>
        label === 'en_caída'
            ? 'text-danger-500 bg-danger-50 border-danger-100'
            : label === 'en_aceleración'
                ? 'text-accent bg-accent/10 border-accent-100'
                : 'text-slate-500 bg-white border-slate-100';

    return (
        <div className={containerClass}>
            <div className={badgeClass}>
                {isLeader ? 'LÍDER ACTUAL' : 'PRINCIPAL RETADOR'}
            </div>
            <div className={headerBgClass}>
                <div className={iconContainerClass}>
                    <Building2 className={iconClass} />
                </div>
                <h2 className="text-4xl font-black text-slate-900 -tracking-wide mb-2">{contestant.entityName}</h2>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{contestant.entityId}</p>
            </div>

            <div className="p-8 border-t border-slate-100 bg-white">
                <div className="text-center mb-8">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Share of Preference</p>
                    <h3 className={shareClass}>{(contestant.weightedPreferenceShare * 100).toFixed(1)}%</h3>
                    <div className="flex items-center justify-center gap-1 text-slate-500 mt-2 text-sm font-medium">
                        <Target className="w-4 h-4" /> Base: {contestant.nEff.toFixed(0)} duelos efectivos
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-sm font-bold text-slate-600">Status Competitivo</span>
                    <div className={`flex items-center gap-2 font-bold px-3 py-1 rounded-xl shadow-sm border ${statusClass(contestant.stabilityLabel)}`}>
                        {contestant.stabilityLabel === 'en_caída' ? <TrendingDown className="w-4 h-4" /> : contestant.stabilityLabel === 'en_aceleración' ? <TrendingUp className="w-4 h-4" /> : null}
                        {contestant.stabilityLabel.replace('_', ' ').toUpperCase()}
                    </div>
                </div>
            </div>
        </div>
    );
}
