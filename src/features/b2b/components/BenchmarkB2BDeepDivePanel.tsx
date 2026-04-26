import { X, Zap } from "lucide-react";
import { PremiumGate } from "../../../components/ui/PremiumGate";
import { MetricAvailabilityCard } from "../../../components/ui/MetricAvailabilityCard";
import { LeaderboardEntry } from "../../metrics/services/metricsService";
import type { BenchmarkSystemNarrative } from "../hooks/useBenchmarkB2BState";
// DEBT-003 cierre (Fase 4.4): cuando `entityNarrative` es null (no hay entry
// canónica en el snapshot) seguimos usando `MetricAvailabilityCard` con
// status `insufficient_data` — ahora sí es honesto porque la ausencia de
// narrativa implica realmente que faltan datos, no que el engine no existe.

interface BenchmarkB2BDeepDivePanelProps {
    selectedEntity: LeaderboardEntry;
    entityNarrative: BenchmarkSystemNarrative | null;
    loadingDetails: boolean;
    isAdmin: boolean;
    onClose: () => void;
}

/**
 * Drawer lateral con el detalle de la entidad seleccionada: narrativa (cuando
 * hay motor) o MetricAvailabilityCard `pending`, y las métricas duras.
 *
 * Solo renderizar este componente cuando `selectedEntity` existe — la página
 * lo envuelve en un early return para que su presencia sea explícita.
 */
export function BenchmarkB2BDeepDivePanel({
    selectedEntity,
    entityNarrative,
    loadingDetails,
    isAdmin,
    onClose
}: BenchmarkB2BDeepDivePanelProps) {
    return (
        <div className="fixed inset-y-0 right-0 w-full lg:w-[450px] bg-white shadow-2xl z-50 transform transition-transform border-l border-slate-100 flex flex-col">
            <div className="p-8 border-b border-slate-100">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{selectedEntity.entity_name}</h3>
                        <div className="text-xs font-bold text-brand-600 uppercase tracking-widest mt-1">Deep Dive B2B</div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                {loadingDetails ? (
                    <div className="space-y-6 animate-pulse">
                        <div className="h-40 bg-white rounded-3xl border border-slate-100"></div>
                        <div className="h-32 bg-white rounded-3xl border border-slate-100"></div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Narrative Card — sólo se muestra el card premium si hay narrativa real;
                            si no, exponemos un MetricAvailabilityCard explícito ("pending") para
                            no simular que el engine está corriendo y dando empty state. */}
                        {entityNarrative ? (
                            <PremiumGate featureName="Análisis Narrativo Ejecutivo" isLocked={!isAdmin}>
                                <div className="bg-gradient-to-br from-white via-brand-50/30 to-accent-50/20 p-6 rounded-3xl shadow-sm border border-brand-100 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                        <Zap className="w-24 h-24 text-brand" />
                                    </div>

                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="p-1.5 bg-brand-50 border border-brand-100 rounded-lg">
                                                <Zap className="w-4 h-4 text-brand" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-brand">Narrativa Ejecutiva</span>
                                        </div>

                                        <div className="space-y-4">
                                            <p className="text-sm font-medium text-ink leading-relaxed">
                                                {entityNarrative.intelligenceText}
                                            </p>
                                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-brand-100">
                                                <span className="text-[10px] text-brand font-mono">
                                                    Confianza: {entityNarrative.confidence}
                                                </span>
                                                <span className="text-[10px] px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-100">
                                                    {entityNarrative.category}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </PremiumGate>
                        ) : (
                            <MetricAvailabilityCard
                                label="Narrativa Ejecutiva"
                                status="insufficient_data"
                                helperText="No tenemos suficientes señales canónicas para emitir narrativa sobre esta entidad. Las Métricas Duras abajo se muestran como fuente única de verdad observada."
                            />
                        )}

                        {/* Hard Metrics Card */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Métricas Duras</h4>

                            <div className="space-y-5">
                                <div>
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-sm font-bold text-slate-700">Win Rate Relativo</span>
                                        <span className="text-lg font-black text-slate-900">{(selectedEntity.win_rate * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                        <div className="bg-accent h-2 rounded-full" style={{ width: `${selectedEntity.win_rate * 100}%` }}></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-sm font-bold text-slate-700">Batallas Consignadas</span>
                                        <span className="text-lg font-black text-slate-900">{selectedEntity.total_comparisons} batallas</span>
                                    </div>
                                </div>

                                {entityNarrative?.backingMetrics?.deltaPercentage !== undefined && (
                                    <div>
                                        <div className="flex justify-between items-end mb-1">
                                            <span className="text-sm font-bold text-slate-700">Variación Temporal (WoW)</span>
                                            <span className={`text-lg font-black ${(entityNarrative.backingMetrics?.deltaPercentage ?? 0) > 0 ? 'text-accent' : 'text-danger-600'}`}>
                                                {(entityNarrative.backingMetrics?.deltaPercentage ?? 0) > 0 ? '+' : ''}
                                                {Number(entityNarrative.backingMetrics?.deltaPercentage ?? 0).toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
