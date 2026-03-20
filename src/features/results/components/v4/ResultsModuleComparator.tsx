import { motion } from "framer-motion";
import { Swords, Trophy, Layers, MapPin, Zap } from "lucide-react";
import { ResultsModule, ResultsGeneration } from "../../hooks/useResultsExperience";

interface ResultsModuleComparatorProps {
  activeModule: ResultsModule;
  activeGeneration: ResultsGeneration;
}

export function ResultsModuleComparator({ activeModule, activeGeneration: _activeGeneration }: ResultsModuleComparatorProps) {
  // Solo se muestra en la vista "ALL" Transversal
  if (activeModule !== "ALL") return null;

  const modulesData = [
    {
      id: "VERSUS",
      label: "Versus",
      icon: <Swords className="w-5 h-5 text-rose-500" />,
      color: "bg-rose-500",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-100",
      textColor: "text-rose-700",
      volume: 45, // % de señales
      friction: "Alta",
      description: "Debates bicotómicos y polarizados."
    },
    {
      id: "TORNEO",
      label: "Torneo",
      icon: <Trophy className="w-5 h-5 text-amber-500" />,
      color: "bg-amber-500",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-100",
      textColor: "text-amber-700",
      volume: 25,
      friction: "Media",
      description: "Jerarquización prioritaria competitiva."
    },
    {
      id: "PROFUNDIDAD",
      label: "Profundidad",
      icon: <Layers className="w-5 h-5 text-emerald-500" />,
      color: "bg-emerald-500",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-100",
      textColor: "text-emerald-700",
      volume: 15,
      friction: "Baja",
      description: "Consenso sobre atributos detallados."
    },
    {
      id: "LUGARES",
      label: "Lugares",
      icon: <MapPin className="w-5 h-5 text-cyan-500" />,
      color: "bg-cyan-500",
      bgColor: "bg-cyan-50",
      borderColor: "border-cyan-100",
      textColor: "text-cyan-700",
      volume: 10,
      friction: "Media",
      description: "Análisis geolocalizado de la experiencia."
    },
    {
      id: "ACTUALIDAD",
      label: "Actualidad",
      icon: <Zap className="w-5 h-5 text-indigo-500" />,
      color: "bg-indigo-500",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-100",
      textColor: "text-indigo-700",
      volume: 5,
      friction: "Muy Alta",
      description: "Reacciones en tiempo real al entorno."
    }
  ];

  return (
    <div className="container-ws py-12 md:py-16 border-t border-slate-100 mt-10 md:mt-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="max-w-xl">
          <h3 className="text-2xl font-black text-ink tracking-tight mb-2">Composición del Tráfico</h3>
          <p className="text-slate-500 text-sm mb-3">
            Distribución de la atención y energía participativa actual.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-[10px] md:text-xs text-slate-400 font-medium bg-slate-50 py-1.5 px-3 rounded-full border border-slate-100 w-fit">
            <span className="flex items-center gap-1"><span className="w-3 h-1 bg-slate-300 rounded-full"></span> Largo = Share de tráfico</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-400"></span> Color = Módulo activo</span>
            <span className="flex items-center gap-1 uppercase tracking-wider font-bold text-slate-500">Fricción = Intensidad de debate</span>
          </div>
        </div>
      </div>

      <div className="w-full bg-slate-50/50 rounded-3xl border border-slate-100 p-6 md:p-8">
        {/* Progress Bar View */}
        <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden flex mb-8 border border-slate-200/50 shadow-inner group">
          {modulesData.map((mod, index) => (
            <motion.div 
              key={`bar-${mod.id}`}
              initial={{ width: 0 }}
              animate={{ width: `${mod.volume}%` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: index * 0.1 }}
              className={`h-full relative overflow-hidden border-r border-white/20 last:border-0 hover:brightness-110 transition-all ${mod.color}`}
              title={`${mod.label}: ${mod.volume}%`}
            >
              {/* Subtle animated shine traversing the bars */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "300%" }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "linear",
                  delay: index * 0.2
                }}
                className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
              />
            </motion.div>
          ))}
        </div>

        {/* Clean Editorial Columns */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
          {modulesData.map((mod, index) => (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col group"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${mod.color}`} />
                <span className={`text-xl font-black ${mod.textColor}`}>{mod.volume}%</span>
              </div>
              <h4 className="text-sm font-bold text-ink mb-1">{mod.label}</h4>
              <p className="text-xs text-slate-500 leading-snug mb-3 flex-1">{mod.description}</p>
              
              <div className="flex items-center gap-1.5 border-t border-slate-200/60 pt-2 mt-auto">
                <span className="text-[9px] uppercase tracking-widest font-bold text-slate-400">Fricción:</span>
                <span className={`text-[9px] uppercase tracking-widest font-black ${mod.textColor}`}>{mod.friction}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
