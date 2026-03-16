import { FileText, Download, Lock, ChevronRight, Zap } from "lucide-react";

export default function ReportsB2B() {
    return (
        <div className="p-6 lg:p-10 flex flex-col h-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <FileText className="w-8 h-8 text-indigo-600" />
                        <span className="text-gradient-brand">C-Level Reports</span>
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Exportación de inteligencia accionable, resúmenes ejecutivos y análisis sectoriales.
                    </p>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-8 bg-white border border-slate-100 rounded-3xl shadow-sm relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-50/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

                <div className="max-w-2xl w-full text-center relative z-10">
                    <div className="w-24 h-24 bg-white rounded-3xl shadow-xl shadow-indigo-500/10 border border-indigo-100 flex items-center justify-center mx-auto mb-8 rotate-3 transition-transform hover:rotate-6">
                        <Lock className="w-10 h-10 text-indigo-400" />
                    </div>
                    
                    <h2 className="text-2xl lg:text-3xl font-black text-slate-900 mb-4 tracking-tight">
                        Módulo de Reportería en Desarrollo
                    </h2>
                    
                    <p className="text-slate-500 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
                        Estamos calibrando nuestros modelos generativos para entregar reportes ejecutivos automatizados en PDF y formatos presentables listos para la junta directiva.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-10">
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-start gap-4 hover:border-indigo-200 transition-colors">
                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl shrink-0">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm mb-1">One-Pagers Comerciales</h4>
                                <p className="text-xs text-slate-500">Resúmenes de 1 página con KPIs críticos y posicionamiento vs. competidores directos.</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-start gap-4 hover:border-indigo-200 transition-colors">
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl shrink-0">
                                <Zap className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm mb-1">Alertas Automatizadas</h4>
                                <p className="text-xs text-slate-500">Despachos programados semanales o mensuales directo a su equipo de marketing.</p>
                            </div>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-xl shadow-slate-900/10 cursor-not-allowed opacity-80">
                        <Download className="w-4 h-4 opacity-50" />
                        <span className="opacity-90">Exportar Reporte (.pdf)</span>
                        <ChevronRight className="w-4 h-4 opacity-30 ml-2" />
                    </div>
                </div>
            </div>
        </div>
    );
}
