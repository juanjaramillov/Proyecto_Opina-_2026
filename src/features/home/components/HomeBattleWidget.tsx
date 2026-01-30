
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HomeBattleWidget: React.FC = () => {
    const [hasVoted, setHasVoted] = useState(false);
    const [results, setResults] = useState({ a: 54, b: 46 });
    const [timer, setTimer] = useState<number | null>(null);
    const [showToast, setShowToast] = useState(false);

    const handleVote = (option: 'A' | 'B') => {
        // Demo logic: simulate vote and show results
        const newA = option === 'A' ? 55 : 53;
        setResults({ a: newA, b: 100 - newA });
        setHasVoted(true);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 1500);

        // Auto-reset countdown
        setTimer(3);
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev === null || prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // Auto-reset when timer hits 0
    React.useEffect(() => {
        if (timer === 0) {
            setHasVoted(false);
            setTimer(null);
        }
    }, [timer]);

    return (
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-xl transition-all h-full flex flex-col">
            <div className="absolute top-0 right-0 p-6 opacity-10">
                <span className="material-symbols-outlined text-8xl text-indigo-500">poll</span>
            </div>

            <div className="relative z-10 flex-1 flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <span className="material-symbols-outlined text-2xl">bolt</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 leading-tight">Versus Rápido</h3>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Tu opinión vs Chile</p>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-center">
                    <h4 className="text-lg font-black text-slate-800 mb-6 leading-snug">
                        ¿Qué debería ser prioridad inmediata?
                    </h4>

                    <AnimatePresence mode="wait">
                        {!hasVoted ? (
                            <motion.div
                                key="voting"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="grid grid-cols-1 gap-3"
                            >
                                <button
                                    onClick={() => handleVote('A')}
                                    className="group relative flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-200 hover:shadow-md transition-all text-left"
                                >
                                    <span className="font-bold text-slate-700 group-hover:text-indigo-700">Seguridad</span>
                                    <span className="material-symbols-outlined text-slate-300 group-hover:text-indigo-400">arrow_forward</span>
                                </button>
                                <button
                                    onClick={() => handleVote('B')}
                                    className="group relative flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-200 hover:shadow-md transition-all text-left"
                                >
                                    <span className="font-bold text-slate-700 group-hover:text-indigo-700">Costo de vida</span>
                                    <span className="material-symbols-outlined text-slate-300 group-hover:text-indigo-400">arrow_forward</span>
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-4"
                            >
                                {/* Results Title with Countdown */}
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-lg">
                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                        Señal registrada
                                    </div>
                                    {timer !== null && (
                                        <div className="text-xs font-bold text-slate-400 animate-pulse">
                                            Nuevo versus en {timer}...
                                        </div>
                                    )}
                                </div>

                                {/* Bar A */}
                                <div>
                                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                                        <span className="text-slate-900">Seguridad</span>
                                        <span>{results.a}%</span>
                                    </div>
                                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${results.a}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="h-full bg-indigo-500"
                                        />
                                    </div>
                                </div>

                                {/* Bar B */}
                                <div>
                                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                                        <span className="text-slate-900">Costo de vida</span>
                                        <span>{results.b}%</span>
                                    </div>
                                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${results.b}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="h-full bg-slate-400"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2 text-center">
                                    <button
                                        onClick={() => {
                                            setHasVoted(false);
                                            setTimer(null);
                                        }}
                                        className="text-xs font-bold text-slate-400 hover:text-indigo-500 transition-colors"
                                    >
                                        Votar otra vez
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Mini Toast */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
                    >
                        <div className="bg-slate-900/90 backdrop-blur text-white px-4 py-2 rounded-full font-bold shadow-xl text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-emerald-400 text-sm">check</span>
                            Señal registrada
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HomeBattleWidget;
