
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useVersusGame } from '../hooks/useVersusGame';
import { useAuth } from '../../auth';
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
    const { profile } = useAuth();

    const {
        effectiveBattle,
        locked,
        lockedByLimit,
        selected,
        phase,
        idx,
        total,
        streak,
        vote,
        next,
        champion,
        isCompleted,
        sessionHistory,
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
                        onClick={() => window.location.reload()}
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
                onReset={() => window.location.reload()}
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

    const a = effectiveBattle.options[0];
    const b = effectiveBattle.options[1];

    const handleVote = async (optionId: string, e?: React.MouseEvent) => {
        if (props.isSubmitting) return;

        if (e) {
            setClickPosition({ x: e.clientX, y: e.clientY });
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(50);
            }
        }

        await vote(optionId);

        setTimeout(() => {
            if (!props.enableAutoAdvance) {
                setShowFinalMessage(true);
            }
        }, 1200);
    };

    return (
        <div className="w-full">
            <div className="px-4 pt-4 pb-6 text-center">
                {!props.hideProgress && (
                    <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-surface2 border border-stroke shadow-sm relative z-50">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                            {effectiveBattle.type === 'separator' ? 'Pausa' : (props.mode === 'survival' ? `Racha: ${streak}` : effectiveBattle.subtitle?.includes("Paso") ? effectiveBattle.subtitle : `Señal ${idx + 1} / ${total}`)}
                        </span>
                        {phase === 'next' && <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />}
                    </div>
                )}

                <AnimatePresence mode="wait">
                    <motion.div
                        key={effectiveBattle.title}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-2xl md:text-3xl font-bold text-ink leading-tight"
                    >
                        {effectiveBattle.title}
                    </motion.div>
                </AnimatePresence>

                {effectiveBattle.subtitle && (
                    <div className="text-base text-text-secondary font-medium mt-1">{effectiveBattle.subtitle}</div>
                )}

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

            {effectiveBattle.type === 'separator' ? (
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
                        <div className={`relative grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 px-4 pb-4 transition-opacity duration-300 ${props.isSubmitting ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                            <OptionCard
                                option={a}
                                onClick={(e) => handleVote(a.id, e)}
                                disabled={locked || lockedByLimit || !!props.isSubmitting}
                                isSelected={selected === a.id}
                                showResult={false}
                                showPercentage={false}
                                percent={null}
                                isLeft={effectiveBattle.layout === 'versus'}
                                layout={effectiveBattle.layout}
                                theme={props.theme}
                            />

                            {effectiveBattle.layout === 'versus' && (
                                <div
                                    className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-16 h-16 bg-white rounded-full items-center justify-center font-black text-sm border-8 border-white shadow-[0_15px_40px_rgba(0,0,0,0.15)] select-none"
                                    style={{ color: props.theme?.primary || '#10b981' }}
                                >VS</div>
                            )}

                            <OptionCard
                                option={b}
                                onClick={(e) => handleVote(b.id, e)}
                                disabled={locked || lockedByLimit || !!props.isSubmitting}
                                isSelected={selected === b.id}
                                showResult={false}
                                showPercentage={false}
                                percent={null}
                                layout={effectiveBattle.layout}
                                theme={props.theme}
                            />
                        </div>

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
                                        +{((profile as { signal_weight?: number })?.signal_weight || 1.0).toFixed(1)}x Impacto
                                    </div>
                                    <div className="absolute inset-0 bg-white opacity-20 blur-md rounded-full animate-pulse" />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="text-center mt-4 opacity-40">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[14px]">query_stats</span>
                                Tu voto se cruza con tu perfil (Edad, Zona) para detectar patrones
                            </p>
                        </div>
                    </motion.div>
                </AnimatePresence >
            )}

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
                            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
                                <span className="material-symbols-outlined text-4xl">verified_user</span>
                            </div>
                            <h2 className="text-2xl font-black text-ink mb-4">Señal Protegida</h2>
                            <p className="text-slate-500 mb-8 leading-relaxed">
                                Para que tu señal tenga <span className="text-indigo-600 font-bold">impacto real</span> y se sume a la inteligencia colectiva, necesitas validar tu identidad.
                            </p>
                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate('/profile')}
                                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
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
        </div>
    );
}
