import { useState, useMemo, useRef, useEffect } from "react";
import { Battle } from "../../signals/types";
import { PARENT_INDUSTRIES } from "../data/industries";
import { IndustrySelector } from "./IndustrySelector";
import TorneoRunner from "../../signals/components/TorneoRunner";
import { signalService } from "../../signals/services/signalService";
import { useToast } from "../../../components/ui/useToast";
import { useHubSession } from "../hooks/useHubSession";
import { logger } from '../../../lib/logger';

interface TorneoViewProps {
    battles: Battle[];
    onBack: () => void;
}

export default function TorneoView({ battles, onBack }: TorneoViewProps) {
    const { showToast } = useToast();
    const { 
        consumeSessionSignal
    } = useHubSession();

    const [selectedTheme, setSelectedTheme] = useState<string | 'mix'>('mix');
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
    const [progressiveRefreshKey, setProgressiveRefreshKey] = useState(() => Math.floor(Math.random() * 1000));
    const sequenceIdRef = useRef<string>(crypto.randomUUID());

    useEffect(() => {
        sequenceIdRef.current = crypto.randomUUID();
    }, [progressiveRefreshKey]);

    const progressiveData = useMemo(() => {
        const validMappedBattles = battles.map(b => ({
            ...b,
            options: b.options.filter(o => o.is_active_torneo !== false)
        })).filter(b => b.options.length >= 2);

        let validBattles = validMappedBattles.filter(b => {
            const slug = (b.category as { slug?: string })?.slug || b.industry;
            return slug !== 'vida_diaria';
        });
        let idVal = 'mix';
        let titleVal = 'Torneo Global';
        let subtitleVal = 'Una subcategoría aleatoria.';
        let themeVal = {
            primary: "#2563EB",
            accent: "#10B981",
            bgGradient: "from-blue-50 to-white",
            icon: "shuffle"
        };

        if (selectedTheme !== 'mix') {
            const t = PARENT_INDUSTRIES[selectedTheme];
            if (t) {
                const targetSlugs = selectedSubcategoryId
                    ? [t.subcategories.find((s: { id: string, slug: string }) => s.id === selectedSubcategoryId)?.slug]
                    : t.subcategories.map((s: { slug: string }) => s.slug);

                validBattles = validBattles.filter((b) => {
                    const catSlug = (b.category as { slug?: string })?.slug;
                    return targetSlugs.includes(catSlug) || targetSlugs.includes(b.industry);
                });

                idVal = t.id;
                titleVal = t.title;
                subtitleVal = t.subtitle;
                themeVal = t.theme;
            }
        }

        const uniqueSubcategories = Array.from(new Set(validBattles.map(b => (b.category as { slug?: string })?.slug || b.industry))).filter(Boolean) as string[];

        let subcatsWithEnoughCandidates = uniqueSubcategories.filter(slug => {
            const slugBattles = validBattles.filter(b => ((b.category as { slug?: string })?.slug || b.industry) === slug);
            const candidatesCount = new Set(slugBattles.flatMap((b) => b.options || []).map(o => o?.label?.trim().toLowerCase())).size;
            return candidatesCount >= 4; 
        });

        if (subcatsWithEnoughCandidates.length === 0) {
            subcatsWithEnoughCandidates = uniqueSubcategories;
        }

        if (subcatsWithEnoughCandidates.length > 0) {
            const pickedIndex = progressiveRefreshKey % subcatsWithEnoughCandidates.length;
            const chosenSubcategorySlug = subcatsWithEnoughCandidates[pickedIndex];

            validBattles = validBattles.filter(b => {
                const currentSlug = (b.category as { slug?: string })?.slug || b.industry;
                return currentSlug === chosenSubcategorySlug;
            });

            if (selectedTheme === 'mix' && chosenSubcategorySlug) {
                subtitleVal = `Torneo enfocado en: ${chosenSubcategorySlug.replace(/_/g, ' ')}.`;
            }
        }

        const shuffledBattles = [...validBattles].sort(() => Math.random() - 0.5);

        return {
            id: idVal,
            title: titleVal,
            subtitle: subtitleVal,
            industry: shuffledBattles.length > 0 ? ((shuffledBattles[0]?.category as { slug?: string })?.slug || shuffledBattles[0]?.industry || 'mix') : 'mix',
            theme: themeVal,
            candidates: shuffledBattles
                .flatMap((b) => b.options || [])
                .filter((v, i, a) => a.findIndex((o) => o?.label?.trim().toLowerCase() === v?.label?.trim().toLowerCase()) === i)
                .map(opt => ({
                    ...opt,
                    type: 'brand' as const,
                    imageFit: 'contain' as const
                }))
                .slice(0, 11),
        };
    }, [battles, selectedTheme, selectedSubcategoryId, progressiveRefreshKey]);


    const isGoldenHour = new Date().getHours() >= 19 && new Date().getHours() <= 22;

    return (
        <div className="space-y-8 flex flex-col animate-in fade-in duration-500 w-full">
            <div className={`w-[100vw] relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] min-h-[80vh] md:min-h-[85vh] ${isGoldenHour ? 'bg-amber-50/30' : 'bg-slate-50 md:bg-transparent'} flex flex-col animate-in fade-in zoom-in-95 duration-500 order-1 border-y border-slate-100 md:border-none shadow-sm md:shadow-none overflow-hidden`}>
                
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
                                Torneo Progresivo
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

                <div className="flex-1 flex flex-col items-center justify-center p-0 md:p-6 w-full max-w-6xl mx-auto">
                    <div className="w-full max-w-4xl bg-white md:bg-transparent md:border-0 md:shadow-none min-h-[600px] flex flex-col relative mx-auto">
                        <div className="absolute inset-0 pointer-events-none opacity-30">
                            <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br transition-all duration-700 ${selectedTheme !== 'mix' ? PARENT_INDUSTRIES[selectedTheme]?.theme?.bgGradient : 'from-blue-50 to-white'} rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`} />
                        </div>

                        <TorneoRunner
                            progressiveData={progressiveData}
                            onVote={async (battle_id, option_id, opponentId, metadata) => {
                                try {
                                    const selected = progressiveData?.candidates?.find(o => o.id === option_id);
                                    const rejected = progressiveData?.candidates?.find(o => o.id === opponentId);

                                    if (selected && rejected && progressiveData) {
                                        await signalService.saveTorneoSignal({
                                            battle_uuid: battle_id,
                                            battle_id: battle_id,
                                            instance_id: progressiveData.id || battle_id,
                                            title: progressiveData.title,
                                            selected_option_id: selected.id,
                                            loser_option_id: rejected.id,
                                            selected_option_name: selected.label,
                                            loser_option_name: rejected.label,
                                            subcategory: progressiveData.industry,
                                            stage: (metadata?.round as number) || 1,
                                            response_time_ms: metadata?.responseTimeMs as number | undefined,
                                            left_entity_id: metadata?.leftOptionId as string | undefined,
                                            right_entity_id: metadata?.rightOptionId as string | undefined,
                                            sequence_id: sequenceIdRef.current,
                                            sequence_order: (metadata?.round as number) || 1
                                        });
                                    } else {
                                        await signalService.saveSignalEvent({
                                            battle_id,
                                            option_id,
                                            sequence_id: sequenceIdRef.current,
                                            sequence_order: (metadata?.round as number) || 1,
                                            meta: { opponent_id: opponentId, mode: 'torneo', ...metadata }
                                        });
                                    }

                                    consumeSessionSignal();
                                    await new Promise(r => setTimeout(r, 400));
                                    showToast("Decisión confirmada. Nueva opción en camino.", "success");
                                } catch (err) {
                                    logger.error("Error votando en progresivo", { domain: 'signal_write', origin: 'TorneoView', action: 'progressive_vote', state: 'failed' }, err);
                                    showToast("No se pudo registrar tu señal. Intenta de nuevo.", "error");
                                    throw err;
                                }
                            }}
                            onPlayAgain={() => setProgressiveRefreshKey(k => k + 1)}
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-5xl xl:max-w-6xl mx-auto w-full space-y-4 order-2 px-4 md:px-0">
                <IndustrySelector
                    industries={Object.fromEntries(Object.entries(PARENT_INDUSTRIES).filter(([k]) => k !== 'vida_diaria'))}
                    selectedParentId={selectedTheme}
                    selectedSubcategoryId={selectedSubcategoryId}
                    onParentChange={(id) => {
                        setSelectedTheme(id || 'mix');
                        setSelectedSubcategoryId(null);
                        setProgressiveRefreshKey(Math.floor(Math.random() * 1000));
                    }}
                    onSubcategoryChange={(id) => setSelectedSubcategoryId(id)}
                    title="Elige tu Torneo"
                    subtitle={selectedTheme !== 'mix'
                        ? "Torneo enfocado en esta categoría."
                        : "Enfrenta marcas cara a cara hasta encontrar tu favorita."
                    }
                    hideMixOption={false}
                />
            </div>
        </div>
    );
}
