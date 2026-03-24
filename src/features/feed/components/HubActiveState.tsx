import { useMemo } from 'react';

import { Battle, BattleOption } from '../../signals/types';
import VersusGame from '../../signals/components/VersusGame';
import { useHubSession } from '../hooks/useHubSession';
import { signalService } from '../../signals/services/signalService';
import { useToast } from '../../../components/ui/useToast';
import { logger } from '../../../lib/logger';

interface HubActiveStateProps {
    battles: Battle[];
    onBatchComplete: (history: Array<{ battle: Battle; myVote: 'A' | 'B'; pctA: number; }>) => void;
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

    const handleVote = async (battleId: string, optionId: string, opponentId: string) => {
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
                });
            } else {
                await signalService.saveSignalEvent({ battle_id: battleId, option_id: optionId });
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
            <div className="w-full flex items-center justify-center p-12 min-h-[400px]">
                <div className="text-center">
                    <span className="material-symbols-outlined text-4xl text-slate-400 animate-spin-slow">sync</span>
                    <p className="text-slate-600 font-medium mt-4">Actualizando radar de señales...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col relative animate-in fade-in zoom-in-95 duration-500">
            {/* Contenido principal sobre el fondo */}
            <div className="relative z-10 flex-1 flex flex-col w-full h-full">

                {/* STICKY HEADER: Floating Session Pill (Temporarily disabled as requested) */}
                {/* 
                <div className="sticky top-2 md:top-4 z-50 w-full px-2 md:px-4 flex justify-center pointer-events-none transition-all duration-1000">
                    <div className={`pointer-events-auto px-4 py-1.5 md:py-2 rounded-full backdrop-blur-xl transform-gpu border shadow-lg flex items-center gap-3 sm:gap-4 transition-colors duration-1000 ${isGoldenHour ? 'bg-amber-500/90 border-amber-400' : 'bg-white/95 border-slate-200/50'}`}>
                        <div className="flex items-center gap-2">
                            <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center shrink-0 ${isGoldenHour ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>
                                <span className="material-symbols-outlined text-[10px] md:text-[11px] font-bold animate-[spin_4s_linear_infinite]">radar</span>
                            </div>
                            <div className="flex flex-col justify-center">
                                <h3 className={`text-[10px] md:text-[11px] font-black uppercase tracking-wider flex items-center gap-1 leading-none ${isGoldenHour ? 'text-white' : 'text-slate-800'}`}>
                                    En Misión 
                                    {isGoldenHour && <span className="bg-white text-orange-600 text-[9px] px-1 py-0.5 rounded border border-orange-200 animate-pulse ml-0.5">x2 PUNTOS</span>}
                                </h3>
                                <p className={`text-[9px] md:text-[10px] font-bold mt-1 leading-none ${isGoldenHour ? 'text-amber-100' : 'text-slate-600'}`}>
                                    {isUnlimited ? "Modo Infinito" : `${sessionSignals} de ${sessionLimit} señales`}
                                </p>
                            </div>
                        </div>

                        {!isUnlimited && (
                            <div className={`w-16 sm:w-24 h-1.5 md:h-2 rounded-full overflow-hidden border shadow-inner shrink-0 ${isGoldenHour ? 'bg-amber-900/30 border-amber-400/50' : 'bg-slate-100 border-slate-200'}`}>
                                <div 
                                    className={`h-full rounded-full transition-all duration-500 ${isGoldenHour ? 'bg-white shadow-[0_0_10px_white]' : 'bg-gradient-brand'}`}
                                    style={{ width: `${sessionProgressPercentage}%` }}
                                />
                            </div>
                        )}
                    </div>
                </div>
                */}

                {/* MAIN VERSUS CONTAINER */}
                <div className="flex-1 flex flex-col items-center justify-start p-0">
                    
                    {/* CUADRANTE VERSUS */}
                    <div className="w-full max-w-4xl flex flex-col relative shrink-0 px-2 sm:px-4 md:px-0">
                        
                        {/* Header del Cuadrante */}
                        <div className="flex flex-row items-center justify-between mb-3 md:mb-4 px-2 md:px-6">
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 md:w-8 md:h-8 rounded-[10px] bg-gradient-to-br from-primary to-emerald-500 text-white flex items-center justify-center shadow-md shadow-primary/20">
                                    <span className="material-symbols-outlined text-sm md:text-base">bolt</span>
                                </div>
                                <h2 className="text-base md:text-xl font-black text-slate-800 tracking-tight">Versus rápido</h2>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-[pulse_2s_ease-in-out_infinite]"></span>
                                <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-slate-500">En Vivo</span>
                            </div>
                        </div>

                        {/* Contenedor Físico del Juego */}
                        <div className="bg-white rounded-[32px] md:rounded-[40px] shadow-sm shadow-slate-200/50 border border-slate-200/60 w-full min-h-[400px] md:min-h-[450px] flex flex-col relative overflow-hidden">
                            {/* Brillo Superior Sutil */}
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />
                            
                            
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
                                    autoNextMs={4000} // Tiempo estandarizado a 4s para permitir interacción con Insights
                                    onQueueComplete={onBatchComplete}
                                    isSubmitting={false}
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
