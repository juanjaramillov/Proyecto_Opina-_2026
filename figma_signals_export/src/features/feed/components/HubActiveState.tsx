import { useMemo } from 'react';

import { Battle, BattleOption } from '../../signals/types';
import VersusGame from '../../signals/components/VersusGame';
import { useHubSession } from '../hooks/useHubSession';
import { signalService } from '../../signals/services/signalService';
import { useToast } from '../../../components/ui/useToast';
import { logger } from '../../../lib/logger';

interface HubActiveStateProps {
    battles: Battle[];
    onBatchComplete: (history: Array<{ battle: Battle; mySignal: 'A' | 'B'; pctA: number; }>) => void;
}

export default function HubActiveState({ battles, onBatchComplete }: HubActiveStateProps) {
    const { 
        consumeSessionSignal
    } = useHubSession();
    
    const { showToast } = useToast();

    // Priorizar batallas inteligentes (Weighted Shuffle)
    const battlesForQueue = useMemo(() => {
        if (!battles || battles.length === 0) return [];
        
        // Algoritmo de Matching: 60% Tensión/Relevancia, 30% Aleatoriedad (Novedad)
        // Simulamos la "Tensión" usando isHighSignal o añadiendo entropía
        const weighted = [...battles].sort((a, b) => {
            const scoreA = (a.isHighSignal ? 2 : 1) * Math.random();
            const scoreB = (b.isHighSignal ? 2 : 1) * Math.random();
            return scoreB - scoreA;
        });

        // En una sesión real podríamos asegurar que no se repitan marcas.
        return weighted.slice(0, 15);
    }, [battles]);

    const handleVote = async (battleId: string, optionId: string, opponentId: string, meta?: { responseTimeMs?: number }) => {
        try {
            const b = battlesForQueue.find(x => x.id === battleId);
            const selected = b?.options.find((o: BattleOption) => o.id === optionId);
            const rejected = b?.options.find((o: BattleOption) => o.id === opponentId);

            if (b && selected && rejected) {
                await signalService.saveVersusSignal({
                    battle_uuid: battleId,
                    battle_id: b.slug || b.id,
                    battle_title: b.title,
                    selected_option_id: selected.id,
                    loser_option_id: rejected.id,
                    selected_option_name: selected.label,
                    loser_option_name: rejected.label,
                    subcategory: typeof b.category === 'object' ? b.category.slug : b.category || b.industry,
                    left_entity_id: b.options[0]?.id,
                    right_entity_id: b.options[1]?.id,
                    response_time_ms: meta?.responseTimeMs
                });
            } else {
                await signalService.saveSignalEvent({ 
                    battle_id: battleId, 
                    option_id: optionId,
                    response_time_ms: meta?.responseTimeMs,
                    left_entity_id: b?.options[0]?.id,
                    right_entity_id: b?.options[1]?.id,
                });
            }
            
            // Consumir señal en la sesión local
            consumeSessionSignal();

        } catch (err) {
            logger.error("Failed to save vote:", err);
            showToast("Error de conexión al guardar la señal", "error");
        }
        return {};
    };

    if (battlesForQueue.length === 0) {
        return (
            <div className="w-full flex items-center justify-center p-12 min-h-[400px] animate-in fade-in duration-500">
                <div className="text-center flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-blue-50/50 border border-blue-100 flex items-center justify-center mb-6 relative">
                        <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-ping opacity-75"></div>
                        <span className="material-symbols-outlined text-4xl text-blue-500 animate-spin-slow relative z-10">radar</span>
                    </div>
                    <p className="text-slate-700 font-black text-xl mb-1">Buscando señales</p>
                    <p className="text-slate-400 text-sm font-medium">Sintonizando la red comunitaria...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col relative animate-in fade-in zoom-in-95 duration-500">
            {/* Contenido principal sobre el fondo */}
            <div className="relative z-10 flex-1 flex flex-col w-full h-full">



                {/* MAIN VERSUS CONTAINER */}
                <div className="flex-1 flex flex-col items-center justify-start p-0">
                    
                    {/* CUADRANTE VERSUS */}
                    <div className="w-full max-w-xl md:max-w-2xl flex flex-col relative shrink-0 px-2 sm:px-4 md:px-0">
                        {/* Contenedor Físico del Juego sin cabecera extra */}
                        <div className="w-full min-h-[300px] md:min-h-[350px] flex flex-col relative">
                            {/* VERSUS GAME COMPONENT */}
                            <div className="flex-1 w-full relative pt-2">
                                <VersusGame
                                    key="hub-active-versus"
                                    battles={battlesForQueue}
                                    onVote={handleVote}
                                    mode="classic"
                                    enableAutoAdvance={true}
                                    hideProgress={true}
                                    isQueueFinite={true}
                                    autoNextMs={2000} // Speed up advance from 4s to 2s to improve load perception
                                    onQueueComplete={onBatchComplete}
                                    isSubmitting={false}
                                    showExploreCTA={true}
                                    theme={{
                                        primary: "#2563EB",
                                        accent: "#10B981",
                                        bgGradient: "from-transparent to-transparent", // El card ya provee fondo
                                        icon: "bolt",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Fin contenedor main versus */}

            <style>{`
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translateY(-10px); }
                    10% { opacity: 1; transform: translateY(0); }
                    80% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(-10px); }
                }
            `}</style>
        </div>
    );
}
