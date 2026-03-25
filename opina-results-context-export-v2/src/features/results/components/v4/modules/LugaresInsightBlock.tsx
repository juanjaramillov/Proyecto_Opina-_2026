import { Map, ShieldAlert, Target, Navigation, Users, MapPin } from "lucide-react";
import { MasterHubSnapshot } from "../../../../../read-models/b2c/hub-types";
import { ResultsGeneration } from "../../../hooks/useResultsExperience";

interface LugaresInsightBlockProps {
  generation: ResultsGeneration;
  snapshot: MasterHubSnapshot;
}

export function LugaresInsightBlock({ generation: _generation, snapshot }: LugaresInsightBlockProps) {
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
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-700 px-3 py-1.5 mb-4">
            <Map className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Estado del Frente: Geografía</span>
          </div>
          <h3 className="text-3xl font-black text-ink tracking-tight mb-3">Concentración Territorial</h3>
          <p className="text-slate-500 text-base leading-relaxed">
            Las posturas dominantes nacen en núcleos muy densos y específicos. El Norte actúa como motor de consenso de vanguardia, mientras fuertes focos de resistencia u opiniones disidentes se aíslan en corredores específicos del Oeste.
          </p>
        </div>
        <div className="w-full md:w-auto flex-shrink-0 bg-slate-50 border border-slate-100 p-5 rounded-2xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Dispersión Fractal</div>
          <div className="text-4xl font-black text-cyan-600">Baja</div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 border-t border-slate-100 pt-8">
        <div className="flex flex-col gap-1">
           <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><Target className="w-3 h-3" /> Epicentro de Consenso</span>
           <span className="text-base font-black text-cyan-700">Distrito Norte</span>
        </div>
        <div className="flex flex-col gap-1">
           <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><MapPin className="w-3 h-3" /> Retractor Principal</span>
           <span className="text-base font-black text-amber-500">Corredor Oeste</span>
        </div>
        <div className="flex flex-col gap-1">
           <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><Navigation className="w-3 h-3" /> Sentimiento</span>
           <span className="text-base font-black text-emerald-600">Aceleración</span>
        </div>
        <div className="flex flex-col gap-1">
           <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><Users className="w-3 h-3" /> Generación Dominante</span>
           <span className="text-base font-black text-indigo-600">Boomers</span>
        </div>
      </div>
    </div>
  );
}
