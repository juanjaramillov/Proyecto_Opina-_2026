import { motion } from "framer-motion";
import { Trophy, ShieldAlert, Crown, ArrowUp, ArrowDown } from "lucide-react";
import { MasterHubSnapshot } from "../../../../../read-models/b2c/hub-types";
import { ResultsGeneration } from "../../../hooks/useResultsExperience";

interface TorneoInsightBlockProps {
  generation: ResultsGeneration;
  snapshot: MasterHubSnapshot;
}

export function TorneoInsightBlock({ generation, snapshot }: TorneoInsightBlockProps) {
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

  const ranking = [
    { rank: 1, name: "Inteligencia Artificial (IA)", score: 98, trend: "up", color: "bg-amber-500", text: "text-amber-700" },
    { rank: 2, name: "Ciberseguridad", score: 85, trend: "up", color: "bg-slate-400", text: "text-slate-600" },
    { rank: 3, name: "Energías Renovables", score: 72, trend: "down", color: "bg-orange-500", text: "text-orange-700" },
    { rank: 4, name: "Biotecnología", score: 65, trend: "up", color: "bg-emerald-500", text: "text-emerald-700" },
  ];

  return (
    <div className="w-full">
      <div className="mb-12">
        <h3 className="text-3xl font-black text-ink tracking-tight mb-2">Escalera de Dominancia</h3>
        <p className="text-slate-500 text-lg max-w-2xl">
          Las opciones que lideran consistentemente los enfrentamientos múltiples en el ecosistema.
        </p>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-8 pb-4 border-b border-slate-100">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h4 className="text-xl font-black text-ink">Ranking de Supervivencia</h4>
        </div>

        <div className="space-y-4">
          {ranking.map((item, index) => (
            <motion.div 
              key={item.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors group"
            >
              <div className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center font-black text-xl ${item.rank === 1 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                {item.rank === 1 ? <Crown className="w-6 h-6" /> : item.rank}
              </div>
              
              <div className="flex-1">
                <h5 className="text-lg font-bold text-ink">{item.name}</h5>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-2 bg-slate-100 rounded-full flex-1 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.score}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      className={`h-full ${item.color}`}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-400 w-12 text-right">{item.score}/100</span>
                </div>
              </div>

              <div className="shrink-0 w-8 flex justify-center">
                {item.trend === "up" ? (
                  <ArrowUp className="w-5 h-5 text-emerald-500" />
                ) : (
                  <ArrowDown className="w-5 h-5 text-rose-500" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
