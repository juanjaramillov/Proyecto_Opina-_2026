import { useState, useEffect } from "react";
import { useActiveBattles } from "../../../hooks/useActiveBattles";
import VersusGame from "../../signals/components/VersusGame";
import { useSignalStore } from "../../../store/signalStore";
// import { SIGNALS_PER_BATCH } from "../../../config/constants";
import { useLocation, useNavigate } from "react-router-dom";
import { DepthSelector } from '../../signals/components/DepthSelector';
import { useToast } from "../../../components/ui/useToast";

import { signalService, ActiveBattle } from "../../signals/services/signalService";
import { sessionService } from "../../signals/services/sessionService";
import InsightPack from "../../signals/components/InsightPack";
import { Battle, BattleOption } from "../../signals/types";
import { useAuth } from "../../auth";
import RequestLoginModal from "../../auth/components/RequestLoginModal";
import ProgressiveRunner from "../../signals/components/ProgressiveRunner";
import { SkeletonModuleCard } from "../../../components/ui/Skeleton";
import { logger } from "../../../lib/logger";
const PROGRESSIVE_THEMES = {
    streaming: {
        id: 'tournament-streaming',
        title: 'La Guerra del Streaming',
        subtitle: '¿Cuál es tu plataforma definitiva?',
        industry: 'streaming',
        theme: {
            primary: '#8b5cf6', // violet
            accent: '#a78bfa',
            bgGradient: 'from-violet-50 to-white',
            icon: 'movie'
        }
    },
    bebidas: {
        id: 'tournament-bebidas',
        title: 'Battle of the Brands',
        subtitle: '¿Cuál es tu bebida indispensable?',
        industry: 'bebidas',
        theme: {
            primary: '#ef4444', // red
            accent: '#f87171',
            bgGradient: 'from-red-50 to-white',
            icon: 'local_drink'
        }
    },
    vacaciones: {
        id: 'tournament-vacaciones',
        title: 'Destino de Ensueño',
        subtitle: '¿A dónde te escaparías mañana?',
        industry: 'vacaciones',
        theme: {
            primary: '#0ea5e9', // sky
            accent: '#38bdf8',
            bgGradient: 'from-sky-50 to-white',
            icon: 'beach_access'
        }
    },
    smartphones: {
        id: 'tournament-smartphones',
        title: 'Duelo de Gigantes Tech',
        subtitle: '¿Qué smartphone domina tu vida?',
        industry: 'smartphones',
        theme: {
            primary: '#3b82f6', // blue
            accent: '#60a5fa',
            bgGradient: 'from-blue-50 to-white',
            icon: 'smartphone'
        }
    },
    salud: {
        id: 'tournament-salud',
        title: 'Excelencia Médica',
        subtitle: '¿Cuál es la mejor clínica?',
        industry: 'salud',
        theme: {
            primary: '#10b981', // emerald
            accent: '#34d399',
            bgGradient: 'from-emerald-50 to-white',
            icon: 'medical_services'
        }
    }
};

// const BATCH_SIZE = SIGNALS_PER_BATCH;
const BATCH_SIZE = 50; // 🧪 MODO PRUEBAS: Lotes extendidos

type ExperienceMode = "menu" | "versus" | "progressive" | "insights";

export default function Experience() {
    // 1. ALL HOOKS FIRST (Unconditional)
    const { battles, loading } = useActiveBattles();
    const { profile } = useAuth();
    const { signals, signalsToday } = useSignalStore();
    const location = useLocation();
    const navigate = useNavigate();
    const { showToast } = useToast();

    // State
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<BattleOption | null>(null);
    const [selectedTheme, setSelectedTheme] = useState<keyof typeof PROGRESSIVE_THEMES | null>(null);

    // Navigation & Batch Logic
    const requestedBatch = (location.state as { nextBatch?: number })?.nextBatch;
    const computedBatch = Math.floor(signals / BATCH_SIZE);
    const initialBatch = typeof requestedBatch === "number" ? requestedBatch : computedBatch;
    const [batchIndex] = useState(initialBatch);

    const [mode, setMode] = useState<ExperienceMode>(
        typeof requestedBatch === "number" ? "versus" : "menu"
    );

    // 2. EFFECTS
    // Enforce profile completion
    // 🧪 MODO FIX 04: Redirección relajada. Se maneja por evento en VersusGame.
    /*
    useEffect(() => {
        if (profile && !profile.isProfileComplete) {
            navigate("/complete-profile", { replace: true });
        }
    }, [profile, navigate]);
    */

    // Start or resume session when in versus mode
    useEffect(() => {
        const initSession = async () => {
            if (mode === "versus") {
                try {
                    // Start or Resume session
                    await sessionService.startNewSession();
                } catch (err) {
                    logger.error("Session init failed:", err);
                }
            }
        };
        initSession();
    }, [mode]);

    // 3. HANDLERS
    const handleOptionSelect = (option: BattleOption) => {
        setSelectedOption(option);
        setMode("insights");
    };

    const handleVote = async (battleId: string, optionId: string, _opponentId: string): Promise<Record<string, number>> => {
        // 🧪 MODO PRUEBAS: Límites desactivados por petición del usuario
        /*
        if (profile && profile.signalsDailyLimit !== -1 && signalsToday >= profile.signalsDailyLimit) {
            if (profile.tier === 'guest') {
                setIsLoginModalOpen(true);
                showToast("Límite de invitado alcanzado. Verifica tu cuenta para emitir más señales.", "info");
            } else {
                showToast("Has alcanzado tu límite diario de señales. ¡Vuelve mañana!", "info");
            }
            return {};
        }
        */

        // Fire-and-forget signal save to eliminate UI friction
        signalService.saveSignalEvent({
            battle_id: battleId,
            option_id: optionId
        }).catch(err => {
            logger.error("Failed to save vote:", err);
            // Ya no informamos "offline se sincronizará luego" aquí
            // puesto que saveSignalEvent SIEMPRE encola con éxito sin lanzar excepción,
            // (los errores de encolamiento lanzan excepción pero no los de flush).
            // Si llega aquí, es porque fue explícitamente rechazado de encolarse
            // (ej. límite alcanzado u error grave).
            showToast("No se pudo registrar la señal.", "error");
        });

        // Resolve immediately for local ultra-fast UI transition
        return {};
    };

    const handleBatchComplete = () => {
        navigate("/results", { state: { batchIndex } });
    };

    const handlePlaceholderClick = (name: string) => {
        showToast(`La experiencia "${name}" estará disponible próximamente.`, "info");
    };

    // 4. EARLY RETURNS
    // if (profile && !profile.isProfileComplete) return null; // FIX 04: Quitamos el return nulo para permitir ver el Hub
    if (loading && battles.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col items-center gap-4 mb-12 animate-pulse">
                        <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-full px-3 py-1 text-xs font-bold tracking-widest uppercase text-slate-600">
                            <span className="material-symbols-outlined text-[16px]">bolt</span>
                            Emite señales
                        </div>
                        <h1 className="mt-4 text-3xl md:text-4xl font-black tracking-tight text-slate-900">
                            Tu opinión es una señal
                        </h1>
                        <p className="mt-2 text-slate-600 max-w-2xl mx-auto">
                            Selecciona tu canal de expresión.
                        </p>
                    </div>
                    {/* Skeleton Grid for 6 Hub modules */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-70">
                        <SkeletonModuleCard />
                        <SkeletonModuleCard />
                        <SkeletonModuleCard />
                        <SkeletonModuleCard />
                        <SkeletonModuleCard />
                        <SkeletonModuleCard />
                    </div>
                </div>
            </div>
        );
    }

    // Insight option select removed

    if (loading) return null;

    return (
        <div className="min-h-screen bg-white">
            {/* TOP HERO STRIP */}
            <section className="relative overflow-hidden bg-white text-slate-900 pt-10 pb-8">
                <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-full px-3 py-1 text-xs font-bold tracking-widest uppercase text-slate-600">
                        <span className="material-symbols-outlined text-[16px]">bolt</span>
                        Emite señales
                    </div>

                    <h1 className="mt-4 text-3xl md:text-4xl font-black tracking-tight text-slate-900">
                        Tu opinión es una señal
                    </h1>
                    <p className="mt-2 text-slate-600 max-w-2xl mx-auto">
                        {mode === 'menu'
                            ? 'Selecciona tu canal de expresión.'
                            : (mode === 'versus'
                                ? `Bloque ${batchIndex + 1}: Calibrando preferencias.`
                                : '')}
                    </p>

                    {/* BACK TO HUB BUTTON */}
                    {mode !== 'menu' && (
                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={() => setMode('menu')}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm transition-all active:scale-95"
                            >
                                <span className="material-symbols-outlined text-lg">grid_view</span>
                                Volver al Hub
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* GLOBAL EMPTY STATE when no battles loaded */}
            {!loading && battles.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-4xl text-slate-400">dns</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Conectando con la base de señales...</h2>
                    <p className="text-slate-500 max-w-md">
                        Estamos calibrando las experiencias. Si esto persiste, verifica tu conexión o la base de datos.
                    </p>
                </div>
            )}

            {/* INTERACTION AREA */}
            {battles.length > 0 && (
                <section className="relative z-10 w-full max-w-6xl mx-auto px-4 pb-20">

                    {/* HUB MENU */}
                    {mode === 'menu' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            {/* 1. VERSUS (Classic) */}
                            <button
                                onClick={() => setMode('versus')}
                                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all text-left flex flex-col h-full group hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50 hover:-translate-y-1 active:scale-[0.98]"
                            >
                                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-2xl">swords</span>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Versus</h3>
                                <p className="text-sm text-slate-500 mb-4">Comparaciones rápidas 1 vs 1. Calibra tus preferencias fundamentales.</p>

                                <div className="mt-auto flex items-center gap-3 pt-4 border-t border-slate-50">
                                    <div className="flex items-center gap-1.5">
                                        <span className="relative flex h-1.5 w-1.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                        </span>
                                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">124 en línea</span>
                                    </div>
                                    <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">8.4k señales hoy</div>
                                </div>
                            </button>

                            {/* 2. PROGRESIVO (Ladder Tournament) */}
                            <button
                                onClick={() => setMode('progressive')}
                                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all text-left flex flex-col h-full group hover:shadow-lg hover:shadow-secondary/10 hover:border-secondary/50 hover:-translate-y-1 active:scale-[0.98]"
                            >
                                <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-2xl">rocket_launch</span>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Versus Progresivo</h3>
                                <p className="text-sm text-slate-500 mb-4">Modo torneo. Enfrenta a los mejores hasta coronar a un único ganador.</p>

                                <div className="mt-auto flex items-center gap-3 pt-4 border-t border-slate-50">
                                    <div className="flex items-center gap-1.5">
                                        <span className="relative flex h-1.5 w-1.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                        </span>
                                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">42 en línea</span>
                                    </div>
                                    <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">1.2k récords</div>
                                </div>
                            </button>


                            {/* 3. PROFUNDIDAD (ACTIVO) */}
                            <button
                                onClick={() => setMode('insights')}
                                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all text-left flex flex-col h-full group hover:shadow-lg hover:shadow-emerald-500/10 hover:border-emerald-500/50 hover:-translate-y-1 active:scale-[0.98]"
                            >
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-2xl">insights</span>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Profundidad</h3>
                                <p className="text-sm text-slate-500 mb-4">Análisis detallado. Ayuda a refinar la inteligencia colectiva sobre opciones específicas.</p>

                                <div className="mt-auto flex items-center gap-3 pt-4 border-t border-slate-50">
                                    <div className="flex items-center gap-1.5">
                                        <span className="relative flex h-1.5 w-1.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                        </span>
                                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Activo</span>
                                    </div>
                                    <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">Core Insights</div>
                                </div>
                            </button>

                            {/* 4. BIENESTAR */}
                            <button
                                onClick={() => navigate('/personal-state')}
                                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all text-left flex flex-col h-full group hover:shadow-lg hover:shadow-rose-500/10 hover:border-rose-500/50 hover:-translate-y-1 active:scale-[0.98]"
                            >
                                <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-2xl">favorite</span>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Módulo de Bienestar</h3>
                                <p className="text-sm text-slate-500 mb-4">Ayuda a calibrar el motor sincronizando tu estado actual. 100% anónimo.</p>

                                <div className="mt-auto flex items-center gap-3 pt-4 border-t border-slate-50">
                                    <div className="flex items-center gap-1.5">
                                        <span className="relative flex h-1.5 w-1.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                        </span>
                                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Activo</span>
                                    </div>
                                    <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">Personal & Privado</div>
                                </div>
                            </button>

                            {/* 5. LUGARES (Placeholder) */}
                            <button
                                onClick={() => handlePlaceholderClick('Lugares')}
                                className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left flex flex-col h-full group opacity-70 cursor-default relative overflow-hidden"
                            >
                                <div className="absolute top-3 right-3 px-2 py-0.5 bg-slate-800 rounded-md text-[10px] font-bold text-white uppercase tracking-wider">Próximamente</div>
                                <div className="w-12 h-12 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-2xl">location_on</span>
                                </div>
                                <h3 className="text-xl font-black text-slate-700 tracking-tight mb-2">Lugares</h3>
                                <p className="text-sm text-slate-500">Califica experiencias en ubicaciones físicas.</p>
                            </button>

                            {/* 6. SERVICIO (Placeholder) */}
                            <button
                                onClick={() => handlePlaceholderClick('Servicio')}
                                className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left flex flex-col h-full group opacity-70 cursor-default relative overflow-hidden"
                            >
                                <div className="absolute top-3 right-3 px-2 py-0.5 bg-slate-800 rounded-md text-[10px] font-bold text-white uppercase tracking-wider">Próximamente</div>
                                <div className="w-12 h-12 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-2xl">support_agent</span>
                                </div>
                                <h3 className="text-xl font-black text-slate-700 tracking-tight mb-2">Servicio</h3>
                                <p className="text-sm text-slate-500">Evalúa la calidad de atención y servicio.</p>
                            </button>

                            {/* 7. NPS (Placeholder) */}
                            <button
                                onClick={() => handlePlaceholderClick('NPS')}
                                className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left flex flex-col h-full group opacity-70 cursor-default relative overflow-hidden"
                            >
                                <div className="absolute top-3 right-3 px-2 py-0.5 bg-slate-800 rounded-md text-[10px] font-bold text-white uppercase tracking-wider">Próximamente</div>
                                <div className="w-12 h-12 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-2xl">thumbs_up_down</span>
                                </div>
                                <h3 className="text-xl font-black text-slate-700 tracking-tight mb-2">NPS</h3>
                                <p className="text-sm text-slate-500">Net Promoter Score. ¿Recomendarías esta marca?</p>
                            </button>

                            {/* 8. ACTUALIDAD (Placeholder/New) */}
                            <button
                                onClick={() => handlePlaceholderClick('Actualidad')}
                                className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left flex flex-col h-full group opacity-70 cursor-default relative overflow-hidden"
                            >
                                <div className="absolute top-3 right-3 px-2 py-0.5 bg-slate-800 rounded-md text-[10px] font-bold text-white uppercase tracking-wider">Próximamente</div>
                                <div className="w-12 h-12 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-2xl">newspaper</span>
                                </div>
                                <h3 className="text-xl font-black text-slate-700 tracking-tight mb-2">Actualidad</h3>
                                <p className="text-sm text-slate-500">Vota sobre noticias y temas del momento con opciones opuestas (ej. Sí / No).</p>
                            </button>

                            {/* 9. ESCÁNER (Placeholder/New) */}
                            <button
                                onClick={() => handlePlaceholderClick('Escáner de Productos')}
                                className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left flex flex-col h-full group opacity-70 cursor-default relative overflow-hidden"
                            >
                                <div className="absolute top-3 right-3 px-2 py-0.5 bg-slate-800 rounded-md text-[10px] font-bold text-white uppercase tracking-wider">Próximamente</div>
                                <div className="w-12 h-12 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-2xl">qr_code_scanner</span>
                                </div>
                                <h3 className="text-xl font-black text-slate-700 tracking-tight mb-2">Escáner</h3>
                                <p className="text-sm text-slate-500">Escanea el código de barras de un producto para ver su ficha y valoración comunitaria.</p>
                            </button>

                        </div>
                    )}

                    {/* VERSUS MODE (Standard 1-on-1 Batch) */}
                    {mode === 'versus' && (
                        <div className="relative animate-in fade-in slide-in-from-bottom-8 duration-500" id="battle-runner">
                            <VersusGame
                                key={`versus-${batchIndex}`}
                                battles={battles as unknown as Battle[]}
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
                                    primary: '#3b82f6',
                                    accent: '#60a5fa',
                                    bgGradient: 'from-blue-50 to-white',
                                    icon: 'query_stats'
                                }}
                            />
                        </div>
                    )}


                    {/* PROGRESSIVE MODE (Tournament Ladder) */}
                    {mode === 'progressive' && (
                        <div className="relative animate-in fade-in slide-in-from-bottom-8 duration-500" id="battle-progressive">
                            {!selectedTheme ? (
                                <div className="max-w-4xl mx-auto space-y-12">
                                    <div className="text-center space-y-4">
                                        <h2 className="text-4xl font-black text-ink">Elige tu <span className="text-secondary">Torneo</span></h2>
                                        <p className="text-text-secondary text-lg">Enfrenta opciones del mismo tema hasta encontrar al ganador.</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {Object.entries(PROGRESSIVE_THEMES).map(([key, theme]) => (
                                            <button
                                                key={key}
                                                onClick={() => setSelectedTheme(key as keyof typeof PROGRESSIVE_THEMES)}
                                                className="bg-white p-8 rounded-3xl border border-stroke hover:border-secondary/50 hover:shadow-xl transition-all group text-left space-y-4"
                                            >
                                                <div className="w-12 h-12 rounded-2xl bg-secondary/5 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                                                    <span className="material-symbols-outlined">
                                                        {theme.theme.icon}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-xl text-ink leading-tight">{theme.title}</h4>
                                                    <p className="text-sm text-text-secondary mt-1">{theme.subtitle}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="text-center pt-8">
                                        <button onClick={() => setMode('menu')} className="text-sm font-bold text-text-secondary hover:text-ink">Volver al Hub</button>
                                    </div>
                                </div>
                            ) : (
                                (() => {
                                    const theme = PROGRESSIVE_THEMES[selectedTheme];
                                    const battleData = (battles as ActiveBattle[]).find(b => b.category?.slug === theme.industry);

                                    if (!battleData) return (
                                        <div className="text-center p-12 bg-white rounded-3xl border border-stroke">
                                            <p className="text-text-secondary">No hay datos disponibles para este torneo.</p>
                                            <button onClick={() => setSelectedTheme(null)} className="mt-4 text-secondary font-bold">Volver</button>
                                        </div>
                                    );

                                    return (
                                        <ProgressiveRunner
                                            progressiveData={{
                                                ...theme,
                                                candidates: battleData.options || []
                                            }}
                                            onVote={handleVote}
                                            onComplete={(winner) => {
                                                showToast(`¡Torneo completado! El ganador es ${winner.label}`, "success");
                                                setSelectedTheme(null);
                                                setMode('menu');
                                            }}
                                        />
                                    );
                                })()
                            )}
                        </div>
                    )}

                    {/* INSIGHTS MODE (Profundidad) */}
                    {mode === 'insights' && (
                        <div className="w-full max-w-2xl mx-auto">
                            <DepthSelector
                                options={battles.flatMap(b => b.options)}
                                onSelect={handleOptionSelect}
                            />
                        </div>
                    )}

                    {/* INSIGHT PACK OVERLAY */}
                    {selectedOption && mode === 'insights' && (
                        <InsightPack
                            optionId={selectedOption.id}
                            optionLabel={selectedOption.label}
                            onComplete={() => {
                                setSelectedOption(null);
                                setMode('menu');
                            }}
                            onCancel={() => setSelectedOption(null)}
                        />
                    )}
                </section>
            )
            }

            {/* FOOTER TEASER */}
            <section className="relative z-10 max-w-6xl mx-auto px-4 text-center pb-8 opacity-30 mt-auto">
                <p className="text-xs text-slate-500">
                    Las señales se vuelven más valiosas con mejor perfil y verificación.
                    ({signalsToday}/{profile?.signalsDailyLimit ?? '?'})
                </p>
            </section>

            <RequestLoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onSuccess={() => {
                    setIsLoginModalOpen(false);
                    showToast("¡Verificación exitosa! Tu límite ha aumentado.", "success");
                }}
            />
        </div >
    );
}
