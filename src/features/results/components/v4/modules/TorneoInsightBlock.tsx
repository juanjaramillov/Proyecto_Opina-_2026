import { motion } from "framer-motion";
import { Trophy, ShieldAlert, Crown, ArrowUp, ArrowDown, Crosshair } from "lucide-react";
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

  const winner = { rank: 1, name: "Inteligencia Artificial Integrada", score: 98, trend: "up", color: "bg-amber-500", text: "text-amber-700", desc: "La IA deja de ser una novedad y se corona como el requerimiento base de cualquier producto digital." };
  
  const runnersUp = [
    { rank: 2, name: "Ciberseguridad Proactiva", score: 75, trend: "up", color: "bg-indigo-500" },
    { rank: 3, name: "Desarrollo Sostenible", score: 62, trend: "down", color: "bg-emerald-500" },
    { rank: 4, name: "Interfaces Espaciales", score: 45, trend: "up", color: "bg-purple-500" },
  ];

  return (
    <div className="w-full">
      <div className="mb-10 md:mb-14">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-100 text-amber-700 px-3 py-1.5 mb-4">
          <Trophy className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Análisis Torneo</span>
        </div>
        <h3 className="text-3xl md:text-5xl font-black text-ink tracking-tight mb-4">
          La Hegemonía de Prioridades
        </h3>
        <p className="text-slate-500 text-base md:text-lg max-w-2xl leading-relaxed">
          En un escenario de eliminación directa, el ecosistema define claramente cuál es la necesidad suprema y quiénes pelean por el segundo lugar.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* WINNER (El Rey Indiscutido) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-8 md:p-12 relative overflow-hidden text-white shadow-lg shadow-amber-500/20"
        >
          <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl" />
          <Trophy className="absolute -right-10 -bottom-10 w-64 h-64 text-white opacity-[0.05] -rotate-12 pointer-events-none" />

          <div className="relative z-10 flex flex-col h-full">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-full border border-white/30 self-start mb-8">
              <Crown className="w-4 h-4 text-amber-100" />
              <span className="text-[10px] font-black uppercase tracking-widest">El Campeón Absoluto</span>
            </div>

            <h4 className="text-4xl md:text-5xl font-black leading-tight mb-4">
              {winner.name}
            </h4>
            
            <p className="text-amber-50 text-base md:text-lg font-medium mb-10 leading-relaxed max-w-sm">
              {winner.desc}
            </p>

            <div className="mt-auto pt-6 border-t border-white/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-widest font-bold text-amber-100">Puntaje de Supervivencia</span>
                <span className="text-5xl font-black leading-none">{winner.score}<span className="text-2xl text-amber-200">/100</span></span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* El Pelotón (Runners Up) */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
           <div className="flex items-center gap-2 mb-8 pb-4 border-b border-slate-100">
             <Crosshair className="w-5 h-5 text-indigo-500" />
             <h4 className="text-xl font-black text-ink">El Pelotón Perseguidor</h4>
           </div>

           <div className="space-y-6">
             {runnersUp.map((item, index) => (
               <motion.div 
                 key={item.rank}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.3 + index * 0.1 }}
                 className="flex flex-col group"
               >
                 <div className="flex items-end justify-between mb-2">
                   <div className="flex items-center gap-3">
                     <span className="text-xl font-black text-slate-300">#{item.rank}</span>
                     <h5 className="text-lg font-bold text-ink">{item.name}</h5>
                   </div>
                   <div className="flex items-center gap-2">
                     <span className="text-lg font-black text-slate-800">{item.score}</span>
                     {item.trend === "up" ? <ArrowUp className="w-4 h-4 text-emerald-500" /> : <ArrowDown className="w-4 h-4 text-rose-500" />}
                   </div>
                 </div>
                 
                 <div className="h-2.5 w-full bg-slate-100 rounded-full flex overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }} 
                     animate={{ width: `${item.score}%` }} 
                     transition={{ duration: 1, delay: 0.5 }}
                     className={`h-full ${item.color}`} 
                   />
                 </div>
               </motion.div>
             ))}
           </div>

           <div className="mt-10 p-5 bg-slate-50 rounded-2xl border border-slate-100">
             <p className="text-xs text-slate-500 font-medium leading-relaxed">
               <strong className="text-slate-800">Nota:</strong> Existe una brecha de <span className="text-amber-600 font-bold">{winner.score - runnersUp[0].score} puntos</span> entre el primer y segundo lugar, indicando un monopolio de interés en esta categoría.
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}
