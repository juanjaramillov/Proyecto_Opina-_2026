import { AlertTriangle, TrendingDown, TrendingUp, Zap, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { b2bCuratedSnapshot } from "../../../read-models/b2b/b2bCuratedSnapshot";

export function OverviewB2BExecutiveSummary() {
    const { overview } = b2bCuratedSnapshot;

    const renderIcon = (iconName: string) => {
        switch (iconName) {
            case "trending-up":
                return <TrendingUp className="w-5 h-5 text-emerald-600" />;
            case "trending-down":
                return <TrendingDown className="w-5 h-5 text-rose-600" />;
            case "zap":
                return <Zap className="w-5 h-5 text-amber-500" />;
            default:
                return <Sparkles className="w-5 h-5 text-indigo-500" />;
        }
    };

    return (
        <div className="mb-10 space-y-8">
            {/* Executive Narrative */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-8 md:p-10 rounded-3xl shadow-lg relative overflow-hidden border border-indigo-900">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Sparkles className="w-48 h-48 text-white -rotate-12 transform" />
                </div>
                
                <div className="relative z-10 max-w-4xl">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-indigo-500/20 rounded-xl backdrop-blur-sm">
                            <Zap className="w-5 h-5 text-indigo-300" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-indigo-300">Inteligencia Ejecutiva - Resumen del Período</span>
                    </div>
                    
                    <p className="text-lg md:text-xl font-medium text-white leading-relaxed mb-8">
                        {overview.executiveSummary}
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <Link 
                            to="/b2b/deep-dive" 
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-bold transition shadow-sm border border-indigo-400"
                        >
                            Ver Comparativa a Fondo
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link 
                            to="/b2b/reports" 
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition border border-white/10"
                        >
                            Descargar Informe
                        </Link>
                    </div>
                </div>
            </div>

            {/* Key Findings & Signals Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* 3 Key Findings */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {overview.keyFindings.map((finding, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-full hover:border-indigo-100 transition-colors">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-3 rounded-2xl ${
                                    finding.trend === 'positive' ? 'bg-emerald-50' : 
                                    finding.trend === 'negative' ? 'bg-rose-50' : 'bg-amber-50'
                                }`}>
                                    {renderIcon(finding.icon)}
                                </div>
                                <h4 className="font-bold text-slate-900">{finding.title}</h4>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed flex-1">
                                {finding.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Signals / Alerts */}
                <div className="lg:col-span-1 space-y-4">
                    {overview.alerts.map((alert, idx) => (
                        <div key={idx} className={`p-5 rounded-3xl border shadow-sm ${
                            alert.type === 'risk' 
                                ? 'bg-rose-50 border-rose-100' 
                                : 'bg-emerald-50 border-emerald-100'
                        }`}>
                            <div className="flex items-center gap-2 mb-2">
                                {alert.type === 'risk' ? (
                                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                                ) : (
                                    <Sparkles className="w-5 h-5 text-emerald-600" />
                                )}
                                <h4 className={`font-bold text-sm ${
                                    alert.type === 'risk' ? 'text-rose-900' : 'text-emerald-900'
                                }`}>{alert.title}</h4>
                            </div>
                            <p className={`text-xs leading-relaxed ${
                                alert.type === 'risk' ? 'text-rose-700' : 'text-emerald-700'
                            }`}>
                                {alert.description}
                            </p>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
