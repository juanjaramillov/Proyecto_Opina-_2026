
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useVersusGame } from '../hooks/useVersusGame';

import OptionCard from './OptionCard';
import VersusLoadingState from './versus/VersusLoadingState';
import VersusFeedbackOverlay from './versus/VersusFeedbackOverlay';
import VersusHeader from './versus/VersusHeader';
import { supabase } from '../../../supabase/client';
import { Battle, BattleOption, TorneoTournament, VoteResult } from '../types';
import SessionSummary from './SessionSummary';
import { FallbackAvatar } from '../../../components/ui/FallbackAvatar';
import { VersusGameModals } from './versus/VersusGameModals';
import { depthService } from '../services/depthService';

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
        isTransitioning
    } = useVersusGame(props);

    const isCurrentlySubmitting = props.isSubmitting || isTransitioning;

    const [showFinalMessage, setShowFinalMessage] = useState(false);
    const [clickPosition, setClickPosition] = useState<{ x: number, y: number } | null>(null);
    const [showGuestConversionModal, setShowGuestConversionModal] = useState(false);
    const [showInsightPack, setShowInsightPack] = useState(false);
    const [quickTagSubmitted, setQuickTagSubmitted] = useState(false);
    const [globalBrandCount, setGlobalBrandCount] = useState<number | null>(null);

    const options = effectiveBattle?.options || [];
    const a = options[0];
    const b = options[1];

    const selectedOption = selected === a?.id ? a : (selected === b?.id ? b : null);

    // Fetch global count for selected brand
    useEffect(() => {
        if (!selectedOption) {
            setGlobalBrandCount(null); // Reset when no option is selected
            return;
        }
        const fetchGlobalCount = async () => {
            const { count, error } = await supabase
                .from('signal_events')
                .select('*', { count: 'exact', head: true })
                .eq('option_id', selectedOption.id);
            if (!error && count !== null) setGlobalBrandCount(count);
        };
        fetchGlobalCount();
    }, [selectedOption]);

    // Reset local state when battle changes
    useEffect(() => {
        setShowFinalMessage(false);
        setClickPosition(null);
        setQuickTagSubmitted(false);
        setGlobalBrandCount(null);
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

    const handleQuickTag = async (tag: string) => {
        if (quickTagSubmitted || !selectedOption) return;
        setQuickTagSubmitted(true);
        try {
            await depthService.saveDepthStructured(selectedOption.id, [
                { question_key: 'quick_tag', answer_value: tag }
            ]);
        } catch (error) {
            console.error("Failed to save quick tag", error);
            setQuickTagSubmitted(false);
        }
    };

    return (
        <div id="versus-container" className="w-full max-w-5xl mx-auto px-4 md:px-6 pb-6 md:pb-8 pt-4 md:pt-8 space-y-6 scroll-mt-20">
            <div className="px-4 pt-4 pb-2 text-center">
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

                                    {/* PANEL INFERIOR ESTABILIZADO - ECG o RESULTADOS */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`mt-4 max-w-3xl mx-auto rounded-[2rem] border border-slate-100 bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] relative z-20 w-full flex items-center justify-center overflow-hidden transition-all duration-500 ${!selectedOption ? 'h-[250px] sm:h-[200px] md:h-[210px]' : 'min-h-[460px] sm:min-h-[400px] md:min-h-[420px] h-auto'}`}
                                    >
                                        {!selectedOption ? (
                                            <div className="flex flex-col items-center justify-center w-full h-full space-y-4 md:space-y-6 relative py-4 md:py-6">
                                                {/* Ambient Background Glows */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-emerald-50/50 to-blue-50/50 blur-3xl opacity-50" />
                                                
                                                <div className="relative w-full max-w-sm h-32 md:h-40 flex items-center justify-center overflow-visible scale-75 md:scale-90 origin-center translate-y-2">
                                                    
                                                    {/* Central Breathing Orb */}
                                                    <motion.div 
                                                        className="absolute w-10 h-10 rounded-full z-10 bg-gradient-to-tr from-blue-600 to-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.5)]"
                                                        animate={{ scale: [1, 1.15, 1], filter: ["hue-rotate(0deg)", "hue-rotate(15deg)", "hue-rotate(0deg)"] }}
                                                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                                    >
                                                        <div className="w-full h-full rounded-full bg-white/20 backdrop-blur-sm border border-white/40" />
                                                    </motion.div>
                                                    
                                                    {/* Complex Dynamic Rings */}
                                                    {[...Array(4)].map((_, idx) => (
                                                        <motion.svg
                                                            key={idx}
                                                            className={`absolute text-${idx % 2 === 0 ? 'blue' : 'emerald'}-400 opacity-${40 - idx * 10}`}
                                                            style={{ width: `${100 + idx * 55}px`, height: `${100 + idx * 55}px` }}
                                                            viewBox="0 0 100 100"
                                                            animate={{ rotate: idx % 2 === 0 ? 360 : -360 }}
                                                            transition={{ duration: 15 + idx * 5, repeat: Infinity, ease: "linear" }}
                                                        >
                                                            <circle 
                                                                cx="50" cy="50" r="48" fill="none" 
                                                                stroke="currentColor" 
                                                                strokeWidth={idx === 1 ? "1.5" : "0.5"} 
                                                                strokeDasharray={idx === 0 ? "4 4" : idx === 2 ? "20 40 10 5" : "100"} 
                                                            />
                                                        </motion.svg>
                                                    ))}

                                                    {/* Floating Particles/Nodes */}
                                                    {[...Array(8)].map((_, i) => (
                                                        <motion.div
                                                            key={`node-${i}`}
                                                            className="absolute w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                                                            initial={{ opacity: 0, x: 0, y: 0 }}
                                                            animate={{ 
                                                                opacity: [0, 1, 0],
                                                                x: Math.cos(i * 45 * Math.PI / 180) * (80 + Math.random() * 50),
                                                                y: Math.sin(i * 45 * Math.PI / 180) * (80 + Math.random() * 50),
                                                                scale: [0.5, 1.5, 0.5]
                                                            }}
                                                            transition={{ duration: 2.5 + Math.random() * 2, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
                                                        />
                                                    ))}
                                                    
                                                    {/* Horizontal Scan Ray */}
                                                    <motion.div 
                                                        className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent blur-[1px] mix-blend-overlay"
                                                        animate={{ y: [-60, 60, -60], opacity: [0, 1, 0] }}
                                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                                    />
                                                </div>

                                                <div className="flex flex-col items-center relative z-10 pt-2 md:pt-4">
                                                    <span className="text-sm md:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500 uppercase tracking-[0.2em] mb-1">
                                                        Analizando Ecosistema
                                                    </span>
                                                    <p className="text-xs md:text-sm text-slate-400 font-medium">Conectado a la inteligencia colectiva de Opina+</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col md:flex-row w-full h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                                {/* Local KPI */}
                                                <div className="flex-1 p-5 md:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100 relative group bg-white hover:bg-slate-50/50 transition-colors">
                                                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-blue-600 material-symbols-outlined text-[80px] transform rotate-12 group-hover:scale-110 transition-transform duration-500 pointer-events-none">star</div>
                                                    
                                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 relative z-10">
                                                        <span className="material-symbols-outlined text-[15px] text-blue-500">how_to_vote</span>
                                                        Preferencia local
                                                    </div>
                                                    
                                                    <div className="mt-4 flex flex-col justify-end relative z-10 flex-1">
                                                        <div className="flex items-baseline gap-1 mb-1">
                                                            <span className="text-5xl md:text-6xl font-black tracking-tight text-slate-800 leading-none">
                                                                {momentum ? Math.round(momentum.options.find(o => o.id === selectedOption.id)?.percentage || 0) : 0}
                                                            </span>
                                                            <span className="text-2xl font-bold text-blue-500">%</span>
                                                        </div>
                                                        <p className="text-[13px] md:text-sm text-slate-500 font-medium leading-snug pr-2">
                                                            coincidió <span className="text-slate-700 font-bold">contigo</span>
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Global KPI */}
                                                <div className="flex-1 p-5 md:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100 relative group bg-white hover:bg-slate-50/50 transition-colors">
                                                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-emerald-600 material-symbols-outlined text-[80px] transform -rotate-12 group-hover:scale-110 transition-transform duration-500 pointer-events-none">public</div>
                                                    
                                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 relative z-10">
                                                        <span className="material-symbols-outlined text-[15px] text-emerald-500">verified</span>
                                                        Histórico
                                                    </div>
                                                    
                                                    <div className="mt-4 flex flex-col justify-end relative z-10 flex-1">
                                                        <div className="flex items-baseline gap-1 mb-1">
                                                            <span className="text-5xl md:text-6xl font-black tracking-tight text-slate-800 leading-none">
                                                                {globalBrandCount !== null ? (globalBrandCount > 999 ? '999+' : globalBrandCount) : '...'}
                                                            </span>
                                                        </div>
                                                        <p className="text-[13px] md:text-sm text-slate-500 font-medium leading-snug pr-2">
                                                            la han <span className="text-slate-700 font-bold">elegido</span>
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* CTA NPS */}
                                                <div className="flex-[1.2] p-5 md:p-6 flex flex-col justify-between bg-slate-50 relative overflow-hidden group">
                                                    <div className="absolute -right-4 -bottom-4 opacity-[0.03] text-slate-900 material-symbols-outlined text-[90px] md:text-[110px] transform group-hover:scale-110 transition-transform duration-500 pointer-events-none">chat_bubble</div>
                                                    
                                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 relative z-10">
                                                        <span className="material-symbols-outlined text-[15px]">campaign</span>
                                                        Tu opinión
                                                    </div>
                                                    
                                                    <div className="mt-3 flex flex-col justify-end relative z-10 flex-1">
                                                        <h3 className="text-base md:text-lg font-black text-slate-800 leading-tight mb-1">
                                                            Evalúa a <span className="text-blue-600 line-clamp-1 break-all">{selectedOption.label}</span>
                                                        </h3>
                                                        <p className="text-[12px] md:text-xs text-slate-500 mb-3">
                                                            Déjale una reseña anónima.
                                                        </p>
                                                        
                                                        {!quickTagSubmitted ? (
                                                            <button
                                                                onClick={() => handleQuickTag('nps_invite_clicked')}
                                                                className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs md:text-sm w-full transition-all duration-300 shadow-sm group/btn relative z-10 h-10 md:h-11"
                                                            >
                                                                Evaluar ahora
                                                                <span className="material-symbols-outlined text-[16px] group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                                                            </button>
                                                        ) : (
                                                            <motion.div 
                                                                initial={{ opacity: 0, scale: 0.95 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl w-full relative z-10 h-10 md:h-11"
                                                            >
                                                                <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-emerald-500/20 shadow-sm shrink-0">
                                                                    <span className="material-symbols-outlined text-[12px]">check</span>
                                                                </div>
                                                                <div className="text-emerald-700 font-bold text-xs md:text-sm truncate">
                                                                    Opinión registrada
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>

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
                effectiveBattle={effectiveBattle}
                next={next}
            />
        </div >
    );
}
