import { useEffect } from "react";
import { FileText, Download, Target, CalendarDays, BarChart3, AlertTriangle, LightbulbIcon, ArrowLeft } from "lucide-react";
import { analyticsService } from "../../../features/analytics/services/analyticsService";
import { Link } from "react-router-dom";
import { useOverviewB2BState } from "../hooks/useOverviewB2BState";
import { MetricAvailabilityCard } from "../../../components/ui/MetricAvailabilityCard";

export default function ReportsB2B() {
    useEffect(() => {
        analyticsService.trackSystem('b2b_opened_reports', 'info');
    }, []);

    const { loading, snapshot } = useOverviewB2BState();

    if (loading) {
        return (
            <div className="p-6 lg:p-10 flex flex-col h-full min-h-screen bg-[#F8FAFC] items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <FileText className="w-12 h-12 text-slate-300 mb-4" />
                    <div className="text-slate-500 font-medium">Generando Reporte de Inteligencia...</div>
                </div>
            </div>
        );
    }

    if (!snapshot || snapshot.availability === 'insufficient_data' || snapshot.reports.exportStatus === 'blocked') {
        const total = snapshot?.overview.secondaryMetrics["Total Señales Evaluadas"] || 0;
        return (
            <div className="p-6 lg:p-10 flex flex-col h-full min-h-screen bg-[#F8FAFC]">
                <div className="flex items-center justify-between mb-8 max-w-5xl mx-auto w-full">
                    <Link 
                        to="/b2b" 
                        onClick={() => analyticsService.trackSystem('b2b_clicked_next_view', 'info', { destination_view: 'overview' })}
                        className="text-slate-500 hover:text-indigo-600 transition flex items-center gap-2 font-medium text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver
                    </Link>
                </div>
                <div className="max-w-3xl mx-auto w-full mt-10">
                    <MetricAvailabilityCard 
                        label="Reporte de Inteligencia B2B"
                        status="insufficient_data"
                        helperText={`Se requiere mayor actividad global para desbloquear la generación de reportes B2B. (Interacciones Mínimas: 30, Actual: ${total})`}
                    />
                </div>
            </div>
        );
    }

    // Filtrar usando lógica de elegibilidad comercial
    const eligibleEntities = snapshot.benchmark.entries.filter(
        e => e.commercialEligibilityLabel === "premium_export_ready" || e.commercialEligibilityLabel === "standard_ready"
    );

    const leader = eligibleEntities.length > 0 ? eligibleEntities[0] : null;
    const growing = eligibleEntities.find(e => e.stabilityLabel === 'en_aceleración');
    const universeCount = snapshot.overview.secondaryMetrics["Total Señales Evaluadas"] || 0;
    
    // Generar contenido del reporte dinámicamente
    const reports = {
        title: "Brief Ejecutivo: Dinámica Competitiva B2B",
        dateRange: "Actualización Continua",
        universe: `${universeCount} señales validadas (Mercado Nacional)`,
        summary: leader 
            ? `El mercado muestra una dinámica activa. La entidad '${leader.entityName}' consolida su liderazgo capturando un ${(leader.weightedPreferenceShare * 100).toFixed(1)}% de preferencia, manteniéndose ${leader.stabilityLabel.replace('_',' ')}.`
            : "Actividad consolidada sin un líder claro elegible para exportación comercial en este momento.",
        findings: eligibleEntities.slice(0, 3).map(e => 
            `La entidad '${e.entityName}' mantiene una preferencia del ${(e.weightedPreferenceShare * 100).toFixed(1)}%, con volumen muestral de ${e.nEff.toFixed(0)} interacciones (Elegibilidad: ${e.commercialEligibilityLabel.replace('_',' ')}).`
        ),
        criticalAlert: snapshot.alerts.filter(a => a.severity === 'high').length > 0
            ? snapshot.alerts.filter(a => a.severity === 'high')[0].message
            : "No se detectan fugas de lealtad críticas ni pérdidas de momentum severas en el universo analizado.",
        strategicRecommendation: growing
            ? `Oportunidad Táctica: '${growing.entityName}' muestra aceleración positiva. Evaluar tácticas de retención o alianzas estratégicas inmediatas considerando su tracción ascendente.`
            : leader 
                ? `Mantener estrategias de consolidación sobre '${leader.entityName}' para proteger su margen frente a posibles retadores emergentes.`
                : "Se requiere mayor flujo de datos para emitir una recomendación estratégica c-level sólida."
    };

    return (
        <div className="p-6 lg:p-10 flex flex-col h-full min-h-screen bg-[#F8FAFC]">
            {/* Header / Tools */}
            <div className="flex items-center justify-between mb-8 max-w-5xl mx-auto w-full">
                <Link 
                    to="/b2b" 
                    onClick={() => analyticsService.trackSystem('b2b_clicked_next_view', 'info', { destination_view: 'overview' })}
                    className="text-slate-500 hover:text-indigo-600 transition flex items-center gap-2 font-medium text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver
                </Link>
                
                <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-slate-900/20">
                    <Download className="w-4 h-4" />
                    Exportar PDF
                </button>
            </div>

            {/* A4 Document Simulation Wrapper */}
            <div className="flex-1 w-full max-w-5xl mx-auto">
                <div className="bg-white rounded-t-3xl border-t border-l border-r border-slate-200 shadow-2xl p-8 md:p-16 min-h-[1056px] relative overflow-hidden">
                    
                    {/* Watermark/Decoration */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

                    {/* Report Header */}
                    <header className="border-b-2 border-slate-900 pb-8 mb-12 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <span className="font-black text-2xl tracking-tight text-slate-900">Opina+ <span className="text-slate-400 font-light">Intelligence</span></span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight max-w-2xl">
                                {reports.title}
                            </h1>
                        </div>

                        <div className="flex flex-col gap-3 text-right shrink-0">
                            <div className="flex items-center justify-end gap-2 text-slate-600 font-medium">
                                <CalendarDays className="w-4 h-4 text-indigo-500" />
                                {reports.dateRange}
                            </div>
                            <div className="flex items-center justify-end gap-2 text-slate-600 font-medium">
                                <Target className="w-4 h-4 text-indigo-500" />
                                Universo: {reports.universe.split('(')[0].trim()}
                            </div>
                        </div>
                    </header>

                    {/* Report Content */}
                    <div className="space-y-12 relative z-10">

                        {/* Executive Summary Section */}
                        <section>
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <BarChart3 className="w-4 h-4" /> Resumen Ejecutivo
                            </h2>
                            <p className="text-2xl font-medium text-slate-800 leading-relaxed border-l-4 border-indigo-500 pl-6 py-2">
                                {reports.summary}
                            </p>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Key Findings List */}
                            <section>
                                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Target className="w-4 h-4" /> Hallazgos Principales (Eligibles)
                                </h2>
                                <ul className="space-y-4">
                                    {reports.findings.length > 0 ? reports.findings.map((finding, idx) => (
                                        <li key={idx} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs shrink-0">
                                                {idx + 1}
                                            </span>
                                            <span className="text-slate-700 font-medium leading-relaxed">{finding}</span>
                                        </li>
                                    )) : (
                                        <li className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                            <span className="text-slate-500 font-medium">No hay suficientes entidades con grado comercial.</span>
                                        </li>
                                    )}
                                </ul>
                            </section>

                            {/* Alert Box */}
                            <section>
                                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-rose-500" /> Riesgo Inminente
                                </h2>
                                <div className="bg-rose-50 p-6 rounded-3xl border border-rose-200 shadow-sm relative overflow-hidden h-full">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                        <AlertTriangle className="w-32 h-32 text-rose-900 -rotate-12" />
                                    </div>
                                    <p className="text-lg font-bold text-rose-900 leading-snug relative z-10">
                                        {reports.criticalAlert}
                                    </p>
                                </div>
                            </section>
                        </div>

                        {/* Strategic Recommendation */}
                        <section className="pt-8 mt-12 border-t border-slate-100">
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <LightbulbIcon className="w-4 h-4 text-amber-500" /> Recomendación Táctica C-Level
                            </h2>
                            <div className="bg-slate-900 p-8 md:p-10 rounded-3xl shadow-xl text-white">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white/10 rounded-2xl mt-1 shrink-0">
                                        <LightbulbIcon className="w-6 h-6 text-amber-400" />
                                    </div>
                                    <p className="text-xl md:text-2xl font-medium leading-relaxed text-slate-100">
                                        "{reports.strategicRecommendation}"
                                    </p>
                                </div>
                            </div>
                        </section>

                    </div>
                    
                    {/* Footer */}
                    <div className="absolute bottom-16 left-16 right-16 pt-8 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <span>Generado Automáticamente</span>
                        <span>Opina+ Intelligence System</span>
                    </div>

                </div>
            </div>
        </div>
    );
}
