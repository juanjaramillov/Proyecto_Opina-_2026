import { motion } from "framer-motion";
import { Activity, Zap, Compass, CheckCircle2, AlertTriangle, ArrowUpRight } from "lucide-react";
import { MasterHubSnapshot } from "../../../../read-models/b2c/hub-types";
import { ResultsPeriod, ResultsGeneration } from "../../hooks/useResultsExperience";

interface ResultsTransversalMetricsProps {
  snapshot: MasterHubSnapshot;
  activePeriod: ResultsPeriod;
  activeGeneration: ResultsGeneration;
}

export function ResultsTransversalMetrics({ snapshot, activePeriod, activeGeneration: _activeGeneration }: ResultsTransversalMetricsProps) {
  const signalVolume = snapshot.overview.totalSignals;
  
  return (
    <div className="w-full bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden flex flex-col pt-8">
      {/* Header unificado */}
      <div className="px-6 md:px-10 pb-6 border-b border-slate-100">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 text-slate-600 px-3 py-1.5 mb-4">
              <Compass className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Global Overview</span>
            </div>
            <h2 className="text-3xl font-black text-ink tracking-tight leading-none mb-2">Composición del Pulso</h2>
            <p className="text-sm text-slate-500 font-medium">
              {activePeriod === "7D" ? "Últimos 7 días" : activePeriod === "30D" ? "Últimos 30 días" : "Últimos 90 días"} • Basado en {signalVolume.toLocaleString()} señales activas
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
        
        {/* Consenso Global (Métrica Heroica) */}
        <div className="flex-1 p-6 md:p-10 border-b lg:border-b-0 lg:border-r border-slate-100 relative overflow-hidden bg-slate-50/30">
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
             <CheckCircle2 className="w-64 h-64 -mb-16 -mr-16" />
          </div>
          <div className="inline-flex items-center gap-2 text-emerald-700 mb-6">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Consenso Global</span>
          </div>
          <p className="text-sm text-slate-500 font-medium max-w-xs mb-8">El nivel de acuerdo promedio cruza una tendencia mayoritaria hacia la estabilidad de sistemas.</p>
          
          <div className="text-7xl font-black text-ink tracking-tighter mb-4">64<span className="text-4xl text-slate-400">%</span></div>
          <div className="h-2 w-full max-w-xs bg-slate-200 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: "64%" }} transition={{ duration: 1, ease: "easeOut" }} className="h-full bg-emerald-500 rounded-full" />
          </div>
        </div>

        {/* Column Right (Dos métricas apiladas editorialmente) */}
        <div className="w-full lg:w-[40%] flex flex-col">
           
           {/* Fricción Activa */}
           <div className="flex-1 p-6 md:p-10 border-b border-slate-100 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-4">
                <div className="inline-flex items-center gap-2 text-rose-700">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Fricción Activa</span>
                </div>
                <div className="text-3xl font-black text-ink tracking-tighter leading-none">12<span className="text-xl text-slate-400">%</span></div>
              </div>
              <p className="text-[13px] text-slate-500 font-medium mb-3">Polarización concentrada en debates de tecnología vs privacidad.</p>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                <motion.div initial={{ width: 0 }} animate={{ width: "12%" }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-rose-500 rounded-l-full" />
                <motion.div initial={{ width: 0 }} animate={{ width: "12%" }} transition={{ duration: 1, delay: 0.4 }} className="h-full bg-blue-500" />
              </div>
           </div>

           {/* Foco Principal */}
           <div className="flex-1 p-6 md:p-10 flex flex-col justify-center relative overflow-hidden group hover:bg-indigo-50/50 transition-colors">
              <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                <Zap className="w-32 h-32 -mb-8 -mr-8 text-indigo-600" />
              </div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="inline-flex items-center gap-2 text-indigo-700">
                  <Zap className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Módulo Foco</span>
                </div>
                <div className="text-xl font-black text-ink flex items-center gap-1 group-hover:text-indigo-600 transition-colors">
                  Versus <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[13px] text-slate-500 font-medium relative z-10">
                Absorbe la mayor concentración de tráfico en tiempo real ({Math.floor(signalVolume * 0.45).toLocaleString()} señales detectadas).
              </p>
           </div>

        </div>
      </div>
    </div>
  );
}
