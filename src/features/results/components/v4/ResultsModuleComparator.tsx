import { motion, AnimatePresence } from "framer-motion";
import { Swords, Trophy, Layers, MapPin, Zap, Crown } from "lucide-react";
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
      icon: <Swords className="w-5 h-5 text-white" />,
      color: "bg-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      textColor: "text-indigo-700",
      volume: 45, // % de señales
      friction: "Alta",
      description: "Dominante: El formato de decisión rápida capitaliza la mayor retención de usuarios.",
      isWinner: true
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
      description: "Competencia jerárquica con participación constante.",
      isWinner: false
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
      description: "Lectura pausada y análisis detallado de atributos.",
      isWinner: false
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
      description: "Fuerte interés local pero de nicho específico.",
      isWinner: false
    },
    {
      id: "ACTUALIDAD",
      label: "Actualidad",
      icon: <Zap className="w-5 h-5 text-rose-500" />,
      color: "bg-rose-500",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-100",
      textColor: "text-rose-700",
      volume: 5,
      friction: "Muy Alta",
      description: "Reacciones instintivas a coyuntura reciente.",
      isWinner: false
    }
  ];

  return (
    <div className="container-ws py-12 md:py-16 border-t border-slate-100 mt-10 md:mt-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="max-w-xl">
           <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 mb-4 shadow-sm">
             <Layers className="w-4 h-4 text-slate-500" />
             <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-600">
               Distribución del Ecosistema
             </span>
           </div>
          <h3 className="text-3xl md:text-4xl font-black text-ink tracking-tight mb-3">
            El reinado de la decisión rápida
          </h3>
          <p className="text-slate-500 text-base md:text-lg mb-4 leading-relaxed">
            El ecosistema muestra una clara preferencia por formatos bicotómicos frente a análisis profundos, concentrando la mayor tensión y volumen.
          </p>
        </div>
      </div>

      <div className="w-full bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-10 relative overflow-hidden">
        
        {/* Leyenda Visual Integrada */}
        <div className="flex flex-wrap items-center gap-5 text-xs text-slate-500 font-bold uppercase tracking-wider mb-8 pb-6 border-b border-slate-100">
          <span className="flex items-center gap-2"><span className="w-4 h-1.5 bg-slate-300 rounded-full"></span> Volumen (Share)</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-indigo-500"></span> Módulo Dominante</span>
          <span className="flex items-center gap-1 text-rose-500"><Zap className="w-3 h-3" /> Fricción / Debate</span>
        </div>

        {/* Progress Bar View Dinámica */}
        <div className="h-8 md:h-10 w-full bg-slate-50 rounded-full overflow-hidden flex mb-12 border border-slate-200 shadow-inner group">
          {modulesData.map((mod, index) => (
            <motion.div 
              key={`bar-${mod.id}`}
              initial={{ width: 0 }}
              animate={{ width: `${mod.volume}%` }}
              transition={{ duration: 1.5, ease: "easeOut", delay: index * 0.15 }}
              className={`h-full relative overflow-hidden border-r-2 border-white last:border-0 hover:brightness-110 transition-all cursor-crosshair
                ${mod.isWinner ? mod.color : 'bg-slate-300 hover:bg-slate-400'}
              `}
              title={`${mod.label}: ${mod.volume}%`}
            >
              {mod.isWinner && (
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "300%" }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Tarjetas Editoriales - Destacando al Ganador */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          <AnimatePresence>
            {modulesData.map((mod, index) => (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className={`
                  flex flex-col relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 hover:shadow-md
                  ${mod.isWinner ? 'bg-indigo-50/50 border-indigo-200 shadow-sm ring-1 ring-indigo-100 scale-[1.02]' : 'bg-white border-slate-100 hover:border-slate-300'}
                `}
              >
                {/* Winner Badge */}
                {mod.isWinner && (
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest py-1 px-3 rounded-bl-lg flex items-center gap-1">
                    <Crown className="w-3 h-3" /> Dominante
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0 ${mod.isWinner ? mod.color : 'bg-slate-50 border border-slate-200'}`}>
                    {mod.isWinner ? mod.icon : <div className="text-slate-400">{mod.icon}</div>}
                  </div>
                  <div>
                    <h4 className={`text-base font-black leading-none mb-1 ${mod.isWinner ? 'text-indigo-950' : 'text-slate-700'}`}>
                      {mod.label}
                    </h4>
                    <div className={`text-2xl font-black tracking-tighter leading-none ${mod.isWinner ? 'text-indigo-600' : 'text-slate-400'}`}>
                      {mod.volume}%
                    </div>
                  </div>
                </div>
                
                <p className={`text-sm leading-relaxed mb-5 flex-1 ${mod.isWinner ? 'text-indigo-800/80 font-medium' : 'text-slate-500'}`}>
                  {mod.description}
                </p>
                
                <div className={`flex items-center justify-between border-t pt-3 mt-auto ${mod.isWinner ? 'border-indigo-100' : 'border-slate-100'}`}>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Fricción Activa</span>
                  <span className={`text-[10px] uppercase tracking-widest font-black ${mod.friction === 'Media' ? 'text-amber-500' : mod.friction === 'Alta' || mod.friction === 'Muy Alta' ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {mod.friction}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
