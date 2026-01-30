
import { motion, AnimatePresence } from 'framer-motion';
import { useVersusGame } from '../hooks/useVersusGame';
import OptionCard from './OptionCard';
import SignalMeter from './SignalMeter';
import { Battle, BattleOption, ProgressiveBattle, VoteResult } from '../types';

// --- CONSTANTS & HELPERS ---
const clampPct = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

const WIN_LINES = ['Sintonizas con la mayoría.', 'Tu señal refuerza el patrón.', 'Coincides con la tendencia.'];
const LOSE_LINES = ['Tu señal aporta contraste.', 'Interesante. Vas contra el patrón.', 'Visión única detectada.'];
const NEUTRAL_LINES = ['Señal capturada.', 'Tu aporte suma al mapa.'];
const INSIGHT_LINES = [
    'Tu elección suele coincidir con personas de perfil similar.',
    'Este versus divide fuerte: hay dos bandos claros.',
    'En tu segmento, mucha gente elige lo contrario.',
    'Tu decisión dice mucho de tu momento actual.',
    'Interesante. Esto afina tu radiografía.'
];

function pickLine(lines: string[], seed: number) {
    const idx = Math.abs(Math.floor(seed)) % lines.length;
    return lines[idx];
}

type GameProps = {
    battles: Battle[];
    onVote: (battleId: string, optionId: string, opponentId: string) => Promise<VoteResult>;
    autoNextMs?: number;
    relatedTrendId?: string;
    mode?: 'classic' | 'survival' | 'progressive';
    progressiveData?: ProgressiveBattle;
    onProgressiveComplete?: (result: { winner: BattleOption; defeated: BattleOption[] }) => void;
};

export default function VersusGame(props: GameProps) {
    // Hook handles all game state and logic
    const {
        effectiveBattle,
        locked,
        lockedByLimit,
        selected,
        result,
        phase,
        idx,
        total,
        streak,
        profile,
        vote,
        next,
        champion
    } = useVersusGame(props);

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

    const pctA = result ? clampPct(result[a.id] ?? 0) : null;
    const pctB = result ? clampPct(result[b.id] ?? 0) : null;
    const showResult = Boolean(result);
    // Determine myVote from state (selected) or battle history (myVote)
    const myVote = (selected as 'A' | 'B' | null) ?? (effectiveBattle.myVote ? effectiveBattle.myVote : null);

    const seed = (() => {
        const str = `${effectiveBattle.id}:${myVote || 'none'}:${idx}`;
        let h = 0;
        for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i);
        return h;
    })();

    const myPct = showResult && myVote ? (myVote === 'A' ? (pctA ?? 0) : (pctB ?? 0)) : null;
    const isMajority = showResult && myVote && myPct !== null ? myPct >= 50 : null;

    let line = '';
    if (effectiveBattle.showPercentage === false && showResult) {
        line = pickLine(INSIGHT_LINES, seed);
    } else if (showResult && myVote && isMajority !== null) {
        line = isMajority ? pickLine(WIN_LINES, seed) : pickLine(LOSE_LINES, seed);
    } else {
        line = pickLine(NEUTRAL_LINES, seed);
    }

    return (
        <div className="w-full">
            <div className="px-4 pt-4 pb-6 text-center">
                <SignalMeter profile={profile} />

                <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-surface2 border border-stroke shadow-sm relative z-50">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                        {effectiveBattle.type === 'separator' ? 'Pausa' : (props.mode === 'survival' ? `Racha: ${streak}` : effectiveBattle.subtitle?.includes("Paso") ? effectiveBattle.subtitle : `Versus ${idx + 1} / ${total}`)}
                    </span>
                    {phase === 'next' && <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />}
                </div>

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
                    <div className="text-base text-text-secondary font-medium mt-2">{effectiveBattle.subtitle}</div>
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
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="relative"
                    >
                        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 px-4 pb-4">
                            <OptionCard
                                option={a}
                                onClick={() => vote(a.id)}
                                disabled={locked || lockedByLimit}
                                isSelected={selected === a.id}
                                showResult={showResult}
                                showPercentage={effectiveBattle.showPercentage ?? true}
                                percent={pctA}
                                isLeft
                                isChampion={props.mode === 'survival' && champion?.id === a.id}
                            />
                            <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white rounded-full items-center justify-center font-black text-xs border-4 border-surface shadow-xl text-text-muted">VS</div>
                            <OptionCard
                                option={b}
                                onClick={() => vote(b.id)}
                                disabled={locked || lockedByLimit}
                                isSelected={selected === b.id}
                                showResult={showResult}
                                showPercentage={effectiveBattle.showPercentage ?? true}
                                percent={pctB}
                                isChampion={props.mode === 'survival' && champion?.id === b.id}
                            />
                        </div>

                        <AnimatePresence>
                            {showResult && myVote && myPct !== null && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 pb-4">
                                    <div className="rounded-2xl border border-stroke bg-surface p-6 shadow-premium text-center">
                                        <div className="text-xl font-bold text-ink mb-1">{line}</div>
                                        <div className="text-sm text-text-secondary">{(effectiveBattle.showPercentage ?? true) ? `${myPct}% eligió lo mismo.` : "Registrado."}</div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
}
