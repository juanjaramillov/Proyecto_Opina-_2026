import { motion, AnimatePresence } from "framer-motion";
import { Activity, Flame, ShieldAlert, Zap, Target } from "lucide-react";
import { ResultsModule, ResultsPeriod, ResultsView, ResultsGeneration } from "../../hooks/useResultsExperience";
import { MasterHubSnapshot } from "../../../../read-models/b2c/hub-types";

interface ResultsHeroDynamicProps {
  snapshot: MasterHubSnapshot;
  activeModule: ResultsModule;
  activePeriod: ResultsPeriod;
  activeView: ResultsView;
  activeGeneration: ResultsGeneration;
}

export function ResultsHeroDynamic({ snapshot, activeModule, activePeriod, activeView, activeGeneration }: ResultsHeroDynamicProps) {
  
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

  const baseInsight = getMainInsight();
  const insight = {
    ...baseInsight,
    description: activeGeneration !== "ALL" 
      ? `${baseInsight.description} (Este patrón es especialmente determinante entre los usuarios de la ${activeGeneration.replace('_', ' ').toLowerCase()}).`
      : baseInsight.description
  };

  // Diccionarios para etiquetas contextuales
  const moduleLabels: Record<string, string> = {
    "ALL": "Todas las métricas",
    "VERSUS": "Enfrentamientos",
    "TOURNAMENT": "Torneos",
    "PROFUNDIDAD": "Estudios",
    "ACTUALIDAD": "Agenda Cíclica",
    "LUGARES": "Mapeo Geo"
  };

  const periodLabels: Record<string, string> = {
    "7D": "Últimos 7 días",
    "30D": "Últimos 30 días",
    "90D": "Últimos 90 días"
  };

  const generationLabels: Record<string, string> = {
    "ALL": "Todas las gen.",
    "BOOMERS": "Boomers",
    "GEN_X": "Gen X",
    "MILLENNIALS": "Millennials",
    "GEN_Z": "Gen Z"
  };

  return (
    <section className="w-full pt-4 pb-8 md:pt-8 md:pb-12 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-50/50 mix-blend-multiply filter blur-[100px]" />
      </div>

      <div className="container-ws relative z-10 w-full">
        
        {/* Main Hero Container */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-5 md:p-10 lg:p-14 overflow-hidden relative">
          
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
            
            {/* Left: Dominant Insight */}
            <div className="flex-1 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeModule}-${activeView}-${activeGeneration}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 mb-6 shadow-sm ${insight.colorBox}`}>
                    {insight.icon}
                    <span className="text-xs md:text-sm font-bold uppercase tracking-widest">
                      {insight.kicker} {activeGeneration !== "ALL" && <span className="opacity-70 ml-1">({generationLabels[activeGeneration]})</span>}
                    </span>
                  </div>
                  
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[72px] font-black tracking-tighter text-ink leading-[1.05] mb-6">
                    {insight.title}
                  </h1>
                  
                  <p className="text-base sm:text-lg md:text-xl text-slate-500 font-medium max-w-2xl mb-10 leading-relaxed md:leading-relaxed">
                    {insight.description}
                  </p>

                  <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-8 border-t border-slate-100 pt-8 mt-4">
                    <div className="flex-shrink-0">
                      <div className={`text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-none ${insight.valueColor}`}>
                        {insight.value}
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">
                        {insight.valueLabel}
                      </div>
                    </div>
                    
                    {/* Explicit Context Block */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-slate-50 rounded-2xl p-3 border border-slate-200/60 w-full md:w-auto mt-4 sm:mt-0">
                       <span className="px-3 py-1.5 bg-white rounded-lg shadow-sm border border-slate-200 text-xs font-bold text-slate-600 block text-center min-w-[100px] flex-1 md:flex-none">
                         {moduleLabels[activeModule] || activeModule}
                       </span>
                       <span className="px-3 py-1.5 bg-white rounded-lg shadow-sm border border-slate-200 text-xs font-bold text-slate-600 block text-center min-w-[100px] flex-1 md:flex-none">
                         {periodLabels[activePeriod] || activePeriod}
                       </span>
                       <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg shadow-sm border border-indigo-100 text-xs font-bold block text-center min-w-[100px] flex-1 md:flex-none">
                         {(snapshot.cohortState.cohortSize || snapshot.overview.totalSignals).toLocaleString()} Señales
                       </span>
                    </div>

                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right: Secondary Signals */}
            <div className="hidden lg:flex w-[340px] xl:w-[380px] shrink-0 flex-col justify-end gap-3 relative z-10">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 pl-2 border-l-2 border-slate-300">
                Señales Derivadas ({generationLabels[activeGeneration] || activeGeneration})
              </h3>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={`sec-${activeModule}-${activeView}-${activeGeneration}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, staggerChildren: 0.1 }}
                  className="flex flex-col gap-3"
                >
                  {/* Secondary Signal Card 1 */}
                  <motion.div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-4 flex gap-4 items-start hover:bg-slate-50 hover:shadow-sm hover:border-indigo-100 transition-all group flex-1">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-slate-100 text-slate-400 group-hover:text-indigo-600 transition-colors">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 leading-tight mb-1.5">Rotación hacia cripto regional</h4>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">Una gran porción de la actividad reciente giró hacia adopción cripto sobre banca tradicional.</p>
                    </div>
                  </motion.div>

                  {/* Secondary Signal Card 2 */}
                  <motion.div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-4 flex gap-4 items-start hover:bg-slate-50 hover:shadow-sm hover:border-emerald-100 transition-all group flex-1">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-slate-100 text-slate-400 group-hover:text-emerald-600 transition-colors">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 leading-tight mb-1.5">Tracción en Diseño Urbano</h4>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">Crecimiento sostenido en el debate sobre peatonalización de centros urbanos.</p>
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
