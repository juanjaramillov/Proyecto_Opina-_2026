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
import { SkeletonModuleCard } from "../../../components/ui/Skeleton";
import { logger } from "../../../lib/logger";

import PageHeader from "../../../components/ui/PageHeader";
import { PageState } from "../../../components/ui/StateBlocks";
import HubIcon from "../../../components/ui/HubIcon";
import { ArrowLeftRight, TrendingUp, Layers, Users, Zap, BarChart3, Boxes, type LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { PARENT_INDUSTRIES } from "../data/industries";

const BATCH_SIZE = 12;

type ExperienceMode = "menu" | "versus" | "progressive" | "insights";

const EXPERIENCE_NAV_ITEMS = [
    { id: 'versus', label: 'Versus', icon: 'dynamic_feed', activeColor: 'text-primary-600' },
    { id: 'progressive', label: 'Progresivos', icon: 'trending_up', activeColor: 'text-emerald-600' },
    { id: 'insights', label: 'Profundidad', icon: 'layers', activeColor: 'text-violet-600' }
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
    const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
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

    const filteredVersusBattles = useMemo(() => {
        if (versusIndustry === 'mix') return battlesAsGame;
        return battlesAsGame.filter(b => {
            // Check if the battle slug matches the subcategory slug EXACTLY, or if it matches ANY subcategory slug in the parent
            const categorySlug = b.category ? (b.category as { slug?: string }).slug : null;

            // If the filter is a parent category (doesn't exist directly on slugs in db, it spans multiple subcats)
            const parent = PARENT_INDUSTRIES[versusIndustry];
            if (parent) {
                if (selectedSubcategoryId) {
                    // Match the exact requested subcategory
                    const subcat = parent.subcategories.find(s => s.id === selectedSubcategoryId);
                    return subcat ? categorySlug === subcat.slug : false;
                } else {
                    // Match ANY of its subcategories
                    return parent.subcategories.some(sub => sub.slug === categorySlug);
                }
            }

            // Fallback for direct matches
            return categorySlug === versusIndustry;
        });
    }, [battlesAsGame, versusIndustry, selectedSubcategoryId]);

    const battlesForQueue = useMemo(() => {
        if (filteredVersusBattles.length === 0) return [];
        if (versusIndustry === 'mix') return filteredVersusBattles.slice(0, 10);

        const queue: Battle[] = [];
        for (let i = 0; i < 10; i++) {
            queue.push(filteredVersusBattles[i % filteredVersusBattles.length]);
        }
        return queue;
    }, [filteredVersusBattles, versusIndustry]);

    const previewVersus = useMemo(() => {
        const slugFromTop = hubTopNow?.top_versus?.slug;
        const fromTop = slugFromTop ? (battlesAsGame || []).find((b) => b.slug === slugFromTop) : null;

        if (fromTop) return fromTop;

        // Fallback: primer versus activo (asegura preview siempre lleno)
        return (battlesAsGame || [])[0] || null;
    }, [hubTopNow, battlesAsGame]);

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

    // Loading: show skeleton cards, but with the same PageHeader as the rest of the app
    if (loading && battles.length === 0) {
        return (
            <div className="container-ws section-y space-y-6 pb-24">
                <PageHeader
                    eyebrow={<span className="badge badge-primary">Hub</span>}
                    title={<h1 className="text-2xl md:text-3xl font-black tracking-tight text-ink">Participa</h1>}
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



    return (
        <div className="container-ws section-y space-y-8 pb-24">

            {/* PAGE HEADER for other modes */}
            {mode !== "menu" ? (
                <PageHeader
                    eyebrow={<span className="badge badge-primary">Hub</span>}
                    title={
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-ink">
                            Elige tu forma de señalar
                        </h1>
                    }
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

            {mode !== "menu" && (
                <ExperienceNavigation
                    currentMode={mode}
                    onChange={(m) => {
                        setSelectedOption(null);
                        setSelectedTheme(null);
                        setMode(m);
                    }}
                />
            )}

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
                                Elige tu forma<br />de <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-emerald-500">señalar</span>
                            </h1>
                            <p className="mt-4 text-base md:text-lg font-medium text-slate-600 leading-relaxed max-w-[60ch]">
                                Versus para decidir rápido. Profundidad para explicar. Rankings para ver cómo va la cosa.
                            </p>

                            <div className="flex items-center gap-4 pt-4">
                                <button
                                    onClick={() => setMode("versus")}
                                    className="h-[52px] md:h-[56px] px-6 md:px-7 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-black text-sm md:text-base shadow-[0_12px_28px_rgba(16,185,129,0.18)] hover:shadow-[0_16px_34px_rgba(59,130,246,0.18)] hover:opacity-95 transition-all active:scale-95"
                                >
                                    Emitir una señal
                                </button>
                                <button
                                    onClick={() => navigate("/results")}
                                    className="h-[52px] md:h-[56px] px-6 md:px-7 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 font-black text-sm md:text-base transition-all active:scale-95"
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
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Versus</h2>
                                    <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-md">
                                        Dos opciones. Una señal. Cero excusas.
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
                                            Ir a Versus →
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
                                    <h3 className="text-xl font-black text-slate-900 mb-1">Versus Progresivo</h3>
                                    <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                        El ganador sigue peleando. Tú solo decides quién merece el trono.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setMode("progressive")}
                                    className={CTA_SECONDARY_FULL}
                                >
                                    Jugar Progresivo →
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
                                        No todo cabe en un versus. Acá explicas el “por qué”.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setMode("insights")}
                                    className={CTA_SECONDARY_FULL}
                                >
                                    Entrar a Profundidad →
                                </button>
                            </motion.div>

                        </div>
                    </motion.div>


                </motion.div>
            ) : null}

            {mode === "versus" ? (
                <div className="space-y-8 animate-in fade-in duration-500">
                    {/* Category Selector for Versus */}
                    <div className="max-w-5xl xl:max-w-6xl mx-auto space-y-4">
                        <IndustrySelector
                            industries={PARENT_INDUSTRIES}
                            selectedParentId={versusIndustry !== 'mix' ? versusIndustry : null}
                            selectedSubcategoryId={selectedSubcategoryId}
                            onParentChange={(id) => setVersusIndustry(id || 'mix')}
                            onSubcategoryChange={(id) => setSelectedSubcategoryId(id)}
                            title="Filtrar por industria"
                            subtitle={`${filteredVersusBattles.length} batallas encontradas`}
                            hideMixOption={false}
                        />
                    </div>

                    {/* Show VersusGame only if an industry is selected */}
                    {versusIndustry !== 'mix' ? (
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-4 md:p-8 min-h-[600px] relative overflow-hidden animate-in fade-in duration-500">
                            {battlesForQueue.length > 0 ? (
                                <VersusGame
                                    key={`versus-${batchIndex}-${versusIndustry}-${selectedSubcategoryId || 'all'}`}
                                    battles={battlesForQueue}
                                    onVote={handleVote}
                                    mode="classic"
                                    enableAutoAdvance={true}
                                    hideProgress={false}
                                    isQueueFinite={true}
                                    autoNextMs={1200}
                                    disableInsights={true}
                                    onQueueComplete={handleBatchComplete}
                                    isSubmitting={false}
                                    theme={{
                                        primary: "#3b82f6",
                                        accent: "#60a5fa",
                                        bgGradient: "from-blue-50 to-white",
                                        icon: "query_stats",
                                    }}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[400px]">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100 shadow-sm">
                                        <span className="material-symbols-outlined text-4xl text-slate-300">hourglass_empty</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800 mb-2">Aún no hay batallas aquí</h3>
                                    <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium">
                                        Estamos preparando nuevas compañías para esta categoría. Si quieres ver enfrentamientos ahora, elige otra opción en el menú.
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
                    ) : (
                        <div className="bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200 p-12 text-center animate-in fade-in duration-500">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <span className="material-symbols-outlined text-3xl text-slate-300">category</span>
                            </div>
                            <h3 className="text-xl font-black text-slate-900">Selecciona una industria para comenzar</h3>
                            <p className="text-slate-500 font-medium mt-2">Elige una categoría arriba para ver los enfrentamientos disponibles.</p>
                        </div>
                    )}
                </div>
            ) : null}

            {/* PROGRESSIVE MODE */}
            {mode === "progressive" ? (
                <div className="space-y-12 animate-in fade-in duration-500">
                    {/* Category Selector (Always visible in Progressive mode) */}
                    <div className="max-w-5xl xl:max-w-6xl mx-auto space-y-6">
                        <IndustrySelector
                            industries={PARENT_INDUSTRIES}
                            selectedParentId={selectedTheme}
                            selectedSubcategoryId={selectedSubcategoryId}
                            onParentChange={(id) => {
                                setSelectedTheme(id);
                                setSelectedSubcategoryId(null);
                            }}
                            onSubcategoryChange={(id) => setSelectedSubcategoryId(id)}
                            title="Elige tu Torneo"
                            subtitle={selectedTheme
                                ? "Puedes cambiar de categoría en cualquier momento."
                                : "Enfrenta marcas cara a cara hasta encontrar tu favorita."
                            }
                            hideMixOption={true}
                        />
                    </div>

                    {/* Active Tournament Runner */}
                    {selectedTheme ? (
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-4 md:p-8 min-h-[600px] relative overflow-hidden">
                            {/* Decorative Background */}
                            <div className="absolute inset-0 pointer-events-none opacity-30">
                                <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br transition-all duration-700 ${PARENT_INDUSTRIES[selectedTheme].theme.bgGradient} rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`} />
                            </div>

                            <ProgressiveRunner
                                progressiveData={(() => {
                                    const t = PARENT_INDUSTRIES[selectedTheme];

                                    // Target specific subcategory or all from parent
                                    const targetSlugs = selectedSubcategoryId
                                        ? [t.subcategories.find(s => s.id === selectedSubcategoryId)?.slug]
                                        : t.subcategories.map(s => s.slug);

                                    return {
                                        id: t.id,
                                        title: t.title,
                                        subtitle: t.subtitle,
                                        industry: targetSlugs[0] || t.id,
                                        theme: t.theme,
                                        candidates: (battlesAsGame || [])
                                            .filter((b) => {
                                                const catSlug = (b.category as { slug?: string })?.slug;
                                                return targetSlugs.includes(catSlug) || targetSlugs.includes(b.industry);
                                            })
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
                    ) : (
                        <div className="bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200 p-12 text-center">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <span className="material-symbols-outlined text-3xl text-slate-300">target</span>
                            </div>
                            <h3 className="text-xl font-black text-slate-900">Selecciona un canal para comenzar</h3>
                            <p className="text-slate-500 font-medium mt-2">Enfrenta opciones una a una hasta coronar a la mejor.</p>
                        </div>
                    )}
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
                                setSelectedTheme(id);
                                setSelectedSubcategoryId(null);
                            }}
                            onSubcategoryChange={(id) => setSelectedSubcategoryId(id)}
                            title="Elige tu Torneo"
                            subtitle={selectedTheme
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
                                                ? [parent.subcategories.find(s => s.id === selectedSubcategoryId)?.slug]
                                                : parent.subcategories.map(s => s.slug);

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
                                <h2 className="text-2xl md:text-3xl font-black text-ink">Resultados de tu sesión</h2>
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

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => {
                                        setShowBatchResults(false);
                                        if (versusIndustry !== 'mix') {
                                            setVersusIndustry('mix');
                                        }
                                        navigate("/experience");
                                    }}
                                    className="w-full flex-1 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all"
                                >
                                    Seguir Señalando
                                </button>
                                <button
                                    onClick={() => { setShowBatchResults(false); navigate("/results"); }}
                                    className="w-full flex-1 py-4 bg-primary-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-primary-500/20 hover:bg-primary-700 active:scale-95 transition-all"
                                >
                                    Ir a Resultados Globales →
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
