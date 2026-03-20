import { motion } from "framer-motion";
import { Zap, Activity, Clock } from "lucide-react";

export function ActualidadInsightBlock() {
  const events = [
    { time: "Hace 2h", title: "Pico de participación por anuncio gubernamental", type: "spike" },
    { time: "Hace 5h", title: "Aceleración de consenso a favor de medidas preventivas", type: "trend" },
    { time: "Hace 12h", title: "Apertura de nuevo nodo de debate: Energía Sustentable", type: "new" },
  ];

  return (
    <div className="w-full">
      <div className="mb-12">
        <h3 className="text-3xl font-black text-ink tracking-tight mb-2">Foco Caliente Actualidad</h3>
        <p className="text-slate-500 text-lg max-w-2xl">
          Eventos en tiempo real y el flujo de la opinión sobre la agenda inmediata.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Live Status Card */}
        <div className="md:col-span-1 bg-ink text-white rounded-[2rem] p-8 relative overflow-hidden flex flex-col justify-between shadow-lg">
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/20 rounded-bl-full blur-xl animate-pulse" />
          
          <div className="relative z-10 flex items-center gap-2 mb-8">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-200">En Vivo</span>
          </div>

          <div className="relative z-10">
            <h4 className="text-4xl font-black tracking-tight mb-2">1,245</h4>
            <div className="text-sm font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-4 h-4" /> Señales por hora
            </div>
            
            <div className="mt-8 pt-6 border-t border-indigo-500/30">
              <p className="text-sm text-indigo-200 font-medium">Tema dominante:</p>
              <p className="text-lg font-bold text-white leading-tight mt-1">
                Efectos locales del nuevo paquete económico
              </p>
            </div>
          </div>
        </div>

        {/* Timeline / Recent Activity */}
        <div className="md:col-span-2 bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-8 border-b border-slate-100 pb-4">
            <Activity className="w-5 h-5 text-indigo-500" />
            <h4 className="text-xl font-black text-ink">Línea de Vida</h4>
          </div>

          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {events.map((event, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
              >
                {/* Timeline Icon */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-indigo-100 text-indigo-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <Clock className="w-4 h-4" />
                </div>
                
                {/* Event Content */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">{event.time}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-800 leading-snug">{event.title}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
