import { useState, useMemo } from "react";
import { Battle } from "../../signals/types";
import { PARENT_INDUSTRIES } from "../data/industries";
import { IndustrySelector } from "./IndustrySelector";
import TorneoRunner from "../../signals/components/TorneoRunner";
import { signalService } from "../../signals/services/signalService";
import { useToast } from "../../../components/ui/useToast";
import { logger } from '../../../lib/logger';

interface TorneoViewProps {
    battles: Battle[];
}

export default function TorneoView({ battles }: TorneoViewProps) {
    const { showToast } = useToast();
    const [selectedTheme, setSelectedTheme] = useState<string | 'mix'>('mix');
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
    const [progressiveRefreshKey, setProgressiveRefreshKey] = useState(() => Math.floor(Math.random() * 1000));

    const progressiveData = useMemo(() => {
        let validBattles = (battles || []).filter(b => {
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


    return (
        <div className="space-y-8 flex flex-col animate-in fade-in duration-500 w-full">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-4 md:p-8 min-h-[600px] relative overflow-hidden order-1">
                <div className="absolute inset-0 pointer-events-none opacity-30">
                    <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br transition-all duration-700 ${selectedTheme !== 'mix' ? PARENT_INDUSTRIES[selectedTheme]?.theme?.bgGradient : 'from-blue-50 to-white'} rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`} />
                </div>

                <TorneoRunner
                    progressiveData={progressiveData}
                    onVote={async (battle_id: string, option_id: string, opponentId: string, metadata?: Record<string, any>) => {
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
                                    stage: metadata?.round || 1,
                                });
                            } else {
                                await signalService.saveSignalEvent({
                                    battle_id,
                                    option_id,
                                    meta: { opponent_id: opponentId, mode: 'torneo', ...metadata }
                                });
                            }

                            await new Promise(r => setTimeout(r, 400));
                            showToast("Decisión confirmada. Nueva opción en camino.", "success");
                            return {};
                        } catch (err) {
                            logger.error("Error votando en progresivo", { domain: 'signal_write', origin: 'TorneoView', action: 'progressive_vote', state: 'failed' }, err);
                            showToast("No se pudo registrar tu señal. Intenta de nuevo.", "error");
                            throw err;
                        }
                    }}
                    onPlayAgain={() => setProgressiveRefreshKey(k => k + 1)}
                />
            </div>

            <div className="max-w-5xl xl:max-w-6xl mx-auto w-full space-y-4 order-2">
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
