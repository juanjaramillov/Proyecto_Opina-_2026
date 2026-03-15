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
import RequestLoginModal from "../../auth/components/RequestLoginModal";
import { logger } from "../../../lib/logger";

interface VersusViewProps {
    battles: Battle[];
    batchIndex: number;
    onBatchComplete: (history: Array<{ battle: Battle; myVote: 'A' | 'B'; pctA: number; }>) => void;
}

export default function VersusView({ battles, batchIndex, onBatchComplete }: VersusViewProps) {
    const { profile } = useAuth();
    const { signalsToday } = useSignalStore();
    const { showToast } = useToast();

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
            
            showToast("Señal registrada.", "award", 1);
        } catch (err) {
            logger.error("Failed to save vote:", err);
            const errorMessage = err instanceof Error ? err.message : "Desconocido";
            showToast(`Error DB: ${errorMessage}`, "error");
        }
        return {};
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 flex flex-col w-full">
            <div className="card card-pad relative animate-in fade-in duration-500 min-h-[600px] order-1">
                {battlesForQueue.length > 0 ? (
                    <VersusGame
                        key={`versus-${batchIndex}-${versusIndustry}-${selectedSubcategoryId || 'all'}-${filteredVersusBattles.length}`}
                        battles={battlesForQueue}
                        onVote={handleVote}
                        mode="classic"
                        enableAutoAdvance={true}
                        hideProgress={false}
                        isQueueFinite={true}
                        autoNextMs={1800}
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

            <div className="max-w-5xl xl:max-w-6xl mx-auto w-full space-y-4 order-2">
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
