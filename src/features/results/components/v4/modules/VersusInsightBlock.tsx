import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { MasterHubSnapshot } from "../../../../../read-models/b2c/hub-types";
import { ResultsGeneration } from "../../../hooks/useResultsExperience";

interface VersusInsightBlockProps {
  generation: ResultsGeneration;
  snapshot: MasterHubSnapshot;
}

export function VersusInsightBlock({ generation, snapshot }: VersusInsightBlockProps) {
  if (snapshot.cohortState.privacyState === 'insufficient_cohort') {
    return (
      <div className="w-full flex flex-col items-center justify-center p-8 md:p-12 bg-slate-50 border border-slate-100 rounded-[2rem] text-center my-8">
        <ShieldAlert className="w-12 h-12 text-slate-300 mb-4" />
        <h4 className="text-xl font-bold text-slate-700 mb-2">Muestra Insuficiente</h4>
        <p className="text-slate-500 mb-6 max-w-md mx-auto text-sm">
          No hay suficientes señales ({snapshot.cohortState.cohortSize} activas) en la generación seleccionada ({generation}) para garantizar estadísticamente la privacidad en este nivel de granularidad.
        </p>
        <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-colors">
          Explorar otras variables
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-12">
        <h3 className="text-3xl font-black text-ink tracking-tight mb-2">Mapa de Tensión Versus</h3>
        <p className="text-slate-500 text-lg max-w-2xl">
          Visualización de los debates bicotómicos con mayor energía y fricción en la comunidad.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Most Polarized Debate */}
        <div className="border border-rose-100 bg-white rounded-3xl p-8 relative overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-bl-full group-hover:bg-rose-500/20 transition-colors" />
          
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 text-rose-700 px-3 py-1 mb-6">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Máxima Fricción</span>
          </div>

          <h4 className="text-2xl font-black leading-tight text-ink mb-6">
            ¿Regulación estricta vs Innovación libre en IA?
          </h4>

          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-end">
              <span className="text-sm font-bold text-slate-800">Regulación (49%)</span>
              <span className="text-sm font-bold text-slate-800">Libertad (51%)</span>
            </div>
            <div className="h-3 w-full rounded-full flex overflow-hidden">
              <div className="h-full bg-rose-500 w-[49%]" />
              <div className="h-full bg-slate-200 w-[2%]" />
              <div className="h-full bg-blue-500 w-[51%]" />
            </div>
            <p className="text-xs text-slate-500 font-medium">Empate técnico con alta migración entre posturas.</p>
          </div>
        </div>

        {/* Most Defined Debate */}
        <div className="border border-emerald-100 bg-white rounded-3xl p-8 relative overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full group-hover:bg-emerald-500/20 transition-colors" />
          
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-1 mb-6">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Consenso Fuerte</span>
          </div>

          <h4 className="text-2xl font-black leading-tight text-ink mb-6">
            ¿Trabajo Remoto 100% vs Modelo Híbrido?
          </h4>

          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-end">
              <span className="text-sm font-bold text-slate-800">Híbrido (82%)</span>
              <span className="text-sm text-slate-400">Remoto (18%)</span>
            </div>
            <div className="h-3 w-full rounded-full flex overflow-hidden">
              <div className="h-full bg-emerald-500 w-[82%]" />
              <div className="h-full bg-slate-200 w-[18%]" />
            </div>
            <p className="text-xs text-slate-500 font-medium">Postura consolidada a lo largo del último trimestre.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
