import { Layers, ShieldAlert, Hexagon, Activity, Hash, AlertCircle } from "lucide-react";
import { MasterHubSnapshot } from "../../../../../read-models/b2c/hub-types";
import { ResultsGeneration } from "../../../hooks/useResultsExperience";

interface ProfundidadInsightBlockProps {
  generation: ResultsGeneration;
  snapshot: MasterHubSnapshot;
}

export function ProfundidadInsightBlock({ generation: _generation, snapshot }: ProfundidadInsightBlockProps) {
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
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1.5 mb-4">
            <Layers className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Estado del Frente: Profundidad</span>
          </div>
          <h3 className="text-3xl font-black text-ink tracking-tight mb-3">La Brecha de Adopción</h3>
          <p className="text-slate-500 text-base leading-relaxed">
            El análisis detallado de atributos confirma un patrón clásico: el ecosistema premia altamente la innovación tecnológica pero castiga severamente la falta de accesibilidad base. Hay un trade-off claro entre lo aspiracional y lo pragmático.
          </p>
        </div>
        <div className="w-full md:w-auto flex-shrink-0 bg-slate-50 border border-slate-100 p-5 rounded-2xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Dispersión de Atributos</div>
          <div className="text-4xl font-black text-emerald-600">Alta</div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 border-t border-slate-100 pt-8">
        <div className="flex flex-col gap-1">
           <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><Hexagon className="w-3 h-3" /> Pilar Core</span>
           <span className="text-base font-black text-indigo-600">Innovación (92%)</span>
        </div>
        <div className="flex flex-col gap-1">
           <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><AlertCircle className="w-3 h-3" /> Cuello de Botella</span>
           <span className="text-base font-black text-rose-500">Accesibilidad (45%)</span>
        </div>
        <div className="flex flex-col gap-1">
           <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><Activity className="w-3 h-3" /> Retención</span>
           <span className="text-base font-black text-emerald-600">Estable</span>
        </div>
        <div className="flex flex-col gap-1">
           <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><Hash className="w-3 h-3" /> Generación Retractora</span>
           <span className="text-base font-black text-slate-800">Generación X</span>
        </div>
      </div>
    </div>
  );
}
