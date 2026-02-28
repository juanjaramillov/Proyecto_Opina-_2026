import { useState, useEffect } from 'react';
import { modulesPriorityService, ModulePriorityMetric } from '../services/modulesPriorityService';
import { logger } from '../../../lib/logger';

export default function ModulesPriorityPage() {
    const [range, setRange] = useState<7 | 30 | 90>(30);
    const [ranking, setRanking] = useState<ModulePriorityMetric[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const data = await modulesPriorityService.getModulesPriority(range);
                setRanking(data);
            } catch (error) {
                logger.error('[ModulesPriorityPage] Error loading ranking:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [range]);

    const topModule = ranking[0];

    return (
        <div className="container-ws section-y space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end p-8 bg-gradient-to-br from-slate-900 to-primary-950 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <span className="material-symbols-outlined text-[10rem]">rocket_launch</span>
                </div>

                <div className="relative z-10">
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-4">
                        Roadmap de Prioridad
                    </h1>
                    <p className="text-slate-300 mt-3 font-medium text-lg max-w-xl">
                        Scoring inteligente basado en intención real para decidir el orden de lanzamiento.
                    </p>
                </div>

                <div className="mt-8 md:mt-0 flex bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 relative z-10">
                    {[7, 30, 90].map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r as 7 | 30 | 90)}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${range === r
                                ? 'bg-white text-slate-900 shadow-xl scale-105'
                                : 'text-slate-300 hover:text-white'
                                }`}
                        >
                            {r} DÍAS
                        </button>
                    ))}
                </div>
            </div>

            {/* Top Recommendation Highlight */}
            {topModule && !loading && (
                <div className="bg-amber-50 border-2 border-amber-200 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 shadow-sm">
                    <div className="w-24 h-24 bg-amber-400 rounded-3xl flex items-center justify-center shrink-0 shadow-lg rotate-3">
                        <span className="material-symbols-outlined text-white text-5xl">rewarded_ads</span>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 mb-2">Recomendación #1</h2>
                        <h3 className="text-3xl font-black text-slate-900 capitalize mb-2">Lanzar "{topModule.module_slug.replace('-', ' ')}"</h3>
                        <p className="text-slate-600 font-medium">
                            Este módulo lidera con un score de <span className="font-bold text-slate-900">{topModule.score}</span>.
                            Muestra la mejor intersección entre volumen visual y <span className="text-amber-700 underline decoration-2 underline-offset-4 font-bold">intención real de uso</span>.
                        </p>
                    </div>
                    <div className="bg-white px-8 py-6 rounded-3xl border border-amber-100 shadow-sm text-center min-w-[150px]">
                        <div className="text-4xl font-black text-slate-900">{topModule.clicks}</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase mt-1">Clicks de Interés</div>
                    </div>
                </div>
            )}

            {/* Ranking Table */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                    <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Ranking de Tracción</h3>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
                        <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-300"></div> SCORE = (C*3) + (V*1) + (CTR*2)</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pos</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Módulo</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Score</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Clicks</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">CTR</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Roadmap Insight</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {ranking.map((m, i) => (
                                <tr key={i} className={`group hover:bg-slate-50/30 transition-all ${i === 0 ? 'bg-amber-50/10' : ''}`}>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${i === 0 ? 'bg-amber-400 text-white' :
                                            i === 1 ? 'bg-slate-300 text-slate-600' :
                                                i === 2 ? 'bg-orange-200 text-orange-700' : 'bg-slate-100 text-slate-400'
                                            }`}>
                                            {i + 1}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-black text-slate-900 text-base capitalize">{m.module_slug.replace('-', ' ')}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-tighter">{m.preview_type}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`text-xl font-black ${i === 0 ? 'text-primary-600' : 'text-slate-900'}`}>{m.score}</span>
                                    </td>
                                    <td className="px-8 py-6 font-bold text-slate-600">
                                        {m.clicks} <span className="text-[10px] font-black text-slate-300 ml-1">CLICKS</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-black text-slate-700">{m.ctr.toFixed(1)}%</span>
                                            <div className="w-12 h-1 bg-slate-100 rounded-full">
                                                <div className="h-full bg-slate-300 rounded-full" style={{ width: `${Math.min(100, m.ctr * 4)}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${m.insight === 'Alta intención' ? 'bg-emerald-100 text-emerald-700' :
                                            m.insight === 'Muy prometedor' ? 'bg-primary-100 text-primary-700' :
                                                m.insight === 'Nicho potente' ? 'bg-secondary-100 text-secondary-700' :
                                                    m.insight === 'Curiosidad, falta gancho' ? 'bg-slate-100 text-slate-500' : 'bg-slate-100 text-slate-400'
                                            }`}>
                                            {m.insight}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {!loading && ranking.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-bold italic">
                                        No hay datos suficientes para generar el roadmap.
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

