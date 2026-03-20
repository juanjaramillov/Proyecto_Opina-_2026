import { Trophy, ShieldAlert, Crosshair, Crown, ArrowUp, Users } from "lucide-react";
import { MasterHubSnapshot } from "../../../../../read-models/b2c/hub-types";
import { ResultsGeneration } from "../../../hooks/useResultsExperience";

interface TorneoInsightBlockProps {
  generation: ResultsGeneration;
  snapshot: MasterHubSnapshot;
}

export function TorneoInsightBlock({ generation: _generation, snapshot }: TorneoInsightBlockProps) {
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
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-100 text-amber-700 px-3 py-1.5 mb-4">
            <Trophy className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Estado del Frente: Torneo</span>
          </div>
          <h3 className="text-3xl font-black text-ink tracking-tight mb-3">Jerarquías Claras, Poca Fricción</h3>
          <p className="text-slate-500 text-base leading-relaxed">
            El ecosistema muestra un monopolio de interés en categorías clave. La competencia de eliminación directa ha dejado a un claro ganador con una brecha significativa sobre el resto del pelotón, indicando un consenso amplio sobre prioridades.
          </p>
        </div>
        <div className="w-full md:w-auto flex-shrink-0 bg-slate-50 border border-slate-100 p-5 rounded-2xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Fricción Competitiva</div>
          <div className="text-4xl font-black text-amber-500">Baja</div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 border-t border-slate-100 pt-8">
        <div className="flex flex-col gap-1">
           <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><Crown className="w-3 h-3" /> Categoría Líder</span>
           <span className="text-base font-black text-amber-600">Sostenibilidad</span>
        </div>
        <div className="flex flex-col gap-1">
           <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><Crosshair className="w-3 h-3" /> Brecha con el 2do</span>
           <span className="text-base font-black text-slate-800">12 Puntos</span>
        </div>
        <div className="flex flex-col gap-1">
           <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><ArrowUp className="w-3 h-3" /> Escalador Rápido</span>
           <span className="text-base font-black text-emerald-500">Ciberseguridad</span>
        </div>
        <div className="flex flex-col gap-1">
           <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><Users className="w-3 h-3" /> Generación Dominante</span>
           <span className="text-base font-black text-indigo-600">Millennials</span>
        </div>
      </div>
    </div>
  );
}
