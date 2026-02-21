import { useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from '../../../components/ui/useToast';
import { useAuth } from "../../auth";
import { useSignalStore } from "../../../store/signalStore";
// import { saveSignalEvent } from "../services/saveSignalEvent"; // Removed
import { Battle, BattleOption, ProgressiveBattle, VoteResult } from '../types';

const SHOW_RESULT_MS = 400;
const NEXT_INTERSTITIAL_MS = 200;

interface UseVersusGameProps {
    battles: Battle[];
    onVote: (battleId: string, optionId: string, opponentId: string) => Promise<VoteResult>;
    mode?: 'classic' | 'survival' | 'progressive';
    autoNextMs?: number;
    progressiveData?: ProgressiveBattle;
    onProgressiveComplete?: (result: { winner: BattleOption; defeated: BattleOption[] }) => void;
    enableAutoAdvance?: boolean;
    isQueueFinite?: boolean;

    // UX controls
    hideProgress?: boolean;
    disableInsights?: boolean;
    onQueueComplete?: () => void;
    isSubmitting?: boolean;
}

export function useVersusGame({
    battles,
    onVote,
    mode = 'classic',
    autoNextMs,
    progressiveData,
    onProgressiveComplete,
    enableAutoAdvance = true,
    isQueueFinite = false,
    hideProgress = false,
    disableInsights = false,
    onQueueComplete,
    isSubmitting = false,
}: UseVersusGameProps) {
    const { profile } = useAuth();
    const { showToast } = useToast();
    const addSignal = useSignalStore((s) => s.addSignal);

    const [idx, setIdx] = useState(0);
    const [result, setResult] = useState<VoteResult | null>(null);
    const [showInsight, setShowInsight] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [sessionHistory, setSessionHistory] = useState<Array<{
        battle: Battle;
        myVote: 'A' | 'B';
        pctA: number;
    }>>([]);
    const [lastWinner, setLastWinner] = useState<BattleOption | null>(null);

    const timeoutRef = useRef<number | null>(null);

    const effectiveBattle = useMemo(() => {
        if (mode === 'progressive' && progressiveData) {
            const a = progressiveData.candidates[0];
            const b = progressiveData.candidates[1];
            return {
                id: progressiveData.id,
                title: progressiveData.title,
                subtitle: progressiveData.subtitle,
                options: [a, b],
                industry: progressiveData.industry,
            } as Battle;
        }

        if (mode === 'survival' && lastWinner) {
            const baseBattle = battles[idx % battles.length];
            // Challenger is the first option of the next battle that isn't the winner
            const challenger = baseBattle.options.find(o => o.id !== lastWinner.id) || baseBattle.options[0];

            return {
                ...baseBattle,
                title: `${lastWinner.label} vs ${challenger.label}`,
                subtitle: 'Superviviencia: El ganador sigue',
                options: [lastWinner, challenger]
            } as Battle;
        }

        return battles[idx];
    }, [battles, idx, mode, progressiveData, lastWinner]);

    const resetTimers = () => {
        if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    useEffect(() => {
        return () => resetTimers();
    }, []);

    const goNext = () => {
        setResult(null);
        setShowInsight(false);

        // Queue behavior
        if (mode !== 'progressive') {
            const nextIdx = idx + 1;

            if (isQueueFinite && nextIdx >= battles.length) {
                onQueueComplete?.();
                return;
            }

            setIdx(nextIdx % Math.max(1, battles.length));
        } else {
            // Progressive handled elsewhere (parent)
            setIdx((prev) => prev + 1);
        }
    };

    const vote = async (optionId: string) => {
        if (!effectiveBattle) return;
        if (isSubmitting) return;

        // 🛡️ SECURITY CHECK: Real session required (Bloque 6B)
        // Delegated to profile check from useAuth for UI purposes
        if (!profile || profile.tier === 'guest') {
            setShowAuthModal(true);
            return;
        }

        const opponent = effectiveBattle.options.find(o => o.id !== optionId);
        if (!opponent && effectiveBattle.options.length > 1) return;

        try {
            const r = await onVote(effectiveBattle.id, optionId, opponent?.id || 'unknown');

            const choiceLabel = effectiveBattle.options.find(o => o.id === optionId)?.label || 'unknown';

            // Spend signal and store event detail locally for Trends fallback
            addSignal({
                amount: 1,
                voteId: `${effectiveBattle.id}-${Date.now()}`,
                eventDetail: {
                    sourceType: 'versus',
                    sourceId: effectiveBattle.id,
                    title: effectiveBattle.title,
                    choiceLabel: choiceLabel,
                }
            });

            // Note: saveSignalEvent was removed here because Experience.tsx handles it.

            setResult(r);

            const votedOption = effectiveBattle.options.find(o => o.id === optionId);
            if (mode === 'survival' && votedOption) {
                setLastWinner(votedOption);
            }

            setSessionHistory(prev => [...prev, {
                battle: effectiveBattle,
                myVote: optionId === effectiveBattle.options[0].id ? 'A' : 'B',
                pctA: 0 // No longer using mockPctA
            }]);

            // AUTO-ADVANCE LOGIC
            if (enableAutoAdvance) {
                resetTimers();

                timeoutRef.current = window.setTimeout(() => {
                    if (!disableInsights && effectiveBattle.insights?.length) {
                        setShowInsight(true);

                        timeoutRef.current = window.setTimeout(() => {
                            goNext();
                        }, NEXT_INTERSTITIAL_MS);
                    } else {
                        goNext();
                    }
                }, autoNextMs ?? SHOW_RESULT_MS);
            }
        } catch (err) {
            console.error("Vote processing failed:", err);
            showToast('No pudimos registrar tu señal. Revisa tu conexión e intenta nuevamente.', 'error');
            // We do NOT call setResult, so the UI stays in 'voting' phase for the same battle.
        }
    };

    // Use unused var to suppress warning
    useEffect(() => {
        if (mode === 'progressive' && onProgressiveComplete) {
            // no-op, just to usage
        }
    }, [mode, onProgressiveComplete]);

    return {
        battle: effectiveBattle,
        effectiveBattle, // Alias for component compatibility
        idx,
        vote,
        result,
        showInsight,
        showAuthModal,
        setShowAuthModal,
        hideProgress,
        disableInsights,
        profile,
        sessionHistory,

        // Dummies for VersusGame.tsx compatibility
        locked: false,
        lockedByLimit: false,
        selected: null as string | null,
        phase: (result ? 'result' : 'voting') as 'idle' | 'voting' | 'result' | 'next',
        total: battles.length,
        streak: sessionHistory.length,
        next: goNext,
        champion: null as BattleOption | null,
        isCompleted: isQueueFinite && idx >= battles.length,
    };
}
