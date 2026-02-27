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
import { MODULES } from "../modulesConfig";

const PROGRESSIVE_THEMES = {
    // 1. Aerolíneas
    aerolineas: {
        id: "tournament-aerolineas",
        title: "Batalla en los Cielos",
        subtitle: "¿Cuál es tu aerolínea preferida?",
        industry: "transporte-aerolineas",
        theme: {
            primary: "#0ea5e9", // sky-500
            accent: "#7dd3fc", // sky-300
            bgGradient: "from-sky-50 to-white",
            icon: "flight",
        },
    },
    // 2. Bancos
    bancos: {
        id: "tournament-bancos",
        title: "Finanzas Master",
        subtitle: "¿En qué banco confías más?",
        industry: "finanzas-bancos",
        theme: {
            primary: "#1d4ed8", // blue-700
            accent: "#60a5fa", // blue-400
            bgGradient: "from-blue-50 to-white",
            icon: "account_balance",
        },
    },
    // 3. Autos
    autos: {
        id: "tournament-autos",
        title: "Motor Draft",
        subtitle: "¿Cuál es la marca que te mueve?",
        industry: "transporte-autos",
        theme: {
            primary: "#ef4444", // red-500
            accent: "#fca5a5", // red-300
            bgGradient: "from-red-50 to-white",
            icon: "directions_car",
        },
    },
    // 4. Comida Rápida
    comidarapida: {
        id: "tournament-comidarapida",
        title: "Reyes del Fast Food",
        subtitle: "¿Qué antojo domina hoy?",
        industry: "gastronomia-comida-rapida",
        theme: {
            primary: "#f59e0b", // amber-500
            accent: "#fcd34d", // amber-300
            bgGradient: "from-amber-50 to-white",
            icon: "fastfood",
        },
    },
    // 5. Supermercados
    supermercados: {
        id: "tournament-supermercados",
        title: "Guerra del Carrito",
        subtitle: "¿Dónde haces tus compras?",
        industry: "retail-supermercados",
        theme: {
            primary: "#10b981", // emerald-500
            accent: "#6ee7b7", // emerald-300
            bgGradient: "from-emerald-50 to-white",
            icon: "shopping_cart",
        },
    },
    // 6. Streaming Video
    streaming: {
        id: "tournament-streaming",
        title: "Guerra del Streaming",
        subtitle: "¿Cuál es tu plataforma definitiva?",
        industry: "entretencion-streaming-video",
        theme: {
            primary: "#8b5cf6", // violet-500
            accent: "#a78bfa", // violet-400
            bgGradient: "from-violet-50 to-white",
            icon: "movie",
        },
    },
    // 7. Streaming Audio
    audio: {
        id: "tournament-audio",
        title: "Batalla Musical",
        subtitle: "¿Quién pone el ritmo de tu día?",
        industry: "entretencion-streaming-audio",
        theme: {
            primary: "#ec4899", // pink-500
            accent: "#f472b6", // pink-400
            bgGradient: "from-pink-50 to-white",
            icon: "headphones",
        },
    },
    // 8. Ropa
    ropa: {
        id: "tournament-ropa",
        title: "Moda y Deporte",
        subtitle: "¿Con qué marca te vistes?",
        industry: "retail-ropa",
        theme: {
            primary: "#64748b", // slate-500
            accent: "#cbd5e1", // slate-300
            bgGradient: "from-slate-50 to-white",
            icon: "checkroom",
        },
    },
    // 9. Apps Movilidad
    movilidad: {
        id: "tournament-movilidad",
        title: "Delivery & Rides",
        subtitle: "¿Cuál es la app que te salva?",
        industry: "apps-delivery-movilidad",
        theme: {
            primary: "#f97316", // orange-500
            accent: "#fdba74", // orange-300
            bgGradient: "from-orange-50 to-white",
            icon: "two_wheeler",
        },
    },
    // 10. Startphones/Tecnología
    smartphones: {
        id: "tournament-smartphones",
        title: "Duelo de Gigantes Tech",
        subtitle: "¿Qué ecosistema domina tu vida?",
        industry: "tecnologia-marcas",
        theme: {
            primary: "#3b82f6", // blue-500
            accent: "#60a5fa", // blue-400
            bgGradient: "from-blue-50 to-white",
            icon: "smartphone",
        },
    },
    // 11. Bebidas
    bebidas: {
        id: "tournament-bebidas",
        title: "Battle of the Brands",
        subtitle: "¿Cuál es tu bebida indispensable?",
        industry: "consumo-bebidas",
        theme: {
            primary: "#e11d48", // rose-600
            accent: "#fb7185", // rose-400
            bgGradient: "from-rose-50 to-white",
            icon: "local_drink",
        },
    },
    // 12. Fútbol
    futbol: {
        id: "tournament-futbol",
        title: "Pasión de Multitudes",
        subtitle: "¿Quién es el rey de la cancha?",
        industry: "deportes-futbol",
        theme: {
            primary: "#22c55e", // green-500
            accent: "#86efac", // green-300
            bgGradient: "from-green-50 to-white",
            icon: "sports_soccer",
        },
    },
    // 13. Sagas
    sagas: {
        id: "tournament-sagas",
        title: "Universos Épicos",
        subtitle: "¿A qué mundo perteneces?",
        industry: "entretencion-sagas",
        theme: {
            primary: "#d946ef", // fuchsia-500
            accent: "#f0abfc", // fuchsia-300
            bgGradient: "from-fuchsia-50 to-white",
            icon: "auto_stories",
        },
    },
    // 14. Ciudades/Turismo
    vacaciones: {
        id: "tournament-vacaciones",
        title: "Destino de Ensueño",
        subtitle: "¿A dónde te escaparías mañana?",
        industry: "turismo-ciudades",
        theme: {
            primary: "#0284c7", // lightBlue-600
            accent: "#7dd3fc", // lightBlue-300
            bgGradient: "from-sky-50 to-white",
            icon: "flight_takeoff",
        },
    },
    /*
    // Nota: Salud Pública / Privada ya no es progresivo per se en V12 pero se podría incluir
    salud: {
        id: "tournament-salud",
        title: "Excelencia Médica",
        subtitle: "¿Cuál es la mejor clínica?",
        industry: "salud-clinicas-privadas-scl",
        theme: {
            primary: "#14b8a6", // teal-500
            accent: "#5eead4", // teal-300
            bgGradient: "from-teal-50 to-white",
            icon: "medical_services",
        },
    },
    */
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

    const battlesAsGame = useMemo(() => battles as unknown as Battle[], [battles]);

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
                                className="h-10 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-500 hover:opacity-95 text-white font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
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
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
                    {/* Active Modules - Featured Bento Layout */}
                    <div>
                        <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2 px-1">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse"></span>
                            Módulos Disponibles
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {MODULES.filter(m => m.status === 'active').map((mod) => (
                                <div key={mod.key} className="flex flex-col h-full">
                                    <ExperienceModuleCard
                                        title={mod.title}
                                        description={mod.description}
                                        icon={mod.icon}
                                        tone={mod.tone}
                                        tags={mod.tags}
                                        status={mod.status}
                                        variant="standard"
                                        onClick={() => {
                                            if (mod.key === "personal") navigate("/personal-state");
                                            else setMode(mod.key as ExperienceMode);
                                        }}
                                    />



                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Soon Modules - Compact Layout */}
                    <div>
                        <div className="flex items-center gap-3 mb-2 px-1">
                            <h2 className="text-xl font-black text-slate-900">El Laboratorio</h2>
                            <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-black uppercase tracking-wider">
                                Próximamente
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 mb-6 px-1">
                            Explora los prototipos de las próximas experiencias que estamos construyendo.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {MODULES.filter(m => m.status === 'soon').map((mod) => (
                                <ExperienceModuleCard
                                    key={mod.key}
                                    title={mod.title}
                                    description={mod.description}
                                    icon={mod.icon}
                                    tone={mod.tone}
                                    tags={mod.tags}
                                    status={mod.status}
                                    variant="compact"
                                    onClick={() => navigate(`/m/${mod.slug}`)}
                                />
                            ))}
                        </div>
                    </div>
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
                                        .filter((b) => (b.category as any)?.slug === t.industry || b.industry === t.industry)
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
