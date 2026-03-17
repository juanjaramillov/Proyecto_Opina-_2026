import { CheckCircle, AlertTriangle, ShieldAlert, Target, Activity, TrendingUp } from "lucide-react";
import { B2BBattleAnalytics, B2BEligibility, IntegrityFlags } from "../../../signals/services/insightsService";

interface B2BAnalyticsCardsProps {
    b2bEligibility?: B2BEligibility | null;
    b2bAnalytics?: B2BBattleAnalytics | null;
    integrityFlags?: IntegrityFlags | null;
}

export function B2BAnalyticsCards({ b2bEligibility, b2bAnalytics, integrityFlags }: B2BAnalyticsCardsProps) {
    if (!b2bEligibility && !b2bAnalytics && !integrityFlags) return null;

    return (
        <>
            {b2bEligibility && (
                <div className={`mb-6 p-4 rounded-2xl border ${
                    b2bEligibility.eligibility_status === 'PUBLISHABLE' 
                        ? 'bg-emerald-50 border-emerald-200' 
                        : b2bEligibility.eligibility_status === 'EXPLORATORY'
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-rose-50 border-rose-200'
                }`}>
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                            {b2bEligibility.eligibility_status === 'PUBLISHABLE' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> :
                             b2bEligibility.eligibility_status === 'EXPLORATORY' ? <AlertTriangle className="w-5 h-5 text-amber-600" /> :
                             <ShieldAlert className="w-5 h-5 text-rose-600" />}
                        </div>
                        <div className="flex-1">
                            <h4 className={`font-bold text-sm ${
                                b2bEligibility.eligibility_status === 'PUBLISHABLE' ? 'text-emerald-900' :
                                b2bEligibility.eligibility_status === 'EXPLORATORY' ? 'text-amber-900' :
                                'text-rose-900'
                            }`}>
                                {b2bEligibility.eligibility_status === 'PUBLISHABLE' ? 'Premium Exportable (Data B2B Lista)' :
                                 b2bEligibility.eligibility_status === 'EXPLORATORY' ? 'Consumo Exploratorio (Tendencia Volátil)' :
                                 'Consumo Interno Bloqueado (Riesgo Estadístico)'}
                            </h4>
                            
                            {b2bEligibility.eligibility_reasons && b2bEligibility.eligibility_reasons.length > 0 && (
                                <ul className="mt-2 space-y-1">
                                    {b2bEligibility.eligibility_reasons.map((reason, idx) => (
                                        <li key={idx} className={`text-xs flex items-center gap-1.5 ${
                                            b2bEligibility.eligibility_status === 'EXPLORATORY' ? 'text-amber-700' : 'text-rose-700'
                                        }`}>
                                            <div className="w-1 h-1 rounded-full bg-current opacity-50"></div>
                                            {reason}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-8">
                {b2bEligibility && (
                    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-4 rounded-2xl relative overflow-hidden group">
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">OpinaScore</span>
                                <span className="text-[10px] bg-white/10 text-white px-1.5 py-0.5 rounded font-mono border border-white/20 uppercase">
                                    {b2bEligibility.opinascore_context}
                                </span>
                            </div>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-3xl font-black text-white">{Math.round(b2bEligibility.opinascore_value || 0)}</span>
                                <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest leading-none">/ 1000</span>
                            </div>
                            <div className="mt-4 text-[9px] text-indigo-200/70 font-mono flex items-center gap-1 pt-2 border-t border-indigo-800/50">
                                <span>B: {Math.round(b2bEligibility.opinascore_base || 0)}</span>
                                <span>×</span>
                                <span>M: {b2bEligibility.integrity_multiplier || 1}</span>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <Target className="w-24 h-24 text-white -rotate-12 transform translate-x-4 -translate-y-4" />
                        </div>
                    </div>
                )}

                {b2bAnalytics && (
                    <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                        <div className="flex flex-col h-full justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Confianza Estd.</span>
                            <div className="flex items-baseline gap-1.5 mt-1">
                                <span className="text-2xl font-black text-slate-800">{Math.round(b2bAnalytics.n_eff)}</span>
                                <span className="text-[10px] font-bold text-slate-400">N_EFF</span>
                            </div>
                            {b2bAnalytics?.analytics_payload?.[0]?.technical_tie_flag ? (
                                <div className="mt-4 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-amber-600">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    <span className="text-[9px] font-bold uppercase tracking-wide">Empate Técnico</span>
                                </div>
                            ) : (
                                <div className="mt-4 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-emerald-600">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    <span className="text-[9px] font-bold uppercase tracking-wide">Líder Claro</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {integrityFlags && (
                    <div className={`border p-4 rounded-2xl ${
                        integrityFlags.integrity_score >= 90 ? 'bg-emerald-50/50 border-emerald-100' :
                        integrityFlags.integrity_score >= 50 ? 'bg-amber-50/50 border-amber-100' :
                        'bg-rose-50/50 border-rose-100'
                    }`}>
                        <div className="flex flex-col h-full justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Integridad</span>
                            <div className="flex items-baseline gap-1.5 mt-1">
                                <span className={`text-2xl font-black ${
                                    integrityFlags.integrity_score >= 90 ? 'text-emerald-700' :
                                    integrityFlags.integrity_score >= 50 ? 'text-amber-700' :
                                    'text-rose-700'
                                }`}>{Math.round(integrityFlags.integrity_score)}</span>
                                <span className="text-[10px] font-bold text-slate-400">/ 100</span>
                            </div>
                            <div className={`mt-4 pt-2 border-t flex flex-col gap-1 ${
                                integrityFlags.integrity_score >= 90 ? 'border-emerald-200/50' :
                                integrityFlags.integrity_score >= 50 ? 'border-amber-200/50' :
                                'border-rose-200/50'
                            }`}>
                                {integrityFlags.flag_device_concentration && (
                                    <span className="text-[9px] font-bold text-rose-600 flex items-center gap-1 uppercase tracking-wide">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> Bot Concentrado
                                    </span>
                                )}
                                {integrityFlags.flag_velocity_burst && (
                                    <span className="text-[9px] font-bold text-rose-600 flex items-center gap-1 uppercase tracking-wide">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> Ráfaga Anómala
                                    </span>
                                )}
                                {integrityFlags.flag_repetitive_pattern && (
                                    <span className="text-[9px] font-bold text-rose-600 flex items-center gap-1 uppercase tracking-wide">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> Scripting Pattern
                                    </span>
                                )}
                                {integrityFlags.integrity_score === 100 && (
                                    <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-1 uppercase tracking-wide">
                                        <CheckCircle className="w-3 h-3" /> Ecosistema Sano
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {b2bEligibility && (b2bEligibility.entropy_normalized !== null || b2bEligibility.stability_label) && (
                    <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                        <div className="flex flex-col h-full justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Estructura</span>
                            {b2bEligibility.opinascore_context === 'news' ? (
                                <>
                                    <div className="flex items-baseline gap-1.5 mt-1">
                                        <span className="text-2xl font-black text-slate-800">{b2bEligibility.entropy_normalized?.toFixed(2) || '0.00'}</span>
                                        <span className="text-[10px] font-bold text-slate-400">ENTROPÍA</span>
                                    </div>
                                    <div className="mt-4 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-slate-500">
                                        <Activity className="w-3.5 h-3.5" />
                                        <span className="text-[9px] font-bold uppercase tracking-wide leading-tight">
                                            {(b2bEligibility.entropy_normalized ?? 0) > 0.8 ? 'Alta Fragmentación' : 
                                             (b2bEligibility.entropy_normalized ?? 0) > 0.5 ? 'Consenso Moderado' : 'Consenso Fuerte'}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2 h-8 mt-1">
                                        <span className="text-lg font-black text-slate-800 capitalize leading-tight">{b2bEligibility.stability_label || 'Pendiente'}</span>
                                    </div>
                                    <div className="mt-4 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-slate-500">
                                        <TrendingUp className="w-3.5 h-3.5" />
                                        <span className="text-[9px] font-bold uppercase tracking-wide leading-tight">Estadío Actual</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
