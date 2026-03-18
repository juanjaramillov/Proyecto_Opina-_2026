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
        sessionSignals, 
        sessionLimit, 
        sessionProgressPercentage, 
        consumeSessionSignal,
        isUnlimited
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
                    <span className="material-symbols-outlined text-4xl text-slate-300 animate-spin-slow">sync</span>
                    <p className="text-slate-500 font-medium mt-4">Actualizando radar de señales...</p>
                </div>
            </div>
        );
    }

    const isGoldenHour = new Date().getHours() >= 19 && new Date().getHours() <= 22; // Hardcodeado ampliado para demos

    return (
        <div className={`w-full min-h-[80vh] md:min-h-[85vh] ${isGoldenHour ? 'bg-amber-50/30' : 'bg-slate-50 md:bg-transparent'} flex flex-col relative animate-in fade-in zoom-in-95 duration-500`}>
            
            {/* STICKY HEADER: Session Progress */}
            <div className={`sticky top-0 z-50 w-full px-4 py-3 backdrop-blur-xl border-b shadow-sm flex items-center justify-between transition-colors duration-1000 ${isGoldenHour ? 'bg-gradient-to-r from-amber-500/90 to-orange-500/90 border-amber-400' : 'bg-white/80 border-slate-200/50'}`}>
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isGoldenHour ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>
                        <span className="material-symbols-outlined text-sm font-bold">radar</span>
                    </div>
                    <div>
                        <h3 className={`text-xs font-black uppercase tracking-widest flex items-center gap-1 ${isGoldenHour ? 'text-white' : 'text-ink'}`}>
                            En Misión 
                            {isGoldenHour && <span className="bg-white text-orange-600 text-[8px] px-1.5 py-0.5 rounded-sm animate-pulse">x2 PUNTOS</span>}
                        </h3>
                        <p className={`text-[10px] font-bold ${isGoldenHour ? 'text-amber-100' : 'text-slate-500'}`}>
                            {isUnlimited ? "Modo Infinito" : `${sessionSignals} de ${sessionLimit} señales enviadas`}
                            {isGoldenHour && " • Golden Hour 🔥"}
                        </p>
                    </div>
                </div>

                {!isUnlimited && (
                    <div className={`w-32 h-2.5 rounded-full overflow-hidden border shadow-inner ${isGoldenHour ? 'bg-amber-900/30 border-amber-400/50' : 'bg-slate-100 border-slate-200'}`}>
                        <div 
                            className={`h-full rounded-full transition-all duration-500 ${isGoldenHour ? 'bg-white shadow-[0_0_10px_white]' : 'bg-gradient-brand'}`}
                            style={{ width: `${sessionProgressPercentage}%` }}
                        />
                    </div>
                )}
            </div>

            {/* MAIN VERSUS CONTAINER */}
            <div className="flex-1 flex flex-col items-center justify-center p-0 md:p-6">
                <div className="w-full max-w-4xl bg-white md:bg-transparent md:border-0 md:shadow-none min-h-[600px] flex flex-col relative">
                    
                    {/* Micro Contexto Overlay (Opcional, se puede hacer dinámico basado en la batalla actual) */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
                        <div className="bg-ink/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-ink-600 text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2 shadow-lg opacity-0 animate-[fadeInOut_4s_ease-in-out_forwards] delay-1000">
                            <span className="material-symbols-outlined text-[14px] text-emerald-400">info</span>
                            Tendencia en alza
                        </div>
                    </div>

                    <VersusGame
                        key="hub-active-versus"
                        battles={battlesForQueue}
                        onVote={handleVote}
                        mode="classic"
                        enableAutoAdvance={true}
                        hideProgress={true} // Ocultamos el viejo progress bar porque tenemos el nuevo sticky
                        isQueueFinite={true}
                        autoNextMs={400} // Anti-spam y feedback ultrarrápido (350-400ms)
                        onQueueComplete={onBatchComplete}
                        isSubmitting={false}
                        theme={{
                            primary: "#2563EB",
                            accent: "#10B981",
                            bgGradient: "from-blue-50 to-white",
                            icon: "bolt",
                        }}
                    />
                </div>
            </div>

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
