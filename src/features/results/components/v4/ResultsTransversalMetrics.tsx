import { motion } from "framer-motion";
import { Activity, Users, Zap, Compass, CheckCircle2, AlertTriangle, ArrowUpRight } from "lucide-react";
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
    <div className="w-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
          <Compass className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-ink tracking-tight">Pulso del Ecosistema</h2>
          <p className="text-sm text-slate-500 font-medium">{activePeriod === "7D" ? "Últimos 7 días" : activePeriod === "30D" ? "Últimos 30 días" : "Últimos 90 días"} • {signalVolume.toLocaleString()} señales analizadas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Consenso Global */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white rounded-[2rem] p-6 lg:p-8 border border-slate-100 shadow-sm flex flex-col justify-between group"
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-1 mb-6">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Consenso Global</span>
            </div>
            <p className="text-sm text-slate-500 font-medium mb-4">El nivel de acuerdo promedio entre todas las señales activas.</p>
          </div>
          <div>
            <div className="text-5xl font-black text-ink tracking-tighter mb-2">64<span className="text-2xl text-slate-400">%</span></div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[64%] rounded-full" />
            </div>
          </div>
        </motion.div>

        {/* Polarización Máxima */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white rounded-[2rem] p-6 lg:p-8 border border-slate-100 shadow-sm flex flex-col justify-between group"
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 text-rose-700 px-3 py-1 mb-6">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Fricción Activa</span>
            </div>
            <p className="text-sm text-slate-500 font-medium mb-4">La porción de debates que se encuentran en empate técnico hoy.</p>
          </div>
          <div>
            <div className="text-5xl font-black text-ink tracking-tighter mb-2">12<span className="text-2xl text-slate-400">%</span></div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div className="h-full bg-rose-500 w-[12%] rounded-l-full" />
              <div className="h-full bg-blue-500 w-[12%]" />
            </div>
          </div>
        </motion.div>

        {/* Módulo más activo */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-ink text-white rounded-[2rem] p-6 lg:p-8 shadow-md flex flex-col justify-between relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-bl-full blur-2xl group-hover:bg-indigo-500/40 transition-colors" />
          <div className="relative z-10 w-full">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-400/10 text-indigo-300 px-3 py-1 mb-6">
              <Zap className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Foco Principal</span>
            </div>
            <p className="text-sm text-slate-300 font-medium mb-4">El módulo con mayor volumen y aceleración de señales.</p>
          </div>
          <div className="relative z-10">
            <div className="text-3xl font-black tracking-tight mb-2 flex items-center gap-2">
              Versus <ArrowUpRight className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="text-sm font-bold text-indigo-300 uppercase tracking-widest">85 señales/hora</div>
          </div>
        </motion.div>

        {/* Participación */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white rounded-[2rem] p-6 lg:p-8 border border-slate-100 shadow-sm flex flex-col justify-between group"
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 text-slate-600 px-3 py-1 mb-6">
              <Activity className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Aceleración</span>
            </div>
            <p className="text-sm text-slate-500 font-medium mb-4">Crecimiento en la emisión de señales frente al periodo anterior.</p>
          </div>
          <div>
            <div className="text-5xl font-black text-emerald-500 tracking-tighter mb-1 flex items-start">
              +18<span className="text-2xl mt-1">%</span>
            </div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Users className="w-4 h-4" /> {snapshot.cohortState.cohortSize.toLocaleString()} Activos
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
