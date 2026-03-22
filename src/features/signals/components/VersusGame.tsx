
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useVersusGame } from '../hooks/useVersusGame';

import OptionCard from './OptionCard';
import VersusLoadingState from './versus/VersusLoadingState';
import VersusFeedbackOverlay from './versus/VersusFeedbackOverlay';
import VersusHeader from './versus/VersusHeader';
import VersusInsightCard from './versus/VersusInsightCard';
import { Battle, BattleOption, TorneoTournament, VoteResult } from '../types';
import SessionSummary from './SessionSummary';
import { FallbackAvatar } from '../../../components/ui/FallbackAvatar';
import { VersusGameModals } from './versus/VersusGameModals';

// --- CONSTANTS & HELPERS ---

type GameProps = {
    battles: Battle[];
    onVote: (battleId: string, optionId: string, opponentId: string) => Promise<VoteResult>;
    autoNextMs?: number;
    relatedTrendId?: string;
    mode?: 'classic' | 'survival' | 'torneo';
    progressiveData?: TorneoTournament;
    onProgressiveComplete?: (result: { winner: BattleOption; defeated: BattleOption[] }) => void;
    enableAutoAdvance?: boolean;
    hideProgress?: boolean;
    isQueueFinite?: boolean;
    onQueueComplete?: (history: Array<{ battle: Battle; myVote: 'A' | 'B'; pctA: number }>) => void;
    isSubmitting?: boolean;
    theme?: {
        primary: string;
        accent: string;
        bgGradient: string;
        icon: string;
    };
};

export default function VersusGame(props: GameProps) {
    const navigate = useNavigate();

    const {
        effectiveBattle,
        locked,
        lockedByLimit,
        selected,
        idx,
        total,
        vote,
        next,
        champion,
        isCompleted,
        sessionHistory,
        momentum,
        result,
        showAuthModal,
        setShowAuthModal,
        showProfileModal,
        setShowProfileModal,
        isTransitioning,
        isExitingBattle
    } = useVersusGame(props);

    const isCurrentlySubmitting = props.isSubmitting || isTransitioning;

    const [showFinalMessage, setShowFinalMessage] = useState(false);
    const [clickPosition, setClickPosition] = useState<{ x: number, y: number } | null>(null);
    const [showGuestConversionModal, setShowGuestConversionModal] = useState(false);
    const [showInsightPack, setShowInsightPack] = useState(false);

    // Reset local state when battle changes
    useEffect(() => {
        setShowFinalMessage(false);
        setClickPosition(null);
    }, [effectiveBattle?.id]);

    const resetGame = async () => {
        setShowFinalMessage(false);
        setClickPosition(null);
        if (props.onQueueComplete) {
            props.onQueueComplete(sessionHistory);
        } else {
            navigate('/');
        }
    };

    if (showFinalMessage) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full flex flex-col items-center justify-center py-20 px-6 text-center"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-24 h-24 rounded-full mb-8 flex items-center justify-center text-white shadow-xl"
                    style={{ backgroundColor: props.theme?.primary || '#10b981' }}
                >
                    <span className="material-symbols-outlined text-primary text-4xl mb-3">auto_awesome</span>
                </motion.div>
                <h2 className="text-xl font-black text-ink tracking-tight mb-2">Señal Completada</h2>
                <p className="text-text-secondary font-medium text-sm mb-6">Tu influencia ya fue sumada al consenso general.</p>
                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <button
                        onClick={resetGame}
                        className="w-full px-8 py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary-dark transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20"
                    >
                        Siguiente evaluación →
                    </button>
                </div>
            </motion.div>
        );
    }

    if (isCompleted) {
        return (
            <SessionSummary
                results={sessionHistory}
                onReset={resetGame}
            />
        );
    }

    if (!effectiveBattle) {
        return <VersusLoadingState />;
    }

    const options = effectiveBattle.options || [];
    const a = options[0];
    const b = options[1];

    const selectedOption = selected === a?.id ? a : (selected === b?.id ? b : null);

    const handleVote = async (optionId: string, e?: React.MouseEvent) => {
        if (isCurrentlySubmitting) return;

        if (e) {
            setClickPosition({ x: e.clientX, y: e.clientY });
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(50);
            }
        }

        await vote(optionId);



        // DO NOT show the final message anymore if autoAdvance is enabled
        // since we are showing the algorithmic feedback in the card itself.
        if (!props.enableAutoAdvance) {
            setTimeout(() => {
                setShowFinalMessage(true);
            }, 1200);
        }
    };

    return (
        <div id="versus-container" className="w-full max-w-5xl mx-auto px-4 md:px-6 pb-24 pt-4 md:pt-10 space-y-8 scroll-mt-20">
            <div className="px-4 pt-4 pb-6 text-center">
                {/* Title and subtitle only at the top */}

                <VersusHeader title={effectiveBattle.title} onResetGame={resetGame} />

                {effectiveBattle.layout === 'opinion' && effectiveBattle.mainImageUrl && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative mt-8 mb-4 mx-auto max-w-lg aspect-video rounded-[2rem] overflow-hidden bg-slate-800 shadow-2xl border border-slate-700/50 group"
                    >
                        <div className="absolute inset-0 bg-primary-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl -z-10" />
                        <FallbackAvatar
                            src={effectiveBattle.mainImageUrl}
                            name={effectiveBattle.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
                            fallbackClassName="w-full h-full text-5xl"
                        />
                    </motion.div>
                )}
            </div>

            {
                effectiveBattle.type === 'separator' ? (
                    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                        <button onClick={next} className="px-8 py-3 bg-primary text-white rounded-xl font-bold">Siguiente comparación →</button>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={effectiveBattle.id + (champion?.id || '')}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5, transition: { duration: 0.15, ease: "easeIn" } }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="relative"
                        >
                            {/* Instruction + Progress immediately above cards */}
                            {!props.hideProgress && (
                                <div className="max-w-xl mx-auto mb-8">
                                    <div className="mt-8 relative z-20 text-center animate-fade-in-up">
                                        <span className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-stroke text-[11px] font-black uppercase tracking-widest text-text-muted mix-blend-multiply">
                                            <span className="material-symbols-outlined text-[14px]">touch_app</span>
                                            Elige una opción para avanzar
                                        </span>
                                    </div>

                                    <div className="mt-2 h-1.5 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shadow-inner">
                                        <div
                                            className="h-full rounded-full bg-gradient-brand shadow-[0_0_8px_rgba(59,130,246,0.4)] transition-all duration-500 ease-out"
                                            style={{ width: `${Math.round(((idx) / Math.max(1, total)) * 100)}%` }}
                                        />
                                    </div>

                                    <div className="mt-2 text-[11px] font-bold text-slate-400 text-center uppercase tracking-widest">
                                        Cruzando señal con perfil
                                    </div>
                                </div>
                            )}
                            {/* Spinners eliminated conceptually to favor instant UX */}

                            {/* Error handling interior si no hay opciones */}
                            {(!a && !b) ? (
                                <div className="p-8 text-center text-rose-400 font-bold bg-rose-500/10 rounded-2xl mx-4 mb-4 border border-rose-500/20">
                                    Hay un problema de datos con esta señal. No hay opciones configuradas.
                                </div>
                            ) : (
                                <div className="relative mt-6 w-full mx-auto">
                                    {/* VS badge central eliminado por lineamientos de copy (no lenguaje bélico) */}

                                    <div className={`grid grid-cols-2 gap-3 md:gap-8 lg:gap-10 relative z-20 transition-opacity duration-300 ${isCurrentlySubmitting ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                                        {a && (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="w-full flex">
                                                <OptionCard
                                                    option={a}
                                                    onClick={(e) => handleVote(a.id, e)}
                                                    disabled={locked || lockedByLimit || !!isCurrentlySubmitting}
                                                    isSelected={selected === a.id || !!result}
                                                    showResult={!!result || !!momentum}
                                                    showPercentage={true}
                                                    percent={null}
                                                    momentum={momentum?.options.find(o => o.id === a.id)}
                                                    layout={effectiveBattle.layout}
                                                    theme={props.theme}
                                                />
                                            </motion.div>
                                        )}

                                        {b && (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut", delay: 0.05 }} className="w-full flex">
                                                <OptionCard
                                                    option={b}
                                                    onClick={(e) => handleVote(b.id, e)}
                                                    disabled={locked || lockedByLimit || !!isCurrentlySubmitting}
                                                    isSelected={selected === b.id || !!result}
                                                    showResult={!!result || !!momentum}
                                                    showPercentage={true}
                                                    percent={null}
                                                    momentum={momentum?.options.find(o => o.id === b.id)}
                                                    layout={effectiveBattle.layout}
                                                    theme={props.theme}
                                                />
                                            </motion.div>
                                        )}
                                    </div>

                                    {selectedOption && !isTransitioning && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-6 max-w-3xl mx-auto rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] relative z-20"
                                        >
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                                <div>
                                                    <div className="text-[10px] font-black uppercase tracking-widest text-primary-500">Siguiente paso</div>
                                                    <div className="mt-1 text-sm md:text-base font-black text-slate-900">
                                                        ¿Por qué {selectedOption.label}? (10 preguntas rápidas)
                                                    </div>
                                                    <div className="mt-1 text-xs font-bold text-slate-500">
                                                        Esto mejora la calidad del dato algorítmico y tus resultados.
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => setShowInsightPack(true)}
                                                    className="h-12 px-6 rounded-xl bg-gradient-brand text-white font-black text-sm shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.23)] hover:-translate-y-0.5 transition-all active:scale-95 whitespace-nowrap uppercase tracking-wider"
                                                >
                                                    Aportar contexto
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            {/* Comentario de Insight simulado por IA después de votar - PREMIUM V2 */}
                            <VersusInsightCard selectedOption={isExitingBattle ? null : selectedOption} momentum={momentum} />

                            <VersusFeedbackOverlay clickPosition={clickPosition} theme={props.theme} />

                            {/* Tooltip profile hints incorporated directly into progress bar top UI */}
                        </motion.div>
                    </AnimatePresence >
                )
            }

            <VersusGameModals
                showAuthModal={showAuthModal}
                setShowAuthModal={setShowAuthModal}
                showProfileModal={showProfileModal}
                setShowProfileModal={setShowProfileModal}
                showGuestConversionModal={showGuestConversionModal}
                setShowGuestConversionModal={setShowGuestConversionModal}
                showInsightPack={showInsightPack}
                setShowInsightPack={setShowInsightPack}
                selectedOption={selectedOption}
                effectiveBattle={effectiveBattle}
                next={next}
            />
        </div >
    );
}
