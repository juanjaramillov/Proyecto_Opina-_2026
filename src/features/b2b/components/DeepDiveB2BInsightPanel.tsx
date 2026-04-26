import { ArrowLeftRight, ShieldAlert, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { PremiumGate } from "../../../components/ui/PremiumGate";
import type { DeepDivePair } from "../utils/deepDiveHelpers";

interface DeepDiveB2BInsightPanelProps {
    pair: DeepDivePair;
    isAdmin: boolean;
}

/**
 * Insight Ejecutivo C-level dentro de Deep Dive: narrativa comparativa + tarjeta
 * lateral "Riesgo de Brecha". Sigue siendo un bloque estático (plantilla), no un
 * output de modelo — el copy lo deja claro (ver `BetaDisclaimerBanner` en ReportsB2B
 * y el comentario aquí). Los números son reales, la redacción es plantilla.
 */
export function DeepDiveB2BInsightPanel({ pair, isAdmin }: DeepDiveB2BInsightPanelProps) {
    const { leader, challenger, leaderGap, projectionGap } = pair;

    return (
        <PremiumGate featureName="Deep Dive Insight Comparativo" isLocked={!isAdmin}>
            <div className="bg-gradient-to-br from-white via-brand-50/30 to-accent-50/20 p-8 md:p-10 rounded-3xl shadow-xl relative overflow-hidden border border-brand-100">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <ArrowLeftRight className="w-48 h-48 text-brand -rotate-12 transform" />
                </div>

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row items-start gap-8">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-brand-50 border border-brand-100 rounded-xl">
                                    <Sparkles className="w-5 h-5 text-brand" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-brand">Insight Comparativo (Plantilla)</span>
                            </div>

                            <p className="text-lg md:text-xl font-medium text-ink leading-relaxed mb-6">
                                "{leader.entityName} mantiene la posición dominante pero el momentum competitivo indica dinámicas cambiantes en el segmento profundo. La desviación estándar del volumen modelada confirma una brecha del {(leaderGap * 100).toFixed(1)}%. Este fenómeno requiere estrategias tácticas si {challenger.entityName} capitaliza su ciclo actual."
                            </p>

                            <div className="flex flex-wrap items-center gap-3">
                                <span className="px-3 py-1 rounded-full bg-white text-slate-600 text-xs font-mono font-bold tracking-wide border border-stroke shadow-sm">
                                    Confianza Wilson: {leader.wilsonLowerBound > 0.5 ? 'Muy Alta' : 'Moderada'}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-100 text-xs font-bold uppercase tracking-wider">
                                    Categoría: Competitividad
                                </span>
                            </div>
                        </div>

                        <div className="w-full md:w-72 bg-white p-6 rounded-2xl border border-stroke shadow-sm shrink-0">
                            <h4 className="text-sm font-bold text-ink mb-4 pb-4 border-b border-stroke flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4 text-warning-500" /> Riesgo de Brecha
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Brecha Actual</p>
                                    <p className="text-2xl font-black text-ink">{(leaderGap * 100).toFixed(1)} <span className="text-sm text-slate-500 font-medium">puntos</span></p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Proyección Tendencial</p>
                                    <p className="text-xl font-bold text-warning-600">{(projectionGap * 100).toFixed(1)} <span className="text-sm text-warning-500/70 font-medium">puntos</span> {projectionGap < leaderGap ? <TrendingDown className="inline w-4 h-4 ml-1" /> : <TrendingUp className="inline w-4 h-4 ml-1" />}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PremiumGate>
    );
}
