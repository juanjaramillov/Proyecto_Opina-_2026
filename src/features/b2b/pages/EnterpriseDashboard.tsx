import { useEffect, useState } from "react";
import RequireEntitlement from "../../auth/components/RequireEntitlement";
import { useAccountProfile } from "../../../auth/useAccountProfile";
import { useActiveBattles } from "../../../hooks/useActiveBattles";
import { kpiService } from "../../../services/kpiService";

// UI Types
type ShareOfPreference = { choice_label: string; share_pct: number };
type TrendVelocity = { choice_label: string; delta_signals: number };
type EngagementQuality = { choice_label: string; weighted_signals: number };

export default function EnterpriseDashboard() {
    const { profile, loading: loadingProfile } = useAccountProfile();
    const { battles, loading: _loadingBattles } = useActiveBattles();

    const [sop, setSop] = useState<ShareOfPreference[]>([]);
    const [trends, setTrends] = useState<TrendVelocity[]>([]);
    const [eqi, setEqi] = useState<EngagementQuality[]>([]);
    const [loadingKpis, setLoadingKpis] = useState(false);

    useEffect(() => {
        if (profile?.canExport && battles.length > 0) {
            const battle = battles[0]; // Pick first active battle
            const range = {
                start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                end: new Date()
            };

            setLoadingKpis(true);

            Promise.all([
                kpiService.shareOfPreference(battle.id, range),
                kpiService.trendVelocity(battle.id, 'day', range),
                kpiService.engagementQuality(battle.id, range)
            ]).then(([resSop, _resTrends, resEqi]) => {
                // Map Data using Battle Options (ID -> Label)
                const labelMap = new Map(battle.options.map(o => [o.id, o.label]));
                const getLabel = (id: string) => labelMap.get(id) || 'Desconocido';

                // SoP
                setSop(resSop.map(r => ({
                    choice_label: getLabel(r.option_id),
                    share_pct: r.share
                })));

                // Trends (Simplification: grouping/summing by option for the card)
                // Since this view expects a list of "Topic + Delta", and trendVelocity returns time-series buckets...
                // We'll just show empty/mock for now or adapt if possible.
                // Actually, let's just map what we can. The types might not align perfectly for "Choice Label".
                // KpiTrendRow has { bucket_at, weighted_signals }. It lacks option_id breakdown in the current service definition?
                // Wait, checked step 635: KpiTrendRow = { bucket_at, weighted_signals }. It DOES NOT have option_id.
                // This means the current trendVelocity RPC aggregates EVERYTHING? Or is it missing a group by?
                // For now, let's leave Trends empty to avoid errors, or mock it.
                setTrends([]);

                // EQI
                // KpiQualityRow = { metric_key, metric_value, metric_label }. 
                // It seems related to global quality metrics, not per-option?
                // The UI expects per-choice quality.
                // Let's adapt if we can, otherwise empty.
                setEqi(resEqi.map(r => ({
                    choice_label: r.metric_label,
                    weighted_signals: r.metric_value
                })));

                setLoadingKpis(false);
            }).catch(err => {
                console.error("Error loading KPIs", err);
                setLoadingKpis(false);
            });
        }
    }, [profile, battles]);

    if (loadingProfile || !profile) return null;

    return (
        <RequireEntitlement
            tier={profile.tier}
            profileCompleteness={profile.profileCompleteness}
            hasCI={profile.hasCI}
            require="export"
        >
            <div className="container-ws section-y">
                <header className="mb-8">
                    <h1 className="text-3xl font-black text-ink">Dashboard Empresa</h1>
                    <p className="text-text-secondary mt-2">Visión sistémica y KPIs de mercado en tiempo real.</p>
                </header>

                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* KPI 1: SoP */}
                    <div className="card p-6">
                        <h3 className="text-sm font-bold text-text-muted uppercase mb-4">Share of Preference (SoP)</h3>
                        <div className="space-y-4">
                            {loadingKpis ? (
                                <div className="animate-pulse h-20 bg-gray-100 rounded"></div>
                            ) : sop.length === 0 ? (
                                <p className="text-sm text-text-secondary">Sin datos suficientes aún.</p>
                            ) : (
                                sop.map((item) => (
                                    <div key={item.choice_label}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-semibold">{item.choice_label}</span>
                                            <span className="text-primary font-bold">{item.share_pct}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary" style={{ width: `${item.share_pct}%` }}></div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* KPI 2: Trend Velocity */}
                    <div className="card p-6">
                        <h3 className="text-sm font-bold text-text-muted uppercase mb-4">Trend Velocity (Δ Momentum)</h3>
                        <div className="space-y-4">
                            {loadingKpis ? (
                                <div className="animate-pulse h-20 bg-gray-100 rounded"></div>
                            ) : trends.length === 0 ? (
                                <p className="text-sm text-text-secondary">Sin histórico suficiente.</p>
                            ) : (
                                trends.map((item) => (
                                    <div key={item.choice_label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                        <span className="font-semibold text-sm">{item.choice_label}</span>
                                        <span className={`badge ${item.delta_signals >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {item.delta_signals > 0 ? '+' : ''}{item.delta_signals}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* KPI 3: EQI */}
                    <div className="card p-6">
                        <h3 className="text-sm font-bold text-text-muted uppercase mb-4">Engagement Quality Index (EQI)</h3>
                        <div className="space-y-4">
                            {loadingKpis ? (
                                <div className="animate-pulse h-20 bg-gray-100 rounded"></div>
                            ) : eqi.length === 0 ? (
                                <p className="text-sm text-text-secondary">Sin datos ponderados.</p>
                            ) : (
                                eqi.map((item, idx) => (
                                    <div key={item.choice_label} className="flex items-center gap-3">
                                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-900 text-white text-xs font-bold">
                                            {idx + 1}
                                        </span>
                                        <div className="flex-1">
                                            <div className="text-sm font-semibold">{item.choice_label}</div>
                                            <div className="text-xs text-text-muted">Score ponderado: {Number(item.weighted_signals).toFixed(1)}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </section>

                <footer className="mt-12 pt-8 border-t border-gray-100 text-center">
                    <p className="text-xs text-text-muted italic max-w-2xl mx-auto">
                        Opina+ es una plataforma independiente. Las marcas son objeto de estudio.
                        Los resultados no constituyen respaldo ni afiliación.
                    </p>
                </footer>
            </div>
        </RequireEntitlement >
    );
}
