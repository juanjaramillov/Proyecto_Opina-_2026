import { useEffect } from "react";
import { ArrowLeftRight, Building2, TrendingUp, TrendingDown, Target, ShieldAlert, Sparkles } from "lucide-react";
import { trackEvent } from "../../../services/analytics/trackEvent";
import { Link } from "react-router-dom";
import { PremiumGate } from "../../../components/ui/PremiumGate";
import { b2bCuratedSnapshot } from "../../../read-models/b2b/b2bCuratedSnapshot";

export default function DeepDiveB2B() {
    useEffect(() => {
        trackEvent('b2b_opened_deep_dive');
    }, []);

    const { deepDive } = b2bCuratedSnapshot;

    return (
        <div className="p-6 lg:p-10 flex flex-col h-full min-h-screen bg-[#F8FAFC]">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <ArrowLeftRight className="w-8 h-8 text-indigo-600" />
                        <span className="text-gradient-brand">Comparativa Estratégica</span>
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Head-to-Head: Análisis de brecha de preferencia y drivers de performance.
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Link 
                        to="/b2b"
                        onClick={() => trackEvent('b2b_clicked_next_view', { destination_view: 'overview' })}
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
                    <div className="bg-white rounded-3xl border-2 border-indigo-100 shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 px-4 py-1 bg-indigo-500 text-white text-xs font-bold rounded-bl-xl z-20">LÍDER ACTUAL</div>
                        <div className="p-8 text-center bg-gradient-to-b from-indigo-50/50 to-white relative z-10">
                            <div className="w-20 h-20 bg-white rounded-2xl border border-indigo-100 shadow-md flex items-center justify-center mx-auto mb-6 transform rotate-3">
                                <Building2 className="w-10 h-10 text-indigo-600" />
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 -tracking-wide mb-2">{deepDive.winner.name}</h2>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{deepDive.winner.id}</p>
                        </div>
                        
                        <div className="p-8 border-t border-slate-100 bg-white">
                            <div className="text-center mb-8">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Share of Preference</p>
                                <h3 className="text-5xl font-black text-indigo-600">{(deepDive.winner.winRate * 100).toFixed(1)}%</h3>
                                <div className="flex items-center justify-center gap-1 text-slate-500 mt-2 text-sm font-medium">
                                    <Target className="w-4 h-4" /> Base: {deepDive.winner.comparisons.toLocaleString()} duelos
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-sm font-bold text-slate-600">Momentum (30d)</span>
                                <div className="flex items-center gap-2 text-rose-500 font-bold bg-white px-3 py-1 rounded-xl shadow-sm border border-slate-100">
                                    <TrendingDown className="w-4 h-4" />
                                    {deepDive.winner.delta}%
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Retador */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative opacity-95">
                        <div className="p-8 text-center bg-gradient-to-b from-slate-50/50 to-white relative z-10">
                            <div className="w-20 h-20 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center mx-auto mb-6 transform -rotate-3">
                                <Building2 className="w-10 h-10 text-slate-400" />
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 -tracking-wide mb-2">{deepDive.challenger.name}</h2>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{deepDive.challenger.id}</p>
                        </div>
                        
                        <div className="p-8 border-t border-slate-100 bg-white">
                            <div className="text-center mb-8">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Share of Preference</p>
                                <h3 className="text-5xl font-black text-slate-700">{(deepDive.challenger.winRate * 100).toFixed(1)}%</h3>
                                <div className="flex items-center justify-center gap-1 text-slate-500 mt-2 text-sm font-medium">
                                    <Target className="w-4 h-4" /> Base: {deepDive.challenger.comparisons.toLocaleString()} duelos
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-sm font-bold text-slate-600">Momentum (30d)</span>
                                <div className="flex items-center gap-2 text-emerald-500 font-bold bg-white px-3 py-1 rounded-xl shadow-sm border border-slate-100">
                                    <TrendingUp className="w-4 h-4" />
                                    +{deepDive.challenger.delta}%
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Brecha / Insight Ejecutivo */}
                <PremiumGate featureName="Deep Dive Insight Comparativo" isLocked={true}>
                    <div className="bg-slate-900 p-8 md:p-10 rounded-3xl shadow-xl relative overflow-hidden border border-slate-800">
                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                            <ArrowLeftRight className="w-48 h-48 text-white -rotate-12 transform" />
                        </div>
                        
                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row items-start gap-8">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="p-2 bg-indigo-500/20 rounded-xl backdrop-blur-sm border border-indigo-500/20">
                                            <Sparkles className="w-5 h-5 text-indigo-400" />
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Insight Comparativo de IA</span>
                                    </div>
                                    
                                    <p className="text-lg md:text-xl font-medium text-white leading-relaxed mb-6">
                                        "{deepDive.executiveInsight.intelligenceText}"
                                    </p>
                                    
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold tracking-wide border border-slate-700">
                                            Confianza: {deepDive.executiveInsight.confidence}
                                        </span>
                                        <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-bold uppercase tracking-wider">
                                            Categoría: {deepDive.executiveInsight.category}
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
                                            <p className="text-2xl font-black text-white">24.8 <span className="text-sm text-slate-400 font-medium">puntos</span></p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Proyección 90d</p>
                                            <p className="text-xl font-bold text-amber-500">12.5 <span className="text-sm text-amber-500/50 font-medium">puntos</span> <TrendingDown className="inline w-4 h-4" /></p>
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

