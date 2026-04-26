import { Zap, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface OverviewB2BExecutiveNarrativeProps {
    summaryText: string;
}

/**
 * Hero narrative card that summarizes the B2B overview period in natural language.
 */
export function OverviewB2BExecutiveNarrative({ summaryText }: OverviewB2BExecutiveNarrativeProps) {
    return (
        <div className="bg-gradient-to-br from-white via-brand-50/30 to-accent-50/20 p-8 md:p-10 rounded-3xl shadow-sm relative overflow-hidden border border-brand-100">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Sparkles className="w-48 h-48 text-brand -rotate-12 transform" />
            </div>

            <div className="relative z-10 max-w-4xl">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-brand-50 border border-brand-100 rounded-xl">
                        <Zap className="w-5 h-5 text-brand" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-brand">Inteligencia Ejecutiva - Resumen del Período</span>
                </div>

                <p className="text-lg md:text-xl font-medium text-ink leading-relaxed mb-8">
                    {summaryText}
                </p>

                <div className="flex flex-wrap gap-4">
                    <Link
                        to="/b2b/deep-dive"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-brand to-accent hover:opacity-90 hover:scale-105 text-white rounded-xl font-bold transition-all shadow-sm shadow-brand/20"
                    >
                        Ver Comparativa a Fondo
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                        to="/b2b/reports"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-ink rounded-xl font-bold transition border border-stroke shadow-sm"
                    >
                        Descargar Informe
                    </Link>
                </div>
            </div>
        </div>
    );
}
