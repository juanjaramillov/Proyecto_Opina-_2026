import { motion } from "framer-motion";
import { Navigation, ShieldAlert, Compass, Target, Map } from "lucide-react";
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

  const epicentro = { name: "Distrito Tecnológico Norte", score: 94, sentiment: "Aceleración", desc: "Concentra el 60% de la actividad favorable reciente, actuando como el principal motor de consenso de la temática." };
  
  const locations = [
    { name: "Anillo Financiero Centro", score: 65, sentiment: "Tensión", color: "bg-rose-500", dot: "border-rose-500 text-rose-600" },
    { name: "Polos Universitarios Sur", score: 82, sentiment: "Orgánico", color: "bg-emerald-500", dot: "border-emerald-500 text-emerald-600" },
    { name: "Corredor Industrial Oeste", score: 48, sentiment: "Resistencia", color: "bg-amber-500", dot: "border-amber-500 text-amber-600" },
  ];

  return (
    <div className="w-full">
      <div className="mb-10 md:mb-14">
        <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-700 px-3 py-1.5 mb-4">
          <Map className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Análisis Geográfico</span>
        </div>
        <h3 className="text-3xl md:text-5xl font-black text-ink tracking-tight mb-4">
          Cartografía del Sentimiento
        </h3>
        <p className="text-slate-500 text-base md:text-lg max-w-2xl leading-relaxed">
          Las ideas no flotan en el vacío. Tienen raíces territoriales. Este es el mapa de dónde nacen, se resisten o se adoptan las nuevas posturas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* El Epicentro - Huge Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7 bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col group hover:shadow-xl hover:border-cyan-200 transition-all"
        >
          {/* Stylized Abstract Map Background */}
          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none transition-opacity group-hover:opacity-20 flex items-center justify-end px-12">
             <div className="w-64 h-64 border-[40px] border-cyan-500 rounded-full blur-xl" />
          </div>
          
          <div className="relative z-10 flex flex-col h-full">
             <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 text-cyan-700 px-3 py-1 mb-8 self-start">
               <Target className="w-4 h-4" />
               <span className="text-[10px] font-bold uppercase tracking-widest">El Epicentro Activo</span>
             </div>

             <h4 className="text-4xl md:text-5xl font-black text-ink mb-4 leading-tight">
               {epicentro.name}
             </h4>
             <p className="text-slate-500 text-base md:text-lg font-medium mb-12 max-w-sm leading-relaxed">
               {epicentro.desc}
             </p>

             <div className="mt-auto">
               <div className="flex items-center gap-6">
                 <div>
                   <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Densidad</span>
                   <span className="text-5xl font-black text-cyan-600 leading-none">{epicentro.score}<span className="text-2xl text-cyan-300">%</span></span>
                 </div>
                 <div className="w-px h-12 bg-slate-200" />
                 <div>
                   <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Estado</span>
                   <span className="text-xl font-bold text-slate-800">{epicentro.sentiment}</span>
                 </div>
               </div>
             </div>
          </div>
        </motion.div>

        {/* Territorios Satélite */}
        <div className="lg:col-span-5 bg-slate-900 rounded-3xl p-8 md:p-10 text-white relative flex flex-col">
          <div className="flex items-center gap-3 mb-10 border-b border-slate-800 pb-5">
            <Compass className="w-5 h-5 text-slate-400" />
            <h4 className="text-xl font-black">Territorios Satélite</h4>
          </div>

          <div className="space-y-8 flex-1">
            {locations.map((loc, index) => (
              <motion.div 
                key={loc.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="group flex flex-col"
              >
                <div className="flex justify-between items-end mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full border-2 ${loc.dot} bg-slate-900`} />
                    <span className="text-sm font-bold text-slate-200">{loc.name}</span>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{loc.sentiment}</span>
                </div>
                
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex items-center">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${loc.score}%` }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    className={`h-full ${loc.color} rounded-full`}
                  />
                  <span className="text-xs font-bold text-slate-400 ml-2 absolute right-8 opacity-0 group-hover:opacity-100 transition-opacity">{loc.score}%</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800">
             <button className="w-full py-3 bg-white/5 text-white/70 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-white/10 transition-colors border border-white/10 group flex items-center justify-center gap-2">
               Explorar Mapa Completo <Navigation className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}
