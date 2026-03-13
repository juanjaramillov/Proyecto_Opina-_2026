import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Battle, BattleOption } from "../../signals/types";
import { PARENT_INDUSTRIES } from "../data/industries";
import { IndustrySelector } from "./IndustrySelector";
import { ProfundidadSelector } from "../../signals/components/ProfundidadSelector";
import InsightPack from "../../signals/components/InsightPack";

interface ProfundidadViewProps {
    battles: Battle[];
    onClose: () => void;
}

export default function ProfundidadView({ battles, onClose }: ProfundidadViewProps) {
    const navigate = useNavigate();
    const [selectedTheme, setSelectedTheme] = useState<string | 'mix'>('mix');
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
    const [selectedOption, setSelectedOption] = useState<BattleOption | null>(null);

    return (
        <div className="space-y-12 animate-in fade-in duration-500 w-full">
            <div className="max-w-5xl xl:max-w-6xl mx-auto space-y-6">
                <IndustrySelector
                    industries={PARENT_INDUSTRIES}
                    selectedParentId={selectedTheme}
                    selectedSubcategoryId={selectedSubcategoryId}
                    onParentChange={(id) => {
                        setSelectedTheme(id || 'mix');
                        setSelectedSubcategoryId(null);
                    }}
                    onSubcategoryChange={(id) => setSelectedSubcategoryId(id)}
                    title="Elige tu Torneo"
                    subtitle={selectedTheme !== 'mix'
                        ? "Puedes cambiar de categoría en cualquier momento."
                        : "Entra a profundidad con las encuestas de cada marca."
                    }
                    hideMixOption={true}
                />
            </div>

            {selectedTheme && selectedTheme !== 'mix' ? (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-4 md:p-8 min-h-[600px] relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none opacity-30">
                        <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br transition-all duration-700 ${PARENT_INDUSTRIES[selectedTheme].theme.bgGradient} rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`} />
                    </div>
                    <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-primary/10 p-4 md:p-8 animate-fade-in relative z-10">
                        <ProfundidadSelector
                            options={(battles || [])
                                .filter((b) => {
                                    const parent = PARENT_INDUSTRIES[selectedTheme];
                                    if (!parent) return false;
                                    const targetSlugs = selectedSubcategoryId
                                        ? [parent.subcategories.find((s: { id: string, slug: string }) => s.id === selectedSubcategoryId)?.slug]
                                        : parent.subcategories.map((s: { slug: string }) => s.slug);

                                    const catSlug = (b.category as { slug?: string })?.slug;
                                    return targetSlugs.includes(catSlug) || targetSlugs.includes(b.industry);
                                })
                                .flatMap((b) => (b.options || []).map(opt => ({
                                    ...opt,
                                    category: b.category,
                                    battleSlug: b.slug,
                                    battleTitle: b.title
                                })))
                                .filter((v, i, a) => a.findIndex((o) => o.label.trim().toLowerCase() === v.label.trim().toLowerCase()) === i)}
                            onSelect={(option) => {
                                navigate(`/versus/${option.battleSlug}`, { state: { targetOptionId: option.id, startInDepth: true } });
                            }}
                        />
                    </div>
                </div>
            ) : (
                <div className="bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200 p-12 text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <span className="material-symbols-outlined text-3xl text-slate-300">layers</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900">Selecciona un canal para profundizar</h3>
                    <p className="text-slate-500 font-medium mt-2">Descubre las encuestas detalladas de cada marca en tu categoría deseada.</p>
                </div>
            )}

            {selectedOption && (
                <InsightPack
                    optionId={selectedOption.id}
                    optionLabel={selectedOption.label}
                    categorySlug={(selectedOption as any).category}
                    onComplete={() => {
                        setSelectedOption(null);
                        onClose();
                    }}
                    onCancel={() => setSelectedOption(null)}
                />
            )}
        </div>
    );
}
