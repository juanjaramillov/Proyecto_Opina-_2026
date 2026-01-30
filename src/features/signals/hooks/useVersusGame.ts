import { useMemo, useRef, useState } from 'react';
import { useToast } from '../../../components/ui/useToast';
import { useAccountProfile } from "../../../auth/useAccountProfile";
// import { addSignal } from "../../../state/signalStore"; // Removed
import { useSignalStore } from "../../../store/signalStore";
import { signalService } from "../../../services/signalService";
// import { saveSignalEvent } from "../services/saveSignalEvent"; // Removed
import { Battle, BattleOption, ProgressiveBattle, VoteResult } from '../types';

const SHOW_RESULT_MS = 1000;
const NEXT_INTERSTITIAL_MS = 500;

interface UseVersusGameProps {
    battles: Battle[];
    onVote: (battleId: string, optionId: string, opponentId: string) => Promise<VoteResult>;
    mode?: 'classic' | 'survival' | 'progressive';
    autoNextMs?: number;
    progressiveData?: ProgressiveBattle;
    onProgressiveComplete?: (result: { winner: BattleOption; defeated: BattleOption[] }) => void;
}

export function useVersusGame({
    battles,
    onVote,
    mode = 'classic',
    autoNextMs = 1500,
    progressiveData,
    onProgressiveComplete
}: UseVersusGameProps) {
    const [idx, setIdx] = useState(0);
    const [locked, setLocked] = useState(false);
    const [selected, setSelected] = useState<string | null>(null);
    const [result, setResult] = useState<VoteResult | null>(null);
    const [phase, setPhase] = useState<'idle' | 'showResult' | 'next'>('idle');

    const { profile, loading: loadingProfile } = useAccountProfile();
    const { addSignal, signalsToday } = useSignalStore();
    const { showToast } = useToast();

    // Limit Logic
    const dailyLimit = profile?.signalsDailyLimit ?? 10;
    const isUnlimited = dailyLimit === -1;
    const remaining = isUnlimited ? 999 : Math.max(0, dailyLimit - signalsToday);
    const lockedByLimit = !isUnlimited && remaining <= 0;

    const [pairSeed, setPairSeed] = useState(0);
    const [defeatedIds, setDefeatedIds] = useState<string[]>([]);
    const [champion, setChampion] = useState<BattleOption | null>(null);
    const [streak, setStreak] = useState(0);
    const [progIndex, setProgIndex] = useState(1);
    const [progHistory, setProgHistory] = useState<BattleOption[]>([]);
    const [progComplete, setProgComplete] = useState(false);

    const t1 = useRef<ReturnType<typeof setTimeout> | null>(null);
    const t2 = useRef<ReturnType<typeof setTimeout> | null>(null);

    const currentBattleData = useMemo(() => battles[idx] || null, [battles, idx]);

    const activeBattle: Battle | null = useMemo(() => {
        if (!currentBattleData || !currentBattleData.options || currentBattleData.options.length < 2) return null;

        if (mode === 'classic') {
            const opts = currentBattleData.options;
            const s = pairSeed;
            const i1 = s % opts.length;
            const rawI2 = (s + 1 + Math.floor(s / opts.length)) % opts.length;
            const i2 = i1 === rawI2 ? (i1 + 1) % opts.length : rawI2;
            return { ...currentBattleData, options: [opts[i1], opts[i2]] };
        }

        if (!champion) {
            const opts = currentBattleData.options;
            const i1 = pairSeed % opts.length;
            const i2 = (i1 + 1) % opts.length;
            return { ...currentBattleData, options: [opts[i1], opts[i2]] };
        }

        const myThemeOptions = battles.find(b => b.options.some(o => o.id === champion.id))?.options || currentBattleData.options;
        const candidates = myThemeOptions.filter(o => o.id !== champion.id && !defeatedIds.includes(o.id));
        const pool = candidates.length > 0 ? candidates : myThemeOptions.filter(o => o.id !== champion.id);

        if (pool.length === 0) return null;

        const challenger = pool[Math.floor(pairSeed % pool.length)];

        return {
            ...currentBattleData,
            title: `Racha: ${streak} Victorias`,
            subtitle: candidates.length === 0 ? "¡Vuelta de honor! Ya venciste a todos." : "El ganador sigue en la arena.",
            options: [champion, challenger]
        };
    }, [currentBattleData, mode, champion, streak, pairSeed, battles, defeatedIds]);

    const activeProgressiveBattle = useMemo(() => {
        if (mode !== 'progressive' || !progressiveData || !progressiveData.candidates || progressiveData.candidates.length < 2) return null;
        if (progComplete) return null;

        const allCandidates = progressiveData.candidates;
        const currentChamp = champion || allCandidates[0];
        const nextChallenger = allCandidates[progIndex];

        if (!nextChallenger) return null;

        return {
            id: progressiveData.id,
            title: progressiveData.title,
            subtitle: progressiveData.subtitle || `Paso ${progIndex} de ${allCandidates.length - 1}`,
            options: [currentChamp, nextChallenger],
            totalVotes: 0,
            showPercentage: false,
        } as Battle;
    }, [mode, progressiveData, champion, progIndex, progComplete]);

    const effectiveBattle = mode === 'progressive' ? activeProgressiveBattle : activeBattle;
    const total = battles.length || 0;

    const clearTimers = () => {
        if (t1.current) clearTimeout(t1.current);
        if (t2.current) clearTimeout(t2.current);
        t1.current = null;
        t2.current = null;
    };

    const next = () => {
        clearTimers();
        setLocked(false);
        setSelected(null);
        setResult(null);
        setPhase('idle');

        if (mode === 'progressive') {
            if (!progressiveData || !progressiveData.candidates) return;
            const nextIdx = progIndex + 1;
            if (nextIdx >= progressiveData.candidates.length) {
                setProgComplete(true);
                if (onProgressiveComplete && champion) {
                    onProgressiveComplete({ winner: champion, defeated: progHistory });
                }
            } else {
                setProgIndex(nextIdx);
            }
            return;
        }

        if (mode === 'survival') {
            setPairSeed(s => s + 1);
        } else {
            setIdx((prev) => (total ? (prev + 1) % total : 0));
            setPairSeed(s => s + 1);
            setDefeatedIds([]);
        }
    };

    const vote = async (optionId: string) => {
        if (!profile || loadingProfile) return;

        if (lockedByLimit) {
            showToast(`Límite diario alcanzado. Verifica tu cuenta.`, 'info');
            return;
        }

        if (!effectiveBattle || locked) return;
        clearTimers();

        setLocked(true);
        setSelected(optionId);

        const opponent = effectiveBattle.options.find(o => o.id !== optionId);
        if (!opponent && effectiveBattle.options.length > 1) return;

        try {
            const r = await onVote(effectiveBattle.id, optionId, opponent?.id || 'unknown');

            // Spend signal using centralized store
            addSignal(1);

            await signalService.saveSignalEvent({
                source_type: 'versus',
                source_id: effectiveBattle.id,
                title: effectiveBattle.title,
                choice_label: effectiveBattle.options.find(o => o.id === optionId)?.label || 'unknown',
                signal_weight: 1, // Default weight
            });

            setResult(r);
            setPhase('showResult');

            if (mode === 'progressive') {
                const winningOption = effectiveBattle.options.find(o => o.id === optionId);
                const losingOption = effectiveBattle.options.find(o => o.id !== optionId);
                if (winningOption && losingOption) {
                    setChampion(winningOption);
                    setProgHistory(prev => [...prev, losingOption]);
                }
            } else if (mode === 'survival') {
                const winningOption = effectiveBattle.options.find(o => o.id === optionId);
                const losingOption = effectiveBattle.options.find(o => o.id !== optionId);
                if (winningOption) {
                    setChampion(winningOption);
                    setStreak(s => s + 1);
                    if (losingOption) {
                        setDefeatedIds(prev => [...prev, losingOption.id]);
                    }
                }
            }

            const totalAfterVote = Math.max(autoNextMs, SHOW_RESULT_MS + NEXT_INTERSTITIAL_MS);
            t1.current = setTimeout(() => {
                setPhase('next');
                t2.current = setTimeout(() => {
                    next();
                }, NEXT_INTERSTITIAL_MS);
            }, Math.min(SHOW_RESULT_MS, totalAfterVote - NEXT_INTERSTITIAL_MS));
        } catch {
            setLocked(false);
            setSelected(null);
            setSelected(null);
            setResult(null);
            setPhase('idle');
        }
    };

    return {
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
        champion,
    };
}
