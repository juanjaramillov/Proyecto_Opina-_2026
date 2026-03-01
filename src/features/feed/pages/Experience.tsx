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
import HubIcon from "../../../components/ui/HubIcon";
import { ArrowLeftRight, TrendingUp, Layers, Users, Zap, BarChart3, Boxes, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

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
            primary: "#8b5cf6", // secondary-500
            accent: "#a78bfa", // secondary-400
            bgGradient: "from-secondary-50 to-white",
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
            primary: "#d946ef", // secondary-500
            accent: "#f0abfc", // secondary-300
            bgGradient: "from-secondary-50 to-white",
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

function AnimatedNumber({
    value,
    durationMs = 700,
}: {
    value: number;
    durationMs?: number;
}) {
    const [display, setDisplay] = useState(0);

    // respeta reduced motion
    const prefersReducedMotion = useMemo(() => {
        if (typeof window === "undefined") return true;
        return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }, []);

    useEffect(() => {
        const target = Number.isFinite(value) ? value : 0;

        if (prefersReducedMotion) {
            setDisplay(target);
            return;
        }

        let raf = 0;
        const start = performance.now();
        const from = display; // anima desde el valor actual (evita saltos)
        const delta = target - from;

        const tick = (t: number) => {
            const p = Math.min(1, (t - start) / durationMs);
            // easeOutCubic suave
            const eased = 1 - Math.pow(1 - p, 3);
            const next = Math.round(from + delta * eased);
            setDisplay(next);
            if (p < 1) raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, durationMs, prefersReducedMotion]);

    return <>{new Intl.NumberFormat("es-CL").format(display)}</>;
}

function SparkBars24h({
    rows,
}: {
    rows: Array<{ label: string; signals: number; depth: number }>;
}) {
    const max = Math.max(1, ...rows.map(r => (r.signals || 0) + (r.depth || 0)));

    return (
        <div className="mt-4">
            <div className="flex items-end gap-[3px] h-12">
                {rows.map((r, i) => {
                    const total = (r.signals || 0) + (r.depth || 0);
                    const h = Math.round((total / max) * 48);

                    // segmento depth (arriba) y signals (abajo)
                    const depthH = total > 0 ? Math.max(1, Math.round(((r.depth || 0) / max) * 48)) : 0;
                    const signalsH = Math.max(0, h - depthH);

                    return (
                        <div
                            key={i}
                            className="opina-bar w-[6px] flex flex-col justify-end origin-bottom"
                            style={{
                                animation: `opinaBarIn 260ms ease-out ${i * 12}ms both`
                            }}
                        >
                            {/* signals */}
                            <div
                                className="rounded-t-[6px] bg-slate-200"
                                style={{ height: signalsH }}
                                title={`${r.label}: señales ${r.signals || 0} / profundidad ${r.depth || 0}`}
                            />
                            {/* depth (overlay/stack) */}
                            <div
                                className="rounded-b-[6px] bg-gradient-to-b from-primary-600/80 to-emerald-500/80"
                                style={{ height: depthH }}
                                title={`${r.label}: señales ${r.signals || 0} / profundidad ${r.depth || 0}`}
                            />
                        </div>
                    );
                })}
            </div>

            <div className="mt-2 flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>h-23</span>
                <span>ahora</span>
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
    const [selectedTheme, setSelectedTheme] = useState<keyof typeof PROGRESSIVE_THEMES | null>(null);

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

    const [hubSeries24h, setHubSeries24h] = useState<Array<{
        bucket_start: string;
        label: string;
        signals: number;
        depth: number;
    }>>([]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            const [top, stats, series] = await Promise.all([
                signalService.getHubTopNow24h(),
                signalService.getHubLiveStats24h(),
                signalService.getHubSignalTimeseries24h()
            ]);
            if (mounted) {
                setHubTopNow(top);
                setHubStats(stats);
                setHubSeries24h(series || []);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const battlesAsGame = useMemo(() => battles as unknown as Battle[], [battles]);

    const previewVersus = useMemo(() => {
        const slugFromTop = hubTopNow?.top_versus?.slug;
        const fromTop = slugFromTop ? (battles || []).find((b) => b.slug === slugFromTop) : null;

        if (fromTop) return fromTop;

        // Fallback: primer versus activo (asegura preview siempre lleno)
        return (battles || []).find((b) => (b.slug || "").startsWith("versus-")) || null;
    }, [hubTopNow, battles]);

    const previewOptions = useMemo(() => {
        const opts = (previewVersus as Battle | null)?.options || [];
        const arr = Array.isArray(opts) ? opts : [];
        // Asegurar 2 opciones
        return arr.slice(0, 2);
    }, [previewVersus]);

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

    const vContainer = {
        hidden: {},
        show: {
            transition: { staggerChildren: 0.08, delayChildren: 0.04 }
        }
    };

    const vItem = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
    };

    const vHero = {
        hidden: { opacity: 0, y: 8 },
        show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
    };

    const vPanel = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut", delay: 0.06 } }
    };

    const CTA_PRIMARY_FULL =
        "w-full h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-black text-sm " +
        "shadow-[0_10px_25px_rgba(16,185,129,0.18)] hover:shadow-[0_14px_32px_rgba(59,130,246,0.18)] " +
        "hover:opacity-95 transition-all active:scale-[0.98]";


    const CTA_SECONDARY_FULL =
        "w-full h-12 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 font-black text-sm " +
        "transition-all active:scale-[0.98]";

    const CTA_HERO_PRIMARY =
        "h-[52px] md:h-[56px] px-6 md:px-7 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white " +
        "font-black text-sm md:text-base shadow-[0_12px_28px_rgba(16,185,129,0.18)] " +
        "hover:shadow-[0_16px_34px_rgba(59,130,246,0.18)] hover:opacity-95 transition-all active:scale-95";

    const CTA_HERO_SECONDARY =
        "h-[52px] md:h-[56px] px-6 md:px-7 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 " +
        "text-slate-900 font-black text-sm md:text-base transition-all active:scale-95";

    return (
        <div className="container-ws section-y space-y-8 pb-24">

            {/* PAGE HEADER */}
            {mode === "menu" ? (
                <PageHeader
                    eyebrow={<span className="badge badge-primary">Hub</span>}
                    title={<h1 className="text-2xl md:text-3xl font-black tracking-tight text-ink">Tu opinión es una señal</h1>}
                    subtitle={<p className="text-sm text-muted font-medium">{headerSubtitle}</p>}
                    meta={
                        <div className="flex flex-wrap gap-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <span className="material-symbols-outlined text-[14px] text-emerald-500">bolt</span>
                                Señales hoy: {fmt(signalsToday)}
                            </div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <span className="material-symbols-outlined text-[14px] text-primary-500">shield</span>
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
                    }
                />
            ) : null}

            {/* NEW HUB MENU HERO & CARDS */}
            {mode === "menu" ? (
                <motion.div initial="hidden" animate="show" variants={vContainer} className="space-y-6 md:space-y-12 pb-12">

                    {/* HUB HERO ROW: TEXT + 24H PANEL */}
                    <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 md:p-8 items-stretch">
                        {/* Decorative Background Pattern */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10 opina-pattern">
                            <div className="absolute -top-12 -right-12 w-96 h-96 bg-primary-100/30 rounded-full blur-3xl"></div>
                            <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-emerald-100/20 rounded-full blur-3xl"></div>
                        </div>

                        {/* Visual Connector (SVG) */}
                        <div className="pointer-events-none absolute inset-0 hidden lg:block">
                            <svg width="100%" height="100%" viewBox="0 0 1200 360" preserveAspectRatio="none" className="opacity-[0.08]">
                                <defs>
                                    <linearGradient id="opinaConnector" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="rgb(37,99,235)" /> {/* blue-600 */}
                                        <stop offset="100%" stopColor="rgb(16,185,129)" /> {/* emerald-500 */}
                                    </linearGradient>
                                </defs>

                                {/* Línea principal */}
                                <path
                                    className="opina-drawline"
                                    d="M140 170 C 360 120, 520 240, 760 170 C 900 130, 980 150, 1060 165"
                                    fill="none" stroke="url(#opinaConnector)" strokeWidth="2" strokeLinecap="round" strokeDasharray="12 10"
                                    style={{
                                        strokeDashoffset: 220,
                                        animation: "opinaDraw 420ms ease-out 60ms forwards"
                                    }}
                                />

                                {/* Nodos */}
                                <circle cx="140" cy="170" r="5" fill="rgb(37,99,235)" />
                                <circle cx="760" cy="170" r="5" fill="rgb(16,185,129)" />
                                <circle cx="1060" cy="165" r="5" fill="rgb(15,23,42)" />
                            </svg>
                        </div>

                        {/* Left: Message */}
                        <motion.div variants={vHero} className="lg:col-span-8 flex flex-col justify-between min-h-[260px] space-y-5 max-w-2xl py-2 md:py-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-bold tracking-wide uppercase mb-2 shadow-sm w-fit">
                                <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
                                Hub Activo
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-ink leading-[1.02]">
                                Tu opinión<br />es una <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-emerald-500">señal</span>
                            </h1>
                            <p className="mt-4 text-base md:text-lg font-medium text-slate-600 leading-relaxed max-w-[56ch]">
                                Transforma tus preferencias en data que mueve el mercado. Rápido, anónimo y sin encuestas eternas.
                            </p>

                            <div className="flex items-center gap-4 pt-4">
                                <button
                                    onClick={() => setMode("versus")}
                                    className={CTA_HERO_PRIMARY}
                                >
                                    Emitir una señal
                                </button>
                                <button
                                    onClick={() => navigate("/results")}
                                    className={CTA_HERO_SECONDARY}
                                >
                                    Ver resultados
                                </button>
                            </div>
                        </motion.div>

                        {/* Right: Live Panel 24h & Top */}
                        <motion.div variants={vPanel} className="lg:col-span-4 h-full">
                            {(() => {
                                const s = hubStats || { active_users_24h: 0, signals_24h: 0, depth_answers_24h: 0, active_battles: 0 };

                                const StatCard = ({ icon, label, value }: { icon: LucideIcon; label: string; value: number }) => (
                                    <div className="group relative rounded-[20px] border border-slate-100 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                                        <div className="absolute inset-0 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-primary-500/10 to-emerald-500/10 pointer-events-none" />

                                        <div className="relative flex items-center justify-between">
                                            <HubIcon Icon={icon} size={40} />

                                            <div className="text-right">
                                                <div className="text-2xl font-black text-ink tracking-tight">
                                                    <AnimatedNumber value={value} />
                                                </div>
                                                <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</div>
                                            </div>
                                        </div>
                                    </div>
                                );

                                return (
                                    <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)] w-full h-full min-h-[260px] flex flex-col">

                                        <div className="flex-1 flex flex-col justify-start">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                        <span className="material-symbols-outlined text-[14px] text-emerald-600">monitoring</span>
                                                        Live Stats (24h)
                                                    </span>
                                                </div>

                                                <div className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-500">
                                                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    Actualizado
                                                </div>
                                            </div>

                                            <div className="mt-4 grid grid-cols-2 gap-3 flex-grow">
                                                <StatCard icon={Users} label="Activos 24h" value={s.active_users_24h} />
                                                <StatCard icon={Zap} label="Señales 24h" value={s.signals_24h} />
                                                <StatCard icon={BarChart3} label="Profundidad 24h" value={s.depth_answers_24h} />
                                                <StatCard icon={Boxes} label="Batallas activas" value={s.active_battles} />
                                            </div>

                                            {hubSeries24h.length ? (
                                                <SparkBars24h rows={hubSeries24h.map(r => ({ label: r.label, signals: r.signals, depth: r.depth }))} />
                                            ) : (
                                                <div className="mt-4 text-xs font-medium text-slate-500">Aún no hay suficiente actividad para graficar.</div>
                                            )}
                                        </div>

                                        {/* Top ahora (24h) — integrado y no vacío */}
                                        <div className="mt-4 pt-4 border-t border-slate-100">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Top ahora (24h)</div>

                                            <div className="mt-2 flex flex-col gap-2">
                                                {hubTopNow?.top_versus ? (
                                                    <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 border border-slate-100 px-3 py-2">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className="material-symbols-outlined text-[18px] text-primary-600">swap_horiz</span>
                                                            <div className="text-xs font-bold text-slate-700 truncate">{hubTopNow.top_versus.title}</div>
                                                        </div>
                                                        <div className="text-[11px] font-black text-slate-700">{fmt(hubTopNow.top_versus.signals_24h)}</div>
                                                    </div>
                                                ) : (
                                                    <div className="text-xs font-medium text-slate-500">Aún no hay suficientes señales en 24h.</div>
                                                )}

                                                {hubTopNow?.top_tournament ? (
                                                    <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 border border-slate-100 px-3 py-2">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className="material-symbols-outlined text-[18px] text-emerald-600">trending_up</span>
                                                            <div className="text-xs font-bold text-slate-700 truncate">{hubTopNow.top_tournament.title}</div>
                                                        </div>
                                                        <div className="text-[11px] font-black text-slate-700">{fmt(hubTopNow.top_tournament.signals_24h)}</div>
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>

                                    </div>
                                );
                            })()}
                        </motion.div>
                    </div>

                    {/* GRIDS - 3 Columns Desktop */}
                    <motion.div variants={vContainer} className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">

                        {/* Versus Card (Large) */}
                        <motion.div variants={vItem} className="md:col-span-2 relative group overflow-hidden bg-white rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 p-8 lg:col-span-2 min-h-[360px] flex flex-col">
                            {/* Decorative Orb */}
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-primary-400/20 to-emerald-400/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 ease-out"></div>

                            <div className="relative z-10 flex-1 flex flex-col justify-between">
                                <div className="flex-1">
                                    <div className="mb-6 w-max">
                                        <HubIcon Icon={ArrowLeftRight} size={64} />
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Señal Rápida</h2>
                                    <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-md">
                                        Compara marcas cara a cara. A vs B. Sin matices, solo instinto. El motor principal de Opina+.
                                    </p>

                                    <div className="mt-6 rounded-[24px] border border-slate-100 bg-white/70 backdrop-blur p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ahora activo (24h)</div>
                                                <div className="mt-1 text-sm font-black text-ink">
                                                    {previewVersus?.title || "Aún no hay batallas activas"}
                                                </div>
                                            </div>

                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-blue-600 to-emerald-500" />
                                                Versus
                                            </div>
                                        </div>

                                        <div className="mt-4 grid grid-cols-3 items-center gap-3">
                                            {/* Opción A */}
                                            <div className="rounded-2xl border border-slate-100 bg-white p-3">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Opción A</div>
                                                <div className="mt-1 text-sm font-black text-slate-900 truncate">{previewOptions?.[0]?.label ? previewOptions[0].label : "Cargando…"}</div>
                                            </div>

                                            {/* VS */}
                                            <div className="flex items-center justify-center">
                                                <div className="rounded-full px-3 py-1 text-[11px] font-black tracking-widest bg-gradient-to-r from-blue-600 to-emerald-500 text-white">VS</div>
                                            </div>

                                            {/* Opción B */}
                                            <div className="rounded-2xl border border-slate-100 bg-white p-3">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Opción B</div>
                                                <div className="mt-1 text-sm font-black text-slate-900 truncate">{previewOptions?.[1]?.label ? previewOptions[1].label : "Cargando…"}</div>
                                            </div>
                                        </div>

                                        <button onClick={() => setMode("versus")} className={CTA_PRIMARY_FULL + " mt-4"}>
                                            Emitir una señal
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Columna Derecha (2 chicas) */}
                        <div className="flex flex-col gap-6">

                            {/* Progressive Card */}
                            <motion.div variants={vItem} className="relative group overflow-hidden bg-white rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col h-full min-h-[170px]">
                                <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-gradient-to-tl from-purple-400/20 to-pink-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                                <div className="relative z-10 flex-1">
                                    <div className="mb-4 w-max">
                                        <HubIcon Icon={TrendingUp} size={48} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-1">Competencia</h3>
                                    <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                        Filtra a los ganadores en un modelo de llaves (16x16) por industria.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setMode("progressive")}
                                    className={CTA_SECONDARY_FULL}
                                >
                                    Ver ranking
                                </button>
                            </motion.div>

                            {/* Insights Card */}
                            <motion.div variants={vItem} className="relative group overflow-hidden bg-white rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col h-full min-h-[170px]">
                                <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-gradient-to-tl from-cyan-400/20 to-blue-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                                <div className="relative z-10 flex-1">
                                    <div className="mb-4 w-max">
                                        <HubIcon Icon={Layers} size={48} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-1">Profundidad</h3>
                                    <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                        Elige una marca y exprésate sobre ella. 10 atributos clave en segundos.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setMode("insights")}
                                    className={CTA_SECONDARY_FULL}
                                >
                                    Analizar marca
                                </button>
                            </motion.div>

                        </div>
                    </motion.div>


                </motion.div>
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
                        <div className="max-w-5xl xl:max-w-6xl mx-auto space-y-6">
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
                                        .filter((b) => (b.category as { slug?: string })?.slug === t.industry || b.industry === t.industry)
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
                    <div className="w-full max-w-4xl xl:max-w-5xl mx-auto">
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
