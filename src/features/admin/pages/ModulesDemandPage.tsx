import { useState, useEffect } from 'react';
import { modulesDemandService, ModuleDemandSummary, TopFilterMetric } from '../services/modulesDemandService';
import { logger } from '../../../lib/logger';

export default function ModulesDemandPage() {
    const [range, setRange] = useState<7 | 30 | 90>(30);
    const [data, setData] = useState<ModuleDemandSummary | null>(null);
    const [topFilters, setTopFilters] = useState<TopFilterMetric[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [summary, filters] = await Promise.all([
                    modulesDemandService.getModulesDemandSummary(range),
                    modulesDemandService.getTopFilters(range)
                ]);
                setData(summary);
                setTopFilters(filters);
            } catch (error) {
                logger.error('[ModulesDemandPage] Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [range]);

    return (
        <div className="container-ws section-y space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end p-6 bg-slate-900 rounded-3xl shadow-xl text-white">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <span className="material-symbols-outlined text-4xl text-amber-400">trending_up</span>
                        Demanda por Módulos
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium">Interés real en funcionalidades "Próximamente".</p>
                </div>

                <div className="mt-6 md:mt-0 flex bg-slate-800 p-1 rounded-xl border border-slate-700">
                    {[7, 30, 90].map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r as any)}
                            className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${range === r
                                ? 'bg-white text-slate-900 shadow-lg'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {r} DÍAS
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card
                    label="Total Views"
                    value={data?.total_views || 0}
                    icon="visibility"
                    loading={loading}
                    color="text-indigo-600"
                />
                <Card
                    label="Total Clicks (Interés)"
                    value={data?.total_clicks || 0}
                    icon="touch_app"
                    loading={loading}
                    color="text-rose-600"
                />
                <Card
                    label="Conversión Global"
                    value={`${data?.global_ctr.toFixed(1) || 0}%`}
                    icon="ads_click"
                    loading={loading}
                    color="text-emerald-600"
                />
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Desglose por Módulo</h3>
                    {loading && <span className="material-symbols-outlined animate-spin text-slate-300">progress_activity</span>}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Módulo (Slug)</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Views</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Clicks</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">CTR</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Preview Type</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {data?.modules_detail.map((m, i) => (
                                <tr key={i} className="group hover:bg-slate-50/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="font-black text-slate-800 text-sm">{m.module_slug}</span>
                                            {m.clicks >= 10 && (
                                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-black rounded-full animate-pulse">HOT</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-500 text-sm">{m.views}</td>
                                    <td className="px-6 py-4 font-black text-slate-900 text-sm">{m.clicks}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-500 rounded-full"
                                                    style={{ width: `${Math.min(m.ctr, 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-black text-slate-600">{m.ctr.toFixed(1)}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                                            {m.preview_type}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {!loading && data?.modules_detail.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-bold italic">
                                        Sin datos de señales en este periodo.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Top Filters Table */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom duration-700 delay-150">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Top Filtros Usados (Preview)</h2>
                        <p className="text-slate-400 text-xs mt-1 font-medium">Interacción detallada con los filtros dinámicos de los mockups</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Módulo</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtro / Acción</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor / Opción</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Usos</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {topFilters.length > 0 ? topFilters.map((filter, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                                    <td className="px-8 py-6">
                                        <span className="text-sm font-black text-slate-800 capitalize">
                                            {filter.module_slug.replace('-', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase tracking-wider">
                                            {filter.filter_key}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-sm text-slate-600 font-bold">
                                            {filter.filter_value}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black text-slate-900">{filter.usage_count}</span>
                                            <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-slate-300"
                                                    style={{ width: `${Math.min(100, (filter.usage_count / (topFilters[0]?.usage_count || 1)) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-bold italic text-sm">
                                        No hay datos de filtros para este periodo.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function Card({ label, value, icon, loading, color }: { label: string; value: string | number; icon: string; loading: boolean; color: string }) {
    return (
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className={`material-symbols-outlined absolute -right-4 -bottom-4 text-8xl opacity-[0.03] group-hover:scale-110 transition-transform ${color}`}>
                {icon}
            </div>
            <div className="flex items-start gap-4 relative z-10">
                <div className={`w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-50 flex items-center justify-center shrink-0 ${color}`}>
                    <span className="material-symbols-outlined text-2xl">{icon}</span>
                </div>
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</h4>
                    {loading ? (
                        <div className="h-8 w-24 bg-slate-50 animate-pulse rounded-lg" />
                    ) : (
                        <p className="text-3xl font-black text-slate-900">{value}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
