import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VersusGame from './VersusGame';
import { Battle, BattleOption, ProgressiveBattle, VoteResult } from '../types';

interface ProgressiveRunnerProps {
    progressiveData: ProgressiveBattle;
    onComplete: (winner: BattleOption) => void;
    onVote: (battleId: string, optionId: string, opponentId: string) => Promise<VoteResult>;
}

export default function ProgressiveRunner({ progressiveData, onComplete, onVote }: ProgressiveRunnerProps) {
    const [round, setRound] = useState(0);
    const [candidates, setCandidates] = useState<BattleOption[]>(progressiveData.candidates || []);
    const [defeated, setDefeated] = useState<BattleOption[]>([]);
    const [winner, setWinner] = useState<BattleOption | null>(null);

    const theme = progressiveData.theme || {
        primary: '#10b981',
        accent: '#34d399',
        bgGradient: 'from-emerald-50 to-white',
        icon: 'stars'
    };

    const activeBattle: Battle | null = useMemo(() => {
        if (!candidates || candidates.length < 2) return null;
        const first = candidates[0];
        const second = candidates[1];

        return {
            id: `${progressiveData.id}-round-${round}`,
            title: progressiveData.title,
            subtitle: `Ronda ${round + 1}: ${progressiveData.subtitle || 'Torneo Progresivo'}`,
            options: [first, second],
            category: 'progressive',
            industry: progressiveData.industry
        } as Battle;
    }, [progressiveData, round, candidates]);

    if (!candidates || candidates.length < 2) {
        return (
            <div className={`min-h-[40vh] flex flex-col items-center justify-center p-8 rounded-[3rem] bg-gradient-to-b ${theme.bgGradient}`}>
                <p className="text-text-secondary">No hay suficientes opciones para iniciar este torneo.</p>
                <button onClick={() => window.location.reload()} className="mt-4 text-secondary font-bold underline">Reintentar</button>
            </div>
        );
    }

    const handleVote = async (battleId: string, optionId: string, opponentId: string) => {
        const result = await onVote(battleId, optionId, opponentId);

        const winningOption = candidates.find(c => c.id === optionId)!;
        const losingOption = candidates.find(c => c.id === opponentId)!;

        const nextCandidates = [winningOption, ...candidates.slice(2)];

        setDefeated(prev => [...prev, losingOption]);

        if (nextCandidates.length > 1) {
            setCandidates(nextCandidates);
            setRound(prev => prev + 1);
        } else {
            setWinner(winningOption);
            // Delay completion to show victory state
            setTimeout(() => onComplete(winningOption), 5000);
        }

        return result;
    };

    if (winner) {
        return (
            <div className={`min-h-[60vh] flex flex-col items-center justify-center p-8 rounded-[3rem] bg-gradient-to-b ${theme.bgGradient} relative overflow-hidden`}>
                {/* Background Decorations */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-20 -right-20 w-64 h-64 bg-white/40 blur-3xl rounded-full"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/40 blur-3xl rounded-full"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 12 }}
                    className="relative z-10 flex flex-col items-center"
                >
                    <div className="relative mb-12">
                        <motion.div
                            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="w-40 h-40 rounded-full bg-white shadow-2xl flex items-center justify-center border-8 border-white overflow-hidden p-6"
                        >
                            {winner.image_url ? (
                                <img src={winner.image_url} alt={winner.label} className="w-full h-full object-contain" />
                            ) : (
                                <span className="material-symbols-outlined text-6xl" style={{ color: theme.primary }}>{theme.icon}</span>
                            )}
                        </motion.div>
                        <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.5, type: "spring" }}
                            className="absolute -top-4 -right-4 w-16 h-16 bg-amber-400 text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white"
                        >
                            <span className="material-symbols-outlined text-3xl">crown</span>
                        </motion.div>
                    </div>

                    <h2 className="text-5xl font-black text-ink mb-4 tracking-tight">¡TENEMOS GANADOR!</h2>
                    <p className="text-2xl font-bold mb-10" style={{ color: theme.primary }}>{winner.label}</p>

                    <div className="flex flex-wrap justify-center gap-3 opacity-60 max-w-lg">
                        {defeated.map((d, i) => (
                            <motion.div
                                key={d.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1 + (i * 0.1) }}
                                className="w-12 h-12 bg-white/50 rounded-xl border border-white flex items-center justify-center p-2 backdrop-blur-sm grayscale"
                            >
                                {d.image_url ? <img src={d.image_url} alt={d.label} className="w-full h-full object-contain" /> : <span className="text-[8px] font-bold">{d.label}</span>}
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2 }}
                        className="mt-12 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary"
                    >
                        Redirigiendo a resultados...
                    </motion.div>
                </motion.div>

                {/* Celebration Particles (Framer Motion) */}
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full"
                        style={{
                            left: "50%",
                            top: "50%",
                            backgroundColor: i % 2 === 0 ? theme.primary : theme.accent
                        }}
                        initial={{ x: 0, y: 0, opacity: 1 }}
                        animate={{
                            x: (Math.random() - 0.5) * 600,
                            y: (Math.random() - 0.5) * 600,
                            opacity: 0,
                            scale: 0
                        }}
                        transition={{ duration: 2, delay: 0.2, repeat: Infinity, repeatDelay: 1 }}
                    />
                ))}
            </div>
        );
    }

    return (
        <div className={`w-full max-w-4xl mx-auto p-4 md:p-12 rounded-[3.5rem] bg-gradient-to-b ${theme.bgGradient} border-b-8 border-stroke/5 shadow-inner transition-colors duration-1000`}>
            <div className="text-center mb-12 space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={theme.icon}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-white shadow-sm rounded-full border border-stroke"
                >
                    <span className="material-symbols-outlined text-xl" style={{ color: theme.primary }}>{theme.icon}</span>
                    <span className="text-xs font-black uppercase tracking-widest text-ink">{progressiveData.subtitle || 'Torneo Progresivo'}</span>
                </motion.div>

                <div className="flex justify-center items-center gap-3">
                    {candidates.map((_, i) => (
                        <div key={i} className="flex items-center">
                            <motion.div
                                animate={{
                                    scale: i === round ? 1.2 : 1,
                                    backgroundColor: i < round ? theme.primary : (i === round ? theme.accent : '#e2e8f0'),
                                }}
                                className="h-3 w-3 rounded-full transition-all duration-500"
                            />
                            {i < candidates.length - 1 && (
                                <div className={`h-1 w-4 md:w-8 transition-colors duration-500 ${i < round ? '' : 'bg-slate-200'}`} style={{ backgroundColor: i < round ? theme.primary : undefined }} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative">
                <AnimatePresence>
                    {round > 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="absolute -top-16 left-1/4 -translate-x-1/2 z-20"
                        >
                            <div className="bg-amber-400 text-white px-4 py-2 rounded-2xl text-[10px] font-black shadow-[0_10px_20px_rgba(245,158,11,0.3)] flex items-center gap-2 border-4 border-white">
                                <span className="material-symbols-outlined text-base">crown</span>
                                EL REY SIGUE EN PIE
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {activeBattle && (
                    <div className="bg-white/40 backdrop-blur-md rounded-[3rem] p-2 border border-white/50 shadow-xl overflow-hidden">
                        <VersusGame
                            battles={[activeBattle]}
                            onVote={handleVote}
                            key={round}
                            mode="progressive"
                            hideProgress
                            enableAutoAdvance={false}
                        />
                    </div>
                )}
            </div>

            {defeated.length > 0 && (
                <div className="mt-16 pt-10 border-t border-white/50">
                    <div className="flex flex-col items-center">
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] mb-8 bg-white/80 px-4 py-1 rounded-full shadow-sm">
                            Retadores Superados
                        </p>
                        <div className="flex flex-wrap justify-center gap-6">
                            {defeated.map((d, i) => (
                                <motion.div
                                    key={d.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 0.35, scale: 0.95 }}
                                    whileHover={{ opacity: 1, scale: 1.05 }}
                                    className="opacity-30 grayscale hover:grayscale-0 transition-all cursor-help relative group"
                                    title={d.label}
                                >
                                    <div className="w-16 h-16 bg-white rounded-2xl border border-stroke flex items-center justify-center p-2 shadow-sm group-hover:shadow-md transition-shadow">
                                        {d.image_url ? (
                                            <img src={d.image_url} alt={d.label} className="w-full h-full object-contain" />
                                        ) : (
                                            <span className="text-[8px] font-black text-center">{d.label}</span>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                        <span className="text-[8px] font-bold text-slate-400">#{i + 1}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
