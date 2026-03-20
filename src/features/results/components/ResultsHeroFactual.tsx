import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Activity,
  ArrowRight
} from "lucide-react";
import { ResultsModule, ResultsPeriod } from "./hub/FilterBar";

interface ResultsHeroFactualProps {
  activeModule: ResultsModule;
  activePeriod: ResultsPeriod;
}

export function ResultsHeroFactual({ activeModule }: ResultsHeroFactualProps) {
  const getModuleLabel = (m: ResultsModule) => {
    switch(m) {
      case "ALL": return "El Pulso Global";
      case "VERSUS": return "Señales Versus";
      case "TOURNAMENT": return "Señales Torneo";
      case "PROFUNDIDAD": return "Foco Profundidad";
      case "ACTUALIDAD": return "Pulso Actualidad";
      case "LUGARES": return "Mapa de Lugares";
    }
  };

  return (
    <section className="w-full pt-12 pb-16 relative">
      <div className="container-ws relative z-10">
        
        {/* Editorial Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
          <div className="max-w-4xl relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute -top-12 -left-12 w-32 h-32 bg-[#10B981]/20 rounded-full blur-2xl pointer-events-none"
            />
            <div className="inline-flex items-center gap-2 rounded-full bg-ink text-white px-4 py-1.5 mb-8">
              <Activity className="w-4 h-4 text-[#10B981]" />
              <span className="text-xs font-bold uppercase tracking-widest">
                {getModuleLabel(activeModule)}
              </span>
            </div>
            
            <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-black tracking-tighter text-ink leading-[0.85] uppercase mix-blend-multiply">
              División <br />
              <span className="text-outline-ink text-transparent">Frente a</span> <br />
              <span className="font-serif italic font-medium text-[#2563EB] tracking-normal capitalize">la Inteligencia</span> <br />
              Artificial
            </h1>
          </div>
          
          <div className="max-w-sm md:text-right">
            <p className="text-xl md:text-3xl text-slate-800 font-medium leading-tight mb-6">
              Empate técnico en un debate donde la tecnología choca con el control.
            </p>
            <button className="flex items-center gap-2 group md:ml-auto">
              <span className="text-sm font-bold uppercase tracking-widest text-ink group-hover:text-[#2563EB] transition-colors">Explorar el Origen</span>
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-[#2563EB] group-hover:text-white transition-all">
                <ArrowRight className="w-5 h-5" />
              </div>
            </button>
          </div>
        </div>

        {/* Dynamic Data Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
          
          {/* Consensus Block - Bold Green */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="group relative overflow-hidden bg-white rounded-3xl p-8 lg:p-12 border border-slate-200 hover:border-[#10B981]/50 shadow-sm hover:shadow-xl transition-all duration-500"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#10B981]/5 rounded-bl-[100px] transition-transform duration-700 group-hover:scale-150" />
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-1.5 mb-6">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">
                    Punto de Acuerdos
                  </span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-ink leading-none">
                  78% apoya<br />regulación
                </h2>
                <p className="mt-4 text-slate-500 text-lg max-w-sm">
                  Acuerdo transversal frente a la necesidad de reglas claras para IA y uso de datos masivos.
                </p>
              </div>

              <div className="mt-12 flex items-end gap-6">
                <div className="text-[6rem] leading-none font-black text-[#10B981] tracking-tighter">78<span className="text-5xl">%</span></div>
                <div className="pb-4 flex-1">
                  <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "78%" }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-[#10B981]" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tension Block - Bold Red/Blue Gradient */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="group relative overflow-hidden bg-ink rounded-3xl p-8 lg:p-12  shadow-lg hover:shadow-2xl transition-all duration-500 text-white"
          >
            <div className="absolute -top-32 -right-32 w-[150%] h-[150%] bg-[#2563EB]/20 mix-blend-overlay rotate-12 group-hover:rotate-45 transition-transform duration-1000 origin-center" />
            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-ink via-transparent to-transparent z-0" />

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400 px-3 py-1.5 mb-6">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">
                    Máxima Tensión
                  </span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-none">
                  Privacidad vs<br />
                  <span className="text-[#3B82F6]">Personalización</span>
                </h2>
                <p className="mt-4 text-slate-400 text-lg max-w-sm">
                  La agenda más dividida del mes: conveniencia digital versus control total de datos.
                </p>
              </div>

              <div className="mt-12 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">Privacidad</div>
                  <div className="text-5xl font-black text-rose-500 tracking-tighter">49%</div>
                  <div className="h-2 w-full mt-3 bg-white/10 rounded-full overflow-hidden">
                    <motion.div initial={{width:0}} animate={{width:"49%"}} transition={{duration:1, delay:0.5}} className="h-full bg-rose-500" />
                  </div>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">Conveniencia</div>
                  <div className="text-5xl font-black text-[#3B82F6] tracking-tighter">51%</div>
                  <div className="h-2 w-full mt-3 bg-white/10 rounded-full overflow-hidden">
                    <motion.div initial={{width:0}} animate={{width:"51%"}} transition={{duration:1, delay:0.6}} className="h-full bg-[#3B82F6]" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

