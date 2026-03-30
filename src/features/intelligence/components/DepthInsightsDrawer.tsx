import { useState, lazy, Suspense } from 'react';
import { X, MonitorPlay, Settings2, Database } from "lucide-react";
import { TrendingItem } from "../../../types/trending";
import { DepthInsight, TemporalComparison, VolatilityData, PolarizationData, SegmentInfluence, EarlySignal, B2BBattleAnalytics, B2BEligibility, IntegrityFlags } from "../../signals/services/insightsService";
import { PremiumExportCard } from './PremiumExportCard';
import { B2BAnalyticsCards } from './drawer/B2BAnalyticsCards';

const InsightsChartsSection = lazy(() => import('./drawer/InsightsChartsSection').then(m => ({ default: m.InsightsChartsSection })));

interface DepthInsightsDrawerProps {
    selectedBattle: TrendingItem;
    setSelectedBattle: (item: TrendingItem | null) => void;
    loadingDetails: boolean;
    aiSummary: string | null;
    isGeneratingAi: boolean;
    handleGenerateAiSummary: () => void;
    role: string | null;
    volatility: VolatilityData | null;
    polarization: PolarizationData | null;
    segmentInfluence: SegmentInfluence[];
    daysBack: number;
    earlySignals: EarlySignal[];
    temporalComparison: TemporalComparison[];
    setDaysBack: (days: number) => void;
    loadDepthData: (item: TrendingItem, days?: number) => void;
    depthInsights: DepthInsight[];
    b2bAnalytics?: B2BBattleAnalytics | null;
    b2bEligibility?: B2BEligibility | null;
    integrityFlags?: IntegrityFlags | null;
}

export function DepthInsightsDrawer({
    selectedBattle,
    setSelectedBattle,
    loadingDetails,
    aiSummary,
    isGeneratingAi,
    handleGenerateAiSummary,
    role,
    volatility,
    polarization,
    segmentInfluence,
    daysBack,
    earlySignals,
    temporalComparison,
    setDaysBack,
    loadDepthData,
    depthInsights,
    b2bAnalytics,
    b2bEligibility,
    integrityFlags
}: DepthInsightsDrawerProps) {
    const [isExportView, setIsExportView] = useState(false);

    return (
        <>
            <div className="fixed inset-y-0 right-0 w-full lg:w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-300 border-l border-slate-100 overflow-y-auto">
                <div className="p-8">
                    {/* Header Preamble & Close Button */}
                    <div className="flex items-start justify-between mb-4 print:hidden">
                        <div className="flex-1 pr-4">
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">{selectedBattle.title}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            {b2bEligibility && (
                                <button
                                    onClick={() => setIsExportView(!isExportView)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors border ${
                                        isExportView 
                                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    {isExportView ? <MonitorPlay className="w-3.5 h-3.5" /> : <Settings2 className="w-3.5 h-3.5" />}
                                    {isExportView ? 'Vista Premium' : 'Panel Técnico'}
                                </button>
                            )}
                            <button
                                onClick={() => setSelectedBattle(null)}
                                className="p-2 hover:bg-slate-100 rounded-full transition bg-slate-50 text-slate-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {isExportView ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 print:mt-0">
                            <PremiumExportCard 
                                item={selectedBattle}
                                b2bEligibility={b2bEligibility || null}
                                b2bAnalytics={b2bAnalytics || null}
                                integrityFlags={integrityFlags || null}
                            />

                            <div className="mt-8 text-center print:hidden">
                                <button
                                    onClick={() => setIsExportView(false)}
                                    className="text-xs font-bold text-slate-400 hover:text-slate-600 underline decoration-slate-300 underline-offset-4"
                                >
                                    Volver a controles técnicos
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <B2BAnalyticsCards 
                                b2bEligibility={b2bEligibility}
                                b2bAnalytics={b2bAnalytics}
                                integrityFlags={integrityFlags}
                            />

                            {loadingDetails ? (
                                <div className="space-y-6">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-24 bg-slate-50 rounded-2xl animate-pulse"></div>
                                    ))}
                                </div>
                            ) : (
                                <Suspense fallback={<div className="h-48 w-full bg-slate-50 rounded-2xl animate-pulse" />}>
                                    <InsightsChartsSection
                                        selectedBattle={selectedBattle}
                                        aiSummary={aiSummary}
                                        isGeneratingAi={isGeneratingAi}
                                        handleGenerateAiSummary={handleGenerateAiSummary}
                                        role={role}
                                        b2bEligibility={b2bEligibility}
                                        b2bAnalytics={b2bAnalytics}
                                        volatility={volatility}
                                        polarization={polarization}
                                        segmentInfluence={segmentInfluence}
                                        earlySignals={earlySignals}
                                        temporalComparison={temporalComparison}
                                        daysBack={daysBack}
                                        setDaysBack={setDaysBack}
                                        loadDepthData={loadDepthData}
                                        depthInsights={depthInsights}
                                    />
                                </Suspense>
                            )}

                            <div className="mt-12 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <p className="text-[10px] text-emerald-700 font-bold leading-relaxed">
                                    <Database className="w-3 h-3 inline mr-1 mb-0.5" />
                                    Estos datos provienen del motor de analíticas de profundidad. El score es el promedio de valoraciones (1-10) capturadas en los Insight Packs.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
            
            <div
                className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
                onClick={() => setSelectedBattle(null)}
            ></div>
        </>
    );
}
