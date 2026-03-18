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
                    title={<h1 className="text-2xl md:text-3xl font-black tracking-tight text-ink">Iniciando <span className="text-primary">motor</span></h1>}
                    subtitle={<p className="text-sm text-muted font-medium">Buscando señales...</p>}
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
                        title="Radar Vacío"
                        description="Estamos recopilando nuevas señales para tu radar."
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

                {/* CTA Versus Específico por Industria */}
                <div className="w-full max-w-6xl mx-auto px-4 md:px-6 pt-12 pb-4">
                    <button 
                        onClick={() => setMode('versus')}
                        className="w-full group bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 rounded-[2.5rem] p-6 md:p-8 flex items-center justify-between overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-transparent group-hover:from-blue-100/50 transition-colors" />
                        <div className="flex items-center gap-6 relative z-10 w-full">
                            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex-shrink-0 flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-500 transition-all duration-300 text-blue-500">
                                <span className="material-symbols-outlined text-3xl">tune</span>
                            </div>
                            <div className="text-left flex-1">
                                <h3 className="text-xl md:text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">Modo Versus Especializado</h3>
                                <p className="text-sm md:text-base text-slate-500 font-medium mt-1">¿Buscas una categoría específica? Filtra los combates cara a cara por tu industria favorita.</p>
                            </div>
                            <div className="hidden md:flex w-12 h-12 rounded-full border border-slate-200 items-center justify-center group-hover:bg-blue-500 group-hover:border-blue-500 group-hover:text-white transition-all text-slate-400">
                                <span className="material-symbols-outlined font-bold">arrow_forward</span>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Track Secundarios: Exploración de Módulos (Torneo, Profundidad, etc) */}
                <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-20">
                    <div className="mb-12">
                        <h2 className="text-3xl lg:text-4xl font-black text-ink tracking-tight mb-2">Más formas de <span className="text-transparent bg-clip-text bg-gradient-brand">opinar</span></h2>
                        <p className="text-lg text-slate-500 font-medium max-w-2xl">Descubre nuevas dinámicas diseñadas para extraer el máximo valor de tu perspectiva.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                        
                        {/* 1. TORNEOS */}
                        <button 
                            onClick={() => setMode('torneo')}
                            className="group relative flex flex-col p-8 md:p-10 rounded-[2.5rem] bg-gradient-to-br from-amber-50 via-white to-orange-50/50 border border-amber-100/50 hover:border-amber-300 hover:shadow-[0_30px_60px_-15px_rgba(245,158,11,0.2)] transition-all duration-500 text-left overflow-hidden min-h-[340px] isolation-auto"
                        >
                            {/* Fondo inmersivo */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(253,230,138,0.3),transparent_60%)]" />
                            <div className="absolute top-0 right-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNGQ0QzNEQiIG9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            
                            {/* Micro-Ilustración Protagonista: Torneos */}
                            <div className="absolute top-1/2 right-4 md:right-12 -translate-y-1/2 w-40 h-40 pointer-events-none">
                                <div className="absolute inset-0 bg-amber-300/20 rounded-full blur-3xl group-hover:bg-amber-400/30 transition-colors duration-500 animate-pulse" />
                                <div className="absolute bottom-4 right-0 w-full flex items-end justify-center gap-2" style={{ perspective: '1000px' }}>
                                    {/* Segundo Lugar */}
                                    <div className="w-10 h-16 bg-amber-200 rounded-t-xl border-t-2 border-white/60 shadow-inner group-hover:translate-y-2 group-hover:bg-amber-100 transition-all duration-500 delay-75" />
                                    {/* Primer Lugar */}
                                    <div className="w-12 h-28 bg-gradient-to-t from-amber-400 to-amber-300 rounded-t-xl border-t-2 border-white shadow-[0_10px_20px_rgba(245,158,11,0.4)] group-hover:-translate-y-6 group-hover:shadow-[0_20px_30px_rgba(245,158,11,0.6)] group-hover:from-amber-500 group-hover:to-amber-400 transition-all duration-500 z-10 relative flex justify-center">
                                        <div className="absolute -top-8 text-amber-500 font-black text-xl drop-shadow-md opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-500 delay-150 transform">1º</div>
                                        {/* Estrella de recompensa */}
                                        <div className="absolute top-4 w-6 h-6 text-white opacity-50 group-hover:opacity-100 group-hover:animate-spin-slow flex items-center justify-center">
                                           <span className="material-symbols-outlined text-[24px]">grade</span>
                                        </div>
                                    </div>
                                    {/* Tercer Lugar */}
                                    <div className="w-10 h-10 bg-amber-300 rounded-t-xl border-t-2 border-white/60 shadow-inner group-hover:translate-y-1 transition-all duration-500 delay-100" />
                                </div>
                                {/* Chispas flotantes */}
                                <div className="absolute top-0 left-10 w-2 h-2 bg-amber-400 rounded-full blur-[1px] animate-[bounce_2s_infinite] opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute top-10 right-0 w-3 h-3 bg-yellow-300 rounded-full animate-[ping_3s_infinite] opacity-0 group-hover:opacity-100 transition-opacity delay-200" />
                            </div>

                            <div className="mt-auto relative z-10 max-w-[65%]">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100/50 border border-amber-200/50 text-amber-800 text-xs font-bold rounded-xl mb-4 shadow-sm backdrop-blur-sm">
                                    <span className="material-symbols-outlined text-[16px]">emoji_events</span>
                                    Competencia
                                </div>
                                <h3 className="font-black text-ink text-3xl md:text-4xl mb-3 group-hover:text-amber-600 transition-colors">Torneos</h3>
                                <p className="text-base md:text-lg text-slate-500 font-medium leading-relaxed">Llaves eliminatorias intensas. Compara a los mejores y elige a un solo campeón.</p>
                            </div>
                        </button>

                        {/* 2. PROFUNDIDAD */}
                        <button 
                            onClick={() => setMode('profundidad')}
                            className="group relative flex flex-col p-8 md:p-10 rounded-[2.5rem] bg-gradient-to-br from-indigo-50 via-white to-purple-50/50 border border-indigo-100/50 hover:border-indigo-300 hover:shadow-[0_30px_60px_-15px_rgba(99,102,241,0.2)] transition-all duration-500 text-left overflow-hidden min-h-[340px] isolation-auto"
                        >
                            {/* Fondo inmersivo */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(199,210,254,0.3),transparent_60%)]" />
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700" style={{ backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.2) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                            
                            {/* Micro-Ilustración Protagonista: Profundidad */}
                            <div className="absolute top-1/2 right-4 md:right-16 -translate-y-1/2 w-48 h-48 pointer-events-none perspective-1000">
                                <div className="absolute inset-0 bg-indigo-300/20 rounded-full blur-3xl group-hover:bg-indigo-400/40 transition-colors duration-500" />
                                
                                <div className="w-full h-full relative flex items-center justify-center transform-style-3d transition-transform duration-1000" style={{ transform: 'rotateY(0deg)' }}>
                                    {/* Capa Base (Oscura) */}
                                    <div className="absolute w-24 h-24 bg-slate-800 rounded-2xl border border-slate-700 opacity-20 transition-all duration-700 delay-100" style={{ transform: 'rotateX(45deg) rotateZ(45deg) translateZ(0px)' }} />
                                    {/* Capa Media (Semitransparente) */}
                                    <div className="absolute w-24 h-24 bg-indigo-200/40 backdrop-blur-sm rounded-2xl border-2 border-indigo-300/50 transition-all duration-700 delay-75 shadow-lg group-hover:border-indigo-400 group-hover:scale-105" style={{ transform: 'rotateX(45deg) rotateZ(45deg) translateZ(0px)' }} />
                                    {/* Capa Superior (Glass Activo) */}
                                    <div className="absolute w-24 h-24 bg-gradient-to-tr from-indigo-500/80 to-purple-500/80 backdrop-blur-md rounded-2xl border border-white shadow-[0_15px_30px_rgba(99,102,241,0.5)] transition-all duration-700 flex items-center justify-center z-10 group-hover:-translate-y-4 group-hover:-translate-x-4" style={{ transform: 'rotateX(45deg) rotateZ(45deg) translateZ(0px)' }}>
                                        <div className="w-8 h-8 rounded-full border-4 border-white/30 border-t-white animate-spin-slow" />
                                    </div>
                                    
                                    {/* Puntos de datos interconectados */}
                                    <svg className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-300 z-20" viewBox="0 0 100 100">
                                        <circle cx="20" cy="20" r="3" fill="#818cf8" className="animate-pulse" />
                                        <circle cx="80" cy="30" r="2" fill="#c084fc" className="animate-ping" />
                                        <circle cx="50" cy="80" r="2.5" fill="#a5b4fc" />
                                        <line x1="20" y1="20" x2="50" y2="80" stroke="#c7d2fe" strokeWidth="1" strokeDasharray="2 2" className="animate-pulse" />
                                    </svg>
                                </div>
                            </div>

                            <div className="mt-auto relative z-10 max-w-[65%]">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100/50 border border-indigo-200/50 text-indigo-800 text-xs font-bold rounded-xl mb-4 shadow-sm backdrop-blur-sm">
                                    <span className="material-symbols-outlined text-[16px]">psychology</span>
                                    Análisis
                                </div>
                                <h3 className="font-black text-ink text-3xl md:text-4xl mb-3 group-hover:text-indigo-600 transition-colors">Profundidad</h3>
                                <p className="text-base md:text-lg text-slate-500 font-medium leading-relaxed">Encuestas multivariables. Evalúa con rigor y descubre capas ocultas de insights.</p>
                            </div>
                        </button>

                        {/* 3. ACTUALIDAD */}
                        <button 
                            onClick={() => setMode('actualidad')}
                            className="group relative flex flex-col p-8 md:p-10 rounded-[2.5rem] bg-gradient-to-br from-emerald-50 via-white to-teal-50/50 border border-emerald-100/50 hover:border-emerald-300 hover:shadow-[0_30px_60px_-15px_rgba(16,185,129,0.2)] transition-all duration-500 text-left overflow-hidden min-h-[340px] isolation-auto"
                        >
                            {/* Fondo inmersivo */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(167,243,208,0.3),transparent_60%)]" />
                            {/* Rejilla de Radar */}
                            <div className="absolute top-0 right-0 w-[150%] h-[150%] rounded-full border border-emerald-200/30 opacity-0 group-hover:opacity-100 group-hover:scale-[1.5] transition-all duration-1000 -translate-y-1/2 translate-x-1/4" />
                            <div className="absolute top-0 right-0 w-[100%] h-[100%] rounded-full border border-emerald-300/30 opacity-0 group-hover:opacity-100 group-hover:scale-[1.2] transition-all duration-700 -translate-y-1/2 translate-x-1/4" />
                            
                            {/* Micro-Ilustración Protagonista: Actualidad */}
                            <div className="absolute top-1/2 right-4 md:right-12 -translate-y-1/2 w-48 h-32 pointer-events-none flex items-center justify-end">
                                <div className="absolute inset-0 bg-emerald-300/20 rounded-full blur-3xl group-hover:bg-emerald-400/30 transition-colors duration-500 animate-pulse" />
                                
                                <div className="relative flex items-end justify-center w-full h-24 gap-1.5 z-10 px-4">
                                    {/* Frecuencias ecualizador */}
                                    <div className="w-2 md:w-3 bg-emerald-200 rounded-t-lg shadow-sm h-[30%] group-hover:h-[60%] transition-all duration-300 ease-bounce delay-75" />
                                    <div className="w-2 md:w-3 bg-emerald-300 rounded-t-lg shadow-sm h-[60%] group-hover:h-[90%] transition-all duration-500 ease-bounce delay-100" />
                                    <div className="w-3 md:w-4 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg shadow-[0_0_15px_rgba(16,185,129,0.4)] h-[40%] group-hover:h-[100%] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] transition-all duration-500 ease-bounce relative">
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-px bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="w-2 md:w-3 bg-emerald-300 rounded-t-lg shadow-sm h-[80%] group-hover:h-[50%] transition-all duration-500 ease-bounce delay-150" />
                                    <div className="w-2 md:w-3 bg-emerald-200 rounded-t-lg shadow-sm h-[50%] group-hover:h-[70%] transition-all duration-300 ease-bounce delay-200" />
                                    <div className="w-2 md:w-3 bg-emerald-100 rounded-t-lg shadow-sm h-[20%] group-hover:h-[40%] transition-all duration-300 ease-bounce delay-300" />
                                </div>
                                {/* Target icon flotante */}
                                <div className="absolute top-0 right-6 bg-white shadow-xl border border-emerald-100 rounded-full w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:-translate-y-4 group-hover:scale-110 transition-all duration-500 z-20 text-emerald-500">
                                   <span className="material-symbols-outlined text-[20px] animate-pulse">crisis_alert</span>
                                </div>
                            </div>

                            <div className="mt-auto relative z-10 max-w-[65%]">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100/50 border border-emerald-200/50 text-emerald-800 text-xs font-bold rounded-xl mb-4 shadow-sm backdrop-blur-sm">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    En Vivo
                                </div>
                                <h3 className="font-black text-ink text-3xl md:text-4xl mb-3 group-hover:text-emerald-600 transition-colors">Actualidad</h3>
                                <p className="text-base md:text-lg text-slate-500 font-medium leading-relaxed">Reacciona a las últimas noticias y marca tendencia minuto a minuto.</p>
                            </div>
                        </button>

                        {/* 4. LUGARES */}
                        <button 
                            onClick={() => setMode('lugares')}
                            className="group relative flex flex-col p-8 md:p-10 rounded-[2.5rem] bg-gradient-to-br from-rose-50 via-white to-pink-50/50 border border-rose-100/50 hover:border-rose-300 hover:shadow-[0_30px_60px_-15px_rgba(244,63,94,0.2)] transition-all duration-500 text-left overflow-hidden min-h-[340px] isolation-auto"
                        >
                            {/* Fondo inmersivo */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(254,205,211,0.3),transparent_60%)]" />
                            {/* Malla Terrestre */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-1000" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(244, 63, 94, 0.4) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                            
                            {/* Micro-Ilustración Protagonista: Lugares */}
                            <div className="absolute top-1/2 right-4 md:right-16 -translate-y-1/2 w-48 h-48 pointer-events-none perspective-1000 flex items-center justify-center">
                                <div className="absolute inset-0 bg-rose-300/20 rounded-full blur-3xl group-hover:bg-rose-400/30 transition-colors duration-500 animate-pulse" />
                                
                                {/* Disco Base (Mapa 3D) */}
                                <div className="absolute w-32 h-32 rounded-full border-4 border-rose-200/40 bg-white/50 backdrop-blur-sm shadow-xl transition-all duration-700 flex items-center justify-center overflow-hidden group-hover:scale-110" style={{ transform: 'rotateX(60deg)' }}>
                                     <div className="w-[150%] h-[150%] border border-rose-100 rounded-full animate-[spin_10s_linear_infinite]" />
                                     <div className="absolute w-[80%] h-[80%] border border-rose-200/80 rounded-full animate-[spin_10s_linear_infinite_reverse]" />
                                </div>

                                {/* Pin Flotante Interactivo */}
                                <div className="absolute z-10 bottom-1/2 left-1/2 -translate-x-1/2 flex flex-col items-center justify-end transform transition-all duration-500 group-hover:-translate-y-6">
                                    <div className="w-10 h-14 bg-gradient-to-br from-rose-400 to-rose-600 rounded-full rounded-b-none shadow-[0_10px_20px_rgba(244,63,94,0.4)] relative p-2 flex items-start justify-center">
                                        <div className="w-4 h-4 bg-white rounded-full shadow-inner" />
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-t-[12px] border-t-rose-600 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent" />
                                    </div>
                                    {/* Sombra proyectada */}
                                    <div className="w-6 h-2 bg-rose-900/40 rounded-full blur-[2px] absolute -bottom-4 animate-[pulse_2s_infinite] group-hover:scale-75 group-hover:opacity-50 transition-all duration-500" />
                                </div>
                                {/* Ondas de radar de ubicación */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-rose-400 rounded-full opacity-0 group-hover:animate-[ping_2s_ease-out_infinite_0.5s] z-0" style={{ transform: 'rotateX(60deg)' }} />
                            </div>

                            <div className="mt-auto relative z-10 max-w-[65%]">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-100/50 border border-rose-200/50 text-rose-800 text-xs font-bold rounded-xl mb-4 shadow-sm backdrop-blur-sm">
                                    <span className="material-symbols-outlined text-[16px]">place</span>
                                    Físico
                                </div>
                                <h3 className="font-black text-ink text-3xl md:text-4xl mb-3 group-hover:text-rose-600 transition-colors">Lugares</h3>
                                <p className="text-base md:text-lg text-slate-500 font-medium leading-relaxed">Geolocalización activa. Evalúa sucursales, tiendas y tu entorno físico in-situ.</p>
                            </div>
                        </button>

                        {/* 5. PRÓXIMAMENTE: PREDICCIONES */}
                        <div className="group relative flex flex-col p-8 md:p-10 rounded-[2.5rem] bg-slate-50/50 border-2 border-dashed border-slate-200 hover:border-slate-300 transition-all duration-500 text-left overflow-hidden min-h-[340px] isolation-auto">
                            {/* Micro-Ilustración Muted / Blueprint */}
                            <div className="absolute top-1/2 right-4 md:right-16 -translate-y-1/2 w-48 h-48 pointer-events-none flex items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity duration-500">
                                <div className="w-32 h-32 rounded-full border border-slate-300 relative flex items-center justify-center">
                                    <div className="absolute w-[120%] h-px bg-slate-200 rotate-45" />
                                    <div className="absolute w-[120%] h-px bg-slate-200 -rotate-45" />
                                    <div className="w-24 h-24 rounded-full border border-slate-300 border-t-slate-400 border-r-slate-400 animate-[spin_8s_linear_infinite]" />
                                    <div className="absolute w-4 h-4 bg-slate-400 rounded-full" />
                                    {/* Objeto escaneado */}
                                    <div className="absolute top-4 right-4 w-3 h-3 bg-slate-400 rounded-full group-hover:bg-slate-500 transition-colors group-hover:shadow-[0_0_10px_rgba(100,116,139,0.5)]" />
                                </div>
                            </div>
                            
                            <div className="mt-auto relative z-10 max-w-[65%]">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-200/80 text-slate-600 rounded-xl text-xs font-bold uppercase mb-4 shadow-sm backdrop-blur-sm">
                                    <span className="material-symbols-outlined text-[16px]">lock_clock</span>
                                    Próximamente
                                </div>
                                <h3 className="font-black text-slate-400 text-3xl md:text-4xl mb-3">Predicciones</h3>
                                <p className="text-base md:text-lg text-slate-400 font-medium leading-relaxed">Apuesta tus señales en eventos futuros. Quien acierta se lleva el pozo de recompensas.</p>
                            </div>
                        </div>

                        {/* 6. PRÓXIMAMENTE: DESAFÍOS */}
                        <div className="group relative flex flex-col p-8 md:p-10 rounded-[2.5rem] bg-slate-50/50 border-2 border-dashed border-slate-200 hover:border-slate-300 transition-all duration-500 text-left overflow-hidden min-h-[340px] isolation-auto">
                            {/* Micro-Ilustración Muted / Blueprint */}
                            <div className="absolute top-1/2 right-4 md:right-16 -translate-y-1/2 w-48 h-48 pointer-events-none flex auto justify-center items-center opacity-40 group-hover:opacity-60 transition-opacity duration-500">
                                <div className="flex items-end justify-center gap-3 h-24 w-full">
                                    <div className="w-8 h-[40%] rounded-xl border-2 border-slate-300 group-hover:h-[60%] transition-all duration-700" />
                                    <div className="w-8 h-[70%] rounded-xl border-2 border-slate-300 bg-[linear-gradient(45deg,transparent_25%,rgba(203,213,225,0.2)_25%,rgba(203,213,225,0.2)_50%,transparent_50%,transparent_75%,rgba(203,213,225,0.2)_75%,rgba(203,213,225,0.2)_100%)] bg-[size:10px_10px] group-hover:h-[90%] transition-all duration-700 delay-100" />
                                    <div className="w-8 h-[30%] rounded-xl border-2 border-slate-300 group-hover:h-[50%] transition-all duration-700 delay-200" />
                                </div>
                            </div>
                            
                            <div className="mt-auto relative z-10 max-w-[65%]">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-200/80 text-slate-600 rounded-xl text-xs font-bold uppercase mb-4 shadow-sm backdrop-blur-sm">
                                    <span className="material-symbols-outlined text-[16px]">lock_clock</span>
                                    Próximamente
                                </div>
                                <h3 className="font-black text-slate-400 text-3xl md:text-4xl mb-3">Desafíos</h3>
                                <p className="text-base md:text-lg text-slate-400 font-medium leading-relaxed">Retos patrocinados por marcas. Completa misiones específicas y gana beneficios reales.</p>
                            </div>
                        </div>

                    </div>
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
                <div className="w-full flex justify-start animate-in fade-in duration-300">
                    <button
                        onClick={resetToMenu}
                        className="h-10 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600 hover:text-slate-900 font-bold text-sm transition-all shadow-sm active:scale-95 shrink-0 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                        Volver al Hub
                    </button>
                </div>
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
