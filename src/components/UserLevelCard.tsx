
import { getUserLevel, getNextLevel } from "../lib/levelSystem";
import { motion } from "framer-motion";

interface Props {
    totalSignals: number;
}

export function UserLevelCard({ totalSignals }: Props) {
    const current = getUserLevel(totalSignals);
    const next = getNextLevel(totalSignals);

    const progress = next
        ? ((totalSignals - current.minSignals) /
            (next.minSignals - current.minSignals)) * 100
        : 100;

    return (
        <div className="bg-slate-900 rounded-[2rem] p-8 shadow-2xl border border-slate-800 relative overflow-hidden group hover:shadow-[0_20px_40px_rgba(79,70,229,0.2)] transition-all duration-500">
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-500/20 to-emerald-500/10 rounded-bl-full -z-0 group-hover:scale-110 blur-2xl transition-transform duration-700" />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 text-[10px] font-black uppercase tracking-widest mb-4 border border-primary-500/30">
                            <span className="material-symbols-outlined text-[14px]">account_tree</span>
                            Panel de Influencia
                        </div>
                        <h3 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                            Lvl {current.level}
                            <span className="text-sm font-bold bg-slate-800 px-3 py-1 rounded-lg text-slate-300 border border-slate-700 tracking-wider">
                                {current.level === 4 ? 'MAX' : 'ACTIVO'}
                            </span>
                        </h3>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1 mb-1">Impacto de Señal</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-lg font-black text-emerald-400">Alto</span>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 backdrop-blur-sm mb-8 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Señales Emitidas</span>
                    <span className="text-3xl font-black text-white">{totalSignals.toLocaleString()}</span>
                </div>

                {next && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Siguiente Nivel: Lvl {next.level}</span>
                            <span className="text-sm font-black text-slate-300">{totalSignals} / {next.minSignals}</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/50">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, progress)}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="bg-gradient-to-r from-primary-500 to-emerald-400 h-full rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)] relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite] -translate-x-full" />
                            </motion.div>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-800/80 p-3 rounded-xl border border-slate-700/50 mt-4 backdrop-blur-md">
                            <span className="material-symbols-outlined text-sm text-primary-400">info</span>
                            <span>Sigue acumulando señales para subir al siguiente nivel de influencia.</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
