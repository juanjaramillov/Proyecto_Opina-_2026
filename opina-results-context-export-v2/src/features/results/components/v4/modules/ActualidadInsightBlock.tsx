import { Radio, ShieldAlert, ArrowUpRight, Clock, Flame } from "lucide-react";
import { MasterHubSnapshot } from "../../../../../read-models/b2c/hub-types";
import { ResultsGeneration } from "../../../hooks/useResultsExperience";

interface ActualidadInsightBlockProps {
  generation: ResultsGeneration;
  snapshot: MasterHubSnapshot;
}

export function ActualidadInsightBlock({ generation: _generation, snapshot }: ActualidadInsightBlockProps) {
  if (snapshot.cohortState.privacyState === 'insufficient_cohort') {
    return (
      <div className="w-full flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-100 rounded-[2rem] text-center my-8">
        <ShieldAlert className="w-12 h-12 text-slate-300 mb-4" />
        <h4 className="text-xl font-bold text-slate-700 mb-2">Muestra Insuficiente</h4>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 md:p-10">
      <div className="flex flex-col md:flex-row gap-8 items-start justify-between mb-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 border border-rose-100 text-rose-700 px-3 py-1.5 mb-4">
            <Radio className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Estado del Frente: Actualidad</span>
          </div>
          <h3 className="text-3xl font-black text-ink tracking-tight mb-3">Picos de Atención Fugaz</h3>
          <p className="text-slate-500 text-base leading-relaxed">
            Las coyunturas dominan la conversación, pero con una latencia extremadamente corta. Temas como normativas globales explotan en interés durante horas y desaparecen, reemplazados rápidamente por incentivos locales (subsidios).
          </p>
        </div>
        <div className="w-full md:w-auto flex-shrink-0 bg-slate-50 border border-slate-100 p-5 rounded-2xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Velocidad de Rotación</div>
          <div className="text-4xl font-black text-rose-500">Crítica</div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 border-t border-slate-100 pt-8">
        <div className="flex flex-col gap-1">
           <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><Flame className="w-3 h-3" /> Tema Caliente</span>
           <span className="text-base font-black text-rose-600">Regulación IA</span>
        </div>
        <div className="flex flex-col gap-1">
           <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><ArrowUpRight className="w-3 h-3" /> Aceleración</span>
           <span className="text-base font-black text-emerald-500">+300% (2H)</span>
        </div>
        <div className="flex flex-col gap-1">
           <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><Clock className="w-3 h-3" /> Latencia Promedio</span>
           <span className="text-base font-black text-slate-700">4.5 Días</span>
        </div>
        <div className="flex flex-col gap-1">
           <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><ShieldAlert className="w-3 h-3" /> Fricción</span>
           <span className="text-base font-black text-amber-500">Severa</span>
        </div>
      </div>
    </div>
  );
}
