import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BattleOption, TorneoTournament } from '../types';
import OptionCard from './OptionCard';
import { logger } from '../../../lib/logger';
import { ProgressiveEmptyState } from './runner/ProgressiveEmptyState';
import { CrownedChampionView } from './runner/CrownedChampionView';

interface TorneoRunnerProps {
    progressiveData: Omit<TorneoTournament, 'stage'> | null;
    onVote: (battle_id: string, option_id: string, opponentId: string, metadata?: Record<string, unknown>) => Promise<void>;
    onComplete?: (results: Record<string, unknown>) => void;
    onPlayAgain?: () => void;
}

export default function TorneoRunner({ progressiveData, onVote, onPlayAgain }: Omit<TorneoRunnerProps, 'onComplete'>) {
    const candidates = progressiveData?.candidates || [];
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

    const theme = progressiveData?.theme || {
        primary: '#2563eb', // Opina Blue
        accent: '#10b981',  // Opina Emerald
        bgGradient: 'from-slate-50 to-white',
        icon: 'stars'
    };

    const memoCandidates = useMemo(() => progressiveData?.candidates || [], [progressiveData?.candidates]);

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
    }, [progressiveData?.id, memoCandidates, initTournament]);

    const handleVote = useCallback(async (selectedOptionId: string) => {
        if (!leftOption || !rightOption || isVoting) return;
        setIsVoting(true);
        setLastWinnerId(selectedOptionId);

        const battleId = `prog-${progressiveData?.id}-r${round}`;
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
            logger.error("Error in progressive vote", { domain: 'signal_write', origin: 'TorneoRunner', action: 'progressive_vote', state: 'failed' }, error);
        } finally {
            setIsVoting(false);
            setLastWinnerId(null);
        }
    }, [leftOption, rightOption, isVoting, progressiveData?.id, round, champWins, onVote, processedCandidates, currentChampId, totalRounds]);

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
        return <ProgressiveEmptyState progressiveData={progressiveData} />;
    }

    if (isCrowned && leftOption) {
        return (
            <CrownedChampionView
                champion={leftOption}
                theme={theme}
                champWins={champWins}
                round={round}
                defeatedOpponents={defeatedOpponents}
                onReplay={() => {
                    if (onPlayAgain) {
                        onPlayAgain();
                    } else if (memoCandidates.length > 0) {
                        initTournament(memoCandidates);
                    }
                }}
            />
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto px-4 md:px-6 pb-24 pt-2 md:pt-4 space-y-8">
            <div className="px-4 pb-2 text-center">
                <div className="text-center">
                    <h2 className="h2 text-slate-800">
                        {(() => {
                            const ironicPrefixes = ["Dilema de", "Terapia de", "Diferendo de", "Sínodo de", "Anatomía de", "Fricción de", "Debate de"];
                            const rawTitle = progressiveData?.title || "Guerra del Canal";

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
                    {/* VS badge central eliminado por lineamientos de copy corporativo, igual que en Versus */}

                    <div className="grid grid-cols-2 gap-3 md:gap-8 lg:gap-10 relative z-20 items-stretch">
                        {/* Left Option */}
                        <AnimatePresence mode="popLayout">
                            <motion.div
                                initial={{ x: -40, opacity: 0, scale: 0.95 }}
                                animate={{ x: 0, opacity: 1, scale: 1 }}
                                exit={{ x: -20, opacity: 0, scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                                key={`left-${leftOption?.id}`}
                                className="relative w-full flex"
                            >
                                {round > 1 && currentChampId === leftOption?.id && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full bg-gradient-brand text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-blue-500/30 border-2 border-white whitespace-nowrap">
                                        <span className="material-symbols-outlined text-[12px] align-middle mr-1">social_leaderboard</span>
                                        Preferencia actual
                                    </div>
                                )}
                                {round > 1 && currentChampId !== leftOption?.id && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full bg-slate-800 text-[10px] font-black uppercase tracking-widest text-white shadow-lg border-2 border-white whitespace-nowrap">
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
                                className="relative w-full flex"
                            >
                                {round > 1 && currentChampId === rightOption?.id && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full bg-gradient-brand text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-blue-500/30 border-2 border-white whitespace-nowrap">
                                        <span className="material-symbols-outlined text-[12px] align-middle mr-1">social_leaderboard</span>
                                        Preferencia actual
                                    </div>
                                )}
                                {round > 1 && currentChampId !== rightOption?.id && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full bg-slate-800 text-[10px] font-black uppercase tracking-widest text-white shadow-lg border-2 border-white whitespace-nowrap">
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
