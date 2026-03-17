import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useActiveBattles } from "../../../hooks/useActiveBattles";
import { useSignalStore } from "../../../store/signalStore";
import { useAuth } from "../../auth";
import { trackEvent } from "../../../services/analytics/trackEvent";

import PageHeader from "../../../components/ui/PageHeader";
import { PageState } from "../../../components/ui/StateBlocks";
import { SkeletonModuleCard } from "../../../components/ui/Skeleton";

import HubMenuSimplified from "../components/HubMenuSimplified";
import { ActualidadHubManager } from "../components/ActualidadHubManager";
import VersusView from "../components/VersusView";
import TorneoView from "../components/TorneoView";
import ProfundidadView from "../components/ProfundidadView";
import LugaresView from "../components/LugaresView";
import BatchSessionResults, { BatchSessionResultRecord } from "../components/BatchSessionResults";
import { ModuleErrorBoundary } from "../../../components/ui/ModuleErrorBoundary";


import { useExperienceMode, useExperienceStats } from "../hooks/useExperienceMode";
import { Battle } from "../../signals/types";

const BATCH_SIZE = 12;

export default function SignalsHub() {
    const { mode, setMode, requestedBatch, resetToMenu } = useExperienceMode();
    const { hubTopNow, hubStats } = useExperienceStats();
    
    const { battles, loading, error } = useActiveBattles();
    const { profile } = useAuth();
    const { signals, signalsToday } = useSignalStore();
    const navigate = useNavigate();

    const [showBatchResults, setShowBatchResults] = useState(false);
    const [batchSessionHistory, setBatchSessionHistory] = useState<BatchSessionResultRecord[]>([]);

    const computedBatch = Math.floor(signals / BATCH_SIZE);
    const initialBatch = typeof requestedBatch === "number" ? requestedBatch : computedBatch;
    const [batchIndex] = useState(initialBatch);

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

    const headerSubtitle = mode === "menu"
        ? "Elige tu canal. Rápido, anónimo y sin discursos innecesarios."
        : mode === "versus"
            ? `Bloque ${batchIndex + 1}: calibrando preferencias.`
            : mode === "torneo"
                ? "Modo torneo: una opción sobrevive y sigue peleando."
                : mode === "lugares"
                    ? "Lugares: Descubre y evalúa ubicaciones físicas."
                    : "Profundidad: 5 preguntas rápidas para afinar el motor.";

    if (loading && battles.length === 0 && mode !== 'menu') {
        return (
            <div className="container-ws section-y space-y-6 pb-24">
                <PageHeader
                    eyebrow={<span className="badge badge-primary">Hub</span>}
                    title={<h1 className="text-2xl md:text-3xl font-black tracking-tight text-ink">Elige tu <span className="text-primary">formato</span></h1>}
                    subtitle={<p className="text-sm text-muted font-medium">{headerSubtitle}</p>}
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
                    title="Error al conectar con el servidor"
                    description="No pudimos cargar las señales activas. Revisa tu conexión."
                    icon="cloud_off"
                    primaryAction={{ label: "Intentar de nuevo", onClick: () => window.location.reload() }}
                />
            </div>
        );
    }

    if (!loading && battles.length === 0) {
        return (
            <div className="container-ws section-y">
                <PageState
                    type="empty"
                    title="No hay evaluaciones activas"
                    description="Estamos recargando el motor de señales."
                    icon="dns"
                    primaryAction={{ label: "Volver al inicio", onClick: () => navigate("/") }}
                />
            </div>
        );
    }

    return (
        <div className={`container-ws pb-24 ${mode === 'menu' ? 'section-y space-y-8' : 'pt-4 md:pt-8 space-y-6'}`}>
            
            {mode === "menu" && (
                <HubMenuSimplified
                    onEnterVersus={() => {
                        setMode('versus');
                        trackEvent('user_started_module', { module: 'versus' });
                    }}
                    onEnterTorneo={() => {
                        setMode("torneo");
                        trackEvent('user_started_module', { module: 'torneo' });
                    }}
                    onEnterProfundidad={() => {
                        setMode("profundidad");
                        trackEvent('user_started_module', { module: 'profundidad' });
                    }}
                    onEnterLugares={() => {
                        setMode("lugares");
                        trackEvent('user_started_module', { module: 'lugares' });
                    }}
                    onViewResults={() => {
                        trackEvent('user_clicked_next_action', { target_action: 'view_results' });
                        navigate("/results");
                    }}
                    topNow={hubTopNow}
                    stats={hubStats}
                    previewVersus={battles.length > 0 ? (battles[0] as unknown as Battle) : null}
                    signalsToday={signalsToday}
                    signalsLimit={signalsLimit === '∞' ? '∞' : Number(signalsLimit)}
                />
            )}

            {mode !== "menu" && mode !== "actualidad" && mode !== "lugares" && (
                <div className="w-full flex justify-start animate-in fade-in duration-300">
                    <button
                        onClick={resetToMenu}
                        className="h-10 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600 hover:text-slate-900 font-bold text-sm transition-all shadow-sm active:scale-95 shrink-0 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                        Volver a Señales
                    </button>
                </div>
            )}

            {mode === "versus" && (
                <ModuleErrorBoundary moduleName="Versus">
                    <VersusView 
                        battles={(battles as unknown as Battle[])} 
                        batchIndex={batchIndex} 
                        onBatchComplete={handleBatchComplete} 
                    />
                </ModuleErrorBoundary>
            )}

            {mode === "torneo" && (
                <ModuleErrorBoundary moduleName="Torneo">
                    <TorneoView battles={(battles as unknown as Battle[])} />
                </ModuleErrorBoundary>
            )}

            {mode === "profundidad" && (
                <ModuleErrorBoundary moduleName="Profundidad">
                    <ProfundidadView battles={(battles as unknown as Battle[])} onClose={resetToMenu} />
                </ModuleErrorBoundary>
            )}

            {mode === "actualidad" && (
                <ModuleErrorBoundary moduleName="Actualidad">
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-4 md:p-8 min-h-[600px] relative overflow-hidden">
                            <ActualidadHubManager onClose={resetToMenu} />
                        </div>
                    </div>
                </ModuleErrorBoundary>
            )}

            {mode === "lugares" && (
                <ModuleErrorBoundary moduleName="Lugares">
                    <div className="space-y-8 animate-in fade-in duration-500 relative">
                        <div className="w-full flex justify-start mb-2 px-4 md:px-0">
                            <button
                                onClick={resetToMenu}
                                className="h-10 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600 hover:text-slate-900 font-bold text-sm transition-all shadow-sm active:scale-95 shrink-0 flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                                Volver a Señales
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
