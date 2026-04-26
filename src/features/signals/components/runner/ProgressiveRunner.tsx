import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BattleOption, Progressive } from '../../types';
import OptionCard from '../OptionCard';
import { logger } from '../../../../lib/logger';
import { ProgressiveEmptyState } from './ProgressiveEmptyState';
import { CrownedChampionView } from './CrownedChampionView';
import VersusHeader from '../versus/VersusHeader';

interface ProgressiveRunnerProps {
    progressiveData: Omit<Progressive, 'stage'> | null;
    onVote: (battle_id: string, option_id: string, opponentId: string, metadata?: Record<string, unknown>) => Promise<void>;
    onComplete?: (results: Record<string, unknown>) => void;
    onPlayAgain?: () => void;
}

export default function ProgressiveRunner({ progressiveData, onVote, onPlayAgain }: Omit<ProgressiveRunnerProps, 'onComplete'>) {
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

    const initProgressive = useCallback((candidatesData: BattleOption[]) => {
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
            initProgressive(memoCandidates);
        }
    }, [progressiveData?.id, memoCandidates, initProgressive]);

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
            logger.error("Error in progressive vote", { domain: 'signal_write', origin: 'ProgressiveRunner', action: 'progressive_vote', state: 'failed' }, error);
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
                        initProgressive(memoCandidates);
                    }
                }}
            />
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto px-4 md:px-6 pb-24 pt-2 md:pt-4 space-y-8">
            <div className="pt-2 pb-0">
                <VersusHeader 
                    title={progressiveData?.title || "Evaluación Sectorial"} 
                    subtitle="Si fueras descartando opciones, ¿cuál elegirías?" 
                />
            </div>

            {/* Battle Arena */}
            <div className="relative mt-2">
                {/* Instruction + Progress immediately above cards */}
                <div className="max-w-xl mx-auto mb-4 px-4">
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
                </div>

                <div className="relative mt-2 w-full mx-auto md:px-0">
                    {/* VERSUS ARENA: Flex Container (Vertical in mobile, Horizontal in desktop) */}
                    <div className={`flex flex-col md:flex-row w-full h-[58vh] min-h-[480px] md:h-[500px] lg:h-[550px] rounded-[2.5rem] overflow-hidden relative shadow-2xl transition-opacity duration-300 ${isVoting ? 'opacity-80 grayscale-[0.3] pointer-events-none' : ''}`}>
                        {/* Left Option */}
                        <AnimatePresence mode="popLayout" initial={false}>
                            {leftOption && (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                    key={`left-${leftOption.id}`}
                                    className={`flex flex-col relative w-full transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] origin-top md:origin-left z-10 ${
                                        lastWinnerId === leftOption.id ? "flex-[1.8] md:flex-[1.5] scale-100 z-20 shadow-[0_10px_40px_rgba(0,0,0,0.15)]" 
                                        : (lastWinnerId ? "flex-[0.2] md:flex-[0.5] opacity-50 blur-[2px] scale-[0.98]" : "flex-1")
                                    }`}
                                >
                                    {round > 1 && currentChampId === leftOption.id && (
                                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 rounded-full bg-gradient-brand text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-brand-500/30 border-2 border-white whitespace-nowrap">
                                            <span className="material-symbols-outlined text-[10px] md:text-[12px] align-middle mr-1">social_leaderboard</span>
                                            Preferencia actual
                                        </div>
                                    )}
                                    {round > 1 && currentChampId !== leftOption.id && (
                                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 rounded-full bg-brand/85 backdrop-blur-md text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white shadow-lg border border-white/20 whitespace-nowrap">
                                            Nueva opción
                                        </div>
                                    )}
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
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Separador Píldora VS Central (Desaparece si ya hubo voto) */}
                        {leftOption && rightOption && !lastWinnerId && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none flex items-center justify-center">
                                <motion.div 
                                    initial={{ scale: 0, rotate: -45 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.2 }}
                                    className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center shadow-2xl border-[4px] md:border-[6px] border-slate-100/30 text-slate-800 font-black text-sm md:text-xl tracking-tighter backdrop-blur-xl"
                                >
                                    <span className="bg-gradient-to-br from-slate-700 to-slate-900 bg-clip-text text-transparent italic pr-0.5">VS</span>
                                </motion.div>
                            </div>
                        )}

                        {/* Divider dinámico que aparece al votar */}
                        {lastWinnerId && (
                            <div className="absolute top-1/2 left-0 w-full h-[2px] md:top-0 md:left-1/2 md:w-[2px] md:h-full bg-white/50 z-20 mix-blend-overlay pointer-events-none" />
                        )}

                        {/* Right Option */}
                        <AnimatePresence mode="popLayout" initial={false}>
                            {rightOption && (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.05 }}
                                    key={`right-${rightOption.id}`}
                                    className={`flex flex-col relative w-full transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] origin-bottom md:origin-right z-10 ${
                                        lastWinnerId === rightOption.id ? "flex-[1.8] md:flex-[1.5] scale-100 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] md:shadow-[-10px_0_40px_rgba(0,0,0,0.15)]" 
                                        : (lastWinnerId ? "flex-[0.2] md:flex-[0.5] opacity-50 blur-[2px] scale-[0.98]" : "flex-1")
                                    }`}
                                >
                                    {round > 1 && currentChampId === rightOption.id && (
                                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 rounded-full bg-gradient-brand text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-brand-500/30 border-2 border-white whitespace-nowrap">
                                            <span className="material-symbols-outlined text-[10px] md:text-[12px] align-middle mr-1">social_leaderboard</span>
                                            Preferencia actual
                                        </div>
                                    )}
                                    {round > 1 && currentChampId !== rightOption.id && (
                                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 rounded-full bg-brand/85 backdrop-blur-md text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white shadow-lg border border-white/20 whitespace-nowrap">
                                            Nueva opción
                                        </div>
                                    )}
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
                                </motion.div>
                            )}
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
