import { useState, useEffect, useMemo } from "react";
import { useActiveBattles } from "../../../hooks/useActiveBattles";
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
import { SkeletonModuleCard } from "../../../components/ui/Skeleton";
import { logger } from "../../../lib/logger";

import PageHeader from "../../../components/ui/PageHeader";
import { PageState } from "../../../components/ui/StateBlocks";
import ExperienceModuleCard from "../components/ExperienceModuleCard";

const PROGRESSIVE_THEMES = {
    streaming: {
        id: "tournament-streaming",
        title: "La Guerra del Streaming",
        subtitle: "¿Cuál es tu plataforma definitiva?",
        industry: "streaming",
        theme: {
            primary: "#8b5cf6",
            accent: "#a78bfa",
            bgGradient: "from-violet-50 to-white",
            icon: "movie",
        },
    },
    bebidas: {
        id: "tournament-bebidas",
        title: "Battle of the Brands",
        subtitle: "¿Cuál es tu bebida indispensable?",
        industry: "bebidas",
        theme: {
            primary: "#ef4444",
            accent: "#f87171",
            bgGradient: "from-red-50 to-white",
            icon: "local_drink",
        },
    },
    vacaciones: {
        id: "tournament-vacaciones",
        title: "Destino de Ensueño",
        subtitle: "¿A dónde te escaparías mañana?",
        industry: "vacaciones",
        theme: {
            primary: "#0ea5e9",
            accent: "#38bdf8",
            bgGradient: "from-sky-50 to-white",
            icon: "beach_access",
        },
    },
    smartphones: {
        id: "tournament-smartphones",
        title: "Duelo de Gigantes Tech",
        subtitle: "¿Qué smartphone domina tu vida?",
        industry: "smartphones",
        theme: {
            primary: "#3b82f6",
            accent: "#60a5fa",
            bgGradient: "from-blue-50 to-white",
            icon: "smartphone",
        },
    },
    salud: {
        id: "tournament-salud",
        title: "Excelencia Médica",
        subtitle: "¿Cuál es la mejor clínica?",
        industry: "salud",
        theme: {
            primary: "#10b981",
            accent: "#34d399",
            bgGradient: "from-emerald-50 to-white",
            icon: "medical_services",
        },
    },
};

const BATCH_SIZE = 12;

type ExperienceMode = "menu" | "versus" | "progressive" | "insights";

export default function Experience() {
    const { battles, loading } = useActiveBattles();
    const { profile } = useAuth();
    const { signals, signalsToday } = useSignalStore();
    const location = useLocation();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<BattleOption | null>(null);
    const [selectedTheme, setSelectedTheme] = useState<keyof typeof PROGRESSIVE_THEMES | null>(null);

    const requestedBatch = (location.state as { nextBatch?: number })?.nextBatch;
    const computedBatch = Math.floor(signals / BATCH_SIZE);
    const initialBatch = typeof requestedBatch === "number" ? requestedBatch : computedBatch;
    const [batchIndex] = useState(initialBatch);

    const [mode, setMode] = useState<ExperienceMode>(typeof requestedBatch === "number" ? "versus" : "menu");

    // Enforce profile completion
    useEffect(() => {
        if (profile && !profile.isProfileComplete) {
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

        signalService
            .saveSignalEvent({ battle_id: battleId, option_id: optionId })
            .catch((err) => {
                logger.error("Failed to save vote:", err);
                showToast("No se pudo registrar la señal.", "error");
            });

        return {};
    };

    const handleBatchComplete = () => {
        navigate("/results", { state: { batchIndex } });
    };

    const handlePlaceholderClick = (name: string) => {
        showToast(`"${name}" viene pronto. Sí, está en el backlog.`, "info");
    };

    if (profile && !profile.isProfileComplete) return null;

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

    // Move useMemo here to fix conditional hook call
    const battlesAsGame = useMemo(() => battles as unknown as Battle[], [battles]);

    // Loading: show skeleton cards, but with the same PageHeader as the rest of the app
    if (loading && battles.length === 0) {
        return (
            <div className="container-ws section-y space-y-6 pb-24">
                <PageHeader
                    eyebrow={<span className="badge badge-primary">Hub</span>}
                    title={<h1 className="text-2xl md:text-3xl font-black tracking-tight text-ink">Experience</h1>}
                    subtitle={<p className="text-sm text-muted font-medium">Cargando experiencias… (sí, estamos vivos).</p>}
                    meta={
                        <div className="flex flex-wrap gap-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <span className="material-symbols-outlined text-[14px]">bolt</span>
                                Señales hoy: {signalsToday}
                            </div>
                        </div>
                    }
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80">
                    <SkeletonModuleCard />
                    <SkeletonModuleCard />
                    <SkeletonModuleCard />
                    <SkeletonModuleCard />
                    <SkeletonModuleCard />
                    <SkeletonModuleCard />
                </div>
            </div>
        );
    }

    // Empty: no battles after loading
    if (!loading && battles.length === 0) {
        return (
            <div className="container-ws section-y">
                <PageState
                    type="empty"
                    title="No hay batallas activas"
                    description="La app está bien. Lo que no está bien es que no haya datos. (Vamos a arreglar eso.)"
                    icon="dns"
                    primaryAction={{ label: "Volver al inicio", onClick: () => navigate("/") }}
                    secondaryAction={{ label: "Ir a Resultados", onClick: () => navigate("/results") }}
                />
            </div>
        );
    }

    return (
        <div className="container-ws section-y space-y-8 pb-24">

            <PageHeader
                eyebrow={<span className="badge badge-primary">Hub</span>}
                title={<h1 className="text-2xl md:text-3xl font-black tracking-tight text-ink">Tu opinión es una señal</h1>}
                subtitle={<p className="text-sm text-muted font-medium">{headerSubtitle}</p>}
                meta={
                    <div className="flex flex-wrap gap-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <span className="material-symbols-outlined text-[14px] text-emerald-500">bolt</span>
                            Señales hoy: {signalsToday}
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <span className="material-symbols-outlined text-[14px] text-indigo-500">shield</span>
                            Límite: {limitLabel}
                        </div>
                        {profile?.tier ? (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <span className="material-symbols-outlined text-[14px]">person</span>
                                Tier: {profile.tier}
                            </div>
                        ) : null}
                    </div>
                }
                actions={
                    mode !== "menu" ? (
                        <button
                            onClick={() => {
                                setSelectedOption(null);
                                setSelectedTheme(null);
                                setMode("menu");
                            }}
                            className="h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all active:scale-95"
                        >
                            ← Volver al Hub
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={() => navigate("/results")}
                                className="h-10 px-4 rounded-xl bg-ink text-white font-bold text-sm transition-all hover:opacity-90 active:scale-95"
                            >
                                Ver resultados
                            </button>
                            <button
                                onClick={() => navigate("/profile")}
                                className="h-10 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm transition-all hover:bg-slate-50 active:scale-95"
                            >
                                Mi perfil
                            </button>
                        </div>
                    )
                }
            />

            {/* HUB MENU */}
            {mode === "menu" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    <ExperienceModuleCard
                        title="Versus"
                        description="Comparaciones rápidas 1 vs 1. Calibra tus preferencias fundamentales."
                        icon="swords"
                        tone="primary"
                        onClick={() => setMode("versus")}
                        footerLeft="Activo"
                        footerRight="Rápido"
                    />

                    <ExperienceModuleCard
                        title="Versus Progresivo"
                        description="Modo torneo. Una opción sigue ganando hasta coronar al ganador."
                        icon="rocket_launch"
                        tone="secondary"
                        onClick={() => setMode("progressive")}
                        footerLeft="Beta"
                        footerRight="Torneo"
                    />

                    <ExperienceModuleCard
                        title="Profundidad"
                        description="5 preguntas rápidas para refinar la inteligencia colectiva sobre una opción."
                        icon="insights"
                        tone="emerald"
                        onClick={() => setMode("insights")}
                        footerLeft="Activo"
                        footerRight="Insights"
                    />

                    <ExperienceModuleCard
                        title="Bienestar"
                        description="Sincroniza tu estado actual. 100% anónimo. (De verdad.)"
                        icon="favorite"
                        tone="rose"
                        onClick={() => navigate("/personal-state")}
                        footerLeft="Activo"
                        footerRight="Privado"
                    />

                    <ExperienceModuleCard
                        title="Lugares"
                        description="Califica experiencias en ubicaciones físicas."
                        icon="location_on"
                        tone="slate"
                        disabled
                        badge="Próximamente"
                        onClick={() => handlePlaceholderClick("Lugares")}
                    />

                    <ExperienceModuleCard
                        title="Servicio"
                        description="Evalúa la calidad de atención y servicio."
                        icon="support_agent"
                        tone="slate"
                        disabled
                        badge="Próximamente"
                        onClick={() => handlePlaceholderClick("Servicio")}
                    />

                    <ExperienceModuleCard
                        title="Actualidad"
                        description="Vota sobre temas del momento con opciones opuestas (sí/no, A/B)."
                        icon="newspaper"
                        tone="slate"
                        disabled
                        badge="Próximamente"
                        onClick={() => handlePlaceholderClick("Actualidad")}
                    />

                    <ExperienceModuleCard
                        title="Escáner"
                        description="Escanea un producto para ver ficha y valoración comunitaria."
                        icon="qr_code_scanner"
                        tone="slate"
                        disabled
                        badge="Próximamente"
                        onClick={() => handlePlaceholderClick("Escáner")}
                    />

                </div>
            ) : null}

            {/* VERSUS MODE */}
            {mode === "versus" ? (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 md:p-6">
                    <VersusGame
                        key={`versus-${batchIndex}`}
                        battles={battlesAsGame}
                        onVote={handleVote}
                        mode="classic"
                        enableAutoAdvance={true}
                        hideProgress={false}
                        isQueueFinite={true}
                        autoNextMs={800}
                        disableInsights={false}
                        onQueueComplete={handleBatchComplete}
                        isSubmitting={false}
                        theme={{
                            primary: "#3b82f6",
                            accent: "#60a5fa",
                            bgGradient: "from-blue-50 to-white",
                            icon: "query_stats",
                        }}
                    />
                </div>
            ) : null}

            {/* PROGRESSIVE MODE */}
            {mode === "progressive" ? (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 md:p-6">
                    {!selectedTheme ? (
                        <div className="max-w-4xl mx-auto space-y-6">
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl md:text-3xl font-black text-ink">
                                    Elige tu <span className="text-gradient-brand">Torneo</span>
                                </h2>
                                <p className="text-muted font-medium">
                                    Enfrenta opciones del mismo tema hasta encontrar al ganador. (Sí, es adictivo.)
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.keys(PROGRESSIVE_THEMES).map((key) => {
                                    const k = key as keyof typeof PROGRESSIVE_THEMES;
                                    const t = PROGRESSIVE_THEMES[k];
                                    return (
                                        <button
                                            key={t.id}
                                            onClick={() => setSelectedTheme(k)}
                                            className="p-5 rounded-2xl border border-slate-100 bg-white text-left hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-[0.99]"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="text-xs font-black uppercase tracking-widest text-slate-400">{t.industry}</div>
                                                    <div className="text-lg font-black text-ink mt-1">{t.title}</div>
                                                    <div className="text-sm text-muted mt-1">{t.subtitle}</div>
                                                </div>
                                                <span className="material-symbols-outlined text-slate-300">arrow_forward</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <ProgressiveRunner
                            progressiveData={(() => {
                                const t = PROGRESSIVE_THEMES[selectedTheme];
                                return {
                                    id: t.id,
                                    title: t.title,
                                    subtitle: t.subtitle,
                                    industry: t.industry,
                                    theme: t.theme,
                                    candidates: battlesAsGame
                                        .filter((b) => b.industry === t.industry)
                                        .flatMap((b) => b.options)
                                        .filter((v, i, a) => a.findIndex((o) => o.id === v.id) === i)
                                        .slice(0, 16),
                                };
                            })()}
                            onComplete={(winner) => {
                                showToast(`¡${winner.label} ganó el torneo!`, "success");
                                setSelectedTheme(null);
                            }}
                            onVote={async (battle_id: string, option_id: string) => {
                                await signalService.saveSignalEvent({ battle_id, option_id });
                                return {};
                            }}
                        />
                    )}
                </div>
            ) : null}

            {/* INSIGHTS MODE */}
            {mode === "insights" ? (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 md:p-6">
                    <div className="w-full max-w-2xl mx-auto">
                        <DepthSelector
                            options={battlesAsGame.flatMap((b) => b.options)}
                            onSelect={handleOptionSelect}
                        />
                    </div>
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

            <div className="pt-2 text-center opacity-40">
                <p className="text-xs text-slate-500">
                    Las señales valen más con mejor perfil y verificación. ({signalsToday}/{limitLabel})
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
