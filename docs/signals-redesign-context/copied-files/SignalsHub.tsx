// Original path: src/features/feed/pages/SignalsHub.tsx

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
            <div className="w-full pb-24 md:pb-0 relative min-h-[calc(100vh-80px)] md:min-h-[85vh] bg-slate-50 md:bg-transparent">
                <ModuleErrorBoundary moduleName={hubState === 'ACTIVE' ? "HubActiveState" : "HubCooldownState"}>
                    {hubState === 'ACTIVE' ? (
                        <HubActiveState battles={(battles as unknown as Battle[])} onBatchComplete={handleBatchComplete} />
                    ) : (
                        <HubCooldownState />
                    )}
                </ModuleErrorBoundary>

                <div id="hub-tracks">
                    <HubSecondaryTracks setMode={setMode} />
                </div>

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
            <div className="w-full relative min-h-[100vh]">
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
            <div className="w-full relative min-h-[100vh]">
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
            <div className="w-full relative min-h-[100vh]">
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
        <div className="container-ws pb-24 pt-4 md:pt-8 space-y-6">
            
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
    );
}
