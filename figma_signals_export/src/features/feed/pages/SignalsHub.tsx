import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useActiveBattles } from "../../../hooks/useActiveBattles";
import { useSignalStore } from "../../../store/signalStore";
import { useAuth } from "../../auth";
import { analyticsService } from "../../../features/analytics/services/analyticsService";

import PageHeader from "../../../components/ui/PageHeader";
import { PageState } from "../../../components/ui/StateBlocks";
import { SkeletonModuleCard } from "../../../components/ui/Skeleton";


import SignalsRouter from "../components/hub/SignalsRouter";
import BatchSessionResults, { BatchSessionResultRecord } from "../components/BatchSessionResults";
import { ModuleErrorBoundary } from "../../../components/ui/ModuleErrorBoundary";
import HubBentoGrid from "../components/hub/HubBentoGrid";
import { useExperienceMode } from "../hooks/useExperienceMode";
import { Battle } from "../../signals/types";
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
        analyticsService.trackSystem('user_entered_signals', 'info');
    }, []);

    useEffect(() => {
        if (profile && !profile.isProfileComplete && profile.role !== 'admin') {
            navigate("/complete-profile", { replace: true });
        }
    }, [profile, navigate]);

    if (profile && !profile.isProfileComplete && profile.role !== 'admin') return null;

    const handleBatchComplete = (history: Array<{ battle: Battle; mySignal: 'A' | 'B'; pctA: number }>) => {
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
            <div className="w-full pb-24 md:pb-0 relative min-h-screen bg-slate-50">
                
                {/* 1. HERO VERTICAL PREMIUM (Versus Centrado) */}
                <section className="w-full pt-6 pb-8 md:pt-10 md:pb-12 bg-white border-b border-slate-100/60 overflow-hidden relative">
                    {/* Background glows */}
                    <div className="absolute top-0 inset-x-0 h-96 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.08),transparent_70%)] pointer-events-none" />
                    
                    <div className="container-ws flex flex-col items-center relative z-10">
                        {/* Cabecera ultra-limpia */}
                        <div className="flex flex-col items-center text-center space-y-2 mb-6 md:mb-10 max-w-2xl mx-auto px-4">
                            <div className="flex items-center gap-2 sm:gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500 mb-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] border border-emerald-100/80 shadow-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-[pulse_2s_ease-in-out_infinite]" /> 
                                    Motor Activo
                                </span>
                                {signalsToday > 0 && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-slate-500 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.1em] border border-slate-200/60 shadow-sm">
                                        <span className="font-black text-slate-700">{new Intl.NumberFormat('es-CL').format(signalsToday)}</span> señales previas
                                    </span>
                                )}
                            </div>
                            
                            <h1 className="text-[36px] md:text-5xl lg:text-[60px] font-black text-slate-900 tracking-[-0.03em] leading-[1.05] animate-in fade-in slide-in-from-bottom-3 duration-700 drop-shadow-sm">
                                Tu instinto <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">decide</span>
                            </h1>
                            
                            <p className="text-sm md:text-[17px] text-slate-500 font-medium max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 mt-2">
                                Evalúa tendencias y compara perfiles con un solo clic.
                            </p>
                        </div>

                        {/* BLOQUE FUNCIONAL VERSUS (Centrado, Ancho Óptimo) */}
                        <div className="w-full max-w-[600px] flex justify-center animate-in fade-in zoom-in-95 duration-700 delay-150">
                            <ModuleErrorBoundary moduleName={hubState === 'ACTIVE' ? "HubActiveState" : "HubCooldownState"}>
                                {hubState === 'ACTIVE' ? (
                                    <HubActiveState battles={(battles as unknown as Battle[])} onBatchComplete={handleBatchComplete} />
                                ) : (
                                    <HubCooldownState />
                                )}
                            </ModuleErrorBoundary>
                        </div>
                    </div>
                </section>

                {/* 2. BENTO GRID DE MÓDULOS (Reemplaza al radar horizontal) */}
                <HubBentoGrid setMode={setMode} />

                <BatchSessionResults 
                    showBatchResults={showBatchResults}
                    batchSessionHistory={batchSessionHistory}
                    batchIndex={batchIndex}
                    onClose={() => setShowBatchResults(false)}
                />
            </div>
        );
    }

    // Enrutamiento Delegado a Modules
    return (
        <>
            <SignalsRouter
                mode={mode}
                resetToMenu={resetToMenu}
                battles={battles as unknown as Battle[]}
                batchIndex={batchIndex}
                handleBatchComplete={handleBatchComplete}
            />
            
            <BatchSessionResults 
                showBatchResults={showBatchResults}
                batchSessionHistory={batchSessionHistory}
                batchIndex={batchIndex}
                onClose={() => setShowBatchResults(false)}
            />
        </>
    );
}
