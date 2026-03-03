import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BattleOption, ProgressiveBattle, VoteResult } from '../types';
import OptionCard from './OptionCard';
import { useAuth } from '../../auth';
import { BrandLogo } from '../../../components/ui/BrandLogo';

interface ProgressiveRunnerProps {
    progressiveData: ProgressiveBattle;
    onComplete: (winner: BattleOption) => void;
    onVote: (battleId: string, option_id: string, opponentId: string) => Promise<VoteResult>;
}

const SESSION_GOAL = 10;

export default function ProgressiveRunner({ progressiveData, onVote }: Omit<ProgressiveRunnerProps, 'onComplete'>) {
    const candidates = progressiveData.candidates || [];
    const { profile } = useAuth();

    const [round, setRound] = useState(1);
    const [champWins, setChampWins] = useState(0);
    const [isCrowned, setIsCrowned] = useState(false);

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

    // Prepare candidates properly if they come without type/fit
    const processedCandidates = useMemo(() => {
        return memoCandidates.map(c => ({
            ...c,
            type: c.type || 'brand' as const,
            imageFit: c.imageFit || 'contain' as const
        }));
    }, [memoCandidates]);

    useEffect(() => {
        if (!leftOption && processedCandidates[0]) {
            setLeftOption(processedCandidates[0]);
        }
        if (!rightOption && processedCandidates[1]) {
            setRightOption(processedCandidates[1]);
        }
    }, [processedCandidates, leftOption, rightOption]);

    const handleVote = useCallback(async (selectedOptionId: string) => {
        if (!leftOption || !rightOption || isVoting) return;
        setIsVoting(true);
        setLastWinnerId(selectedOptionId);

        const battleId = `prog-${progressiveData.id}-r${round}`;
        const opponentId = selectedOptionId === leftOption.id ? rightOption.id : leftOption.id;

        try {
            await onVote(battleId, selectedOptionId, opponentId);

            // Wait for visual feedback
            await new Promise(resolve => setTimeout(resolve, 1000));

            const winningOption = selectedOptionId === leftOption.id ? leftOption : rightOption;
            const newWins = (currentChampId === selectedOptionId) ? champWins + 1 : 1;

            if (newWins >= SESSION_GOAL || round >= processedCandidates.length - 1) {
                setIsCrowned(true);
                setChampWins(newWins);
                setLeftOption(winningOption); // Show final champion center or reuse slot
            } else {
                setChampWins(newWins);
                setCurrentChampId(selectedOptionId);
                setRound(prev => prev + 1);

                // Get next challenger (sequentially)
                const nextIndex = round + 1;
                const nextCandidate = processedCandidates[nextIndex];

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
    }, [leftOption, rightOption, isVoting, progressiveData.id, round, champWins, onVote, processedCandidates, currentChampId]);

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
                <button
                    onClick={() => window.location.href = '/experience'}
                    className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-slate-800 transition-all active:scale-95"
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
                        className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-white shadow-2xl border-8 border-blue-600 p-8 flex items-center justify-center relative z-20"
                    >
                        <BrandLogo
                            name={leftOption?.label || "Campeón actual"}
                            imageUrl={leftOption?.image_url || leftOption?.imageUrl}
                            brandDomain={leftOption?.brand_domain}
                            className="w-full h-full object-contain mix-blend-multiply"
                            fallbackClassName="text-4xl font-black text-blue-600 w-full h-full flex items-center justify-center p-2"
                        />
                    </motion.div>

                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 z-10 border-4 border-dashed border-emerald-400/30 rounded-full scale-110"
                    />

                    <div className="absolute -top-6 -right-6 z-30 bg-slate-900 text-white w-16 h-16 rounded-2xl flex flex-col items-center justify-center shadow-xl rotate-12">
                        <span className="text-[10px] font-black uppercase">Wins</span>
                        <span className="text-2xl font-black">{champWins}</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-4xl md:text-5xl font-black text-ink tracking-tight">
                        {leftOption?.label} <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-500">Campeón actual</span>
                    </h2>
                    <p className="text-lg text-muted font-medium">Coronado tras {round} enfrentamientos intensos.</p>
                </div>

                {/* Simulated AI Insight */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem] text-left relative overflow-hidden group shadow-sm hover:shadow-md transition-all"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                            <span className="material-symbols-outlined text-white text-[18px]">auto_awesome</span>
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-primary-600">AI Insight Progresivo</span>
                    </div>

                    <p className="text-slate-700 font-bold leading-relaxed">
                        Tu preferencia por <span className="text-primary-600">{leftOption?.label}</span> sugiere una prioridad crítica en <b>fiabilidad</b> y <b>experiencia de usuario</b> sobre el puro precio. En el segmento {profile?.demographics?.gender === 'm' ? 'Masculino' : (profile?.demographics?.gender === 'f' ? 'Femenino' : 'Global')} de {profile?.demographics?.birthYear ? (new Date().getFullYear() - profile.demographics.birthYear) : '25-34'} años, esta marca mantiene un <b>Momentum de +{Math.floor(Math.random() * 8) + 2}.5%</b> esta semana.
                    </p>

                    <div className="mt-4 flex gap-4">
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

                <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                    <button
                        onClick={() => window.location.reload()}
                        className="h-14 rounded-2xl border border-slate-200 bg-white font-black text-slate-900 hover:bg-slate-50 transition-all active:scale-95"
                    >
                        Volver al Hub
                    </button>
                    <button
                        onClick={() => {
                            setRound(1);
                            setChampWins(0);
                            setIsCrowned(false);
                            setLeftOption(processedCandidates[0]);
                            setRightOption(processedCandidates[1]);
                            setCurrentChampId(null);
                        }}
                        className="h-14 rounded-2xl bg-slate-900 text-white font-black hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-slate-900/20"
                    >
                        Jugar de nuevo
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto px-4 md:px-6 pb-24 pt-8 md:pt-10 space-y-8">
            <div className="px-4 pt-4 pb-6 text-center">
                <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-blue-600 to-emerald-500" />
                        Versus Progresivo
                    </div>

                    <h1 className="mt-5 text-4xl md:text-5xl font-black tracking-tight text-ink leading-[1.05]">
                        {(() => {
                            const ironicPrefixes = ["Dilema de", "Terapia de", "Diferendo de", "Sínodo de", "Anatomía de", "Fricción de", "Debate de"];
                            const rawTitle = progressiveData.title || "Guerra del Canal";

                            // Replace "Guerra" with a random ironic prefix if found
                            let refinedTitle = rawTitle;
                            if (rawTitle.toLowerCase().includes('guerra')) {
                                const randomPrefix = ironicPrefixes[Math.floor(Math.random() * ironicPrefixes.length)];
                                refinedTitle = rawTitle.replace(/Guerra/i, randomPrefix);
                            }

                            const words = refinedTitle.split(' ');
                            const lastWord = words.pop() || '';
                            const firstPart = words.join(' ');
                            return (
                                <>
                                    {firstPart} <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-500">{lastWord}</span>
                                </>
                            );
                        })()}
                    </h1>

                    <p className="mt-3 text-base md:text-lg font-medium text-slate-600">
                        El campeón se queda. Tú decides si lo merece.
                    </p>

                    <div className="mt-2 text-sm font-medium text-slate-500">
                        Señala al ganador y el retador cambia automáticamente.
                    </div>
                </div>
            </div>

            {/* Battle Arena */}
            <div className="relative mt-6">
                {/* Instruction + Progress immediately above cards */}
                <div className="max-w-xl mx-auto mb-8">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>Progreso</span>
                        <span>{round}/{SESSION_GOAL}</span>
                    </div>

                    <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-500 ease-out"
                            style={{ width: `${Math.round(((round - 1) / SESSION_GOAL) * 100)}%` }}
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
                            className="h-20 w-20 md:h-24 md:w-24 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-full border-[6px] md:border-8 border-white shadow-[0_25px_65px_rgba(37,99,235,0.35)] flex items-center justify-center"
                        >
                            <span className="relative text-2xl md:text-3xl font-black tracking-tighter text-white italic drop-shadow-md">VS</span>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-stretch">
                        {/* Left Option */}
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            key={`left-${leftOption?.id}`}
                            className="relative"
                        >
                            {round > 1 && currentChampId === leftOption?.id && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 bg-gradient-to-r from-blue-600 to-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg border-2 border-white">
                                    Campeón actual
                                </div>
                            )}
                            {round > 1 && currentChampId !== leftOption?.id && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg border-2 border-white">
                                    Retador
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

                        {/* Right Option */}
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            key={`right-${rightOption?.id}`}
                            className="relative"
                        >
                            {round > 1 && currentChampId === rightOption?.id && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 bg-gradient-to-r from-blue-600 to-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg border-2 border-white">
                                    Campeón actual
                                </div>
                            )}
                            {round > 1 && currentChampId !== rightOption?.id && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg border-2 border-white">
                                    Retador
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
