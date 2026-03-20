import { Zap, ShieldAlert, Users, TrendingUp, AlertTriangle } from "lucide-react";
import { MasterHubSnapshot } from "../../../../../read-models/b2c/hub-types";
import { ResultsGeneration } from "../../../hooks/useResultsExperience";

interface VersusInsightBlockProps {
  generation: ResultsGeneration;
  snapshot: MasterHubSnapshot;
}

export function VersusInsightBlock({ generation, snapshot }: VersusInsightBlockProps) {
  if (snapshot.cohortState.privacyState === 'insufficient_cohort') {
    return (
      <div className="w-full flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-100 rounded-[2rem] text-center my-8">
        <ShieldAlert className="w-12 h-12 text-slate-300 mb-4" />
        <h4 className="text-xl font-bold text-slate-700 mb-2">Muestra Insuficiente</h4>
        <p className="text-slate-500 mb-6 max-w-md mx-auto text-sm">
          No hay suficientes señales en la generación {generation}.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 md:p-10">
      <div className="flex flex-col md:flex-row gap-8 items-start justify-between mb-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 mb-4">
            <Zap className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Estado del Frente: Versus</span>
          </div>
          <h3 className="text-3xl font-black text-ink tracking-tight mb-3">La Fractura Constante</h3>
          <p className="text-slate-500 text-base leading-relaxed">
            El módulo de decisiones dicotómicas concentra la mayor fricción del ecosistema. Identificamos polarización aguda en temas de privacidad vs conveniencia, mientras que el modelo de trabajo remoto muestra un consenso sorpresivo en retorno a oficinas.
          </p>
        </div>
        <div className="w-full md:w-auto flex-shrink-0 bg-slate-50 border border-slate-100 p-5 rounded-2xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Temperatura del Módulo</div>
          <div className="text-4xl font-black text-indigo-600">Alta</div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 border-t border-slate-100 pt-8">
        <div className="flex flex-col gap-1">
           <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><Users className="w-3 h-3" /> Mayor Cambio</span>
           <span className="text-base font-black text-slate-800">Privacidad de Datos</span>
        </div>
        <div className="flex flex-col gap-1">
           <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><TrendingUp className="w-3 h-3" /> Mayor Consenso</span>
           <span className="text-base font-black text-emerald-600">Trabajo Híbrido (82%)</span>
        </div>
        <div className="flex flex-col gap-1">
           <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><AlertTriangle className="w-3 h-3" /> Más Polarizado</span>
           <span className="text-base font-black text-rose-500">Regular IA (51/49)</span>
        </div>
        <div className="flex flex-col gap-1">
           <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><ShieldAlert className="w-3 h-3" /> Tensión Generacional</span>
           <span className="text-base font-black text-indigo-600">Gen Z vs Boomers</span>
        </div>
      </div>
    </div>
  );
}
