
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
        setGlobalBrandCount(null);
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
        <div id="versus-container" className="w-full mx-auto pb-8 md:pb-12 pt-4 md:pt-8 space-y-8 md:space-y-12 scroll-mt-20">
            <div className="pt-2 pb-2">
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
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={effectiveBattle.id + (champion?.id || '')}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5, transition: { duration: 0.15, ease: "easeIn" } }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="relative"
                        >
                            {/* Error handling interior si no hay opciones */}
                            {(!a && !b) ? (
                                <div className="p-8 text-center text-rose-400 font-bold bg-rose-500/10 rounded-2xl mx-4 mb-4 border border-rose-500/20">
                                    Hay un problema de datos con esta señal. No hay opciones configuradas.
                                </div>
                            ) : (
                                <div className="relative mt-8 md:mt-12 w-full mx-auto px-4 md:px-0">
                                    {/* Prominent Options Grid with Expanded Gaps */}
                                    <div className={`grid grid-cols-2 gap-4 md:gap-8 lg:gap-12 relative z-20 transition-opacity duration-300 ${isCurrentlySubmitting ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                                        {a && (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="w-full flex">
                                                <OptionCard
                                                    option={a}
                                                    onClick={(e) => handleVote(a.id, e)}
                                                    disabled={locked || lockedByLimit || !!isCurrentlySubmitting}
                                                    isSelected={selected === a.id || !!result}
                                                    showResult={!!result || !!momentum}
                                                    showPercentage={false}
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
                                                    showPercentage={false}
                                                    percent={null}
                                                    momentum={momentum?.options.find(o => o.id === b.id)}
                                                    layout={effectiveBattle.layout}
                                                    theme={props.theme}
                                                />
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Opción Saltar */}
                                    {(!isCurrentlySubmitting && !result) && (
                                        <div className="mt-5 text-center relative z-20">
                                            <button 
                                                onClick={() => next()}
                                                className="text-[11px] md:text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors py-2 px-6 rounded-full hover:bg-slate-100"
                                            >
                                                Saltar señal
                                            </button>
                                        </div>
                                    )}

                                    {/* PANEL INFERIOR ESTABILIZADO - ECG o RESULTADOS */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`mt-8 md:mt-12 max-w-4xl mx-auto rounded-[2rem] overflow-hidden relative z-20 w-full transition-all duration-700 h-[250px] sm:h-[210px] md:h-[220px] ${!selectedOption ? 'bg-transparent border-transparent shadow-none' : 'border-transparent shadow-[0_20px_50px_-12px_rgba(37,99,235,0.4)] bg-gradient-brand'}`}
                                    >
                                        <AnimatePresence mode="wait">
                                            {!selectedOption ? (
                                                <motion.div 
                                                    key="analyzing"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                                                    transition={{ duration: 0.4 }}
                                                    className="absolute inset-0 flex flex-col items-center justify-center w-full h-full space-y-4 md:space-y-6 py-4 md:py-6"
                                                >
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
                                                        <span className="text-sm md:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600 uppercase tracking-widest mb-1">
                                                            Analizando Ecosistema
                                                        </span>
                                                        <p className="text-xs md:text-sm text-slate-600 font-medium">Conectado a la inteligencia colectiva de Opina+</p>
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <motion.div 
                                                    key="results"
                                                    initial={{ opacity: 0, scale: 1.05, filter: 'blur(20px)' }} 
                                                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} 
                                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                                    className="absolute inset-0 flex flex-col md:flex-row items-center justify-center w-full h-full text-white overflow-hidden px-6 py-8 md:py-0 md:px-12"
                                                >
                                                    {(() => {
                                                        const selectedPct = momentum ? Math.round(momentum.options.find(o => o.id === selectedOption.id)?.percentage || 0) : 0;
                                                        const isMajority = selectedPct > 50;
                                                        const isTie = selectedPct === 50;

                                                        let messageHeadline = "Coincidiste con la mayoría";
                                                        let iconName = "verified";
                                                        let styleGlow = "shadow-[0_0_30px_rgba(255,255,255,0.4)]";

                                                        if (isTie) {
                                                            messageHeadline = "La opinión está dividida";
                                                            iconName = "balance";
                                                            styleGlow = "shadow-[0_0_30px_rgba(255,255,255,0.3)]";
                                                        } else if (!isMajority) {
                                                            messageHeadline = "Fuiste contra la corriente";
                                                            iconName = "bolt";
                                                            styleGlow = "shadow-[0_0_30px_rgba(255,255,255,0.3)]";
                                                        }

                                                        return (
                                                            <>
                                                                {/* Ambient Background Glows para el Gradiente Corporativo */}
                                                                <div className={`absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[80px] opacity-60 mix-blend-screen pointer-events-none transform translate-x-1/3 -translate-y-1/3`} />
                                                                <div className={`absolute bottom-0 left-0 w-64 h-64 bg-white/20 rounded-full blur-[80px] opacity-40 mix-blend-screen pointer-events-none transform -translate-x-1/3 translate-y-1/3`} />
                                                                
                                                                {/* Overlay pattern sutil */}
                                                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] mix-blend-overlay border-none" />

                                                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full h-full gap-6 md:gap-8">
                                                                    
                                                                    {/* Lado Izquierdo: Porcentaje y Mensaje */}
                                                                    <div className="flex flex-col items-center md:items-start flex-1 text-center md:text-left mt-2 md:mt-0">
                                                                        <motion.div 
                                                                            initial={{ opacity: 0, y: -10 }}
                                                                            animate={{ opacity: 1, y: 0 }}
                                                                            transition={{ delay: 0.3 }}
                                                                            className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3"
                                                                        >
                                                                            <motion.div 
                                                                                initial={{ scale: 0, rotate: -45 }}
                                                                                animate={{ scale: 1, rotate: 0 }}
                                                                                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.4 }}
                                                                                className={`w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 flex items-center justify-center shadow-inner ${styleGlow} border border-white/30 backdrop-blur-md`}
                                                                            >
                                                                                <span className={`material-symbols-outlined text-[18px] md:text-[22px] text-white`}>{iconName}</span>
                                                                            </motion.div>
                                                                            <span className={`text-xs md:text-sm font-black text-white uppercase tracking-widest drop-shadow-md`}>
                                                                                {messageHeadline}
                                                                            </span>
                                                                        </motion.div>
                                                                        
                                                                        <motion.div 
                                                                            initial={{ opacity: 0, scale: 0.9 }}
                                                                            animate={{ opacity: 1, scale: 1 }}
                                                                            transition={{ delay: 0.5, type: "spring" }}
                                                                            className="flex items-center gap-2 md:gap-4"
                                                                        >
                                                                            <span className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter drop-shadow-lg leading-none">
                                                                                {selectedPct}<span className="text-4xl md:text-5xl opacity-80">%</span>
                                                                            </span>
                                                                            <span className="text-sm md:text-base lg:text-lg text-white/90 font-medium leading-tight text-left max-w-[100px] md:max-w-none">
                                                                                coincide<br className="hidden md:block"/> con tu visión
                                                                            </span>
                                                                        </motion.div>
                                                                    </div>

                                                                    {/* Divider sutil en Desktop */}
                                                                    <div className="hidden md:block w-px h-24 bg-gradient-to-b from-transparent via-white/30 to-transparent mx-4" />

                                                                    {/* Lado Derecho: Acciones Adicionales */}
                                                                    <motion.div 
                                                                        initial={{ opacity: 0, x: 20 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        transition={{ delay: 0.6 }}
                                                                        className="flex flex-col gap-3 md:gap-4 w-full md:w-auto items-center md:items-end justify-center pb-2 md:pb-0"
                                                                    >
                                                                        {globalBrandCount !== null && (
                                                                            <div className="flex items-center gap-2 px-4 py-2 mb-1 bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-md text-white rounded-2xl border border-white/20 shadow-lg">
                                                                                <div className={`w-2 h-2 rounded-full bg-white shadow-[0_0_8px_white] animate-pulse`} />
                                                                                <span className="text-xs md:text-sm font-semibold tracking-wider">
                                                                                    {globalBrandCount > 999 ? '999+' : globalBrandCount} <span className="font-normal opacity-80">votantes en la red</span>
                                                                                </span>
                                                                            </div>
                                                                        )}

                                                                        <div className="flex flex-col gap-2 w-full md:w-auto mt-1 md:mt-0">
                                                                            <button
                                                                                onClick={() => {
                                                                                    setEvaluatingOption(selectedOption);
                                                                                    setShowInsightPack(true);
                                                                                }}
                                                                                className="flex items-center gap-2 px-5 py-2.5 md:py-3 bg-white text-primary hover:bg-slate-50 rounded-2xl shadow-xl transition-all w-full md:w-auto justify-center md:justify-start group"
                                                                            >
                                                                                <span className="material-symbols-outlined text-[18px] group-hover:scale-110 group-hover:rotate-12 transition-transform text-primary/80">draw</span>
                                                                                <span className="text-xs md:text-sm font-bold tracking-wide">Evaluar {selectedOption.label}</span>
                                                                            </button>

                                                                            <button
                                                                                onClick={() => {
                                                                                    const otherOption = a.id === selectedOption.id ? b : a;
                                                                                    setEvaluatingOption(otherOption);
                                                                                    setShowInsightPack(true);
                                                                                }}
                                                                                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white/90 rounded-2xl border border-white/20 transition-all shadow-sm w-full md:w-auto justify-center md:justify-start group"
                                                                            >
                                                                                <span className="material-symbols-outlined text-[16px] opacity-70">draw</span>
                                                                                <span className="text-[11px] md:text-xs font-semibold tracking-wide">Evaluar {a.id === selectedOption.id ? b.label : a.label}</span>
                                                                            </button>
                                                                        </div>
                                                                    </motion.div>
                                                                </div>
                                                            </>
                                                        );
                                                    })()}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
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
                evaluatingOption={evaluatingOption}
                effectiveBattle={effectiveBattle}
                next={next}
            />
        </div >
    );
}
