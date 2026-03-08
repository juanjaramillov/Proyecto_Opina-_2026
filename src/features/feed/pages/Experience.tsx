import { useState, useEffect, useMemo } from "react";
import { useActiveBattles } from "../../../hooks/useActiveBattles";
import { IndustrySelector } from "../components/IndustrySelector";
import VersusGame from "../../signals/components/VersusGame";
import { useSignalStore } from "../../../store/signalStore";
import { useLocation, useNavigate } from "react-router-dom";
import { DepthSelector } from "../../signals/components/DepthSelector";
import { useToast } from "../../../components/ui/useToast";

import { signalService } from "../../signals/services/signalService";
import { sessionService } from "../../signals/services/sessionService";
import InsightPack from "../../signals/components/InsightPack";
import { Battle, BattleOption } from "../../signals/types";
import { useAuth } from "../../auth";
import RequestLoginModal from "../../auth/components/RequestLoginModal";
import ProgressiveRunner from "../../signals/components/ProgressiveRunner";
import HubMenuSimplified from "../components/HubMenuSimplified";
import { SkeletonModuleCard } from "../../../components/ui/Skeleton";
import { logger } from "../../../lib/logger";

import PageHeader from "../../../components/ui/PageHeader";
import { PageState } from "../../../components/ui/StateBlocks";
import { motion, AnimatePresence } from "framer-motion";

import { PARENT_INDUSTRIES } from "../data/industries";
import { NextActionRecommendation, ActionType } from '../../../components/ui/NextActionRecommendation';

const BATCH_SIZE = 12;

type ExperienceMode = "menu" | "versus" | "progressive" | "insights";

const EXPERIENCE_NAV_ITEMS = [
    { id: 'versus', label: 'Versus', icon: 'dynamic_feed', activeColor: 'text-emerald-600' },
    // { id: 'progressive', label: 'Progresivos', icon: 'trending_up', activeColor: 'text-emerald-600' },
    // { id: 'insights', label: 'Profundidad', icon: 'layers', activeColor: 'text-emerald-600' }
] as const;

function ExperienceNavigation({
    currentMode,
    onChange
}: {
    currentMode: ExperienceMode,
    onChange: (mode: ExperienceMode) => void
}) {
    return (
        <div className="w-full flex justify-center overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            <div className="inline-flex items-center gap-1 p-1.5 bg-slate-100 rounded-full min-w-max border border-slate-200">
                {EXPERIENCE_NAV_ITEMS.map(item => {
                    const isActive = currentMode === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onChange(item.id)}
                            className={`flex items-center gap-2 h-10 px-5 rounded-full font-bold text-sm transition-all focus:outline-none whitespace-nowrap select-none ${isActive
                                ? `bg-white shadow-sm ring-1 ring-slate-900/5 ${item.activeColor}`
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                                }`}
                        >
                            <span className={`material-symbols-outlined text-[18px] transition-colors ${isActive ? item.activeColor : ''}`}>{item.icon}</span>
                            <span className={`transition-colors ${isActive ? item.activeColor : ''}`}>{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default function Experience() {
    const { battles, loading } = useActiveBattles();
    const { profile } = useAuth();
    const { signals, signalsToday } = useSignalStore();
    const location = useLocation();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<BattleOption | null>(null);
    const [selectedTheme, setSelectedTheme] = useState<string | 'mix'>('mix');
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
    const [versusIndustry, setVersusIndustry] = useState<string | 'mix'>('mix');

    const [showBatchResults, setShowBatchResults] = useState(false);
    const [batchSessionHistory, setBatchSessionHistory] = useState<Array<{ battle: Battle; myVote: 'A' | 'B'; pctA: number; }>>([]);

    const requestedBatch = (location.state as { nextBatch?: number })?.nextBatch;
    const computedBatch = Math.floor(signals / BATCH_SIZE);
    const initialBatch = typeof requestedBatch === "number" ? requestedBatch : computedBatch;
    const [batchIndex] = useState(initialBatch);

    const [mode, setMode] = useState<ExperienceMode>(typeof requestedBatch === "number" ? "versus" : "menu");

    const fmt = (n: number) => new Intl.NumberFormat("es-CL").format(Number.isFinite(n) ? n : 0);

    const [hubTopNow, setHubTopNow] = useState<{
        top_versus: { slug: string; title: string; signals_24h: number } | null;
        top_tournament: { slug: string; title: string; signals_24h: number } | null;
    } | null>(null);

    const [hubStats, setHubStats] = useState<{
        active_users_24h: number;
        signals_24h: number;
        depth_answers_24h: number;
        active_battles: number;
    } | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            const [top, stats] = await Promise.all([
                signalService.getHubTopNow24h(),
                signalService.getHubLiveStats24h(),
            ]);
            if (mounted) {
                setHubTopNow(top);
                setHubStats(stats);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const battlesAsGame = useMemo(() => battles as unknown as Battle[], [battles]);

    const filteredVersusBattles = useMemo(() => {
        if (versusIndustry === 'mix') return battlesAsGame;
        return battlesAsGame.filter(b => {
            const categorySlug = b.category ? (b.category as { slug?: string }).slug : null;
            const parent = PARENT_INDUSTRIES[versusIndustry];
            if (parent) {
                if (selectedSubcategoryId) {
                    const subcat = parent.subcategories.find((s: any) => s.id === selectedSubcategoryId);
                    return subcat ? categorySlug === subcat.slug : false;
                } else {
                    return parent.subcategories.some((sub: any) => sub.slug === categorySlug);
                }
            }
            return categorySlug === versusIndustry;
        });
    }, [battlesAsGame, versusIndustry, selectedSubcategoryId]);

    const battlesForQueue = useMemo(() => {
        if (filteredVersusBattles.length === 0) return [];
        const getCat = (b: Battle) => b.category ? (b.category as { slug?: string }).slug : 'unknown';

        if (versusIndustry === 'mix') {
            const shuffled = [...filteredVersusBattles].sort(() => 0.5 - Math.random());
            const queue: Battle[] = [];
            for (let i = 0; i < 10 && shuffled.length > 0; i++) {
                const lastCat = queue.length > 0 ? getCat(queue[queue.length - 1]) : null;
                const nextIdx = shuffled.findIndex(b => getCat(b) !== lastCat);
                if (nextIdx !== -1) {
                    queue.push(shuffled[nextIdx]);
                    shuffled.splice(nextIdx, 1);
                } else {
                    queue.push(shuffled[0]);
                    shuffled.splice(0, 1);
                }
            }
            return queue;
        }

        const queue: Battle[] = [];
        for (let i = 0; i < 10; i++) {
            queue.push(filteredVersusBattles[i % filteredVersusBattles.length]);
        }
        return queue;
    }, [filteredVersusBattles, versusIndustry]);

    // Enforce profile completion
    useEffect(() => {
        if (profile && !profile.isProfileComplete && profile.role !== 'admin') {
            navigate("/complete-profile", { replace: true });
        }
    }, [profile, navigate]);

    // Start or resume session when in versus mode
    useEffect(() => {
        const initSession = async () => {
            if (mode === "versus") {
                try {
                    await sessionService.startNewSession();
                } catch (err) {
                    logger.error("Session init failed:", err);
                }
            }
        };
        initSession();
    }, [mode]);

    const handleOptionSelect = (option: BattleOption) => {
        setSelectedOption(option);
        setMode("insights");
    };

    const previewVersus = useMemo(() => {
        if (!battles || battles.length === 0) return null;
        return battles[0];
    }, [battles]);

    const signalsLimit = profile?.role === 'admin' ? '∞' : 50;

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
            await signalService.saveSignalEvent({ battle_id: battleId, option_id: optionId });
            showToast("Señal registrada.", "award", 1);
        } catch (err: any) {
            logger.error("Failed to save vote:", err);
            showToast(`Error DB: ${err?.message || "Desconocido"}`, "error");
        }
        return {};
    };

    const handleBatchComplete = (history: Array<{ battle: Battle; myVote: 'A' | 'B'; pctA: number; }>) => {
        setBatchSessionHistory(history || []);
        setShowBatchResults(true);
    };

    if (profile && !profile.isProfileComplete && profile.role !== 'admin') return null;

    const headerSubtitle =
        mode === "menu"
            ? "Elige tu canal. Rápido, anónimo y sin discursos innecesarios."
            : mode === "versus"
                ? `Bloque ${batchIndex + 1}: calibrando preferencias.`
                : mode === "progressive"
                    ? "Modo torneo: una opción sobrevive y sigue peleando."
                    : "Profundidad: 5 preguntas rápidas para afinar el motor.";

    const limitLabel =
        profile?.signalsDailyLimit === -1
            ? "∞"
            : (profile?.signalsDailyLimit ?? "?").toString();

    // Loading: show skeleton cards
    if (loading && battles.length === 0) {
        return (
            <div className="container-ws section-y space-y-6 pb-24">
                <PageHeader
                    eyebrow={<span className="badge badge-primary">Hub</span>}
                    title={<h1 className="text-2xl md:text-3xl font-black tracking-tight text-ink">Elige tu <span className="text-primary">formato</span></h1>}
                    subtitle={<p className="text-sm text-muted font-medium">{headerSubtitle}</p>}
                    meta={
                        <div className="flex flex-wrap gap-2">
                            <div className="badge badge-outline">Señales hoy: {fmt(signalsToday)}</div>
                            <div className="badge badge-outline">Límite: {limitLabel}</div>
                        </div>
                    }
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80">
                    <SkeletonModuleCard />
                    <SkeletonModuleCard />
                    <SkeletonModuleCard />
                </div>
            </div>
        );
    }

    // Empty: no battles
    if (!loading && battles.length === 0) {
        return (
            <div className="container-ws section-y">
                <PageState
                    type="empty"
                    title="No hay batallas activas"
                    description="Estamos recargando el motor de señales."
                    icon="dns"
                    primaryAction={{ label: "Volver al inicio", onClick: () => navigate("/") }}
                />
            </div>
        );
    }

    return (
        <div className={`container-ws pb-24 ${mode === 'versus' ? 'pt-4 space-y-4' : 'section-y space-y-8'}`}>

            {mode === "progressive" && (
                <ExperienceNavigation
                    currentMode={mode}
                    onChange={(m) => {
                        setSelectedOption(null);
                        setSelectedTheme('mix');
                        setMode(m);
                    }}
                />
            )}

            {mode === "menu" && (
                <HubMenuSimplified
                    onEnterVersus={() => { setVersusIndustry('mix'); setMode('versus'); }}
                    onEnterProgressive={() => setMode("progressive")}
                    onEnterDepth={() => setMode("insights")}
                    onEnterPlaces={() => { setVersusIndustry('turismo'); setMode('versus'); }}
                    onEnterServices={() => { setVersusIndustry('telecom'); setMode('versus'); }}
                    onEnterNews={() => { setVersusIndustry('medios'); setMode('versus'); }}
                    onEnterSports={() => { setVersusIndustry('deportes'); setMode('versus'); }}
                    onEnterProducts={() => { setVersusIndustry('retail'); setMode('versus'); }}
                    onEnterRestaurants={() => { setVersusIndustry('comida'); setMode('versus'); }}
                    onEnterPulse={() => { setVersusIndustry('vida_diaria'); setMode('versus'); }}
                    onViewResults={() => navigate("/results")}
                    stats={hubStats}
                    topNow={hubTopNow}
                    previewVersus={previewVersus}
                    signalsToday={signalsToday}
                    signalsLimit={signalsLimit}
                />
            )}

            {mode === "versus" ? (
                <div className="space-y-8 animate-in fade-in duration-500 flex flex-col">
                    {/* Show VersusGame ON TOP regardless of industry (mix or specific) */}
                    <div className="card card-pad relative animate-in fade-in duration-500 min-h-[600px] order-1">
                        {battlesForQueue.length > 0 ? (
                            <VersusGame
                                key={`versus-${batchIndex}-${versusIndustry}-${selectedSubcategoryId || 'all'}`}
                                battles={battlesForQueue}
                                onVote={handleVote}
                                mode="classic"
                                enableAutoAdvance={true}
                                hideProgress={false}
                                isQueueFinite={true}
                                autoNextMs={1800}
                                onQueueComplete={handleBatchComplete}
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
                                <h3 className="text-2xl font-black text-slate-800 mb-2">Aún no hay batallas aquí</h3>
                                <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium">
                                    Estamos preparando nuevas compañías para esta categoría. Si quieres ver enfrentamientos ahora, elige otra opción abajo.
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

                    {/* Category Selector for Versus Moved Below */}
                    <div className="max-w-5xl xl:max-w-6xl mx-auto w-full space-y-4 order-2">
                        <IndustrySelector
                            industries={PARENT_INDUSTRIES}
                            selectedParentId={versusIndustry}
                            selectedSubcategoryId={selectedSubcategoryId}
                            onParentChange={(id) => setVersusIndustry(id || 'mix')}
                            onSubcategoryChange={(id) => setSelectedSubcategoryId(id)}
                            title="Filtrar por industria"
                            subtitle={`${filteredVersusBattles.length} batallas encontradas`}
                            hideMixOption={false}
                        />
                    </div>
                </div>
            ) : null}

            {/* PROGRESSIVE MODE */}
            {mode === "progressive" ? (
                <div className="space-y-8 flex flex-col animate-in fade-in duration-500">
                    {/* Active Tournament Runner */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-4 md:p-8 min-h-[600px] relative overflow-hidden order-1">
                        {/* Decorative Background */}
                        <div className="absolute inset-0 pointer-events-none opacity-30">
                            <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br transition-all duration-700 ${selectedTheme !== 'mix' ? PARENT_INDUSTRIES[selectedTheme]?.theme?.bgGradient : 'from-blue-50 to-white'} rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`} />
                        </div>

                        <ProgressiveRunner
                            progressiveData={(() => {
                                let validBattles = battlesAsGame || [];
                                let id = 'mix';
                                let title = 'Torneo Global';
                                let subtitle = 'Todas las industrias mezcladas.';
                                let theme = {
                                    primary: "#2563EB",
                                    accent: "#10B981",
                                    bgGradient: "from-blue-50 to-white",
                                    icon: "shuffle"
                                };

                                if (selectedTheme !== 'mix') {
                                    const t = PARENT_INDUSTRIES[selectedTheme];
                                    if (t) {
                                        const targetSlugs = selectedSubcategoryId
                                            ? [t.subcategories.find((s: any) => s.id === selectedSubcategoryId)?.slug]
                                            : t.subcategories.map((s: any) => s.slug);

                                        validBattles = validBattles.filter((b) => {
                                            const catSlug = (b.category as { slug?: string })?.slug;
                                            return targetSlugs.includes(catSlug) || targetSlugs.includes(b.industry);
                                        });

                                        id = t.id;
                                        title = t.title;
                                        subtitle = t.subtitle;
                                        theme = t.theme;
                                    }
                                }

                                // CRITICAL: A Progressive tournament must only contain candidates from a SINGLE subcategory.
                                // Otherwise candidates from different subcategories would face each other (e.g. Airlines vs Fast Food).
                                // If multiple subcategories available, restrict to the first one found in the queue.
                                if (validBattles.length > 0) {
                                    const firstSlug = (validBattles[0].category as any)?.slug || validBattles[0].industry;
                                    validBattles = validBattles.filter(b => ((b.category as any)?.slug || b.industry) === firstSlug);
                                }

                                return {
                                    id,
                                    title,
                                    subtitle,
                                    industry: validBattles.length > 0 ? ((validBattles[0]?.category as any)?.slug || validBattles[0]?.industry || 'mix') : 'mix',
                                    theme,
                                    candidates: validBattles
                                        .flatMap((b) => b.options || [])
                                        .filter((v, i, a) => a.findIndex((o) => o?.id === v?.id) === i)
                                        .map(opt => ({
                                            ...opt,
                                            type: 'brand' as const,
                                            imageFit: 'contain' as const
                                        }))
                                        .slice(0, 16),
                                };
                            })()}
                            onVote={async (battle_id: string, option_id: string, opponentId: string) => {
                                try {
                                    await signalService.saveSignalEvent({
                                        battle_id,
                                        option_id,
                                        meta: { opponent_id: opponentId, mode: 'progressive' }
                                    });
                                    // Wait visually to ensure perception 
                                    await new Promise(r => setTimeout(r, 400));
                                    showToast("Señal registrada. El retador ya viene.", "success");
                                    return {};
                                } catch (err) {
                                    console.error("Error votando en progresivo:", err);
                                    showToast("No se pudo registrar tu señal. Intenta de nuevo.", "error");
                                    throw err;
                                }
                            }}
                        />
                    </div>

                    {/* Category Selector (Always visible in Progressive mode) */}
                    <div className="max-w-5xl xl:max-w-6xl mx-auto w-full space-y-4 order-2">
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
                                ? "Torneo enfocado en esta categoría."
                                : "Enfrenta marcas cara a cara hasta encontrar tu favorita."
                            }
                            hideMixOption={false}
                        />
                    </div>
                </div>
            ) : null}

            {/* INSIGHTS MODE */}
            {mode === "insights" ? (
                <div className="space-y-12 animate-in fade-in duration-500">
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

                    {selectedTheme ? (
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-4 md:p-8 min-h-[600px] relative overflow-hidden">
                            <div className="absolute inset-0 pointer-events-none opacity-30">
                                <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br transition-all duration-700 ${PARENT_INDUSTRIES[selectedTheme].theme.bgGradient} rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`} />
                            </div>
                            <div className="w-full max-w-4xl xl:max-w-5xl mx-auto relative z-10">
                                <DepthSelector
                                    options={(battlesAsGame || [])
                                        .filter((b) => {
                                            const parent = PARENT_INDUSTRIES[selectedTheme];
                                            const targetSlugs = selectedSubcategoryId
                                                ? [parent.subcategories.find((s: any) => s.id === selectedSubcategoryId)?.slug]
                                                : parent.subcategories.map((s: any) => s.slug);

                                            const catSlug = (b.category as { slug?: string })?.slug;
                                            return targetSlugs.includes(catSlug) || targetSlugs.includes(b.industry);
                                        })
                                        .flatMap((b) => b.options || [])
                                        .filter((v, i, a) => a.findIndex((o) => o?.id === v?.id) === i)
                                    }
                                    onSelect={handleOptionSelect}
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
                </div>
            ) : null}

            {/* INSIGHT PACK OVERLAY */}
            {selectedOption && mode === "insights" ? (
                <InsightPack
                    optionId={selectedOption.id}
                    optionLabel={selectedOption.label}
                    onComplete={() => {
                        setSelectedOption(null);
                        setMode("menu");
                    }}
                    onCancel={() => setSelectedOption(null)}
                />
            ) : null}



            <RequestLoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onSuccess={() => {
                    setIsLoginModalOpen(false);
                    showToast("Verificación exitosa. Tu límite subió.", "success");
                }}
            />

            <AnimatePresence>
                {showBatchResults && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setShowBatchResults(false); navigate("/results", { state: { batchIndex } }); }}
                            className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white rounded-[32px] p-6 md:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-3xl">task_alt</span>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-black text-ink"><span className="text-gradient-brand">Resultados</span> de tu sesión</h2>
                                <p className="text-slate-500 font-medium mt-2">
                                    Aportaste <span className="font-bold text-emerald-600">{batchSessionHistory.length} señales</span>. Así se comparan tus decisiones.
                                </p>
                            </div>

                            <div className="space-y-3 mb-6">
                                {batchSessionHistory.map((h, i) => {
                                    const votedOption = h.myVote === 'A' ? h.battle.options[0] : h.battle.options[1];
                                    const opponentOption = h.myVote === 'A' ? h.battle.options[1] : h.battle.options[0];

                                    return (
                                        <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition-all">
                                            <div className="flex-1">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{h.battle.title}</div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-black text-slate-900">{votedOption?.label || "Opción"}</span>
                                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Tu Voto</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
                                                <span>vs</span>
                                                <span className="text-slate-600 line-through decoration-slate-300">{opponentOption?.label || "Opción"}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-4">
                                <NextActionRecommendation
                                    signalsEarned={batchSessionHistory.length}
                                    totalSignals={signals}
                                    profileCompleteness={(profile as any)?.profileCompleteness || 0}
                                    onAction={(action: ActionType) => {
                                        setShowBatchResults(false);
                                        if (action === 'profile') {
                                            navigate('/complete-profile');
                                        } else if (action === 'versus') {
                                            if (versusIndustry !== 'mix') {
                                                setVersusIndustry('mix');
                                            }
                                            navigate("/experience");
                                        } else if (action === 'results') {
                                            navigate("/results");
                                        }
                                    }}
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
