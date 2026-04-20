import { useState } from "react";
import { Battle, BattleOption } from "../../signals/types";
import { PARENT_INDUSTRIES } from "../data/industries";
import { IndustrySelector } from "./IndustrySelector";
import { ProfundidadSelector } from "../../signals/components/ProfundidadSelector";
import InsightPack from "../../signals/components/InsightPack";
import { useHubSession } from "../hooks/useHubSession";

interface ProfundidadViewProps {
    battles: Battle[];
    onClose: () => void;
}

export default function ProfundidadView({ battles, onClose }: ProfundidadViewProps) {
    const [selectedTheme, setSelectedTheme] = useState<string | 'mix'>('mix');
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
    const [selectedOption, setSelectedOption] = useState<BattleOption | null>(null);
    const { sessionProgressPercentage: sessionProgress } = useHubSession();

    return (
        <div className="flex flex-col min-h-[100dvh] w-full bg-slate-50 relative isolate -mt-4 md:-mt-8">
            {/* Sticky Session Header */}
            <div className="sticky top-[60px] md:top-[80px] z-50 bg-slate-50/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm w-full mx-auto px-4 md:px-6 py-3 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-sky-600 text-[18px]">psychology</span>
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-900 leading-tight">Profundidad</h2>
                            <p className="text-[10px] text-slate-500 font-medium">Análisis Detallado</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sesión Actual</span>
                        <span className="text-xs font-black text-sky-600">{sessionProgress}% completado</span>
                    </div>
                    {/* Golden Hour Indicator (Optional/Demo) */}
                    <div className="h-8 px-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center gap-1.5 shadow-sm border border-orange-400">
                        <span className="material-symbols-outlined text-white text-[14px]">local_fire_department</span>
                        <span className="text-xs font-bold text-white">x2</span>
                    </div>
                </div>
            </div>

            {/* Session Progress Bar */}
            <div className="sticky top-[116px] md:top-[136px] left-0 w-full h-1 bg-slate-100 z-50">
                <div 
                    className="h-full bg-gradient-to-r from-sky-400 to-sky-600 transition-all duration-300 ease-out"
                    style={{ width: `${sessionProgress}%` }}
                />
            </div>

            <div className="flex-1 w-full max-w-5xl xl:max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-12 animate-in fade-in duration-500">
                <div className="space-y-6">
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
                        : "Entra a profundidad con el análisis de cada marca."
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

                                    const cat = b.category as { slug?: string } | string | undefined;
                                    const catSlug = typeof cat === 'object' ? cat?.slug : cat;
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
                                setSelectedOption(option as unknown as BattleOption);
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
                    <p className="text-slate-500 font-medium mt-2">Descubre el análisis detallado de cada marca en tu categoría deseada.</p>
                </div>
            )}

            {selectedOption && (
                <InsightPack
                    optionId={selectedOption.id}
                    optionLabel={selectedOption.label}
                    categorySlug={typeof selectedOption.category === 'object' ? (selectedOption.category as { slug?: string })?.slug : selectedOption.category}
                    onComplete={() => {
                        setSelectedOption(null);
                        onClose();
                    }}
                    onCancel={() => setSelectedOption(null)}
                />
            )}

            <p className="text-center text-[10px] text-slate-400 mt-8 font-medium px-4 max-w-2xl mx-auto">
                Opina+ refleja las preferencias declaradas de sus usuarios activos y no constituye una muestra estadística representativa de la población general.
            </p>
            </div>
        </div>
    );
}
