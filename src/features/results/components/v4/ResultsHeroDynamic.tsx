import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Flame, ShieldAlert, Zap, ArrowRight, Target } from "lucide-react";
import { ResultsModule, ResultsPeriod, ResultsView } from "../../hooks/useResultsExperience";
import { MasterHubSnapshot } from "../../../../read-models/b2c/hub-types";

interface ResultsHeroDynamicProps {
  snapshot: MasterHubSnapshot;
  activeModule: ResultsModule;
  activePeriod: ResultsPeriod;
  activeView: ResultsView;
}

export function ResultsHeroDynamic({ snapshot, activeModule, activePeriod, activeView }: ResultsHeroDynamicProps) {
  
  // Lógica para determinar el insight principal (mock contextualizado por las reglas)
  const getMainInsight = () => {
    if (activeView === "CONSENSO") {
      return {
        kicker: "Punto de Acuerdos",
        title: "El 78% apoya la regulación preventiva",
        description: "Acuerdo transversal frente a la necesidad de reglas claras para el uso de datos masivos en IA.",
        icon: <Target className="w-5 h-5 text-emerald-500" />,
        colorBox: "bg-emerald-50 border-emerald-200 text-emerald-700",
        value: "78%",
        valueLabel: "Consenso Fuerte",
        valueColor: "text-emerald-500"
      };
    }
    if (activeView === "POLARIZACION") {
      return {
        kicker: "Máxima Tensión",
        title: "Privacidad vs Personalización Extrema",
        description: "La agenda más dividida: el debate entre conveniencia inmediata y control total de los datos personales.",
        icon: <ShieldAlert className="w-5 h-5 text-rose-500" />,
        colorBox: "bg-rose-50 border-rose-200 text-rose-700",
        value: "49/51",
        valueLabel: "Fractura Técnica",
        valueColor: "text-rose-500"
      };
    }
    if (activeView === "TENDENCIA") {
      return {
        kicker: "Momentum",
        title: "El modelo híbrido desplaza al remoto",
        description: "En los últimos días, la preferencia por oficinas de tres días creció abruptamente.",
        icon: <Activity className="w-5 h-5 text-indigo-500" />,
        colorBox: "bg-indigo-50 border-indigo-200 text-indigo-700",
        value: "+34%",
        valueLabel: "Cambio Acelerado",
        valueColor: "text-indigo-500"
      };
    }
    
    // Default (General)
    return {
      kicker: "El Pulso Global",
      title: "Desestabilización en el ecosistema laboral",
      description: "Las reformas económicas y la irrupción de IA marcan la agenda más activa de las señales actuales.",
      icon: <Zap className="w-5 h-5 text-amber-500" />,
      colorBox: "bg-amber-50 border-amber-200 text-amber-700",
      value: "15k+",
      valueLabel: "Señales Detectadas",
      valueColor: "text-amber-500"
    };
  };

  const insight = getMainInsight();

  return (
    <section className="w-full pt-8 pb-12 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-50/50 mix-blend-multiply filter blur-[100px]" />
      </div>

      <div className="container-ws relative z-10">
        
        {/* Main Hero Container */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-6 md:p-12 overflow-hidden relative">
          
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 pb-4">
            
            {/* Left: Dominant Insight */}
            <div className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeModule}-${activeView}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 mb-6 ${insight.colorBox}`}>
                    {insight.icon}
                    <span className="text-[11px] font-bold uppercase tracking-widest">
                      {insight.kicker}
                    </span>
                  </div>
                  
                  <h1 className="text-4xl md:text-6xl font-black tracking-tight text-ink leading-[1.05] mb-6">
                    {insight.title}
                  </h1>
                  
                  <p className="text-lg md:text-xl text-slate-500 font-medium max-w-xl mb-12">
                    {insight.description}
                  </p>

                  <div className="flex items-end gap-6">
                    <div>
                      <div className={`text-5xl md:text-7xl font-black tracking-tighter leading-none ${insight.valueColor}`}>
                        {insight.value}
                      </div>
                      <div className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">
                        {insight.valueLabel}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right: Secondary Signals */}
            <div className="w-full lg:w-[400px] shrink-0 flex flex-col justify-end gap-4 relative z-10">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 pl-2 border-l-2 border-slate-200">
                Señales Secundarias Activadas
              </h3>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={`sec-${activeModule}-${activeView}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, staggerChildren: 0.1 }}
                  className="space-y-3"
                >
                  {/* Secondary Signal Card 1 */}
                  <motion.div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-4 items-start hover:bg-slate-100 transition-colors group cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-slate-400 group-hover:text-indigo-600 transition-colors">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 leading-tight mb-1">Crecimiento en Cripto local</h4>
                      <p className="text-xs text-slate-500">Un 12% de las señales de Mercado rotaron hacia adopción cripto.</p>
                    </div>
                  </motion.div>

                  {/* Secondary Signal Card 2 */}
                  <motion.div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-4 items-start hover:bg-slate-100 transition-colors group cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-slate-400 group-hover:emerald-600 transition-colors">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 leading-tight mb-1">Estabilidad Urbana</h4>
                      <p className="text-xs text-slate-500">Consenso robusto en "Lugares" sobre regeneración de parques.</p>
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
