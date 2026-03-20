import { motion } from "framer-motion";
import { MapPin, Navigation, ShieldAlert, Compass } from "lucide-react";
import { MasterHubSnapshot } from "../../../../../read-models/b2c/hub-types";
import { ResultsGeneration } from "../../../hooks/useResultsExperience";

interface LugaresInsightBlockProps {
  generation: ResultsGeneration;
  snapshot: MasterHubSnapshot;
}

export function LugaresInsightBlock({ generation, snapshot }: LugaresInsightBlockProps) {
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

  const locations = [
    { name: "Zona Norte", score: 88, sentiment: "Muy Positivo", color: "bg-emerald-500", textColor: "text-emerald-700", bgColor: "bg-emerald-50" },
    { name: "Centro Histórico", score: 45, sentiment: "Crítico", color: "bg-rose-500", textColor: "text-rose-700", bgColor: "bg-rose-50" },
    { name: "Distrito Financiero", score: 72, sentiment: "Positivo", color: "bg-indigo-500", textColor: "text-indigo-700", bgColor: "bg-indigo-50" },
    { name: "Zona Sur", score: 60, sentiment: "Neutral", color: "bg-amber-500", textColor: "text-amber-700", bgColor: "bg-amber-50" },
  ];

  return (
    <div className="w-full">
      <div className="mb-12">
        <h3 className="text-3xl font-black text-ink tracking-tight mb-2">Mapeo de la Experiencia</h3>
        <p className="text-slate-500 text-lg max-w-2xl">
          Recepción y sentimiento geolocalizado basado en las señales vinculadas a territorios.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Placeholder Map Visual */}
        <div className="bg-slate-50 rounded-[2rem] border border-slate-100 p-8 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-100/50 via-transparent to-transparent opacity-50" />
          
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center mb-6 relative z-10 text-indigo-500 border border-indigo-100"
          >
            <MapPin className="w-10 h-10" />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 text-white rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-[10px] font-black">98</span>
            </div>
          </motion.div>
          
          <h4 className="text-xl font-black text-ink relative z-10 mb-2">Cartografía en Tiempo Real</h4>
          <p className="text-sm text-slate-500 font-medium text-center max-w-sm relative z-10">
            La experiencia interactiva del mapa estará disponible en la vista detallada. Arriba un resumen de los clusters principales.
          </p>
        </div>

        {/* Data Ranking */}
        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-8 pb-4 border-b border-slate-100">
            <Compass className="w-5 h-5 text-cyan-500" />
            <h4 className="text-xl font-black text-ink">Ranking Territorial</h4>
          </div>

          <div className="space-y-4">
            {locations.map((loc, index) => (
              <motion.div 
                key={loc.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
              >
                <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center ${loc.bgColor} ${loc.textColor}`}>
                  <Navigation className="w-5 h-5" />
                </div>
                
                <div className="flex-1">
                  <h5 className="text-sm font-bold text-ink mb-1">{loc.name}</h5>
                  <div className="flex items-center gap-2">
                    <div className="h-2 bg-slate-100 rounded-full flex-1 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${loc.score}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                        className={`h-full ${loc.color}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-lg font-black text-ink tracking-tight">{loc.score}</div>
                  <div className={`text-[10px] font-bold uppercase tracking-widest ${loc.textColor}`}>
                    {loc.sentiment}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
