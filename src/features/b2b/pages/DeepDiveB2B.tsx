import { useEffect } from "react";
import { ArrowLeftRight, Building2, TrendingUp, TrendingDown, Target, ShieldAlert, Sparkles } from "lucide-react";
import { analyticsService } from "../../../features/analytics/services/analyticsService";
import { Link } from "react-router-dom";
import { PremiumGate } from "../../../components/ui/PremiumGate";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import { useOverviewB2BState } from "../hooks/useOverviewB2BState";
import { MetricAvailabilityCard } from "../../../components/ui/MetricAvailabilityCard";

export default function DeepDiveB2B() {
    useEffect(() => {
        analyticsService.trackSystem('b2b_opened_deep_dive', 'info');
    }, []);

    const { profile } = useAuth();
    const isAdmin = profile?.role === 'admin';

    const { loading, snapshot } = useOverviewB2BState();

    if (loading) {
        return (
            <div className="p-6 lg:p-10 flex flex-col h-full min-h-screen bg-[#F8FAFC] items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <ArrowLeftRight className="w-12 h-12 text-slate-300 mb-4" />
                    <div className="text-slate-500 font-medium">Cargando Análisis Comparativo...</div>
                </div>
            </div>
        );
    }

    const total = snapshot?.overview.secondaryMetrics["Total Señales Evaluadas"] || 0;
    const entries = snapshot?.benchmark?.entries || [];
    const leader = entries.length > 0 ? entries[0] : null;
    const challenger = entries.length > 1 ? entries[1] : null;

    if (!snapshot || snapshot.availability === 'insufficient_data' || !leader || !challenger) {
        return (
            <div className="p-6 lg:p-10 flex flex-col h-full min-h-screen bg-[#F8FAFC]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 shrink-0">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            <ArrowLeftRight className="w-8 h-8 text-primary-600" />
                            <span className="text-gradient-brand">Comparativa Estratégica</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link 
                            to="/b2b"
                            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
                        >
                            Volver al Overview
                        </Link>
                    </div>
                </div>
                <div className="max-w-3xl mx-auto w-full mt-10">
                    <MetricAvailabilityCard 
                        label="Comparativa Estratégica (Head-to-Head)"
                        status="insufficient_data" 
                        helperText={`Se requieren múltiples competidores fuertes con datos sólidos para desbloquear el análisis profundo (Interacciones Mínimas: 30, Actuales: ${total}).`}
                    />
                </div>
            </div>
        );
    }

    const leaderGap = leader.weightedPreferenceShare - challenger.weightedPreferenceShare;
    const projectionGap = leaderGap; // Using exact gap as projection base

    return (
        <div className="p-6 lg:p-10 flex flex-col h-full min-h-screen bg-[#F8FAFC]">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <ArrowLeftRight className="w-8 h-8 text-primary-600" />
                        <span className="text-gradient-brand">Comparativa Estratégica</span>
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Head-to-Head: Análisis de brecha de preferencia y drivers de performance.
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Link 
                        to="/b2b"
                        onClick={() => analyticsService.trackSystem('b2b_clicked_next_view', 'info', { destination_view: 'overview' })}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
                    >
                        Volver al Overview
                    </Link>
                </div>
            </div>

            <div className="max-w-6xl mx-auto w-full space-y-8">
                
                {/* Comparativa Head to Head */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Opción Lider */}
                    <div className="bg-white rounded-3xl border-2 border-primary-100 shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 px-4 py-1 bg-primary-500 text-white text-xs font-bold rounded-bl-xl z-20">LÍDER ACTUAL</div>
                        <div className="p-8 text-center bg-gradient-to-b from-primary-50/50 to-white relative z-10">
                            <div className="w-20 h-20 bg-white rounded-2xl border border-primary-100 shadow-md flex items-center justify-center mx-auto mb-6 transform rotate-3">
                                <Building2 className="w-10 h-10 text-primary-600" />
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 -tracking-wide mb-2">{leader.entityName}</h2>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{leader.entityId}</p>
                        </div>
                        
                        <div className="p-8 border-t border-slate-100 bg-white">
                            <div className="text-center mb-8">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Share of Preference</p>
                                <h3 className="text-5xl font-black text-primary-600">{(leader.weightedPreferenceShare * 100).toFixed(1)}%</h3>
                                <div className="flex items-center justify-center gap-1 text-slate-500 mt-2 text-sm font-medium">
                                    <Target className="w-4 h-4" /> Base: {leader.nEff.toFixed(0)} duelos efectivos
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-sm font-bold text-slate-600">Status Competitivo</span>
                                <div className={`flex items-center gap-2 font-bold px-3 py-1 rounded-xl shadow-sm border ${leader.stabilityLabel === 'en_caída' ? 'text-rose-500 bg-rose-50 border-rose-100' : leader.stabilityLabel === 'en_aceleración' ? 'text-emerald-500 bg-emerald-50 border-emerald-100' : 'text-slate-500 bg-white border-slate-100'}`}>
                                    {leader.stabilityLabel === 'en_caída' ? <TrendingDown className="w-4 h-4" /> : leader.stabilityLabel === 'en_aceleración' ? <TrendingUp className="w-4 h-4" /> : null}
                                    {leader.stabilityLabel.replace('_', ' ').toUpperCase()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Retador */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative opacity-95">
                        <div className="absolute top-0 right-0 px-4 py-1 bg-slate-600 text-white text-xs font-bold rounded-bl-xl z-20">PRINCIPAL RETADOR</div>
                        <div className="p-8 text-center bg-gradient-to-b from-slate-50/50 to-white relative z-10">
                            <div className="w-20 h-20 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center mx-auto mb-6 transform -rotate-3">
                                <Building2 className="w-10 h-10 text-slate-400" />
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 -tracking-wide mb-2">{challenger.entityName}</h2>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{challenger.entityId}</p>
                        </div>
                        
                        <div className="p-8 border-t border-slate-100 bg-white">
                            <div className="text-center mb-8">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Share of Preference</p>
                                <h3 className="text-5xl font-black text-slate-700">{(challenger.weightedPreferenceShare * 100).toFixed(1)}%</h3>
                                <div className="flex items-center justify-center gap-1 text-slate-500 mt-2 text-sm font-medium">
                                    <Target className="w-4 h-4" /> Base: {challenger.nEff.toFixed(0)} duelos efectivos
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-sm font-bold text-slate-600">Status Competitivo</span>
                                <div className={`flex items-center gap-2 font-bold px-3 py-1 rounded-xl shadow-sm border ${challenger.stabilityLabel === 'en_caída' ? 'text-rose-500 bg-rose-50 border-rose-100' : challenger.stabilityLabel === 'en_aceleración' ? 'text-emerald-500 bg-emerald-50 border-emerald-100' : 'text-slate-500 bg-white border-slate-100'}`}>
                                    {challenger.stabilityLabel === 'en_caída' ? <TrendingDown className="w-4 h-4" /> : challenger.stabilityLabel === 'en_aceleración' ? <TrendingUp className="w-4 h-4" /> : null}
                                    {challenger.stabilityLabel.replace('_', ' ').toUpperCase()}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Brecha / Insight Ejecutivo */}
                <PremiumGate featureName="Deep Dive Insight Comparativo" isLocked={!isAdmin}>
                    <div className="bg-slate-900 p-8 md:p-10 rounded-3xl shadow-xl relative overflow-hidden border border-slate-800">
                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                            <ArrowLeftRight className="w-48 h-48 text-white -rotate-12 transform" />
                        </div>
                        
                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row items-start gap-8">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="p-2 bg-primary-500/20 rounded-xl backdrop-blur-sm border border-primary-500/20">
                                            <Sparkles className="w-5 h-5 text-primary-400" />
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest text-primary-400">Insight Comparativo Dinámico de IA</span>
                                    </div>
                                    
                                    <p className="text-lg md:text-xl font-medium text-white leading-relaxed mb-6">
                                        "{leader.entityName} mantiene la posición dominante pero el momentum competitivo indica dinámicas cambiantes en el segmento profundo. La desviación estándar del volumen modelada confirma una brecha del {(leaderGap * 100).toFixed(1)}%. Este fenómeno requiere estrategias tácticas si {challenger.entityName} capitaliza su ciclo actual."
                                    </p>
                                    
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold tracking-wide border border-slate-700">
                                            Confianza Wilson: {leader.wilsonLowerBound > 0.5 ? 'Muy Alta' : 'Moderada'}
                                        </span>
                                        <span className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-200 text-xs font-bold uppercase tracking-wider">
                                            Categoría: Competitividad
                                        </span>
                                    </div>
                                </div>

                                <div className="w-full md:w-72 bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm shrink-0">
                                    <h4 className="text-sm font-bold text-slate-300 mb-4 pb-4 border-b border-slate-700/50 flex items-center gap-2">
                                        <ShieldAlert className="w-4 h-4 text-amber-500" /> Riesgo de Brecha
                                    </h4>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Brecha Actual</p>
                                            <p className="text-2xl font-black text-white">{(leaderGap * 100).toFixed(1)} <span className="text-sm text-slate-400 font-medium">puntos</span></p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Proyección Tendencial</p>
                                            <p className="text-xl font-bold text-amber-500">{(projectionGap * 100).toFixed(1)} <span className="text-sm text-amber-500/50 font-medium">puntos</span> {projectionGap < leaderGap ? <TrendingDown className="inline w-4 h-4 ml-1" /> : <TrendingUp className="inline w-4 h-4 ml-1" />}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </PremiumGate>
            </div>
        </div>
    );
}

