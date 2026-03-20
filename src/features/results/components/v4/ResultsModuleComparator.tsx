import { motion } from "framer-motion";
import { Zap, Swords, Trophy, Layers, MapPin } from "lucide-react";
import { ResultsModule } from "../../hooks/useResultsExperience";

interface ResultsModuleComparatorProps {
  activeModule: ResultsModule;
}

export function ResultsModuleComparator({ activeModule }: ResultsModuleComparatorProps) {
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
    <div className="container-ws py-12 md:py-20 border-t border-slate-100 mt-12 md:mt-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="max-w-xl">
          <h3 className="text-3xl font-black text-ink tracking-tight mb-2">Composición del Pulso</h3>
          <p className="text-slate-500 text-lg">
            Distribución de la energía participativa a través de los diferentes módulos del ecosistema.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {modulesData.map((mod, index) => (
          <motion.div
            key={mod.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`border rounded-2xl p-6 flex flex-col relative overflow-hidden group hover:border-transparent transition-all ${mod.bgColor} ${mod.borderColor}`}
          >
            {/* Visual Volume Bubble */}
            <div 
              className={`absolute -bottom-10 -right-10 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity ${mod.color}`} 
              style={{ width: `${mod.volume * 3}px`, height: `${mod.volume * 3}px` }} 
            />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-xl bg-white border shadow-sm ${mod.borderColor}`}>
                  {mod.icon}
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-black tracking-tight ${mod.textColor}`}>
                    {mod.volume}%
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Share
                  </div>
                </div>
              </div>
              
              <div className="mt-auto">
                <h4 className={`text-lg font-bold mb-1 ${mod.textColor}`}>{mod.label}</h4>
                <p className="text-xs text-slate-500/80 font-medium mb-3 leading-snug">
                  {mod.description}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                    Fricción:
                  </span>
                  <span className={`text-[10px] uppercase tracking-widest font-black ${mod.textColor}`}>
                    {mod.friction}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
