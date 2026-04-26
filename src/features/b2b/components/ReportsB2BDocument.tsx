import { FileText, Target, CalendarDays, BarChart3, AlertTriangle, LightbulbIcon } from "lucide-react";
import type { ReportContent } from "../utils/reportsHelpers";

interface ReportsB2BDocumentProps {
    content: ReportContent;
}

/**
 * Documento A4 simulado del Brief Ejecutivo B2B. Sólo render — el contenido llega
 * ya armado vía `ReportContent`. Deliberadamente sin dependencias de snapshot ni
 * de servicios para poder reutilizarlo en tests visuales / storybook en el futuro.
 */
export function ReportsB2BDocument({ content }: ReportsB2BDocumentProps) {
    return (
        <div className="flex-1 w-full max-w-5xl mx-auto">
            <div className="bg-white rounded-t-3xl border-t border-l border-r border-slate-200 shadow-2xl p-8 md:p-16 min-h-[1056px] relative overflow-hidden">

                {/* Watermark/Decoration */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

                {/* Report Header */}
                <header className="border-b-2 border-slate-200 pb-8 mb-12 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-brand-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-brand-600/20">
                                <FileText className="w-6 h-6" />
                            </div>
                            <span className="font-black text-2xl tracking-tight text-ink">Opina+ <span className="text-slate-400 font-light">Intelligence</span></span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-ink tracking-tight leading-tight max-w-2xl">
                            {content.title}
                        </h1>
                    </div>

                    <div className="flex flex-col gap-3 text-right shrink-0">
                        <div className="flex items-center justify-end gap-2 text-slate-600 font-medium">
                            <CalendarDays className="w-4 h-4 text-brand-500" />
                            {content.dateRange}
                        </div>
                        <div className="flex items-center justify-end gap-2 text-slate-600 font-medium">
                            <Target className="w-4 h-4 text-brand-500" />
                            Universo: {content.universe.split('(')[0].trim()}
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
                        <p className="text-2xl font-medium text-slate-800 leading-relaxed border-l-4 border-brand-500 pl-6 py-2">
                            {content.summary}
                        </p>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Key Findings List */}
                        <section>
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Target className="w-4 h-4" /> Hallazgos Principales (Eligibles)
                            </h2>
                            <ul className="space-y-4">
                                {content.findings.length > 0 ? content.findings.map((finding, idx) => (
                                    <li key={idx} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-100 text-brand-700 font-bold text-xs shrink-0">
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
                                <AlertTriangle className="w-4 h-4 text-danger-500" /> Riesgo Inminente
                            </h2>
                            <div className="bg-danger-50 p-6 rounded-3xl border border-danger-200 shadow-sm relative overflow-hidden h-full">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                    <AlertTriangle className="w-32 h-32 text-danger-900 -rotate-12" />
                                </div>
                                <p className="text-lg font-bold text-danger-900 leading-snug relative z-10">
                                    {content.criticalAlert}
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* Strategic Recommendation */}
                    <section className="pt-8 mt-12 border-t border-slate-100">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <LightbulbIcon className="w-4 h-4 text-warning-500" /> Recomendación Táctica C-Level
                        </h2>
                        <div className="bg-gradient-to-br from-brand-50 via-white to-accent-50 p-8 md:p-10 rounded-3xl shadow-xl border border-brand-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10"></div>
                            <div className="flex items-start gap-4 relative z-10">
                                <div className="p-3 bg-warning-50 border border-warning-100 rounded-2xl mt-1 shrink-0">
                                    <LightbulbIcon className="w-6 h-6 text-warning-600" />
                                </div>
                                <p className="text-xl md:text-2xl font-medium leading-relaxed text-ink">
                                    "{content.strategicRecommendation}"
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
    );
}
