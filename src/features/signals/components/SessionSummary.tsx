import { motion } from 'framer-motion';
import { Battle } from '../types';

interface SessionResult {
    battle: Battle;
    myVote: 'A' | 'B';
    pctA: number;
}

interface SessionSummaryProps {
    results: SessionResult[];
    onReset: () => void;
}

export default function SessionSummary({ results, onReset }: SessionSummaryProps) {
    return (
        <div className="w-full max-w-2xl mx-auto py-12 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center mb-12"
            >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 mb-6 relative">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-full bg-emerald-500/20"
                    />
                    <span className="material-symbols-rounded text-4xl relative z-10">verified</span>
                </div>
                <h2 className="text-4xl font-black text-ink mb-3 tracking-tight">Sesión Brillante</h2>
                <p className="text-text-secondary font-medium text-lg max-w-md mx-auto">
                    Has generado <span className="text-emerald-600 font-bold">{results.length} nuevas señales</span> para la inteligencia colectiva.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-4 mb-12">
                {results.map((item, i) => (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={item.battle.id}
                        className="group bg-white border border-stroke rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />

                        <div className="flex flex-col gap-4 relative z-10">
                            <h3 className="text-lg font-black text-ink leading-tight">
                                {item.battle.title}
                            </h3>

                            <div className="flex items-center gap-4">
                                <div className="flex-1 relative h-12 bg-slate-50 rounded-2xl overflow-hidden flex items-center px-4 border border-slate-100 group-hover:border-primary/20 transition-colors">
                                    <div className="absolute inset-y-0 left-0 bg-emerald-500/10 w-full" />
                                    <div className="flex items-center gap-2 relative z-10">
                                        <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span>
                                        <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">
                                            Señal Procesada
                                        </span>
                                    </div>
                                </div>

                                <div className="px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100">
                                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter">
                                        Elección: {item.myVote}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                    onClick={onReset}
                    className="w-full sm:w-auto px-10 py-5 bg-ink text-white text-lg font-black rounded-2xl shadow-2xl hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    SEGUIR APORTANDO
                </button>
                <button
                    onClick={() => window.location.href = '/'}
                    className="w-full sm:w-auto px-10 py-5 bg-white text-slate-400 text-lg font-bold rounded-2xl border border-stroke hover:text-slate-600 hover:border-slate-300 transition-all"
                >
                    Panel Principal
                </button>
            </div>
        </div>
    );
}
