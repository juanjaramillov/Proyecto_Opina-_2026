import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from "../../auth";
import { useSignalStore } from "../../../store/signalStore";
import { notifyService, formatKnownError } from '../../notifications/notifyService';
import { Battle, BattleOption, TorneoTournament, VoteResult, BattleMomentum } from '../types';
import { logger } from '../../../lib/logger';
import { supabase } from '../../../supabase/client';

interface UseVersusGameProps {
    battles: Battle[];
    onVote: (battleId: string, optionId: string, opponentId: string) => Promise<VoteResult>;
    mode?: 'classic' | 'survival' | 'torneo';
    autoNextMs?: number;
    progressiveData?: TorneoTournament;
    onProgressiveComplete?: (result: { winner: BattleOption; defeated: BattleOption[] }) => void;
    enableAutoAdvance?: boolean;
    isQueueFinite?: boolean;

    // UX controls
    hideProgress?: boolean;
    onQueueComplete?: (history: Array<{ battle: Battle; myVote: 'A' | 'B'; pctA: number }>) => void;
    isSubmitting?: boolean;
}

export function useVersusGame({
    battles,
    onVote,
    mode = 'classic',
    autoNextMs,
    progressiveData,
    onProgressiveComplete: _onProgressiveComplete,
    enableAutoAdvance = true,
    isQueueFinite = false,
    hideProgress = false,
    onQueueComplete,
    isSubmitting = false,
}: UseVersusGameProps) {
    const { profile } = useAuth();
    const addSignal = useSignalStore((s) => s.addSignal);

    const [idx, setIdx] = useState(0);
    const [result, setResult] = useState<VoteResult | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [sessionHistory, setSessionHistory] = useState<Array<{
        battle: Battle;
        myVote: 'A' | 'B';
        pctA: number;
    }>>([]);
    const [lastWinner, setLastWinner] = useState<BattleOption | null>(null);
    const [momentum, setMomentum] = useState<BattleMomentum | null>(null);
    const [isExitingBattle, setIsExitingBattle] = useState(false);

    const timeoutRef = useRef<number | null>(null);
    const exitTimeoutRef = useRef<number | null>(null);

    const effectiveBattle = useMemo(() => {
        if (mode === 'torneo' && progressiveData && progressiveData.candidates) {
            const a = progressiveData.candidates[0];
            const b = progressiveData.candidates[1];
            if (!a || !b) return null;

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

        const baseBattle = battles[idx];
        if (!baseBattle || !baseBattle.options || baseBattle.options.length < 2) return baseBattle;

        const shuffled = [...baseBattle.options].sort(() => 0.5 - Math.random());
        return {
            ...baseBattle,
            options: [shuffled[0], shuffled[1]]
        } as Battle;
    }, [battles, idx, mode, progressiveData, lastWinner]);

    const resetTimers = () => {
        if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (exitTimeoutRef.current) {
            window.clearTimeout(exitTimeoutRef.current);
            exitTimeoutRef.current = null;
        }
    };

    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        return () => resetTimers();
    }, []);

    const goNext = () => {
        setResult(null);
        setSelectedId(null);
        setMomentum(null);
        setIsTransitioning(false);
        setIsExitingBattle(false);

        // Queue behavior
        if (mode !== 'torneo') {
            const nextIdx = idx + 1;

            if (isQueueFinite && nextIdx >= battles.length) {
                setIdx(nextIdx);
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
        if (isSubmitting || isTransitioning) return;

        // 🛡️ SECURITY CHECK: Real session required (Bloque 6B)
        // Delegated to profile check from useAuth for UI purposes
        /* if (!profile || profile.tier === 'guest') {
            setShowAuthModal(true);
            return;
        } */

        // 🛡️ PROFILE WIZARD V2 CHECK: Ensure at least stage 1 for signaling
        const currentStage = profile?.demographics?.profileStage || 0;
        const isAdmin = profile?.role === 'admin';

        if (!isAdmin && (!profile || profile.tier === 'guest' || currentStage < 1)) {
            notifyService.error("Completa tu perfil para emitir señales.");
            setShowProfileModal(true);
            return;
        }

        setSelectedId(optionId);

        const opponent = effectiveBattle.options.find(o => o.id !== optionId);
        if (!opponent && effectiveBattle.options.length > 1) return;

        try {
            const r = await onVote(effectiveBattle.id, optionId, opponent?.id || 'unknown');

            if (r.error) {
                const knownMsg = formatKnownError(r.error);
                if (knownMsg) {
                    notifyService.error(knownMsg);
                } else {
                    const msg = String(r.error).toUpperCase();
                    if (msg.includes('PROFILE_INCOMPLETE') || msg.includes('PROFILE_MISSING') || msg.includes('INVITE_REQUIRED') || msg.includes('SIGNAL_LIMIT_REACHED') || msg.includes('BATTLE_NOT_ACTIVE') || msg.includes('INVALID SIGNAL PAYLOAD')) {
                        notifyService.error(String(r.error));
                    }
                }
                setResult(r);
                return;
            }

            const choiceLabel = effectiveBattle.options.find(o => o.id === optionId)?.label || 'unknown';

            // Spend signal and store event detail locally for Trends fallback
            addSignal({
                amount: 1,
                voteId: `${effectiveBattle.id}-${Date.now()}`,
                eventDetail: {
                    type: 'versus',
                    description: `Votó por ${choiceLabel} en ${effectiveBattle.title}`,
                    metadata: {
                        sourceId: effectiveBattle.id,
                        choiceLabel: choiceLabel,
                        sourceType: 'versus'
                    }
                }
            });

            // Note: saveSignalEvent was removed here because SignalsHub.tsx handles it.

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
                setIsTransitioning(true);

                // Simply wait for autoNextMs then go to the next battle
                // DONT BLOCK THE TIMER!
                const delayMs = autoNextMs ?? 4000;
                
                // Orchestrate the exit sequence: hide insight card 250ms before the battle swaps
                const exitLeadTime = 250;
                const timeToExit = Math.max(0, delayMs - exitLeadTime);
                
                exitTimeoutRef.current = window.setTimeout(() => {
                    setIsExitingBattle(true);
                }, timeToExit);

                timeoutRef.current = window.setTimeout(() => {
                    goNext();
                }, delayMs);

                // Fetch Momentum Context Post-Vote asynchronously without blocking
                (async () => {
                    try {
                        const { data: momData, error: momError } = await supabase.rpc('get_battle_momentum', { p_battle_id: effectiveBattle.id });
                        if (!momError && momData) {
                            setMomentum(momData as unknown as BattleMomentum);
                        }
                    } catch (e) {
                        logger.warn("Failed to fetch momentum", e);
                    }
                })();
            }
        } catch (err) {
            logger.error("Vote processing failed:", err);
            const msg = formatKnownError(err) ?? 'No se pudo registrar tu señal.';
            notifyService.error(msg);
            setIsTransitioning(false);
            // We do NOT call setResult, so the UI stays in 'voting' phase for the same battle.
        }
    };

    useEffect(() => {
        if (isQueueFinite && idx >= battles.length && onQueueComplete) {
            onQueueComplete(sessionHistory);
        }
    }, [idx, battles.length, isQueueFinite, onQueueComplete]); // eslint-disable-line react-hooks/exhaustive-deps


    return {
        battle: effectiveBattle,
        effectiveBattle, // Alias for component compatibility
        idx,
        vote,
        result,
        showAuthModal,
        setShowAuthModal,
        showProfileModal,
        setShowProfileModal,
        hideProgress,
        profile,
        sessionHistory,
        momentum,
        isTransitioning,
        isExitingBattle,

        // Dummies for VersusGame.tsx compatibility
        locked: false,
        lockedByLimit: false,
        selected: selectedId,
        phase: (result ? 'result' : 'voting') as 'idle' | 'voting' | 'result' | 'next',
        total: battles.length,
        streak: sessionHistory.length,
        next: goNext,
        champion: null as BattleOption | null,
        isCompleted: isQueueFinite && idx >= battles.length,
    };
}
