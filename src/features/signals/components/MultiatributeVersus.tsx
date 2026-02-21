import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VersusGame from './VersusGame';
import { sessionService, UserSession } from '../services/sessionService';
import { signalService } from '../services/signalService';
import { Battle, BattleOption, VoteResult } from '../types';

import { MASTER_CLINICS } from '../config/clinics';

interface Attribute {
    id: string;
    slug: string;
    name: string;
}

interface MultiatributeVersusProps {
    session: UserSession;
    allAttributes: Attribute[];
    onComplete: (dominantClinicId: string) => void;
}

export default function MultiatributeVersus({ session, allAttributes, onComplete }: MultiatributeVersusProps) {
    const [currentAttrIndex, setCurrentAttrIndex] = useState(0);
    const [roundsCount, setRoundsCount] = useState(0);
    const [candidates, setCandidates] = useState<BattleOption[]>([]);
    const [attributeCompleted, setAttributeCompleted] = useState(false);

    const currentAttributeId = session.attributes_shown[currentAttrIndex];
    const attributeInfo = allAttributes.find(a => a.id === currentAttributeId);

    // Initial candidates for a new attribute
    useEffect(() => {
        if (!attributeCompleted) {
            const shuffled = [...MASTER_CLINICS].sort(() => 0.5 - Math.random());
            setCandidates(shuffled.slice(0, 2));
            setRoundsCount(0);
        }
    }, [currentAttrIndex, attributeCompleted]);

    const handleVote = async (battleId: string, optionId: string, _opponentId: string): Promise<VoteResult> => {
        // 1. Save Signal with session context
        await signalService.saveSignalEvent({
            battle_id: battleId,
            option_id: optionId,
            session_id: session.id,
            attribute_id: currentAttributeId
        });

        const winner = candidates.find(c => c.id === optionId)!;

        if (roundsCount < 2) { // Round 0, 1 -> next is Round 1, 2 (Total 3 rounds)
            // King of the Hill: Winner stays, find new challenger
            const newChallenger = MASTER_CLINICS.find(c =>
                c.id !== winner.id &&
                !candidates.some(can => can.id === c.id)
            ) || MASTER_CLINICS.find(c => c.id !== winner.id)!;

            setCandidates([winner, newChallenger]);
            setRoundsCount(prev => prev + 1);
        } else {
            // Attribute finished
            await sessionService.completeAttribute(session.id, currentAttributeId);

            if (currentAttrIndex < session.attributes_shown.length - 1) {
                // Move to next attribute with subtle transition
                setAttributeCompleted(true);
                setTimeout(() => {
                    setCurrentAttrIndex(prev => prev + 1);
                    setAttributeCompleted(false);
                }, 1000);
            } else {
                // Session finished
                const winnerId = await sessionService.finalizeAttributes(session.id);
                onComplete(winnerId || winner.id);
            }
        }

        return {};
    };

    const dummyBattle: Battle = {
        id: `attr-battle-${currentAttributeId}`,
        title: attributeInfo?.name || 'Comparando Clínicas',
        subtitle: `Atributo: ${attributeInfo?.name || '...'}`,
        options: candidates,
        category: 'salud'
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
                {!attributeCompleted ? (
                    <motion.div
                        key={currentAttributeId}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <div className="text-center space-y-2">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-primary/60">
                                Clínicas Privadas Santiago
                            </h2>
                            <h1 className="text-4xl font-black text-ink">
                                ¿Cuál te inspira más <span className="text-primary">{attributeInfo?.name}</span>?
                            </h1>
                        </div>

                        <VersusGame
                            battles={[dummyBattle]}
                            onVote={handleVote}
                            mode="classic"
                            hideProgress
                            enableAutoAdvance={false} // We handle progression manually for King of the Hill
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="transition"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-20 text-center"
                    >
                        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-lg text-text-secondary font-medium">
                            Siguiente atributo: <span className="text-ink font-bold">
                                {allAttributes.find(a => a.id === session.attributes_shown[currentAttrIndex + 1])?.name}
                            </span>
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
