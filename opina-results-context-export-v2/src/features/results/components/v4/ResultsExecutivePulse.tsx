import { motion } from "framer-motion";
import { Activity, Zap, Compass, ShieldAlert, Crown, ArrowUpRight, TrendingUp } from "lucide-react";
import { MasterHubSnapshot } from "../../../../read-models/b2c/hub-types";
import { ResultsPeriod, ResultsGeneration } from "../../hooks/useResultsExperience";

interface ResultsExecutivePulseProps {
  snapshot: MasterHubSnapshot;
  activePeriod: ResultsPeriod;
  activeGeneration: ResultsGeneration;
}

// ----------------------------------------------------------------------------
// Micro-visuals components
// ----------------------------------------------------------------------------
function PulseWave() {
  return (
    <div className="w-full h-16 mt-2 relative overflow-hidden flex items-end opacity-70">
      <svg viewBox="0 0 200 40" className="absolute bottom-0 w-full h-full preserve-3d">
        <motion.path
          d="M 0 40 C 40 20, 80 10, 100 30 C 140 50, 160 20, 200 30 L 200 50 L 0 50 Z"
          fill="rgba(52, 211, 153, 0.2)"
          animate={{ x: [-200, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
        <motion.path
          d="M 0 40 C 30 15, 60 30, 120 15 C 150 5, 180 35, 200 20 L 200 50 L 0 50 Z"
          fill="rgba(52, 211, 153, 0.3)"
          animate={{ x: [0, -200] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />
        <motion.line
          x1="0" y1="20" x2="200" y2="20"
          stroke="rgba(52, 211, 153, 0.8)" strokeWidth="1" strokeDasharray="4 4"
        />
      </svg>
    </div>
  );
}

function VolumeDistributionBar() {
  return (
    <div className="w-full h-3 bg-slate-100 rounded-full flex overflow-hidden shadow-inner relative">
      <motion.div initial={{ width: 0 }} animate={{ width: "45%" }} transition={{ duration: 1.5 }} className="h-full bg-indigo-500 relative" title="Versus (45%)">
        <motion.div animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-1/2 skew-x-12" />
      </motion.div>
      <motion.div initial={{ width: 0 }} animate={{ width: "25%" }} transition={{ duration: 1.5, delay: 0.1 }} className="h-full bg-amber-500 border-l border-white" title="Torneo (25%)" />
      <motion.div initial={{ width: 0 }} animate={{ width: "15%" }} transition={{ duration: 1.5, delay: 0.2 }} className="h-full bg-emerald-500 border-l border-white" title="Profundidad (15%)" />
      <motion.div initial={{ width: 0 }} animate={{ width: "10%" }} transition={{ duration: 1.5, delay: 0.3 }} className="h-full bg-cyan-500 border-l border-white" title="Lugares (10%)" />
      <motion.div initial={{ width: 0 }} animate={{ width: "5%" }} transition={{ duration: 1.5, delay: 0.4 }} className="h-full bg-rose-500 border-l border-white" title="Actualidad (5%)" />
    </div>
  );
}

export function ResultsExecutivePulse({ snapshot, activePeriod }: ResultsExecutivePulseProps) {
  const signalVolume = snapshot.overview.totalSignals;
  const tension = snapshot.editorial?.ecosystemTension || 50;
  
  return (
    <div className="container-ws mt-8 md:mt-12 relative z-10">
      
      {/* Editorial Tag */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 shadow-sm">
          <Activity className="w-4 h-4 text-slate-500" />
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-600">
            Pulso Ejecutivo del Ecosistema
          </span>
        </div>
      </div>

      <div className="w-full bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col relative group">
        
        {/* Background glow base */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-white via-slate-50 to-indigo-50/30 opacity-60 pointer-events-none" />

        {/* Top Info Bar */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between px-8 pt-8 pb-4 border-b border-slate-100/50">
          <div className="text-center md:text-left mb-4 md:mb-0">
             <h2 className="text-2xl md:text-3xl font-black text-ink tracking-tight">Estado de la Red</h2>
             <p className="text-sm text-slate-500 font-medium">
               {activePeriod === "7D" ? "Últimos 7 días" : activePeriod === "30D" ? "Últimos 30 días" : "Últimos 90 días"} • {signalVolume.toLocaleString()} señales activas
             </p>
          </div>
          
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-2xl">
             <div className="flex flex-col items-end">
               <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-widest">Crecimiento (MoM)</span>
               <div className="text-xl font-black text-emerald-600 tracking-tighter flex items-center gap-1">+18.4% <TrendingUp className="w-4 h-4" /></div>
             </div>
          </div>
        </div>

        {/* 3 Main Data Pillars */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          
          {/* Pillar 1: Estabilidad / Consenso */}
          <div className="p-8 md:p-10 flex flex-col justify-between relative overflow-hidden bg-white/50">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 text-emerald-700 mb-3 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                <Compass className="w-4 h-4" />
                <span className="text-xs uppercase tracking-widest font-bold">Consenso Global</span>
              </div>
              <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs">
                Fuerte acuerdo mayoritario, reduciendo la volatilidad estructural.
              </p>
            </div>
            
            <div className="relative">
              <div className="text-6xl font-black text-ink tracking-tighter mb-1 flex items-baseline">
                64<span className="text-3xl text-slate-300 font-bold">%</span>
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Índice de Estabilidad</div>
              <PulseWave />
            </div>
          </div>

          {/* Pillar 2: Entidad / Módulo Dominante */}
          <div className="p-8 md:p-10 flex flex-col justify-between relative overflow-hidden bg-indigo-50/20 group/dom">
            {/* Visual background subtle */}
            <Crown className="absolute -right-10 -bottom-10 w-48 h-48 text-indigo-600 opacity-[0.03] group-hover/dom:rotate-12 group-hover/dom:scale-110 transition-transform duration-700" />
            
            <div className="mb-6 relative z-10">
              <div className="inline-flex items-center gap-2 text-indigo-700 mb-3 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                <Crown className="w-4 h-4" />
                <span className="text-xs uppercase tracking-widest font-bold">Dominancia</span>
              </div>
              <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs">
                La decisión rápida capitaliza la tracción. Versus absorbe casi la mitad de las señales.
              </p>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-indigo-950 leading-none mb-1">Versus</h4>
                  <div className="text-sm font-bold text-indigo-600">Líder Absoluto</div>
                </div>
              </div>
              
              {/* Visual de distribución transversal */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>Share del Ecosistema</span>
                  <span className="text-indigo-600">45%</span>
                </div>
                <VolumeDistributionBar />
              </div>
            </div>
          </div>

          {/* Pillar 3: Tensión / Alerta */}
          <div className="p-8 md:p-10 flex flex-col justify-between relative overflow-hidden bg-white/50">
            <div className="mb-6">
               <div className="inline-flex items-center gap-2 text-rose-700 mb-3 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                 <ShieldAlert className="w-4 h-4" />
                 <span className="text-xs uppercase tracking-widest font-bold">Foco de Tensión</span>
               </div>
               <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs">
                 Polarización aguda en Inteligencia Artificial y privacidad de datos.
               </p>
            </div>

            <div className="relative w-full">
              <div className="text-5xl font-black text-rose-500 tracking-tighter mb-1 mt-auto flex items-baseline">
                {tension}<span className="text-2xl text-slate-300 font-bold ml-1">/100</span>
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Índice de Fricción</div>
              
              {/* Micro visual de alerta */}
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                 <motion.div initial={{ width: 0 }} animate={{ width: `${tension}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className="bg-rose-500 h-full" />
              </div>
              <div className="flex justify-between mt-2 text-[10px] uppercase font-bold text-slate-400">
                 <span>Calma</span>
                 <span className="text-rose-500">Debate Crítico</span>
              </div>
            </div>
          </div>

        </div>

        {/* Micro-conclusión Editorial inferior */}
        <div className="bg-slate-50 border-t border-slate-100 p-4 px-8 flex items-center justify-between text-xs font-medium text-slate-500 relative z-10">
          <p>
            <strong className="text-slate-800">Conclusión Directiva:</strong> La plataforma muestra alta fidelidad en temas ligeros, pero los picos de interacción ocurren donde la polaridad temática es máxima.
          </p>
          <button className="hidden md:flex items-center gap-1 text-indigo-600 font-bold hover:text-indigo-700 hover:underline">
            Explorar Raw Data <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
