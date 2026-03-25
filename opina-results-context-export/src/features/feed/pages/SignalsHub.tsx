import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useActiveBattles } from "../../../hooks/useActiveBattles";
import { useSignalStore } from "../../../store/signalStore";
import { useAuth } from "../../auth";
import { trackEvent } from "../../../services/analytics/trackEvent";

import PageHeader from "../../../components/ui/PageHeader";
import { PageState } from "../../../components/ui/StateBlocks";
import { SkeletonModuleCard } from "../../../components/ui/Skeleton";

import { ActualidadHubManager } from "../components/ActualidadHubManager";
import VersusView from "../components/VersusView";
import TorneoView from "../components/TorneoView";
import ProfundidadView from "../components/ProfundidadView";
import LugaresView from "../components/LugaresView";
import BatchSessionResults, { BatchSessionResultRecord } from "../components/BatchSessionResults";
import { ModuleErrorBoundary } from "../../../components/ui/ModuleErrorBoundary";
import HubSecondaryTracks from "../components/hub/HubSecondaryTracks";

import { useExperienceMode } from "../hooks/useExperienceMode";
import { Battle } from "../../signals/types";

// Nuevos estados principales del Hub (Motor de Sesión)
import { useHubSession } from "../hooks/useHubSession";
import HubActiveState from "../components/HubActiveState";
import HubCooldownState from "../components/HubCooldownState";


export default function SignalsHub() {
    const { mode, setMode, requestedBatch, resetToMenu } = useExperienceMode();
    const { currentState: hubState } = useHubSession();
    
    const { battles, loading, error } = useActiveBattles();
    const { profile } = useAuth();
    const { signalsToday } = useSignalStore();
    const navigate = useNavigate();

    const [showBatchResults, setShowBatchResults] = useState(false);
    const [batchSessionHistory, setBatchSessionHistory] = useState<BatchSessionResultRecord[]>([]);

    const [batchIndex] = useState(typeof requestedBatch === "number" ? requestedBatch : 0);

    const fmt = (n: number) => new Intl.NumberFormat("es-CL").format(Number.isFinite(n) ? n : 0);
    const signalsLimit = profile?.role === 'admin' ? '∞' : profile?.signalsDailyLimit === -1 ? '∞' : (profile?.signalsDailyLimit ?? "?").toString();

    useEffect(() => {
        trackEvent('user_entered_signals');
    }, []);

    useEffect(() => {
        if (profile && !profile.isProfileComplete && profile.role !== 'admin') {
            navigate("/complete-profile", { replace: true });
        }
    }, [profile, navigate]);

    if (profile && !profile.isProfileComplete && profile.role !== 'admin') return null;

    const handleBatchComplete = (history: Array<{ battle: Battle; myVote: 'A' | 'B'; pctA: number }>) => {
        setBatchSessionHistory(history || []);
        setShowBatchResults(true);
    };

    if (loading && battles.length === 0 && mode !== 'menu') {
        return (
            <div className="container-ws section-y space-y-6 pb-24">
                <PageHeader
                    eyebrow={<span className="badge badge-primary">Hub</span>}
                    title={<h1 className="text-2xl md:text-3xl font-black tracking-tight text-ink">Buscando <span className="text-primary">señales</span></h1>}
                    subtitle={<p className="text-sm text-muted font-medium">Cargando el ecosistema...</p>}
                    meta={
                        <div className="flex flex-wrap gap-2">
                            <div className="badge badge-outline">Señales hoy: {fmt(signalsToday)}</div>
                            <div className="badge badge-outline">Límite: {signalsLimit}</div>
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

    if (error) {
        return (
            <div className="container-ws section-y">
                <PageState
                    type="error"
                    title="Error al conectar con el motor"
                    description="No pudimos cargar las señales activas. Revisa tu conexión."
                    icon="cloud_off"
                    primaryAction={{ label: "Intentar de nuevo", onClick: () => window.location.reload() }}
                />
            </div>
        );
    }

    // Flujo Principal de Sesión (Cuando el usuario entra al Hub por defecto)
    if (mode === "menu") {
        if (!loading && battles.length === 0 && hubState === 'ACTIVE') {
             return (
                <div className="container-ws section-y">
                    <PageState
                        type="empty"
                        title="Sin señales activas"
                        description="La comunidad está procesando. Vuelve más tarde."
                        icon="radar"
                        primaryAction={{ label: "Volver al inicio", onClick: () => navigate("/") }}
                    />
                </div>
            );
        }

        return (
            <div className="w-full pb-24 md:pb-0 relative min-h-screen bg-white">
                
                {/* 1. HERO EDITORIAL LUMINOSO (Solo visible en Menu) */}
                <section className="relative w-full pt-8 pb-6 md:pt-16 md:pb-12 bg-white border-b border-slate-100/50 overflow-hidden">
                    
                    {/* FONDO: Detalles visuales corporativos (ondas, brillos, estrellas) */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-0">
                        {/* Glower softer blue background */}
                        <div className="absolute top-0 right-0 w-[90%] md:w-[70%] h-full bg-gradient-to-l from-blue-50/70 via-blue-50/20 to-transparent"></div>
                        <div className="absolute top-[-20%] right-[10%] w-[50%] h-[70%] bg-blue-100/40 rounded-full blur-[120px]"></div>
                        <div className="absolute bottom-[-10%] left-[10%] w-[40%] h-[60%] bg-teal-50/50 rounded-full blur-[100px]"></div>

                        {/* Líneas sutiles cruzadas (Swooping lines) */}
                        <svg className="absolute w-[180%] md:w-[130%] left-[-40%] md:left-[-15%] top-[-10%] md:top-[0%] opacity-[0.35]" viewBox="0 0 1440 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M-100 450 C400 650, 800 50, 1600 200" stroke="url(#swoop1)" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M-50 480 C450 680, 850 80, 1650 230" stroke="url(#swoop2)" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
                            <path d="M0 520 C500 720, 900 120, 1700 270" stroke="url(#swoop3)" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                            <path d="M100 560 C600 760, 1000 160, 1800 310" stroke="url(#swoop4)" strokeWidth="0.5" strokeLinecap="round" opacity="0.9" />
                            
                            <defs>
                                <linearGradient id="swoop1" x1="0" y1="450" x2="1440" y2="200" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#3B82F6" stopOpacity="0" />
                                    <stop offset="0.3" stopColor="#3B82F6" stopOpacity="0.8" />
                                    <stop offset="0.7" stopColor="#0EA5E9" stopOpacity="0.8" />
                                    <stop offset="1" stopColor="#10B981" stopOpacity="0" />
                                </linearGradient>
                                <linearGradient id="swoop2" x1="0" y1="480" x2="1440" y2="230" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#0EA5E9" stopOpacity="0" />
                                    <stop offset="0.4" stopColor="#0EA5E9" stopOpacity="0.6" />
                                    <stop offset="0.8" stopColor="#3B82F6" stopOpacity="0.6" />
                                    <stop offset="1" stopColor="#3B82F6" stopOpacity="0" />
                                </linearGradient>
                                <linearGradient id="swoop3" x1="0" y1="520" x2="1440" y2="270" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#10B981" stopOpacity="0" />
                                    <stop offset="0.5" stopColor="#10B981" stopOpacity="0.4" />
                                    <stop offset="1" stopColor="#0EA5E9" stopOpacity="0" />
                                </linearGradient>
                                <linearGradient id="swoop4" x1="0" y1="560" x2="1440" y2="310" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#6366F1" stopOpacity="0" />
                                    <stop offset="0.5" stopColor="#6366F1" stopOpacity="0.5" />
                                    <stop offset="1" stopColor="#3B82F6" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                        </svg>

                        {/* Olas suaves vectoriales superpuestas */}
                        <svg className="absolute bottom-[-1px] w-[130%] md:w-full left-[-15%] md:left-0 text-white z-0 opacity-80" viewBox="0 0 1440 220" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0,128L80,117.3C160,107,320,85,480,96C640,107,800,149,960,154.7C1120,160,1280,128,1360,112L1440,96L1440,220L1360,220C1280,220,1120,220,960,220C800,220,640,220,480,220C320,220,160,220,80,220L0,220Z" fill="url(#wave_grad1)" opacity="0.3"></path>
                            <path d="M0,160L80,165.3C160,171,320,181,480,165.3C640,149,800,107,960,96C1120,85,1280,107,1360,117.3L1440,128L1440,220L1360,220C1280,220,1120,220,960,220C800,220,640,220,480,220C320,220,160,220,80,220L0,220Z" fill="url(#wave_grad2)" opacity="0.4"></path>
                            <path d="M0,192L80,181.3C160,171,320,149,480,144C640,139,800,149,960,165.3C1120,181,1280,203,1360,213.3L1440,224L1440,224L1360,224C1280,224,1120,224,960,224C800,224,640,224,480,224C320,224,160,224,80,224L0,224Z" fill="#ffffff"></path>
                            <defs>
                                <linearGradient id="wave_grad1" x1="0" y1="0" x2="1440" y2="0">
                                    <stop stopColor="#ffffff" stopOpacity="0" />
                                    <stop offset="0.5" stopColor="#e0f2fe" stopOpacity="1" />
                                    <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
                                </linearGradient>
                                <linearGradient id="wave_grad2" x1="0" y1="0" x2="1440" y2="0">
                                    <stop stopColor="#ffffff" stopOpacity="0" />
                                    <stop offset="0.5" stopColor="#dcfce7" stopOpacity="0.8" />
                                    <stop offset="1" stopColor="#ffffff" stopOpacity="0.5" />
                                </linearGradient>
                            </defs>
                        </svg>

                        {/* Partículas / Estrellas Destellantes */}
                        <div className="absolute top-[18%] left-[12%] w-[3px] h-[3px] bg-blue-400 rounded-full shadow-[0_0_8px_2px_rgba(96,165,250,0.6)] opacity-70 animate-pulse"></div>
                        <div className="absolute top-[28%] right-[48%] w-[4px] h-[4px] bg-emerald-300 rounded-full shadow-[0_0_8px_2px_rgba(110,231,183,0.6)] opacity-50 animate-[pulse_3s_ease-in-out_infinite]"></div>
                        <div className="absolute bottom-[25%] left-[45%] w-[2px] h-[2px] bg-blue-300 rounded-full shadow-[0_0_4px_1px_rgba(147,197,253,0.6)] opacity-60"></div>
                        <div className="absolute top-[42%] right-[28%] w-[5px] h-[5px] bg-teal-300 rounded-full shadow-[0_0_10px_3px_rgba(45,212,191,0.5)] opacity-80 animate-[pulse_4s_ease-in-out_infinite]"></div>
                        
                        {/* Símbolos de Estrellas */}
                        <svg className="absolute top-[12%] left-[42%] w-3 h-3 text-blue-300 opacity-60 drop-shadow-md animate-[pulse_4s_ease-in-out_infinite]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0L13.5 8.5L22 10L13.5 11.5L12 20L10.5 11.5L2 10L10.5 8.5L12 0Z" />
                        </svg>
                        <svg className="absolute bottom-[35%] right-[38%] w-4 h-4 text-emerald-200 opacity-50 drop-shadow-md animate-[pulse_3.5s_ease-in-out_infinite]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0L13.5 8.5L22 10L13.5 11.5L12 20L10.5 11.5L2 10L10.5 8.5L12 0Z" />
                        </svg>
                        <svg className="absolute top-[25%] right-[18%] w-2 h-2 text-indigo-300 opacity-60 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0L13.5 8.5L22 10L13.5 11.5L12 20L10.5 11.5L2 10L10.5 8.5L12 0Z" />
                        </svg>
                    </div>

                    <div className="container-ws grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
                        {/* Columna Izquierda: Texto y Métricas simples */}
                        <div className="flex flex-col items-center text-center lg:items-start lg:text-left space-y-4">
                            <span className="text-[11px] font-bold text-blue-600 tracking-widest uppercase">Señales</span>
                            
                            <h1 className="text-4xl md:text-5xl lg:text-[56px] font-black text-slate-800 tracking-tight leading-[1.05]">
                                Pon a prueba tu <br className="hidden md:block"/> instinto, <span className="bg-gradient-to-r from-teal-500 to-emerald-400 bg-clip-text text-transparent">perspectiva<br className="hidden md:block"/> y criterio.</span>
                            </h1>
                            
                            <p className="text-base md:text-lg text-slate-500 max-w-lg font-medium leading-relaxed mt-2">
                                Evalúa tendencias y descubre cómo se inclina la comunidad en tiempo real.
                            </p>

                            <div className="flex items-center justify-center lg:justify-start gap-8 pt-4">
                                <div className="flex flex-col items-center lg:items-start">
                                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">Participación Hoy</span>
                                    <span className="text-lg font-bold text-slate-800 tracking-tight">{fmt(signalsToday)} <span className="text-xs text-slate-400 font-bold uppercase tracking-wider ml-0.5">señales</span></span>
                                </div>
                                <div className="w-px h-8 bg-slate-200/80"></div>
                                <div className="flex flex-col items-center lg:items-start">
                                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">Estado Motor</span>
                                    <span className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 mt-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-[pulse_2s_ease-in-out_infinite]"></span> Activo
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Columna Derecha: BLOQUE FUNCIONAL VIVO */}
                        <div className="w-full flex justify-center lg:justify-end mt-2 lg:mt-0 relative">
                            {/* Brillo detrás de la zona funcional para destacar las tarjetas interactivas */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/40 to-teal-100/30 rounded-[3rem] blur-2xl -z-10"></div>
                            
                            <div className="w-full max-w-[500px]">
                                <ModuleErrorBoundary moduleName={hubState === 'ACTIVE' ? "HubActiveState" : "HubCooldownState"}>
                                    {hubState === 'ACTIVE' ? (
                                        <HubActiveState battles={(battles as unknown as Battle[])} onBatchComplete={handleBatchComplete} />
                                    ) : (
                                        <HubCooldownState />
                                    )}
                                </ModuleErrorBoundary>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. RADAR DE SEÑALES */}
                <section className="container-ws pb-16 md:pb-20 pt-4 md:pt-6" id="hub-tracks">
                    <HubSecondaryTracks setMode={setMode} />
                </section>

                <BatchSessionResults 
                    showBatchResults={showBatchResults}
                    batchSessionHistory={batchSessionHistory}
                    batchIndex={batchIndex}
                    onClose={() => setShowBatchResults(false)}
                />
            </div>
        );
    }

    // Ruta a "Versus Especializado"
    if (mode === "versus") {
        return (
            <div className="w-full relative min-h-screen bg-white">
                <ModuleErrorBoundary moduleName="Versus (Especializado)">
                    <VersusView battles={(battles as unknown as Battle[])} batchIndex={batchIndex} onBatchComplete={handleBatchComplete} onBack={resetToMenu} />
                </ModuleErrorBoundary>

                <BatchSessionResults 
                    showBatchResults={showBatchResults}
                    batchSessionHistory={batchSessionHistory}
                    batchIndex={batchIndex}
                    onClose={() => setShowBatchResults(false)}
                />
            </div>
        );
    }

    // Ruta a "Torneo Progresivo"
    if (mode === "torneo") {
        return (
            <div className="w-full relative min-h-screen bg-white">
                <ModuleErrorBoundary moduleName="Torneo">
                    <TorneoView battles={(battles as unknown as Battle[])} onBack={resetToMenu} />
                </ModuleErrorBoundary>

                <BatchSessionResults 
                    showBatchResults={showBatchResults}
                    batchSessionHistory={batchSessionHistory}
                    batchIndex={batchIndex}
                    onClose={() => setShowBatchResults(false)}
                />
            </div>
        );
    }

    // Ruta a "Profundidad"
    if (mode === "profundidad") {
        return (
            <div className="w-full relative min-h-screen bg-white">
                <ModuleErrorBoundary moduleName="Profundidad">
                    <ProfundidadView battles={(battles as unknown as Battle[])} onClose={resetToMenu} />
                </ModuleErrorBoundary>
                
                <BatchSessionResults 
                    showBatchResults={showBatchResults}
                    batchSessionHistory={batchSessionHistory}
                    batchIndex={batchIndex}
                    onClose={() => setShowBatchResults(false)}
                />
            </div>
        );
    }

    // Rutas Secundarias Dinámicas (Entradas por Triggers / URL Deep Links)
    return (
        <div className="w-full relative min-h-screen bg-white pb-24">
            <div className="container-ws pt-4 md:pt-8 space-y-6">
                
                {mode !== "actualidad" && mode !== "lugares" && (
                    <div className="sticky top-4 z-[100] w-full flex justify-start animate-in fade-in zoom-in-95 duration-500">
                        <button
                            onClick={resetToMenu}
                            className="h-10 px-4 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600 hover:text-slate-900 font-bold text-sm transition-all shadow-md active:scale-95 shrink-0 flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                            Volver al Hub
                        </button>
                    </div>
                )}

                {mode === "actualidad" && (
                    <ModuleErrorBoundary moduleName="Actualidad">
                        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-4 md:p-8 min-h-[600px] relative overflow-hidden">
                                <ActualidadHubManager onClose={resetToMenu} />
                            </div>
                        </div>
                    </ModuleErrorBoundary>
                )}

                {mode === "lugares" && (
                    <ModuleErrorBoundary moduleName="Lugares">
                        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 relative">
                            <div className="sticky top-4 z-[100] w-full flex justify-start mb-2 px-4 md:px-0">
                                <button
                                    onClick={resetToMenu}
                                    className="h-10 px-4 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600 hover:text-slate-900 font-bold text-sm transition-all shadow-md active:scale-95 shrink-0 flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                                    Volver al Hub
                                </button>
                            </div>
                            <LugaresView onClose={resetToMenu} battles={battles as unknown as Battle[]} />
                        </div>
                    </ModuleErrorBoundary>
                )}

                <BatchSessionResults 
                    showBatchResults={showBatchResults}
                    batchSessionHistory={batchSessionHistory}
                    batchIndex={batchIndex}
                    onClose={() => setShowBatchResults(false)}
                />
            </div>
        </div>
    );
}
