
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useVersusGame } from '../hooks/useVersusGame';

import OptionCard from './OptionCard';
import { Battle, BattleOption, ProgressiveBattle, VoteResult } from '../types';
import SessionSummary from './SessionSummary';
import { ProfileRequiredModal } from '../../../components/ProfileRequiredModal';
import { GuestConversionModal } from '../../auth/components/GuestConversionModal';

// --- CONSTANTS & HELPERS ---

type GameProps = {
    battles: Battle[];
    onVote: (battleId: string, optionId: string, opponentId: string) => Promise<VoteResult>;
    autoNextMs?: number;
    relatedTrendId?: string;
    mode?: 'classic' | 'survival' | 'progressive';
    progressiveData?: ProgressiveBattle;
    onProgressiveComplete?: (result: { winner: BattleOption; defeated: BattleOption[] }) => void;
    enableAutoAdvance?: boolean;
    hideProgress?: boolean;
    isQueueFinite?: boolean;
    onQueueComplete?: () => void;
    disableInsights?: boolean;
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
        setShowProfileModal
    } = useVersusGame(props);

    const [showFinalMessage, setShowFinalMessage] = useState(false);
    const [clickPosition, setClickPosition] = useState<{ x: number, y: number } | null>(null);
    const [showGuestConversionModal, setShowGuestConversionModal] = useState(false);

    // Reset local state when battle changes
    useEffect(() => {
        setShowFinalMessage(false);
        setClickPosition(null);
    }, [effectiveBattle?.id]);

    const resetGame = async () => {
        setShowFinalMessage(false);
        setClickPosition(null);
        if (props.onQueueComplete) {
            props.onQueueComplete();
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
                    <span className="material-symbols-outlined text-5xl">check_circle</span>
                </motion.div>
                <h3 className="text-3xl font-black text-ink mb-3 tracking-tight">Opinión Registrada</h3>
                <p className="text-text-secondary max-w-sm mx-auto mb-10 text-lg leading-relaxed">
                    Tu punto de vista ha sido sumado <span className="text-primary font-bold">anónimamente</span>. Gracias por construir señal.
                </p>
                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <button
                        onClick={resetGame}
                        className="w-full px-8 py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary-dark transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20"
                    >
                        CONTINUAR OPINANDO
                    </button>
                    <button
                        onClick={() => navigate('/results')}
                        className="w-full px-8 py-4 bg-transparent text-slate-400 font-bold rounded-2xl hover:text-slate-600 transition-colors"
                    >
                        Ver Resultados Globales
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
        return (
            <div className="w-full flex flex-col items-center justify-center py-12 px-4 text-center bg-surface2 rounded-3xl min-h-[400px]">
                <div className="w-20 h-20 rounded-full bg-surface shadow-sm flex items-center justify-center mb-6 text-text-muted">
                    <span className="material-symbols-outlined text-4xl">inbox</span>
                </div>
                <h3 className="text-2xl font-bold text-ink mb-2">Sin contenido activo</h3>
                <p className="text-text-secondary max-w-md">
                    No hay versus disponibles en este momento. Vuelve más tarde cuando la comunidad cree nuevas señales.
                </p>
            </div>
        );
    }

    const options = effectiveBattle.options || [];
    const a = options[0];
    const b = options[1];

    const selectedOption = selected === a?.id ? a : (selected === b?.id ? b : null);

    const handleVote = async (optionId: string, e?: React.MouseEvent) => {
        if (props.isSubmitting) return;

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
        <div className="w-full max-w-5xl mx-auto px-4 md:px-6 pb-24 pt-8 md:pt-10 space-y-8">
            <div className="px-4 pt-4 pb-6 text-center">
                {/* Title and subtitle only at the top */}

                <AnimatePresence mode="wait">
                    <motion.div
                        key={effectiveBattle.title}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                    >
                        <div className="text-center">
                            {(() => {
                                const formatTitle = (str: string) => {
                                    const minorWords = ['del', 'de', 'la', 'el', 'los', 'las', 'y', 'o', 'en', 'a', 'un', 'una', 'por'];
                                    return str.split(' ').map((word, index) => {
                                        if (index > 0 && minorWords.includes(word.toLowerCase())) {
                                            return word.toLowerCase();
                                        }
                                        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                                    }).join(' ');
                                };
                                const titleStr = formatTitle(effectiveBattle.title.replace(/[-_]/g, ' '));
                                const words = titleStr.split(' ');
                                const lastWord = words.pop() || '';
                                const firstPart = words.join(' ');
                                return (
                                    <>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                            <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-blue-600 to-emerald-500" />
                                            Versus activo
                                        </div>

                                        <h1 className="mt-5 text-4xl md:text-5xl font-black tracking-tight text-ink leading-[1.05]">
                                            {firstPart} <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-500">{lastWord}</span>
                                        </h1>
                                    </>
                                );
                            })()}

                            <p className="mt-3 text-base md:text-lg font-medium text-slate-600">
                                Elige una opción. Deja tu señal.
                            </p>

                            <div className="mt-2 text-sm font-medium text-slate-500">
                                Sin discursos. Con datos.
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {effectiveBattle.layout === 'opinion' && effectiveBattle.mainImageUrl && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative mt-8 mb-4 mx-auto max-w-lg aspect-video rounded-[3rem] overflow-hidden bg-white shadow-2xl border-8 border-white group"
                    >
                        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl -z-10" />
                        <img
                            src={effectiveBattle.mainImageUrl}
                            alt={effectiveBattle.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    </motion.div>
                )}
            </div>

            {
                effectiveBattle.type === 'separator' ? (
                    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                        <button onClick={next} className="px-8 py-3 bg-primary text-white rounded-xl font-bold">Continuar</button>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={effectiveBattle.id + (champion?.id || '')}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                            className="relative"
                        >
                            {/* Instruction + Progress immediately above cards */}
                            {!props.hideProgress && (
                                <div className="max-w-xl mx-auto mb-8">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <span>Progreso</span>
                                        <span>{idx + 1}/{total}</span>
                                    </div>

                                    <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-500 ease-out"
                                            style={{ width: `${Math.round(((idx) / Math.max(1, total)) * 100)}%` }}
                                        />
                                    </div>

                                    <div className="mt-2 text-[11px] font-medium text-slate-500 text-center">
                                        Tu señal se cruza con tu perfil para detectar patrones.
                                    </div>
                                </div>
                            )}
                            {props.isSubmitting && (
                                <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-[2px] bg-white/10 rounded-[3rem]">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-12 h-12 border-4 border-t-transparent rounded-full"
                                        style={{ borderColor: props.theme?.primary || '#10b981', borderTopColor: 'transparent' }}
                                    />
                                </div>
                            )}

                            {/* Error handling interior si no hay opciones */}
                            {(!a && !b) ? (
                                <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-3xl mx-4 mb-4 border border-slate-100">
                                    Hay un problema de datos con esta señal. No hay opciones configuradas.
                                </div>
                            ) : (
                                <div className={`relative mt-6 w-full mx-auto transition-opacity duration-300 ${props.isSubmitting ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                                    {/* VS badge central MASIVO - Out of the box */}
                                    {effectiveBattle.layout === 'versus' && a && b && (
                                        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40">
                                            <div className="h-20 w-20 md:h-28 md:w-28 rounded-full bg-slate-900/95 backdrop-blur-xl border-[6px] md:border-8 border-white shadow-[0_30px_80px_rgba(15,23,42,0.5)] flex items-center justify-center transform transition-transform duration-700 hover:scale-110">
                                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600/30 to-emerald-500/30 blur-md" />
                                                <span className="relative text-2xl md:text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-emerald-300 italic">VS</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 relative z-20">
                                        {a && (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="w-full flex">
                                                <OptionCard
                                                    option={a}
                                                    onClick={(e) => handleVote(a.id, e)}
                                                    disabled={locked || lockedByLimit || !!props.isSubmitting}
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
                                                    disabled={locked || lockedByLimit || !!props.isSubmitting}
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

                                    {/* CTA post-selección a Profundidad */}
                                    {selectedOption && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-6 max-w-3xl mx-auto rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_14px_50px_rgba(15,23,42,0.06)] relative z-20"
                                        >
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                                <div>
                                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Siguiente paso</div>
                                                    <div className="mt-1 text-sm md:text-base font-bold text-ink">
                                                        ¿Por qué {selectedOption.label}? (10 preguntas rápidas)
                                                    </div>
                                                    <div className="mt-1 text-sm font-medium text-slate-500">
                                                        Esto mejora la calidad del dato y tus resultados.
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => navigate(`/depth/run/${effectiveBattle.slug || effectiveBattle.id}/${selectedOption.id}`)}
                                                    className="h-12 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-black text-sm shadow-[0_12px_28px_rgba(16,185,129,0.18)] hover:opacity-95 transition-all active:scale-95 whitespace-nowrap"
                                                >
                                                    Aportar contexto
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            {/* Comentario de Insight simulado por IA después de votar */}
                            <AnimatePresence>
                                {(result || momentum) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="max-w-2xl mx-auto mt-6 px-6 py-4 bg-gradient-to-br from-primary-50 to-emerald-50 border border-primary-100 rounded-2xl shadow-sm flex items-start gap-4"
                                    >
                                        <div className="p-2 bg-white rounded-full shadow-sm">
                                            <span className="material-symbols-outlined text-primary-500 text-xl">psychology</span>
                                        </div>
                                        <div className="text-left text-sm text-slate-700 leading-relaxed font-medium">
                                            <span className="font-bold text-primary-700 mr-2">Insight de la comunidad:</span>
                                            El {momentum ? Math.max(...momentum.options.map(o => o.percentage)) : 0}% de los encuestados han elegido la opción ganadora. Esta tendencia refleja una fuerte preferencia en este segmento.
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <AnimatePresence>
                                {clickPosition && (
                                    <motion.div
                                        initial={{
                                            opacity: 1,
                                            top: clickPosition.y - 40,
                                            left: clickPosition.x - 40,
                                            scale: 0.5
                                        }}
                                        animate={{
                                            opacity: [1, 1, 0],
                                            top: clickPosition.y - 120,
                                            scale: [1, 1.2, 1]
                                        }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 1.2, ease: "easeOut" }}
                                        className="fixed z-[999] pointer-events-none drop-shadow-2xl"
                                    >
                                        <div
                                            className="text-white font-black text-3xl px-4 py-2 rounded-full border-4 border-white shadow-xl transform -rotate-6 whitespace-nowrap overflow-hidden"
                                            style={{ backgroundColor: props.theme?.primary || '#10b981' }}
                                        >
                                            Registrada
                                        </div>
                                        <div className="absolute inset-0 bg-white opacity-20 blur-md rounded-full animate-pulse" />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Tooltip profile hints incorporated directly into progress bar top UI */}
                        </motion.div>
                    </AnimatePresence >
                )
            }

            <AnimatePresence>
                {showAuthModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAuthModal(false)}
                            className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white rounded-[32px] p-8 md:p-10 max-w-md w-full shadow-2xl border border-slate-100 text-center"
                        >
                            <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-600">
                                <span className="material-symbols-outlined text-4xl">verified_user</span>
                            </div>
                            <h2 className="text-2xl font-black text-ink mb-4">Señal Protegida</h2>
                            <p className="text-slate-500 mb-8 leading-relaxed">
                                Para que tu señal tenga <span className="text-primary-600 font-bold">impacto real</span> y se sume a la inteligencia colectiva, necesitas validar tu identidad.
                            </p>
                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate('/profile')}
                                    className="w-full py-4 bg-primary-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-primary-100 hover:bg-primary-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    INICIAR SESIÓN
                                </button>
                                <button
                                    onClick={() => setShowAuthModal(false)}
                                    className="w-full py-4 bg-white text-slate-400 rounded-2xl font-bold text-sm hover:text-slate-600 transition-colors"
                                >
                                    Continuar como observador
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showProfileModal && (
                    <ProfileRequiredModal
                        onClose={() => setShowProfileModal(false)}
                        onCompleteProfile={() => navigate('/complete-profile')}
                    />
                )}
                {showGuestConversionModal && (
                    <GuestConversionModal
                        isOpen={showGuestConversionModal}
                        onClose={() => setShowGuestConversionModal(false)}
                        onRegister={() => {
                            setShowGuestConversionModal(false);
                            navigate('/dashboard'); // Temporarily navigating to dashboard or specialized signup page
                        }}
                    />
                )}
            </AnimatePresence>
        </div >
    );
}
