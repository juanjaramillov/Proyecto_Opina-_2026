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
                <section className="w-full pt-10 pb-12 md:pt-16 md:pb-16 bg-white border-b border-slate-100/50">
                    <div className="container-ws grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Columna Izquierda: Texto y Métricas simples */}
                        <div className="flex flex-col items-center text-center lg:items-start lg:text-left space-y-5">
                            <span className="text-[11px] font-bold text-blue-600 tracking-widest uppercase">Señales Colectivas</span>
                            
                            <h1 className="text-4xl md:text-5xl lg:text-[56px] font-black text-slate-900 tracking-tight leading-[1.05]">
                                El pulso real de <span className="text-blue-700">Opina+</span>
                            </h1>
                            
                            <p className="text-lg text-slate-500 max-w-lg font-medium leading-relaxed">
                                Evalúa tendencias y compara perfiles. Tu criterio es la brújula de nuestra comunidad.
                            </p>

                            <div className="flex items-center gap-8 pt-4">
                                <div className="flex flex-col items-start">
                                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">Participación Hoy</span>
                                    <span className="text-lg font-bold text-slate-800 tracking-tight">{fmt(signalsToday)} <span className="text-slate-400 text-sm font-medium">señales</span></span>
                                </div>
                                <div className="w-px h-8 bg-slate-200"></div>
                                <div className="flex flex-col items-start">
                                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">Estado</span>
                                    <span className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 mt-1">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Activo
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Columna Derecha: Contenedor Abstracto Premium */}
                        <div className="hidden lg:flex justify-end">
                            <div className="w-[420px] h-[280px] rounded-3xl border border-slate-100 bg-slate-50 relative overflow-hidden flex items-center justify-center shadow-sm">
                                {/* Malla suave corporativa contenida */}
                                <div className="absolute inset-0 opacity-40 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxwYXRoIGQ9Ik0wIDBMMjAgMCAyMCAyMCAwIDIwWiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDIwMCwgMjEwLCAyMjAsIDAuMykiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] bg-repeat" />
                                <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-bl from-blue-500/20 to-transparent rounded-full blur-3xl mix-blend-multiply" />
                                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-emerald-400/20 to-transparent rounded-full blur-3xl mix-blend-multiply" />
                                
                                {/* Pieza central elegante */}
                                <div className="relative w-32 h-32 rounded-full border border-white bg-white/50 backdrop-blur-sm shadow-sm flex items-center justify-center">
                                    <div className="w-24 h-24 rounded-full border border-slate-200 bg-gradient-to-tr from-slate-50 to-white flex items-center justify-center shadow-inner">
                                        <div className="w-12 h-12 rounded-full bg-blue-50/50 border border-blue-100 flex items-center justify-center">
                                            <span className="w-3 h-3 rounded-full bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. BLOQUE FUNCIONAL PRINCIPAL */}
                <section className="container-ws py-12 md:py-16">
                    <ModuleErrorBoundary moduleName={hubState === 'ACTIVE' ? "HubActiveState" : "HubCooldownState"}>
                        {hubState === 'ACTIVE' ? (
                            <HubActiveState battles={(battles as unknown as Battle[])} onBatchComplete={handleBatchComplete} />
                        ) : (
                            <HubCooldownState />
                        )}
                    </ModuleErrorBoundary>
                </section>

                {/* 3. RADAR DE EXPERIENCIAS */}
                <section className="container-ws pb-20" id="hub-tracks">
                    <div className="mb-10 text-center md:text-left border-t border-slate-100 pt-16">
                        <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Expandir el radar</h2>
                        <p className="text-slate-500 mt-2 font-medium text-lg">Navega hacia nuevos módulos de evaluación continua.</p>
                    </div>
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
