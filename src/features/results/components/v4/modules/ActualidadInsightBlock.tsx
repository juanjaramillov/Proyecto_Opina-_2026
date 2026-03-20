import { motion } from "framer-motion";
import { Zap, Activity, ShieldAlert, ArrowUpRight, Radio } from "lucide-react";
import { MasterHubSnapshot } from "../../../../../read-models/b2c/hub-types";
import { ResultsGeneration } from "../../../hooks/useResultsExperience";

interface ActualidadInsightBlockProps {
  generation: ResultsGeneration;
  snapshot: MasterHubSnapshot;
}

export function ActualidadInsightBlock({ generation, snapshot }: ActualidadInsightBlockProps) {
  if (snapshot.cohortState.privacyState === 'insufficient_cohort') {
    return (
      <div className="w-full flex flex-col items-center justify-center p-8 md:p-12 bg-slate-50 border border-slate-100 rounded-[2rem] text-center my-8">
        <ShieldAlert className="w-12 h-12 text-slate-300 mb-4" />
        <h4 className="text-xl font-bold text-slate-700 mb-2">Muestra Insuficiente</h4>
        <p className="text-slate-500 mb-6 max-w-md mx-auto text-sm">
          No hay suficientes señales ({snapshot.cohortState.cohortSize} activas) en la generación seleccionada ({generation}) para garantizar estadísticamente la privacidad en este nivel de granularidad.
        </p>
        <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-colors">
          Explorar otras variables
        </button>
      </div>
    );
  }

  const events = [
    { time: "Apertura de Nodo", title: "Regulación IA Europea", type: "new", minutes: "Hace 12m", metrics: "+420 señales" },
    { time: "Aceleración", title: "Consenso sobre trabajo remoto", type: "trend", minutes: "Hace 45m", metrics: "+28% velocidad" },
    { time: "Pico de Tensión", title: "Impacto ambiental de LLMs", type: "spike", minutes: "Hace 2h", metrics: "Máxima polarización" },
  ];

  return (
    <div className="w-full">
      <div className="mb-10 md:mb-14">
        <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 border border-rose-100 text-rose-700 px-3 py-1.5 mb-4">
          <Radio className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Señal en Vivo</span>
        </div>
        <h3 className="text-3xl md:text-5xl font-black text-ink tracking-tight mb-4">
          Pulso Inmediato
        </h3>
        <p className="text-slate-500 text-base md:text-lg max-w-2xl leading-relaxed">
          Monitor de actividad sísmica del ecosistema. Detecta desplazamientos rápidos en la opinión antes de que se conviertan en tendencias históricas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* Live Status Card - THE BREAKING NEWS */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-8 bg-ink text-white rounded-[2rem] p-8 md:p-12 relative overflow-hidden flex flex-col justify-between shadow-2xl shadow-ink/20"
        >
          {/* Animated Background Pulse */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px]" />
          
          <div className="relative z-10 flex items-center justify-between mb-16">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
              <span className="text-xs font-black uppercase tracking-widest text-white">Transmisión Directa</span>
            </div>
            
            <div className="text-right">
              <div className="text-4xl font-black tracking-tight text-white mb-1">1,245</div>
              <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-1 justify-end">
                 Señales <Activity className="w-3 h-3" /> Hora
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-sm font-bold text-rose-400 uppercase tracking-widest mb-4">Lo más urgente</p>
            <h4 className="text-3xl md:text-5xl font-black leading-tight mb-6">
              Vuelco masivo hacia políticas de subsidio eléctrico
            </h4>
            <div className="flex items-center gap-2 text-indigo-200 text-sm font-medium bg-white/5 border border-white/10 px-4 py-3 rounded-xl inline-flex">
              <ArrowUpRight className="w-5 h-5 text-emerald-400" />
              <span>La postura a favor cruzó el umbral del 70% hace apenas minutos.</span>
            </div>
          </div>
        </motion.div>

        {/* Timeline / Recent Activity */}
        <div className="lg:col-span-4 bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-8 pb-4 border-b border-slate-100">
             <Zap className="w-5 h-5 text-amber-500" />
             <h4 className="text-xl font-black text-ink">Radar de Movimientos</h4>
          </div>

          <div className="space-y-6 flex-1">
            {events.map((event, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="group relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-slate-200 before:rounded-full before:transition-colors hover:before:bg-indigo-500"
              >
                {/* Visual Connector */}
                {index !== events.length - 1 && (
                  <div className="absolute left-[3px] top-4 w-[2px] h-[calc(100%+8px)] bg-slate-100" />
                )}

                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{event.minutes}</span>
                </div>
                <h5 className="text-base font-bold text-ink leading-snug mb-2 group-hover:text-indigo-600 transition-colors">{event.title}</h5>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">{event.time}</span>
                  <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">{event.metrics}</span>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-100">
             <button className="w-full py-3 bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-colors">
               Ver historial completo
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}
