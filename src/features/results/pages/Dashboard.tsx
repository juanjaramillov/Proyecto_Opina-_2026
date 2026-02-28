import { useState, useEffect } from "react";
import { supabase as sb } from "../../../supabase/client";

interface SignalAgg {
    hour_bucket: string;
    signals_count: number;
    weighted_sum: number;
    battle?: { title: string };
    option?: { label: string };
}

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<SignalAgg[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            const { data, error } = await sb
                .from('signal_hourly_aggs')
                .select('*, battle:battles(title), option:battle_options(label)')
                .order('hour_bucket', { ascending: false })
                .limit(20);

            if (!error) setStats((data as unknown as SignalAgg[]) || []);
            setLoading(false);
        };

        fetchStats();
    }, []);

    return (
        <div className="p-8 w-full max-w-[1600px] mx-auto space-y-8">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">B2B Intelligence</h1>
                    <p className="text-slate-500">Panel de monitoreo de señales agregadas (actualizado cada 3 horas).</p>
                </div>
                <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-100">
                    SISTEMA ONLINE
                </div>
            </header>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-40 bg-slate-50 rounded-2xl border border-slate-100" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stats.length > 0 ? stats.map((stat, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                    {new Date(stat.hour_bucket).toLocaleString()}
                                </span>
                                <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded">
                                    {new Date(stat.hour_bucket).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <h3 className="font-bold text-slate-900 line-clamp-1">{stat.battle?.title}</h3>
                            <p className="text-sm text-slate-500 mb-4">{stat.option?.label}</p>

                            <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-4">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Señales</p>
                                    <p className="text-xl font-black text-slate-900">{stat.signals_count}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Impacto Relativo</p>
                                    <p className="text-xl font-black text-secondary">{stat.weighted_sum.toFixed(1)}</p>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                            <p className="text-slate-400">No hay señales agregadas en la última hora.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
