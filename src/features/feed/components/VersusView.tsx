import { useState, useMemo, useEffect } from "react";
import { Battle, BattleOption } from "../../signals/types";
import { PARENT_INDUSTRIES } from "../data/industries";
import { IndustrySelector } from "./IndustrySelector";
import VersusGame from "../../signals/components/VersusGame";
import { signalService } from "../../signals/services/signalService";
import { sessionService } from "../../signals/services/sessionService";
import { useToast } from "../../../components/ui/useToast";
import { useAuth } from "../../auth";
import { useSignalStore } from "../../../store/signalStore";
import { useHubSession } from "../hooks/useHubSession";
import RequestLoginModal from "../../auth/components/RequestLoginModal";
import { logger } from "../../../lib/logger";

interface VersusViewProps {
    battles: Battle[];
    batchIndex: number;
    onBatchComplete: (history: Array<{ battle: Battle; myVote: 'A' | 'B'; pctA: number; }>) => void;
    onBack: () => void;
}

export default function VersusView({ battles, batchIndex, onBatchComplete, onBack }: VersusViewProps) {
    const { profile } = useAuth();
    const { signalsToday } = useSignalStore();
    const { showToast } = useToast();

    const { 
        consumeSessionSignal
    } = useHubSession();

    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [versusIndustry, setVersusIndustry] = useState<string | 'mix'>('mix');
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);

    useEffect(() => {
        const initSession = async () => {
            try {
                await sessionService.startNewSession();
            } catch (err) {
                logger.error("Session init failed:", err);
            }
        };
        initSession();
    }, []);

    const filteredVersusBattles = useMemo(() => {
        if (versusIndustry === 'mix') return battles;
        return battles.filter(b => {
            const categorySlug = typeof b.category === 'object' ? b.category.slug : b.category;
            const parent = PARENT_INDUSTRIES[versusIndustry];
            if (parent) {
                if (selectedSubcategoryId) {
                    const subcat = parent.subcategories.find((s: { id: string, slug: string }) => s.id === selectedSubcategoryId);
                    return subcat ? categorySlug === subcat.slug : false;
                } else {
                    return parent.subcategories.some((sub: { slug: string }) => sub.slug === categorySlug);
                }
            }
            return categorySlug === versusIndustry;
        });
    }, [battles, versusIndustry, selectedSubcategoryId]);

    const battlesForQueue = useMemo(() => {
        if (filteredVersusBattles.length === 0) return [];
        
        const getCat = (b: Battle) => typeof b.category === 'object' ? b.category.slug : b.category;
        const shuffled = [...filteredVersusBattles].sort(() => 0.5 - Math.random());
        const queue: Battle[] = [];
        const seenInQueue = new Set<string>(); // Evitar mostrar la misma marca en este batch

        for (let i = 0; i < 10 && shuffled.length > 0; i++) {
            const lastCat = queue.length > 0 ? getCat(queue[queue.length - 1]) : null;
            
            // 1. Ideal: Distinta categoría (si es mix) y que las marcas no hayan salido en esta tanda
            let idx = shuffled.findIndex(b => {
                const isDiffCat = versusIndustry === 'mix' ? getCat(b) !== lastCat : true;
                const usesNewBrands = !b.options.some((o: BattleOption) => seenInQueue.has(o.label));
                return isDiffCat && usesNewBrands;
            });

            // 2. Fallback: Ignorar regla de categoría (en mix), pero seguir forzando marcas nuevas
            if (idx === -1) {
                idx = shuffled.findIndex(b => !b.options.some((o: BattleOption) => seenInQueue.has(o.label)));
            }

            // 3. Fallback: Ya no quedan batallas sin marcas repetidas. Buscar que la batalla no repita con la *inmediatamente anterior*
            if (idx === -1) {
                idx = shuffled.findIndex(b => {
                    const prevBattle = queue[queue.length - 1];
                    if (!prevBattle) return true;
                    const prevLabels = prevBattle.options.map((o: BattleOption) => o.label);
                    // Ninguna marca de esta batalla debe estar en la anterior
                    return !b.options.some((o: BattleOption) => prevLabels.includes(o.label));
                });
            }

            // 4. Último recurso: Agarrar la primera disponible (ya no hay de otra, son muy pocas marcas en la subcategoría)
            if (idx === -1) {
                idx = 0;
            }

            const selectedBattle = shuffled[idx];
            queue.push(selectedBattle);
            selectedBattle.options.forEach((o: BattleOption) => seenInQueue.add(o.label));
            shuffled.splice(idx, 1);
        }

        return queue;
    }, [filteredVersusBattles, versusIndustry]);

    const handleVote = async (battleId: string, optionId: string, _opponentId: string): Promise<Record<string, number>> => {
        if (profile && profile.signalsDailyLimit !== -1 && signalsToday >= profile.signalsDailyLimit) {
            if (profile.tier === "guest") {
                setIsLoginModalOpen(true);
                showToast("Límite de invitado alcanzado. Verifica tu cuenta para emitir más señales.", "info");
            } else {
                showToast("Has alcanzado tu límite diario de señales. Vuelve mañana (o negocia con el sistema).", "info");
            }
            return {};
        }
        try {
            const b = battles.find(x => x.id === battleId);
            const selected = b?.options.find((o: BattleOption) => o.id === optionId);
            const rejected = b?.options.find((o: BattleOption) => o.id === _opponentId);

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
                await signalService.saveSignalEvent({ 
                    battle_id: battleId, 
                    option_id: optionId
                });
            }
            
            consumeSessionSignal();
            showToast("Señal registrada.", "award", 1);
        } catch (err) {
            logger.error("Failed to save vote:", err);
            const errorMessage = err instanceof Error ? err.message : "Desconocido";
            showToast(`Error DB: ${errorMessage}`, "error");
        }
        return {};
    };

    const isGoldenHour = new Date().getHours() >= 19 && new Date().getHours() <= 22;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 flex flex-col w-full">
            {/* Rompemos el contenedor padre para que el versus sea full-bleed como en el Hub Principal */}
            <div className={`w-[100vw] relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] min-h-[80vh] md:min-h-[85vh] ${isGoldenHour ? 'bg-amber-50/30' : 'bg-slate-50 md:bg-transparent'} flex flex-col animate-in fade-in zoom-in-95 duration-500 order-1 border-y border-slate-100 md:border-none shadow-sm md:shadow-none`}>
                
                {/* STICKY HEADER: Session Progress */}
                <div className={`sticky top-0 z-50 w-full px-4 md:max-w-6xl md:mx-auto py-3 backdrop-blur-xl border-b shadow-sm flex items-center transition-colors duration-1000 ${isGoldenHour ? 'bg-gradient-to-r from-amber-500/90 to-orange-500/90 border-amber-400' : 'bg-white/80 border-slate-200/50'}`}>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={onBack}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90 ${isGoldenHour ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                            title="Volver al menú"
                        >
                            <span className="material-symbols-outlined text-sm font-bold">arrow_back</span>
                        </button>
                        {/* Session Progress details temporarily disabled 
                        <div>
                            <h3 className={`text-xs font-black uppercase tracking-widest flex items-center gap-1 ${isGoldenHour ? 'text-white' : 'text-ink'}`}>
                                Modo Filtrado
                                {isGoldenHour && <span className="bg-white text-orange-600 text-[8px] px-1.5 py-0.5 rounded-sm animate-pulse">x2 PUNTOS</span>}
                            </h3>
                            <p className={`text-[10px] font-bold ${isGoldenHour ? 'text-amber-100' : 'text-slate-500'}`}>
                                {isUnlimited ? "Modo Infinito" : `${sessionSignals} de ${sessionLimit} señales enviadas`}
                                {isGoldenHour && " • Golden Hour 🔥"}
                            </p>
                        </div>
                        */}
                    </div>

                    {/* 
                    {!isUnlimited && (
                        <div className={`w-32 h-2.5 rounded-full overflow-hidden border shadow-inner ${isGoldenHour ? 'bg-amber-900/30 border-amber-400/50' : 'bg-slate-100 border-slate-200'}`}>
                            <div 
                                className={`h-full rounded-full transition-all duration-500 ${isGoldenHour ? 'bg-white shadow-[0_0_10px_white]' : 'bg-gradient-brand'}`}
                                style={{ width: `${sessionProgressPercentage}%` }}
                            />
                        </div>
                    )}
                    */}
                </div>

                {/* MAIN VERSUS CONTAINER */}
                <div className="flex-1 flex flex-col items-center justify-center p-0 md:p-6 w-full max-w-6xl mx-auto">
                    <div className="w-full max-w-4xl bg-white md:bg-transparent md:border-0 md:shadow-none min-h-[600px] flex flex-col relative mx-auto">
                        {battlesForQueue.length > 0 ? (
                            <VersusGame
                                key={`versus-${batchIndex}-${versusIndustry}-${selectedSubcategoryId || 'all'}-${filteredVersusBattles.length}`}
                                battles={battlesForQueue}
                                onVote={handleVote}
                                mode="classic"
                                enableAutoAdvance={true}
                                hideProgress={true}
                                isQueueFinite={true}
                                autoNextMs={4000} // Tiempo estandarizado a 4s para interacción con Insights
                                onQueueComplete={onBatchComplete}
                                isSubmitting={false}
                                theme={{
                                    primary: versusIndustry === 'mix' ? "#2563EB" : (PARENT_INDUSTRIES[versusIndustry]?.theme.primary || "#2563EB"),
                                    accent: "#10B981",
                                    bgGradient: "from-blue-50 to-white",
                                    icon: versusIndustry === 'mix' ? "shuffle" : (PARENT_INDUSTRIES[versusIndustry]?.theme.icon || "query_stats"),
                                }}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[400px]">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100 shadow-sm">
                                    <span className="material-symbols-outlined text-4xl text-slate-300">hourglass_empty</span>
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 mb-2">Aún no hay evaluaciones aquí</h3>
                                <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium">
                                    Estamos preparando nuevas compañías para esta categoría. Si quieres ver evaluaciones ahora, elige otra opción abajo.
                                </p>
                                <button
                                    onClick={() => {
                                        setVersusIndustry('mix');
                                        setSelectedSubcategoryId(null);
                                    }}
                                    className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm"
                                >
                                    Ver todas las industrias
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div id="industry-selector-section" className="max-w-5xl xl:max-w-6xl mx-auto w-full space-y-4 order-2 px-4 md:px-0">
                <IndustrySelector
                    industries={PARENT_INDUSTRIES}
                    selectedParentId={versusIndustry}
                    selectedSubcategoryId={selectedSubcategoryId}
                    onParentChange={(id) => setVersusIndustry(id || 'mix')}
                    onSubcategoryChange={(id) => setSelectedSubcategoryId(id)}
                    title="Filtrar por industria"
                    subtitle={`${filteredVersusBattles.length} evaluaciones encontradas`}
                    hideMixOption={false}
                />
                <p className="text-center text-[10px] text-slate-400 mt-8 font-medium px-4 animate-in fade-in duration-700">
                    Opina+ refleja las preferencias declaradas de sus usuarios activos y no constituye una muestra estadística representativa de la población general.
                </p>
            </div>

            <RequestLoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onSuccess={() => {
                    setIsLoginModalOpen(false);
                    showToast("Verificación exitosa. Tu límite subió.", "success");
                }}
            />
        </div>
    );
}
