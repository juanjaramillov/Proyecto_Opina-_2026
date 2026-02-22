
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
        <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-0 group-hover:bg-primary/10 transition-colors" />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-2">
                            <span className="material-symbols-outlined text-[14px]">stars</span>
                            Sistema de Impacto
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                            Nivel {current.level}
                        </h3>
                    </div>
                    <div className="text-right">
                        <span className="text-4xl font-black text-primary">{current.weight}x</span>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Peso de Señal</p>
                    </div>
                </div>

                <p className="text-sm text-slate-500 mb-8 max-w-[240px] leading-relaxed">
                    {current.level === 4
                        ? "Has alcanzado el nivel máximo de impacto. ¡Eres una eminencia en la comunidad!"
                        : `Estás en el nivel ${current.level}. Tu opinión tiene un multiplicador de ${current.weight}x en los resultados globales.`}
                </p>

                {next && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progreso al Nivel {next.level}</span>
                            <span className="text-sm font-black text-slate-900">{totalSignals} / {next.minSignals}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-50">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="bg-primary h-full rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                            />
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="material-symbols-outlined text-sm text-primary">info</span>
                            <span>Faltan <strong>{next.minSignals - totalSignals} señales</strong> para desbloquear un peso de <strong>{next.weight}x</strong></span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
