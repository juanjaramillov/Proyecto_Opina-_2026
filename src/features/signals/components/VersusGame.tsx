
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
    onQueueComplete?: (history: any[]) => void;
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
                    <span className="material-symbols-outlined text-5xl">check_circle</span>
                </motion.div>
                <h3 className="text-3xl font-black text-ink mb-3 tracking-tight">Señal registrada.</h3>
                <p className="text-text-secondary max-w-sm mx-auto mb-10 text-lg leading-relaxed">
                    Gracias. Tu señal ya cuenta.
                </p>
                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <button
                        onClick={resetGame}
                        className="w-full px-8 py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary-dark transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20"
                    >
                        Siguiente batalla →
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
                <h3 className="text-2xl font-bold text-ink mb-2">No hay batalla disponible</h3>
                <p className="text-text-secondary max-w-md">
                    Estamos armando la próxima. Vuelve en un rato.
                </p>
                <div className="mt-8">
                    <button onClick={() => navigate('/experience')} className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all">
                        Volver a Participa
                    </button>
                </div>
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
                                            Versus
                                        </div>

                                        <h1 className="mt-5 text-4xl md:text-5xl font-black tracking-tight text-ink leading-[1.05]">
                                            {firstPart} <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-500">{lastWord}</span>
                                        </h1>
                                    </>
                                );
                            })()}

                            <p className="mt-3 text-base md:text-lg font-medium text-slate-600">
                                Dos opciones. Una señal.
                            </p>

                            <div className="mt-2 text-sm font-medium text-slate-500">
                                Toca una carta para señalar. Cambia de idea en la siguiente batalla.
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
                        <button onClick={next} className="px-8 py-3 bg-primary text-white rounded-xl font-bold">Siguiente batalla →</button>
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
                                    {/* VS badge central MASIVO - Corporativo Opina+ */}
                                    {a && b && (
                                        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40">
                                            <motion.div
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-gradient-to-br from-blue-600 to-emerald-500 border-[6px] md:border-8 border-white shadow-[0_25px_65px_rgba(37,99,235,0.35)] flex items-center justify-center transform transition-transform duration-700 hover:scale-110"
                                            >
                                                <span className="relative text-2xl md:text-3xl font-black tracking-tighter text-white italic drop-shadow-md">VS</span>
                                            </motion.div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 relative z-20">
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

                            {/* Comentario de Insight simulado por IA después de votar - PREMIUM V2 */}
                            <AnimatePresence>
                                {(result || momentum) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="relative max-w-2xl mx-auto mt-10 p-[2px] rounded-3xl bg-gradient-to-r from-blue-600 via-primary-500 to-emerald-500 shadow-[0_20px_70px_rgba(37,99,235,0.15)] group"
                                    >
                                        <div className="bg-white rounded-[22px] px-8 py-6 flex items-start gap-5 relative overflow-hidden">
                                            {/* Decorative background glow */}
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/10 to-transparent blur-3xl -z-10" />

                                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform duration-500">
                                                <span className="material-symbols-outlined text-white text-2xl">psychology</span>
                                            </div>

                                            <div className="text-left">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-600">Señal Detectada</span>
                                                    <div className="h-1 w-1 rounded-full bg-slate-300" />
                                                    <span className="text-[10px] font-bold text-slate-400">AI Collective Intelligence</span>
                                                </div>
                                                <h4 className="text-xl font-black text-ink mb-2">Insight de la comunidad</h4>
                                                <div className="text-base text-slate-600 leading-relaxed font-medium">
                                                    El <span className="text-blue-600 font-bold">{momentum ? Math.max(...momentum.options.map(o => o.percentage)) : 0}%</span> de los encuestados han elegido la opción ganadora. Esta tendencia refleja una fuerte preferencia en este segmento y sugiere un cambio en el comportamiento colectivo.
                                                </div>
                                            </div>
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
