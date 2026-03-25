
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useVersusGame } from '../hooks/useVersusGame';

import OptionCard from './OptionCard';
import VersusLoadingState from './versus/VersusLoadingState';
import VersusFeedbackOverlay from './versus/VersusFeedbackOverlay';
import VersusHeader from './versus/VersusHeader';
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
    showExploreCTA?: boolean;
};

export default function VersusGame(props: GameProps) {
    const navigate = useNavigate();

    const {
        effectiveBattle,
        locked,
        lockedByLimit,
        selected,
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
        isTransitioning
    } = useVersusGame(props);

    const isCurrentlySubmitting = props.isSubmitting || isTransitioning;

    const [showFinalMessage, setShowFinalMessage] = useState(false);
    const [clickPosition, setClickPosition] = useState<{ x: number, y: number } | null>(null);
    const [showGuestConversionModal, setShowGuestConversionModal] = useState(false);
    const [showInsightPack, setShowInsightPack] = useState(false);
    const [evaluatingOption, setEvaluatingOption] = useState<BattleOption | null>(null);

    const options = effectiveBattle?.options || [];
    const a = options[0];
    const b = options[1];

    const selectedOption = selected === a?.id ? a : (selected === b?.id ? b : null);

    // Reset local state when battle changes
    useEffect(() => {
        setShowFinalMessage(false);
        setClickPosition(null);
        setEvaluatingOption(null);
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
        <div id="versus-container" className="w-full mx-auto pb-4 md:pb-6 pt-2 space-y-3 md:space-y-4 scroll-mt-20">
            <div className="pt-2 pb-0">
                <VersusHeader title={effectiveBattle.title} />

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
                    <AnimatePresence mode="popLayout" initial={false}>
                        <motion.div
                            key={effectiveBattle.id + (champion?.id || '')}
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96, filter: "blur(4px)", transition: { duration: 0.25, ease: "easeIn" } }}
                            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                            className="relative w-full"
                        >
                            {/* Error handling interior si no hay opciones */}
                            {(!a && !b) ? (
                                <div className="p-8 text-center text-rose-400 font-bold bg-rose-500/10 rounded-2xl mx-4 mb-4 border border-rose-500/20">
                                    Hay un problema de datos con esta señal. No hay opciones configuradas.
                                </div>
                            ) : (
                                <div className="relative mt-2 w-full mx-auto px-4 md:px-0">
                                    {/* Prominent Options Grid with Expanded Gaps */}
                                    <div className={`grid grid-cols-2 gap-3 md:gap-5 lg:gap-6 relative z-20 transition-opacity duration-300 ${isCurrentlySubmitting ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                                        {a && (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="w-full flex">
                                                <OptionCard
                                                    option={a}
                                                    onClick={(e) => handleVote(a.id, e)}
                                                    disabled={locked || lockedByLimit || !!isCurrentlySubmitting}
                                                    isSelected={selected === a.id || !!result}
                                                    showResult={!!result || !!momentum}
                                                    showPercentage={true}
                                                    percent={result ? result[a.id] : null}
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
                                                    percent={result ? result[b.id] : null}
                                                    momentum={momentum?.options.find(o => o.id === b.id)}
                                                    layout={effectiveBattle.layout}
                                                    theme={props.theme}
                                                />
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Controles Inferiores */}
                                    {(!isCurrentlySubmitting && !result) && (
                                        <div className="mt-3 md:mt-4 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-4 relative z-20">
                                            <button 
                                                onClick={() => next()}
                                                className="text-[11px] md:text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors py-2 px-4 rounded-full hover:bg-slate-100"
                                            >
                                                Saltar señal
                                            </button>
                                            
                                            {props.showExploreCTA && (
                                                <Link 
                                                    to="/m/versus"
                                                    className="text-[11px] md:text-xs font-bold text-primary/70 hover:text-primary uppercase tracking-widest transition-colors py-2 px-4 rounded-full hover:bg-primary/5"
                                                >
                                                    Elige tu tema
                                                </Link>
                                            )}
                                        </div>
                                    )}

                                    <VersusFeedbackOverlay clickPosition={clickPosition} theme={props.theme} />
                                </div>
                            )}

                            {/* Comentario de Insight simulado por IA después de votar - PREMIUM V2 (Removido por auditoría) */}

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
                evaluatingOption={evaluatingOption}
                effectiveBattle={effectiveBattle}
                next={next}
            />
        </div >
    );
}
