import { useEffect, useState } from "react";
import { depthService } from "../services/depthService";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
    optionId: string;
};

type Row = {
    question_key: string;
    avg_value: number | null;
    total_responses: number;
};

export default function DepthAnalyticsPanel({ optionId }: Props) {
    const [data, setData] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);

    const [gender, setGender] = useState<string | null>(null);
    const [ageBucket, setAgeBucket] = useState<string | null>(null);
    const [region, setRegion] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const result = await depthService.getDepthAnalytics(optionId, {
                    gender: gender || null,
                    age_bucket: ageBucket || null,
                    region: region || null
                });
                setData(result);
            } catch (error) {
                console.error("Failed to load depth analytics:", error);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [optionId, gender, ageBucket, region]);

    return (
        <div className="card p-8 bg-gradient-to-br from-slate-900 to-indigo-950 border-none shadow-2xl relative overflow-hidden group">
            {/* Background Decor */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700" />

            <header className="relative z-10 mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] mb-3 text-white/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    Depth Engine v2.0
                </div>
                <h2 className="text-3xl font-black text-white tracking-tight">
                    Insights de Profundidad
                </h2>
                <p className="text-slate-400 text-sm font-medium mt-1">Análisis predictivo basado en señales de mercado</p>
            </header>

            {/* Filters */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Género</label>
                    <select
                        onChange={(e) => setGender(e.target.value || null)}
                        className="w-full h-[48px] px-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none appearance-none cursor-pointer"
                    >
                        <option value="" className="bg-slate-900">Todos</option>
                        <option value="male" className="bg-slate-900">Hombre</option>
                        <option value="female" className="bg-slate-900">Mujer</option>
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Rango Etario</label>
                    <select
                        onChange={(e) => setAgeBucket(e.target.value || null)}
                        className="w-full h-[48px] px-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none appearance-none cursor-pointer"
                    >
                        <option value="" className="bg-slate-900">Todos</option>
                        <option value="18-24" className="bg-slate-900">18-24</option>
                        <option value="25-34" className="bg-slate-900">25-34</option>
                        <option value="35-44" className="bg-slate-900">35-44</option>
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Región</label>
                    <select
                        onChange={(e) => setRegion(e.target.value || null)}
                        className="w-full h-[48px] px-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none appearance-none cursor-pointer"
                    >
                        <option value="" className="bg-slate-900">Todas</option>
                        <option value="RM" className="bg-slate-900">RM</option>
                        <option value="Valparaíso" className="bg-slate-900">Valparaíso</option>
                        <option value="Biobío" className="bg-slate-900">Biobío</option>
                    </select>
                </div>
            </div>

            <div className="relative z-10 grid gap-5">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="py-12 flex flex-col items-center justify-center gap-4"
                        >
                            <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                            <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">Sincronizando Insights...</span>
                        </motion.div>
                    ) : data.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-12 text-center"
                        >
                            <span className="material-symbols-outlined text-4xl text-slate-700 mb-3">folder_off</span>
                            <p className="text-slate-500 font-bold">Sin datos para este segmento</p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {data.map((row) => (
                                <motion.div
                                    key={row.question_key}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white/5 border border-white/5 p-6 rounded-2xl hover:bg-white/10 transition-all group/item"
                                >
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 group-hover/item:text-primary transition-colors">
                                        {row.question_key.replace(/_/g, ' ')}
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <div className="text-4xl font-black text-white tracking-tighter">
                                            {row.avg_value ? row.avg_value.toFixed(1) : "-"}
                                        </div>
                                        <div className="text-xs font-bold text-slate-500">avg</div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 grayscale opacity-50">
                                            <span className="material-symbols-outlined text-[14px] text-primary">analytics</span>
                                            <span className="text-[10px] font-black text-white uppercase tracking-tighter">{row.total_responses} reps</span>
                                        </div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
