import { useState, useEffect } from 'react';
import { BattleOption, ProgressiveBattle, VoteResult } from '../types';

import ChampionLane from './progressive/ChampionLane';
import ChallengerLane from './progressive/ChallengerLane';
import CrownedWinner from './progressive/CrownedWinner';

interface ProgressiveRunnerProps {
    progressiveData: ProgressiveBattle;
    onComplete: (winner: BattleOption) => void;
    onVote: (battleId: string, optionId: string, opponentId: string) => Promise<VoteResult>;
}

const SESSION_GOAL = 5;

export default function ProgressiveRunner({ progressiveData, onComplete, onVote }: ProgressiveRunnerProps) {
    const candidates = progressiveData.candidates || [];

    const [round, setRound] = useState(1);
    const [champWins, setChampWins] = useState(0);
    const [isCrowned, setIsCrowned] = useState(false);

    const [championOption, setChampionOption] = useState<BattleOption | null>(candidates[0] || null);
    const [challengerOption, setChallengerOption] = useState<BattleOption | null>(candidates[1] || null);

    const [isVoting, setIsVoting] = useState(false);

    const theme = progressiveData.theme || {
        bgGradient: 'from-slate-50 to-white'
    };

    async function handleVote(selectedOptionId: string) {
        if (!championOption || !challengerOption || isVoting) return;
        setIsVoting(true);

        const battleId = `${progressiveData.id}-round-${round}`;
        const opponentId = selectedOptionId === championOption.id ? challengerOption.id : championOption.id;

        try {
            await onVote(battleId, selectedOptionId, opponentId);

            const didChampionWin = selectedOptionId === championOption.id;
            const newWins = didChampionWin ? champWins + 1 : 1;
            const winningOption = didChampionWin ? championOption : challengerOption;

            // Transición automática sin pantallas intermedias
            setTimeout(() => {
                setChampionOption(winningOption);
                setChampWins(newWins);

                if (newWins >= SESSION_GOAL) {
                    setIsCrowned(true);
                    setTimeout(() => onComplete(winningOption), 2000);
                } else {
                    const nextRoundNum = round + 1;
                    setRound(nextRoundNum);

                    // Obtener siguiente retador secuencial evitando colisiones con el campeón
                    let nextCandIndex = nextRoundNum % candidates.length;
                    let iterations = 0;

                    while (
                        candidates[nextCandIndex] &&
                        candidates[nextCandIndex].id === winningOption?.id &&
                        iterations < candidates.length
                    ) {
                        nextCandIndex = (nextCandIndex + 1) % candidates.length;
                        iterations++;
                    }

                    if (candidates[nextCandIndex]) {
                        setChallengerOption(candidates[nextCandIndex]);
                    } else {
                        // Fallback de seguridad
                        setIsCrowned(true);
                        setTimeout(() => onComplete(winningOption), 2000);
                        return;
                    }
                }
                setIsVoting(false);
            }, 600); // 600ms de feedback visual en la tarjeta
        } catch (error) {
            console.error("Error voting:", error);
            setIsVoting(false);
        }
    }

    // Soporte de Teclado
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isVoting || isCrowned || !championOption || !challengerOption) return;
            if (e.key === 'ArrowLeft' || e.key === '1') {
                handleVote(championOption.id);
            } else if (e.key === 'ArrowRight' || e.key === '2') {
                handleVote(challengerOption.id);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isVoting, isCrowned, championOption, challengerOption]);

    if (!candidates || candidates.length < 2) {
        return (
            <div className={`min-h-[40vh] flex flex-col items-center justify-center p-8 rounded-[3rem] bg-gradient-to-b ${theme.bgGradient}`}>
                <p className="text-slate-500 font-bold">No hay suficientes opciones para iniciar este torneo.</p>
                <button onClick={() => window.location.reload()} className="mt-4 text-primary-500 font-bold underline">Reintentar</button>
            </div>
        );
    };

    const handleExit = () => {
        window.history.back();
    };

    const handlePlayAgain = () => {
        setRound(1);
        setChampWins(0);
        setIsCrowned(false);
        setChampionOption(candidates[0]);
        setChallengerOption(candidates[1]);
    };

    if (isCrowned && championOption) {
        return <CrownedWinner champion={championOption} totalRounds={round} onPlayAgain={handlePlayAgain} onExit={handleExit} />;
    }

    return (
        <div className={`w-full max-w-5xl mx-auto p-4 md:p-8 rounded-[2rem] bg-gradient-to-b ${theme.bgGradient} relative min-h-[80vh] flex flex-col`}>
            {/* Instruction + Progress */}
            <div className="mx-auto w-full max-w-3xl text-center">
                <div className="mb-5">
                    <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                        Elige tu preferencia
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Esto calibra tu perfil y mejora tus resultados.
                    </p>
                </div>

                <div className="mx-auto mb-6 w-full max-w-md">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Progreso</span>
                        <span>{round}/{SESSION_GOAL}</span>
                    </div>

                    <div className="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-slate-900/70 transition-all"
                            style={{ width: `${Math.min(100, Math.max(0, ((round - 1) / SESSION_GOAL) * 100))}%` }}
                        />
                    </div>

                    <div className="mt-2 text-xs text-slate-500">
                        Te faltan <span className="font-medium text-slate-700">{Math.max(0, SESSION_GOAL - round + 1)}</span> para completar el torneo.
                    </div>
                </div>
            </div>

            {/* Layout de Batalla (Campeón vs Retador) */}
            <div className="flex-1 mt-4 relative">
                {/* Etiqueta de microcopy */}
                <p className="text-center text-slate-500 font-medium text-sm mb-6">
                    El campeón se queda. El retador cambia. Corónalo en {SESSION_GOAL} victorias.
                    <br /><span className="text-[10px] text-slate-400">Atajos de teclado: Flechas ←/→ o 1/2</span>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    {/* Versus Badge Central */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:flex w-16 h-16 bg-white rounded-full items-center justify-center shadow-xl border-4 border-slate-50">
                        <span className="font-black text-slate-300 italic text-xl">VS</span>
                    </div>

                    {championOption && (
                        <div className="w-full">
                            <ChampionLane
                                option={championOption}
                                wins={champWins}
                                goal={SESSION_GOAL}
                                onClick={() => handleVote(championOption.id)}
                                isVoting={isVoting}
                            />
                        </div>
                    )}

                    {challengerOption && (
                        <div className="w-full">
                            <ChallengerLane
                                option={challengerOption}
                                onClick={() => handleVote(challengerOption.id)}
                                isVoting={isVoting}
                            />
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
