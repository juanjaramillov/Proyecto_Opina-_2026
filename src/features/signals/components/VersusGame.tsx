
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useVersusGame } from '../hooks/useVersusGame';

import OptionCard from './OptionCard';
import { Battle, BattleOption, ProgressiveBattle, VoteResult } from '../types';
import SessionSummary from './SessionSummary';
import { ProfileRequiredModal } from '../../../components/ProfileRequiredModal';
import { GuestConversionModal } from '../../auth/components/GuestConversionModal';
import { FallbackAvatar } from '../../../components/ui/FallbackAvatar';

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
        return (
            <div className="w-full flex flex-col items-center justify-center py-12 px-4 text-center bg-white border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] rounded-[2rem] min-h-[400px]">
                <div className="w-20 h-20 rounded-[1.5rem] bg-slate-50 border border-slate-100 shadow-sm flex items-center justify-center mb-6 text-slate-400">
                    <span className="material-symbols-outlined text-text-muted text-5xl mb-4">hourglass_empty</span>
                </div>
                <h2 className="text-2xl font-black text-ink tracking-tight mb-2">No hay combates disponibles</h2>
                <p className="text-text-secondary font-medium text-sm mb-6 max-w-xs mx-auto">
                    Estamos preparando nuevas opciones. Vuelve en un rato.
                </p>
                <div className="mt-8">
                    <button onClick={() => navigate('/experience')} className="px-6 py-3 bg-gradient-brand text-white rounded-xl font-black shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.23)] transition-all active:scale-95 uppercase tracking-wider text-sm">
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

                <AnimatePresence mode="wait">
                    <motion.div
                        key={effectiveBattle.title}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5, transition: { duration: 0.15 } }}
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
                                        <div className="flex items-center justify-between w-full mb-6">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                                                <span className="inline-block w-2 h-2 rounded-full bg-gradient-brand shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                                                Comparación Corta
                                            </div>

                                            <button
                                                onClick={resetGame}
                                                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-500 hover:text-rose-600 transition-all group shadow-sm"
                                                title="Salir y ver mis resultados de esta sesión"
                                            >
                                                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Terminar Sesión</span>
                                                <span className="material-symbols-outlined text-sm font-bold transition-transform group-hover:rotate-90">close</span>
                                            </button>
                                        </div>

                                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-[1.05] drop-shadow-sm">
                                            {firstPart} <span className="text-gradient-brand drop-shadow-none">{lastWord}</span>
                                        </h1>
                                    </>
                                );
                            })()}

                            <p className="mt-3 text-base md:text-lg font-bold text-slate-600">
                                Dos opciones. Una decisión rápida.
                            </p>

                            <div className="mt-2 text-sm font-medium text-slate-500">
                                Toca una carta para señalar tu preferencia.
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

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
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }}
                            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
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

                                    {selectedOption && (
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
                                                    onClick={() => navigate(`/depth/run/${effectiveBattle.slug || effectiveBattle.id}/${selectedOption.id}`)}
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
                            <AnimatePresence>
                                {!!selectedOption && (
                                    <motion.div
                                        id="insight-card"
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                        className="max-w-2xl mx-auto mt-10 p-[1px] rounded-[2rem] bg-gradient-to-r from-primary-100 via-slate-200 to-emerald-100 group shadow-md"
                                    >
                                        <div className="bg-white rounded-[calc(2rem-1px)] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 overflow-hidden">
                                            <div className="flex-shrink-0 w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-500">
                                                <span className="material-symbols-outlined text-primary-500 text-3xl">psychology</span>
                                            </div>

                                            <div className="text-center md:text-left flex-1">
                                                <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500">Señal Detectada</span>
                                                    <div className="h-1 w-1 rounded-full bg-slate-300" />
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Opina+ Intelligence</span>
                                                </div>
                                                <h4 className="text-xl md:text-2xl font-black text-slate-900 mb-2 drop-shadow-sm">Insight de la comunidad</h4>
                                                <div className="text-sm md:text-base text-slate-600 leading-relaxed font-medium">
                                                    El <span className="text-primary-600 font-black text-lg">
                                                        {momentum && selectedOption
                                                            ? momentum.options.find(o => o.id === selectedOption.id)?.percentage || 0
                                                            : 0}%
                                                    </span> de la comunidad Opina+ piensa igual que tú y ha elegido a <b>{selectedOption?.label}</b> en evaluaciones recientes.
                                                    <span className="text-xs text-slate-400 mt-2 block">Señal conectada con la inteligencia colectiva.</span>
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
                            className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white rounded-[2rem] p-8 md:p-10 max-w-md w-full shadow-2xl border border-slate-100 text-center overflow-hidden"
                        >
                            {/* Fondo decorativo en AuthModal */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100/50 rounded-full blur-[40px] pointer-events-none"></div>

                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary-500 shadow-sm">
                                    <span className="material-symbols-outlined text-3xl">verified_user</span>
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 mb-4 drop-shadow-sm">Señal Protegida</h2>
                                <p className="text-slate-600 font-medium mb-8 leading-relaxed">
                                    Para que tu señal tenga <span className="text-slate-900 font-black">impacto algorítmico</span> y se sume a la inteligencia colectiva, necesitas validar tu identidad.
                                </p>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => navigate('/profile')}
                                        className="w-full py-4 bg-gradient-brand text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.23)] hover:-translate-y-0.5 transition-all active:scale-95"
                                    >
                                        INICIAR SESIÓN
                                    </button>
                                    <button
                                        onClick={() => setShowAuthModal(false)}
                                        className="w-full py-3 bg-transparent text-slate-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:text-slate-900 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                                    >
                                        Continuar como observador
                                    </button>
                                </div>
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
