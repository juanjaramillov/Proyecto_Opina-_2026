import { motion } from "framer-motion";
import { Activity, Zap, Compass, CheckCircle2, AlertTriangle, ArrowUpRight, ShieldAlert } from "lucide-react";
import { MasterHubSnapshot } from "../../../../read-models/b2c/hub-types";
import { ResultsPeriod, ResultsGeneration } from "../../hooks/useResultsExperience";

interface ResultsTransversalMetricsProps {
  snapshot: MasterHubSnapshot;
  activePeriod: ResultsPeriod;
  activeGeneration: ResultsGeneration;
}

// ----------------------------------------------------------------------------
// Micro-Wave Visualization for Consensus
// ----------------------------------------------------------------------------
function ConsensusMicroWave() {
  return (
    <div className="w-full h-12 mt-4 relative overflow-hidden flex items-end opacity-60">
      <svg viewBox="0 0 200 40" className="absolute bottom-0 w-full h-full preserve-3d">
        <motion.path
          d="M 0 40 C 30 20, 60 20, 100 40 C 140 60, 170 20, 200 40 L 200 50 L 0 50 Z"
          fill="rgba(16, 185, 129, 0.2)"
          animate={{ x: [-200, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        <motion.path
          d="M 0 40 C 40 10, 80 40, 120 20 C 160 0, 180 30, 200 20 L 200 50 L 0 50 Z"
          fill="rgba(16, 185, 129, 0.3)"
          animate={{ x: [0, -200] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <motion.line
          x1="0" y1="20" x2="200" y2="20"
          stroke="rgba(16, 185, 129, 0.8)" strokeWidth="1" strokeDasharray="4 4"
        />
      </svg>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Micro-Tension Visualization
// ----------------------------------------------------------------------------
function TensionMicroPulse({ tension }: { tension: number }) {
  const isHigh = tension > 50;
  return (
    <div className="w-full h-8 mt-2 flex gap-1 items-end">
      {[...Array(20)].map((_, i) => {
        const height = isHigh 
          ? Math.random() * 80 + 20 
          : Math.random() * 30 + 10;
        return (
          <motion.div
            key={i}
            className={`flex-1 rounded-t-sm ${isHigh ? 'bg-rose-500' : 'bg-blue-400'}`}
            animate={{ height: [`${height}%`, `${height * 0.5}%`, `${height}%`] }}
            transition={{ duration: 1 + Math.random(), repeat: Infinity }}
            style={{ opacity: 0.3 + (i / 40) }}
          />
        );
      })}
    </div>
  );
}

export function ResultsTransversalMetrics({ snapshot, activePeriod, activeGeneration: _activeGeneration }: ResultsTransversalMetricsProps) {
  const signalVolume = snapshot.overview.totalSignals;
  const tension = snapshot.editorial?.ecosystemTension || 50;
  
  return (
    <div className="w-full bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden flex flex-col pt-8">
      {/* Header unificado */}
      <div className="px-6 md:px-10 pb-6 border-b border-slate-100">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 text-slate-600 px-3 py-1.5 mb-3">
              <Compass className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Global Overview</span>
            </div>
            <h2 className="text-3xl font-black text-ink tracking-tight leading-none mb-2">Composición del Pulso</h2>
            <p className="text-sm text-slate-500 font-medium">
              {activePeriod === "7D" ? "Últimos 7 días" : activePeriod === "30D" ? "Últimos 30 días" : "Últimos 90 días"} • Basado en {signalVolume.toLocaleString()} señales
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex flex-col items-end">
               <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Crecimiento de Red</span>
               <div className="text-2xl font-black text-emerald-500 tracking-tighter flex items-center gap-1">+18% <Activity className="w-4 h-4" /></div>
             </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        
        {/* Consenso Global (Métrica Heroica con Intención Editorial) */}
        <div className="flex-1 p-6 md:p-10 border-b lg:border-b-0 lg:border-r border-slate-100 relative overflow-hidden bg-slate-50/30 group">
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-[0.03]">
            <motion.div 
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -right-20 -bottom-20 w-96 h-96 bg-emerald-500 rounded-full blur-3xl mix-blend-multiply"
            />
          </div>

          <div className="absolute right-0 top-0 opacity-[0.02] pointer-events-none z-0 transform group-hover:scale-110 transition-transform duration-1000">
             <CheckCircle2 className="w-64 h-64 -mt-16 -mr-16" />
          </div>
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-emerald-700 mb-4 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                <div className="relative flex h-2 w-2 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </div>
                <span className="text-xs uppercase tracking-widest">Estabilidad Mayoritaria</span>
              </div>
              <p className="text-sm text-slate-500 font-medium max-w-sm mb-6 leading-relaxed">
                El sistema muestra una fuerte tendencia al acuerdo en temáticas estructurales, mitigando la volatilidad general.
              </p>
              
              <div className="text-7xl lg:text-[88px] font-black text-ink tracking-tighter mb-2 flex items-baseline gap-1">
                64<span className="text-4xl lg:text-5xl text-slate-300 font-bold">%</span>
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Índice de Consenso Global</div>
            </div>

            <div>
              <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner relative">
                <motion.div 
                  initial={{ width: 0 }} animate={{ width: "64%" }} 
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }} 
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full relative"
                >
                  <motion.div 
                    initial={{ x: "-100%" }} animate={{ x: "200%" }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-1/2"
                  />
                </motion.div>
              </div>
              <ConsensusMicroWave />
            </div>
          </div>
        </div>

        {/* Column Right (Dos métricas apiladas editorialmente) */}
        <div className="w-full lg:w-[45%] flex flex-col">
           
           {/* Fricción Activa */}
           <div className="flex-1 p-6 md:p-10 border-b border-slate-100 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-[0.02] pointer-events-none z-0">
                 <ShieldAlert className="w-48 h-48 -mb-10 -mr-10 text-rose-500" />
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                  <div className="inline-flex items-center gap-2 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Foco de Tensión</span>
                  </div>
                  <div className="text-4xl font-black text-ink tracking-tighter leading-none">{tension}<span className="text-xl text-slate-400 font-bold">/100</span></div>
                </div>
                <h4 className="text-base font-bold text-slate-800 mb-1">Debate Tecnológico</h4>
                <p className="text-[13px] text-slate-500 font-medium mb-4 leading-relaxed max-w-xs">
                  La polarización se concentra agudamente en el cruce entre conveniencia y control de datos.
                </p>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${tension}%` }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-rose-500 rounded-l-full" />
                  <motion.div initial={{ width: 0 }} animate={{ width: `${100 - tension}%` }} transition={{ duration: 1, delay: 0.4 }} className="h-full bg-slate-300" />
                </div>
                <TensionMicroPulse tension={tension} />
              </div>
           </div>

           {/* Motor de Actividad (Antes Foco Principal) */}
           <div className="flex-1 p-6 md:p-10 flex flex-col justify-center relative overflow-hidden group hover:bg-indigo-50/80 transition-colors duration-500">
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -20, 0], x: [0, 10, 0], opacity: [0.1, 0.5, 0.1] }}
                    transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute w-1.5 h-1.5 bg-indigo-500 rounded-full"
                    style={{ left: `${20 + i * 15}%`, top: `${30 + i * 10}%`, boxShadow: "0 0 10px 2px rgba(99, 102, 241, 0.4)" }}
                  />
                ))}
              </div>

              <div className="absolute right-0 top-0 opacity-[0.03] pointer-events-none group-hover:opacity-10 transition-opacity duration-500 transform group-hover:scale-110">
                <Zap className="w-40 h-40 -mt-10 -mr-10 text-indigo-600" />
              </div>
              
              <div className="relative z-10 flex flex-col h-full justify-center">
                <div className="flex justify-between items-start mb-4">
                  <div className="inline-flex items-center gap-2 text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                    <Zap className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Motor de Actividad</span>
                  </div>
                </div>
                <h3 className="text-2xl font-black text-ink mb-2 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                  Módulo Versus <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-sm">
                  Absorbe <strong className="text-indigo-600">45%</strong> del tráfico total, impulsado por decisiones dicotómicas rápidas y recompensas inmediatas.
                </p>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}
