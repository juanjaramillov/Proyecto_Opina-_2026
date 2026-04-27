import { useState } from "react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Activity, ShieldAlert, BrainCircuit, Loader2, Gauge, AlertTriangle, PlayCircle } from "lucide-react";
import { insightsService, B2BBattleAnalytics, PolarizationData } from "../../signals/services/insightsService";
import { supabase } from "../../../supabase/client";

interface AdminSignalAnalyticsDrawerProps {
    battleId: string | null;
    battleTitle: string;
    onClose: () => void;
}

interface BattleMeta {
    slug: string | null;
    ai_summary: string | null;
}

/**
 * FASE 3D React Query (2026-04-26): drawer migrado a 3 useQuery paralelos
 * (meta del battle, analytics B2B, polarización por slug). El AI summary
 * post-generación se actualiza con `qc.setQueryData` en la queryKey del meta
 * — instantáneo, sin refetch.
 */
export function AdminSignalAnalyticsDrawer({ battleId, battleTitle, onClose }: AdminSignalAnalyticsDrawerProps) {
    const qc = useQueryClient();
    const [generatingAi, setGeneratingAi] = useState(false);

    const metaQuery = useQuery<BattleMeta, Error>({
        queryKey: ['admin', 'signals', 'meta', battleId],
        queryFn: async () => {
            const { data } = await supabase
                .from('battles')
                .select('slug, ai_summary')
                .eq('id', battleId as string)
                .single();
            return { slug: data?.slug ?? null, ai_summary: data?.ai_summary ?? null };
        },
        enabled: !!battleId,
    });

    const slug = metaQuery.data?.slug ?? null;
    const aiSummary = metaQuery.data?.ai_summary ?? null;

    const analyticsQuery = useQuery<B2BBattleAnalytics | null, Error>({
        queryKey: ['admin', 'signals', 'analytics', battleId],
        queryFn: () => insightsService.getB2BBattleAnalytics(battleId as string),
        enabled: !!battleId,
    });

    const polarizationQuery = useQuery<PolarizationData | null, Error>({
        queryKey: ['admin', 'signals', 'polarization', slug],
        queryFn: () => insightsService.getBattlePolarization(slug as string),
        enabled: !!slug,
    });

    const analytics = analyticsQuery.data ?? null;
    const polarization = polarizationQuery.data ?? null;
    // Loading agregado: cualquiera de las 3 cargando = spinner.
    const loading = metaQuery.isLoading || analyticsQuery.isLoading || (slug ? polarizationQuery.isLoading : false);

    const handleGenerateAi = async () => {
        if (!slug || !battleId) return;
        setGeneratingAi(true);
        try {
            const summary = await insightsService.generateAiSummary(slug);
            if (summary) {
                // Optimistic update sobre la queryKey del meta para evitar refetch.
                qc.setQueryData<BattleMeta>(['admin', 'signals', 'meta', battleId], (prev) => ({
                    slug: prev?.slug ?? slug,
                    ai_summary: summary,
                }));
            }
        } catch (error) {
            console.error("Failed to generate AI summary", error);
        } finally {
            setGeneratingAi(false);
        }
    };

    if (!battleId) return null;

    return (
        <>
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />
            <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-slate-50 shadow-2xl transition-transform duration-300 transform translate-x-0 overflow-y-auto border-l border-slate-200`}>
                <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 p-6 flex items-center justify-between z-10">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <Activity className="w-6 h-6 text-accent" />
                            Modelos y Analítica
                        </h2>
                        <p className="text-sm font-medium text-slate-500 mt-1 line-clamp-1">{battleTitle}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-4" />
                            <p>Cargando modelos computacionales...</p>
                        </div>
                    ) : (
                        <>
                            {/* AI Summary Section */}
                            <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 bg-gradient-to-br from-brand to-accent w-32 h-32 rounded-bl-full pointer-events-none" />
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <BrainCircuit className="w-5 h-5 text-brand" />
                                        Insight IA (GPT-4o-mini)
                                    </h3>
                                    <button 
                                        onClick={handleGenerateAi}
                                        disabled={generatingAi || !slug}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-sm transition-colors disabled:opacity-50"
                                    >
                                        {generatingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                                        {aiSummary ? "Re-generar" : "Generar"}
                                    </button>
                                </div>
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 min-h-[80px]">
                                    {aiSummary ? (
                                        <p className="text-slate-700 italic text-sm leading-relaxed">{aiSummary}</p>
                                    ) : (
                                        <p className="text-slate-400 text-sm">No se ha generado el reporte ejecutivo para esta señal.</p>
                                    )}
                                </div>
                            </section>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Polarization Index */}
                                <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
                                        <Gauge className="w-5 h-5 text-brand" />
                                        Índice de Polarización
                                    </h3>
                                    {polarization ? (
                                        <div className="flex flex-col items-center">
                                            <div className="text-4xl font-black text-slate-900 mb-2">
                                                {polarization.polarization_index.toFixed(1)}
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                                                polarization.classification === 'consensus' ? 'bg-accent/20 text-accent' :
                                                polarization.classification === 'competitive' ? 'bg-warning/20 text-warning' :
                                                'bg-danger/20 text-danger'
                                            }`}>
                                                {polarization.classification}
                                            </div>
                                            <div className="w-full flex justify-between text-xs text-slate-500 mt-6 font-medium">
                                                <span>Top 1: {(polarization.top_share * 100).toFixed(1)}%</span>
                                                <span>Top 2: {(polarization.second_share * 100).toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-slate-400 text-center py-4">Sin datos de polarización</div>
                                    )}
                                </section>

                                {/* Weights Breakdown */}
                                <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
                                        <ShieldAlert className="w-5 h-5 text-warning" />
                                        Métricas de Pesaje
                                    </h3>
                                    {analytics ? (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                                                <span className="text-sm font-semibold text-slate-600">N-Efectivo (Modelo)</span>
                                                <span className="text-base font-black text-slate-900">{analytics.n_eff?.toFixed(1) || '0'}</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                                                <span className="text-sm font-semibold text-slate-600">Peso Efectivo Total</span>
                                                <span className="text-base font-black text-slate-900">{analytics.total_effective_weight?.toFixed(1) || '0'}</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                                                <span className="text-sm font-semibold text-slate-600">Entropía Normalized</span>
                                                <span className="text-base font-black text-slate-900">{analytics.global_entropy_normalized?.toFixed(2) || '0'}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-slate-400 text-center py-4">Sin datos base B2B</div>
                                    )}
                                </section>
                            </div>

                            {/* Options Payload Raw vs Effective */}
                            <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
                                    <Activity className="w-5 h-5 text-accent" />
                                    Auditoría de Opciones (Crudo vs Efectivo)
                                </h3>
                                {analytics?.analytics_payload && analytics.analytics_payload.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-slate-100">
                                                    <th className="pb-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Opción</th>
                                                    <th className="pb-2 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Crudos</th>
                                                    <th className="pb-2 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Efectivos</th>
                                                    <th className="pb-2 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Desfase</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {analytics.analytics_payload.map((opt, i) => {
                                                    const raw = typeof opt.raw_score === 'number' ? opt.raw_score : 0;
                                                    const eff = typeof opt.effective_score === 'number' ? opt.effective_score : 0;
                                                    const diff = eff - raw;
                                                    return (
                                                        <tr key={i}>
                                                            <td className="py-3 text-sm font-semibold text-slate-800 max-w-[150px] truncate" title={opt.option_label || opt.option_id}>
                                                                {opt.option_label || opt.option_id}
                                                            </td>
                                                            <td className="py-3 text-sm font-medium text-slate-500 text-right">{raw.toFixed(1)}</td>
                                                            <td className="py-3 text-sm font-bold text-accent text-right">{eff.toFixed(1)}</td>
                                                            <td className="py-3 text-sm font-medium text-right">
                                                                <span className={diff < 0 ? 'text-warning' : diff > 0 ? 'text-brand' : 'text-slate-400'}>
                                                                    {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-sm text-slate-400 py-6 text-center bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-slate-300" />
                                        La bata aún no tiene métricas generadas u opciones tabuladas.
                                    </div>
                                )}
                            </section>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
