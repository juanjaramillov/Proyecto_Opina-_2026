import { motion } from "framer-motion";
import { Layers, ShieldAlert, CheckCircle2 } from "lucide-react";
import { MasterHubSnapshot } from "../../../../../read-models/b2c/hub-types";
import { ResultsGeneration } from "../../../hooks/useResultsExperience";

interface ProfundidadInsightBlockProps {
  generation: ResultsGeneration;
  snapshot: MasterHubSnapshot;
}

export function ProfundidadInsightBlock({ generation, snapshot }: ProfundidadInsightBlockProps) {
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

  const attributes = [
    { name: "Sostenibilidad", score: 85, color: "bg-emerald-500" },
    { name: "Innovación", score: 92, color: "bg-indigo-500" },
    { name: "Accesibilidad", score: 45, color: "bg-rose-500" },
    { name: "Rentabilidad", score: 78, color: "bg-amber-500" },
    { name: "Impacto Social", score: 88, color: "bg-cyan-500" },
  ];

  return (
    <div className="w-full">
      <div className="mb-12">
        <h3 className="text-3xl font-black text-ink tracking-tight mb-2">Análisis de Atributos</h3>
        <p className="text-slate-500 text-lg max-w-2xl">
          Descomposición multicapa de cómo la comunidad percibe y valora las características específicas.
        </p>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm flex flex-col md:flex-row gap-12">
        
        {/* Radar/Bar Chart representation */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-emerald-500" />
            <h4 className="text-xl font-black text-ink">Radar de Percepción</h4>
          </div>

          <div className="space-y-4">
            {attributes.map((attr, index) => (
              <div key={attr.name}>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-bold text-slate-800">{attr.name}</span>
                  <span className="text-xs font-bold text-slate-400">{attr.score}%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${attr.score}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className={`h-full ${attr.color} rounded-full`} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Highlight Callout */}
        <div className="md:w-72 shrink-0 bg-slate-50 rounded-3xl p-6 border border-slate-100 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 px-3 py-1 mb-6 self-start">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Fortaleza Clave</span>
          </div>
          <h5 className="text-3xl font-black text-ink leading-tight mb-4">La Innovación lidera la percepción</h5>
          <p className="text-sm text-slate-500 font-medium">
            Es el atributo con mayor consenso positivo, superando ampliamente a la accesibilidad, que permanece como el principal desafío.
          </p>
        </div>

      </div>
    </div>
  );
}
