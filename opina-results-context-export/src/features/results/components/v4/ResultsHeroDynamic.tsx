import { motion, AnimatePresence } from "framer-motion";
import { Target, LayoutGrid, Zap, TrendingUp } from "lucide-react";
import { ResultsModule, ResultsPeriod, ResultsView, ResultsGeneration } from "../../hooks/useResultsExperience";
import { MasterHubSnapshot } from "../../../../read-models/b2c/hub-types";

interface ResultsHeroDynamicProps {
  snapshot: MasterHubSnapshot;
  activeModule: ResultsModule;
  activePeriod: ResultsPeriod;
  activeView: ResultsView;
  activeGeneration: ResultsGeneration;
}

// ----------------------------------------------------------------------------
// Visualización Dinámica Híbrida (Pulso + Tensión)
// ----------------------------------------------------------------------------
function HeroDynamicVisual({ tension, generation }: { tension: number; generation: string }) {
  // Ajustamos el color dominante y la agitación según la tensión y filtro
  const isHighTension = tension > 70;
  const isFiltered = generation !== "ALL";
  
  const dominantColor = isHighTension ? "#f43f5e" : (isFiltered ? "#10b981" : "#6366f1"); // rose, emerald, indigo
  const secondaryColor = isHighTension ? "#fda4af" : (isFiltered ? "#6ee7b7" : "#a5b4fc");

  return (
    <div className="relative w-full aspect-square max-w-[400px] mx-auto flex items-center justify-center">
      {/* Background Glows */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full blur-[60px]"
        style={{ backgroundColor: dominantColor, opacity: 0.15 }}
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute inset-10 rounded-full blur-[40px]"
        style={{ backgroundColor: secondaryColor, opacity: 0.2 }}
      />

      {/* SVG Container */}
      <svg viewBox="0 0 200 200" className="w-[80%] h-[80%] relative z-10 overflow-visible">
        {/* Anillo exterior - Radar/Pulso */}
        <motion.circle
          cx="100" cy="100" r="80"
          fill="none"
          stroke={secondaryColor}
          strokeWidth="1"
          strokeDasharray="4 4"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Nodos Orbitales (Tensión representa cuántos se desvían de la órbita) */}
        {[...Array(6)].map((_, i) => {
          const angle = (i * 60 * Math.PI) / 180;
          const baseRadius = 60;
          // Si hay alta tensión, los nodos oscilan más caóticamente
          const radiusVariability = isHighTension ? 25 : 5;
          return (
            <motion.circle
              key={i}
              cx="100"
              cy="100"
              r="4"
              fill={dominantColor}
              animate={{
                x: [
                  Math.cos(angle) * baseRadius,
                  Math.cos(angle) * (baseRadius + (i % 2 === 0 ? radiusVariability : -radiusVariability)),
                  Math.cos(angle) * baseRadius
                ],
                y: [
                  Math.sin(angle) * baseRadius,
                  Math.sin(angle) * (baseRadius + (i % 2 !== 0 ? radiusVariability : -radiusVariability)),
                  Math.sin(angle) * baseRadius
                ],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2
              }}
            />
          );
        })}

        {/* Core waveform (Centro) */}
        <motion.path
          d={isHighTension 
            ? "M 70 100 Q 85 60 100 100 T 130 100" // Ondas más pronunciadas (fractura)
            : "M 70 100 Q 85 85 100 100 T 130 100" // Ondas suaves (consenso)
          }
          fill="none"
          stroke={dominantColor}
          strokeWidth="3"
          strokeLinecap="round"
          animate={{
            d: isHighTension 
              ? ["M 70 100 Q 85 60 100 100 T 130 100", "M 70 100 Q 85 140 100 100 T 130 100", "M 70 100 Q 85 60 100 100 T 130 100"]
              : ["M 70 100 Q 85 85 100 100 T 130 100", "M 70 100 Q 85 115 100 100 T 130 100", "M 70 100 Q 85 85 100 100 T 130 100"]
          }}
          transition={{ duration: isHighTension ? 1.5 : 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle cx="100" cy="100" r="15" fill={dominantColor} opacity="0.1" 
          animate={{ scale: [1, 1.5, 1] }} 
          transition={{ duration: 2, repeat: Infinity }}
        />
        <circle cx="100" cy="100" r="8" fill={dominantColor} />
      </svg>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Componente Principal
// ----------------------------------------------------------------------------
export function ResultsHeroDynamic({ snapshot, activeModule, activePeriod, activeView, activeGeneration }: ResultsHeroDynamicProps) {
  
  // Extraemos la data editorial provista por el snapshot curado
  // Fallback explicativo mejorado según los requerimientos
  const editorial = snapshot.editorial || {
    mainInsight: {
      headline: `Tu posición actual te ubica en la vanguardia del ecosistema.`,
      subtitle: `Has procesado ${snapshot.overview.totalSignals.toLocaleString()} señales críticas. La tensión general es estable, pero se detectan fricciones emergentes que podrían alterar el consenso en el corto plazo.`
    },
    secondaryInsights: [
      { type: "consensus", title: "Estado Global", value: "Consenso Fuerte" },
      { type: "trend", title: "Velocidad", value: "Acelerada" }
    ],
    ecosystemTension: 65
  };

  const generationLabels: Record<string, string> = {
    "ALL": "Todas las gen.",
    "BOOMERS": "Boomers",
    "GEN_X": "Gen X",
    "MILLENNIALS": "Millennials",
    "GEN_Z": "Gen Z"
  };

  const moduleLabels: Record<string, string> = {
    "ALL": "Vista General",
    "VERSUS": "Enfrentamientos",
    "TOURNAMENT": "Torneos",
    "PROFUNDIDAD": "Estudios",
    "ACTUALIDAD": "Agenda",
    "LUGARES": "Mapeo Geo"
  };

  const periodLabels: Record<string, string> = {
    "7D": "Últimos 7 días",
    "30D": "Últimos 30 días",
    "90D": "Últimos 90 días"
  };

  // Íconos dinámicos para hallazgos secundarios
  const getSecondaryIcon = (type: string) => {
    switch (type) {
      case 'consensus': return <Target className="w-5 h-5 text-indigo-500" />;
      case 'trend': return <TrendingUp className="w-5 h-5 text-emerald-500" />;
      case 'module': return <LayoutGrid className="w-5 h-5 text-amber-500" />;
      default: return <Zap className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <section className="w-full pt-4 pb-8 md:pt-12 md:pb-16 relative overflow-visible bg-white">
      {/* Elemento decorativo de fondo para darle más fuerza visual y empaque premium */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-slate-50 to-transparent rounded-full blur-3xl opacity-50 pointer-events-none -translate-y-1/2 translate-x-1/3" />

      <div className="container-ws relative z-10 w-full">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Columna Izquierda: Gran Insight Editorial */}
          <div className="lg:col-span-7 flex flex-col justify-center order-2 lg:order-1 relative z-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeModule}-${activeView}-${activeGeneration}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {/* Context Labels */}
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <span className="px-2.5 py-1 bg-slate-100 rounded-md border border-slate-200 text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider">
                    {moduleLabels[activeModule] || activeModule}
                  </span>
                  <span className="px-2.5 py-1 bg-slate-100 rounded-md border border-slate-200 text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider">
                    {periodLabels[activePeriod] || activePeriod}
                  </span>
                  {activeGeneration !== "ALL" && (
                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                      Filtro: {generationLabels[activeGeneration]}
                    </span>
                  )}
                  <span className="px-2.5 py-1 bg-slate-800 text-white rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                    {snapshot.overview.totalSignals.toLocaleString()} Señales Analizadas
                  </span>
                </div>
                
                {/* Titular Editorial WOW */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-ink leading-[1.05] mb-6">
                  {editorial.mainInsight.headline}
                </h1>
                
                {/* Bajada Analítica */}
                <p className="text-base sm:text-lg md:text-xl text-slate-500 font-medium max-w-2xl mb-10 leading-relaxed">
                  {editorial.mainInsight.subtitle}
                </p>

                {/* 2 Hallazgos Secundarios */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {editorial.secondaryInsights.slice(0, 2).map((sec, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + (idx * 0.1) }}
                      className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex items-start gap-4 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.1)] hover:border-indigo-200 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:scale-110 transition-transform group-hover:bg-indigo-50">
                        {getSecondaryIcon(sec.type)}
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                          {sec.title}
                        </div>
                        <div className="text-sm font-black text-slate-800 leading-tight">
                          {sec.value}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Columna Derecha: Visualización Protagonista */}
          <div className="lg:col-span-5 order-1 lg:order-2 w-full max-w-[500px] mx-auto lg:max-w-none relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={`visual-${editorial.ecosystemTension}-${activeGeneration}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full flex justify-center"
              >
                <HeroDynamicVisual 
                  tension={editorial.ecosystemTension} 
                  generation={activeGeneration} 
                />
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}
