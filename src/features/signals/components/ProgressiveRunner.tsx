import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BattleOption, ProgressiveBattle, VoteResult } from '../types';
import OptionCard from './OptionCard';
import EntityLogo from '../../../components/entities/EntityLogo';
import { resolveEntitySlug } from '../../../lib/entities/resolveEntitySlug';

interface ProgressiveRunnerProps {
    progressiveData: ProgressiveBattle;
    onComplete: (winner: BattleOption) => void;
    onVote: (battleId: string, option_id: string, opponentId: string, metadata?: Record<string, any>) => Promise<VoteResult>;
    onPlayAgain?: () => void;
}

export default function ProgressiveRunner({ progressiveData, onVote, onPlayAgain }: Omit<ProgressiveRunnerProps, 'onComplete'>) {
    const candidates = progressiveData.candidates || [];
    const [processedCandidates, setProcessedCandidates] = useState<BattleOption[]>([]);

    const [round, setRound] = useState(1);
    const [champWins, setChampWins] = useState(0);
    const [isCrowned, setIsCrowned] = useState(false);
    const [defeatedOpponents, setDefeatedOpponents] = useState<BattleOption[]>([]);

    const [leftOption, setLeftOption] = useState<BattleOption | null>(candidates[0] || null);
    const [rightOption, setRightOption] = useState<BattleOption | null>(candidates[1] || null);
    const [currentChampId, setCurrentChampId] = useState<string | null>(null);

    const [isVoting, setIsVoting] = useState(false);
    const [lastWinnerId, setLastWinnerId] = useState<string | null>(null);

    const theme = progressiveData.theme || {
        primary: '#2563eb', // Opina Blue
        accent: '#10b981',  // Opina Emerald
        bgGradient: 'from-slate-50 to-white',
        icon: 'stars'
    };

    const memoCandidates = useMemo(() => progressiveData.candidates || [], [progressiveData.candidates]);

    const totalRounds = useMemo(() => processedCandidates.length > 1 ? processedCandidates.length - 1 : 1, [processedCandidates]);

    const initTournament = useCallback((candidatesData: BattleOption[]) => {
        // Map and format
        const mapped = candidatesData.map(c => ({
            ...c,
            type: c.type || 'brand' as const,
            imageFit: c.imageFit || 'contain' as const
        }));

        // Shuffle the candidates so each progressive run starts differently
        const shuffled = mapped.sort(() => Math.random() - 0.5).slice(0, 11);

        setProcessedCandidates(shuffled);
        setRound(1);
        setChampWins(0);
        setIsCrowned(false);
        setDefeatedOpponents([]);
        setCurrentChampId(null);
        setLeftOption(shuffled[0] || null);
        setRightOption(shuffled[1] || null);
        setLastWinnerId(null);
        setIsVoting(false);
    }, []);

    // Initialize/Reset state when the tournament changes (e.g. category switch)
    useEffect(() => {
        if (memoCandidates.length > 0) {
            initTournament(memoCandidates);
        }
    }, [progressiveData.id, memoCandidates, initTournament]);

    const handleVote = useCallback(async (selectedOptionId: string) => {
        if (!leftOption || !rightOption || isVoting) return;
        setIsVoting(true);
        setLastWinnerId(selectedOptionId);

        const battleId = `prog-${progressiveData.id}-r${round}`;
        const opponentId = selectedOptionId === leftOption.id ? rightOption.id : leftOption.id;
        const losingOption = selectedOptionId === leftOption.id ? rightOption : leftOption;

        try {
            await onVote(battleId, selectedOptionId, opponentId, { round });

            // Record the defeated opponent
            setDefeatedOpponents(prev => [...prev, losingOption]);

            // Wait for visual feedback
            await new Promise(resolve => setTimeout(resolve, 1000));

            const winningOption = selectedOptionId === leftOption.id ? leftOption : rightOption;
            const newWins = (currentChampId === selectedOptionId) ? champWins + 1 : 1;

            if (round >= totalRounds) {
                setIsCrowned(true);
                setChampWins(newWins);
                setLeftOption(winningOption); // Show final champion center or reuse slot
            } else {
                setChampWins(newWins);
                setCurrentChampId(selectedOptionId);
                setRound(prev => prev + 1);

                // Get next challenger (sequentially), ensuring it's not the same brand
                let nextIndex = round + 1;
                let nextCandidate = processedCandidates[nextIndex];

                while (nextCandidate && nextCandidate.label?.trim().toLowerCase() === winningOption.label?.trim().toLowerCase()) {
                    nextIndex++;
                    nextCandidate = processedCandidates[nextIndex];
                }

                if (nextCandidate) {
                    // Winner stays in its current slot
                    if (selectedOptionId === leftOption.id) {
                        setRightOption(nextCandidate);
                    } else {
                        setLeftOption(nextCandidate);
                    }
                } else {
                    setIsCrowned(true);
                }
            }
        } catch (error) {
            console.error("Error in progressive vote:", error);
        } finally {
            setIsVoting(false);
            setLastWinnerId(null);
        }
    }, [leftOption, rightOption, isVoting, progressiveData.id, round, champWins, onVote, processedCandidates, currentChampId, totalRounds]);

    // Key Support
    useEffect(() => {
        const handleKeys = (e: KeyboardEvent) => {
            if (isVoting || isCrowned || !leftOption || !rightOption) return;
            if (e.key === 'ArrowLeft' || e.key === '1') handleVote(leftOption.id);
            if (e.key === 'ArrowRight' || e.key === '2') handleVote(rightOption.id);
        };
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, [isVoting, isCrowned, leftOption, rightOption, handleVote]);

    if (!candidates || candidates.length < 2) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-[400px]">
                <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">inventory_2</span>
                <h3 className="text-2xl font-bold text-ink mb-2">No hay progresivo disponible</h3>
                <p className="text-slate-500 font-medium max-w-sm mb-6">Estamos armando la próxima escalera. Vuelve en un rato.</p>
                <div className="text-xs text-left w-full max-w-lg overflow-auto bg-slate-100 p-4 rounded mb-6">
                    <pre>{JSON.stringify({
                        industry: progressiveData?.industry,
                        hasData: !!progressiveData,
                        candidates: candidates?.length,
                        candidatesList: candidates?.map(c => c?.label)
                    }, null, 2)}
                    </pre>
                </div>
                <button
                    onClick={() => window.location.href = '/experience'}
                    className="btn-primary"
                >
                    Volver a Participa
                </button>
            </div>
        );
    }

    if (isCrowned && leftOption) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-8 max-w-4xl mx-auto"
            >
                {/* Champion Badge */}
                <div className="relative">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 12, delay: 0.2 }}
                        className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-white shadow-2xl border-8 border-theme-primary p-8 flex items-center justify-center relative z-20 mx-auto"
                        style={{ borderColor: theme.primary }}
                    >
                        <EntityLogo
                            name={leftOption?.label || "Campeón actual"}
                            slug={resolveEntitySlug(leftOption)}
                            size="lg"
                            rounded={false}
                            className="w-full h-full border-none object-contain mix-blend-multiply bg-transparent"
                        />
                    </motion.div>

                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 z-10 border-4 border-dashed rounded-full scale-110"
                        style={{ borderColor: `${theme.accent}50` }}
                    />

                    <div className="absolute -top-6 -right-6 md:right-4 z-30 bg-slate-900 text-white w-16 h-16 rounded-2xl flex flex-col items-center justify-center shadow-xl rotate-12">
                        <span className="text-[10px] font-black uppercase">Wins</span>
                        <span className="text-2xl font-black">{champWins}</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-4xl md:text-5xl font-black text-ink tracking-tight">
                        {leftOption?.label} <span className="text-gradient-brand">Preferencia Sólida</span>
                    </h2>
                    <p className="text-lg text-slate-500 font-medium">Opción sobreviviente tras {round} decisiones consecutivas.</p>
                </div>

                {/* Simulated AI Insight */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="card card-pad text-left relative overflow-hidden group w-full"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                            <span className="material-symbols-outlined text-white text-[18px]">auto_awesome</span>
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-primary-600">AI Insight Progresivo</span>
                    </div>

                    <p className="text-slate-700 font-bold leading-relaxed md:text-lg">
                        Tu preferencia sostenida es <span className="text-primary-600 font-black">{leftOption?.label}</span> frente a otras opciones de su categoría. El <span className="text-emerald-600 font-black">{40 + Math.floor(Math.random() * 20)}%</span> de la comunidad Opina+ también respaldó a esta opción en escenarios de descarte similares.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-4">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <span className="material-symbols-outlined text-[14px] text-emerald-500">verified</span>
                            Confianza: Alta
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <span className="material-symbols-outlined text-[14px] text-blue-500">public</span>
                            Global Reach: 78%
                        </div>
                    </div>
                </motion.div>

                {/* Camino a la Victoria (Tournament Result) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="w-full text-left"
                >
                    <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary-500">route</span>
                        Camino a la victoria
                    </h3>
                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 shadow-sm">
                        <p className="text-sm font-bold text-slate-500 mb-4">Opciones que descartaste en este torneo:</p>
                        <div className="overflow-x-auto pb-4">
                            <div className="flex gap-4 min-w-max items-center">
                                {defeatedOpponents.map((opp, idx) => (
                                    <div key={idx} className="flex items-center">
                                        <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden p-2 group-hover:-translate-y-1 transition-transform relative">
                                                <div className="absolute inset-0 bg-rose-500/5 mix-blend-multiply z-10" />
                                                <div className="absolute top-1 right-1 z-20">
                                                    <span className="material-symbols-outlined text-[14px] text-rose-500 drop-shadow-sm font-bold">close</span>
                                                </div>
                                                <EntityLogo
                                                    name={opp.label}
                                                    slug={resolveEntitySlug(opp)}
                                                    size="sm"
                                                    rounded={false}
                                                    className="w-full h-full border-none object-contain mix-blend-multiply opacity-60 grayscale bg-transparent"
                                                />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-600 w-20 text-center truncate">{opp.label}</span>
                                        </div>
                                        {idx < defeatedOpponents.length - 1 && (
                                            <span className="material-symbols-outlined text-slate-300 mx-2 text-sm">arrow_forward</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    <button
                        onClick={() => window.location.href = '/experience'}
                        className="btn-secondary w-full"
                    >
                        Ver más evaluaciones
                    </button>
                    <button
                        onClick={() => {
                            if (onPlayAgain) {
                                onPlayAgain();
                            } else if (memoCandidates.length > 0) {
                                initTournament(memoCandidates);
                            }
                        }}
                        className="btn-primary w-full"
                    >
                        Jugar de nuevo
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto px-4 md:px-6 pb-24 pt-2 md:pt-4 space-y-8">
            <div className="px-4 pb-2 text-center">
                <div className="text-center">
                    <h2 className="h2 text-slate-800">
                        {(() => {
                            const ironicPrefixes = ["Dilema de", "Terapia de", "Diferendo de", "Sínodo de", "Anatomía de", "Fricción de", "Debate de"];
                            const rawTitle = progressiveData.title || "Guerra del Canal";

                            // Replace "Guerra" with a random ironic prefix if found
                            let refinedTitle = rawTitle;
                            if (rawTitle.toLowerCase().includes('guerra')) {
                                const randomPrefix = ironicPrefixes[Math.floor(Math.random() * ironicPrefixes.length)];
                                refinedTitle = rawTitle.replace(/Guerra/i, randomPrefix);
                            }

                            const cleanTitle = refinedTitle.trim();
                            const words = cleanTitle.split(/\s+/);

                            if (words.length <= 1) {
                                return (
                                    <span style={{ color: theme.primary }}>{cleanTitle}</span>
                                );
                            }

                            const lastWord = words.pop() || '';
                            const firstPart = words.join(' ');
                            return (
                                <>
                                    {firstPart} <span style={{ color: theme.primary }}>{lastWord}</span>
                                </>
                            );
                        })()}
                    </h2>

                    <p className="body-base mt-4 md:text-lg">
                        Si fueras descartando opciones, ¿cuál elegirías?
                    </p>

                    <div className="body-caption mt-2">
                        Señala la opción que prefieres mantener.
                    </div>
                </div>
            </div>

            {/* Battle Arena */}
            <div className="relative mt-6">
                {/* Instruction + Progress immediately above cards */}
                <div className="max-w-xl mx-auto mb-8">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>Progreso</span>
                        <span>{round}/{totalRounds}</span>
                    </div>

                    <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <motion.div
                            className="h-full rounded-full bg-gradient-brand transition-all duration-500 ease-out"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.round(((round - 1) / totalRounds) * 100)}%` }}
                        />
                    </div>

                    <div className="mt-2 text-[11px] font-medium text-slate-500 text-center">
                        Tu señal se cruza con tu perfil para detectar patrones.
                    </div>
                </div>

                <div className={`relative w-full mx-auto transition-opacity duration-300 ${isVoting ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                    {/* VS Badge - Unificado Corporativo Opina+ */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none">
                        <motion.div
                            key={round}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="h-20 w-20 md:h-24 md:w-24 bg-gradient-brand rounded-full border-[6px] md:border-8 border-white shadow-[0_25px_65px_rgba(37,99,235,0.35)] flex items-center justify-center"
                        >
                            <span className="relative text-2xl md:text-3xl font-black tracking-tighter text-white italic drop-shadow-md">VS</span>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-stretch">
                        {/* Left Option */}
                        <AnimatePresence mode="popLayout">
                            <motion.div
                                initial={{ x: -40, opacity: 0, scale: 0.95 }}
                                animate={{ x: 0, opacity: 1, scale: 1 }}
                                exit={{ x: -20, opacity: 0, scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                                key={`left-${leftOption?.id}`}
                                className="relative w-full"
                            >
                                {round > 1 && currentChampId === leftOption?.id && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full bg-gradient-brand text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-blue-500/30 border-2 border-white">
                                        <span className="material-symbols-outlined text-[12px] align-middle mr-1">social_leaderboard</span>
                                        Favorito actual
                                    </div>
                                )}
                                {round > 1 && currentChampId !== leftOption?.id && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full bg-slate-800 text-[10px] font-black uppercase tracking-widest text-white shadow-lg border-2 border-white">
                                        Nueva opción
                                    </div>
                                )}
                                {leftOption && (
                                    <OptionCard
                                        option={leftOption}
                                        onClick={() => handleVote(leftOption.id)}
                                        disabled={isVoting}
                                        isSelected={lastWinnerId === leftOption.id}
                                        showResult={isVoting}
                                        percent={null}
                                        isChampion={currentChampId === leftOption.id}
                                        theme={theme}
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Right Option */}
                        <AnimatePresence mode="popLayout">
                            <motion.div
                                initial={{ x: 50, opacity: 0, scale: 0.9 }}
                                animate={{ x: 0, opacity: 1, scale: 1 }}
                                exit={{ x: 30, opacity: 0, scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                                key={`right-${rightOption?.id}`}
                                className="relative w-full"
                            >
                                {round > 1 && currentChampId === rightOption?.id && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full bg-gradient-brand text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-blue-500/30 border-2 border-white">
                                        <span className="material-symbols-outlined text-[12px] align-middle mr-1">social_leaderboard</span>
                                        Favorito actual
                                    </div>
                                )}
                                {round > 1 && currentChampId !== rightOption?.id && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full bg-slate-800 text-[10px] font-black uppercase tracking-widest text-white shadow-lg border-2 border-white">
                                        Nueva opción
                                    </div>
                                )}
                                {rightOption && (
                                    <OptionCard
                                        option={rightOption}
                                        onClick={() => handleVote(rightOption.id)}
                                        disabled={isVoting}
                                        isSelected={lastWinnerId === rightOption.id}
                                        showResult={isVoting}
                                        percent={null}
                                        isChampion={currentChampId === rightOption.id}
                                        theme={theme}
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Keyboard Hints */}
                    <div className="text-center mt-8">
                        <p className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            <span className="material-symbols-outlined text-[16px]">keyboard</span>
                            Usa las flechas ← → o las teclas 1 2
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
