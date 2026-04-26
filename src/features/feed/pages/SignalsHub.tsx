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
import HubActiveState from "../components/HubActiveState";



export default function SignalsHub() {
    const { mode, setMode, requestedBatch, resetToMenu } = useExperienceMode();
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
                    title={<h1 className="text-2xl md:text-3xl font-black tracking-tight text-ink">Buscando <span className="text-brand">señales</span></h1>}
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
        if (!loading && battles.length === 0) {
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
                
                {/* 1. HERO VERTICAL PREMIUM (Asimétrico via HubActiveState) */}
                <section className="w-full pt-4 md:pt-6 bg-white overflow-hidden relative isolate">
                    
                    {/* Glow Radial Sutil de Fondo para unificar Hero y Arena */}
                    <div className="absolute top-0 right-0 lg:right-[-10%] w-[1000px] h-[800px] bg-brand/5 blur-[120px] rounded-full pointer-events-none z-[-1] opacity-70" />

                    <div className="container-ws relative z-10 px-0 sm:px-4">
                        <div className="w-full animate-in fade-in zoom-in-95 duration-700 delay-150">
                            <ModuleErrorBoundary moduleName="HubActiveState">
                                <HubActiveState battles={(battles as unknown as Battle[])} onBatchComplete={handleBatchComplete} />
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
