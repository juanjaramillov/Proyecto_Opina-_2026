
import { Radio, GitCommit, Network } from "lucide-react";

export default function CommunityPulseSection() {
  // Mock de señales en vivo, simulando ingesta asíncrona
  const liveSignals = [
    { id: 1, label: "Nueva señal: Streaming", top: "15%", left: "12%", color: "bg-emerald-400", shadow: "shadow-[0_0_15px_rgba(52,211,153,0.6)]", delay: "delay-100", size: "w-3 h-3" },
    { id: 2, label: "Comparación: Apple vs Samsung", top: "25%", right: "18%", color: "bg-primary", shadow: "shadow-[0_0_15px_rgba(99,102,241,0.6)]", delay: "delay-500", size: "w-2.5 h-2.5" },
    { id: 3, label: "Señal anónima (Santiago)", top: "55%", left: "8%", color: "bg-indigo-400", shadow: "shadow-[0_0_15px_rgba(129,140,248,0.6)]", delay: "delay-300", size: "w-2 h-2" },
    { id: 4, label: "Nueva categoría desbloqueada", top: "65%", right: "12%", color: "bg-emerald-500", shadow: "shadow-[0_0_15px_rgba(16,185,129,0.6)]", delay: "delay-700", size: "w-3.5 h-3.5" },
    { id: 5, label: "Participación en Deportes", bottom: "15%", left: "25%", color: "bg-cyan-400", shadow: "shadow-[0_0_15px_rgba(34,211,238,0.6)]", delay: "delay-1000", size: "w-2.5 h-2.5" },
    { id: 6, label: "Señal de Alto Impacto", bottom: "25%", right: "30%", color: "bg-primary", shadow: "shadow-[0_0_15px_rgba(99,102,241,0.6)]", delay: "delay-150", size: "w-4 h-4" },
    { id: 7, label: "Tendencia: Movilidad", top: "40%", right: "8%", color: "bg-indigo-300", shadow: "shadow-[0_0_12px_rgba(165,180,252,0.6)]", delay: "delay-200", size: "w-2 h-2" },
    { id: 8, label: "Nuevo usuario anónimo", bottom: "35%", left: "15%", color: "bg-emerald-300", shadow: "shadow-[0_0_12px_rgba(110,231,183,0.6)]", delay: "delay-1000", size: "w-3 h-3" },
  ];

  return (
    <section className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100 overflow-hidden flex flex-col items-center">
      
      {/* Blueprint / Network faint background */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '40px 40px', color: '#000' }} />

      <div className="relative z-10 text-center mb-16 max-w-2xl">
        <h2 className="text-3xl md:text-5xl font-black text-ink mb-4 tracking-tight">
          Un ecosistema en <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">constante movimiento</span>
        </h2>
        <p className="text-xl text-slate-500 font-medium">Cada señal alimenta la red de forma estadística.</p>
      </div>

      <div className="relative z-10 w-full max-w-5xl h-[500px] flex items-center justify-center">
         
         {/* Central Radar Illustration */}
         <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full border border-indigo-100 flex items-center justify-center shadow-[0_0_100px_rgba(99,102,241,0.15)] bg-white group">
            {/* The Heartbeat Ping Ring */}
            <div className="absolute inset-0 rounded-full border border-emerald-400/30 animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]" />

            <div className="absolute inset-2 rounded-full border border-emerald-100/50" />
            <div className="absolute inset-8 rounded-full border border-primary/10" />
            <div className="absolute inset-16 rounded-full border border-indigo-200/30 bg-indigo-50/30" />
            
            {/* Spinning radar sweep */}
            <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_70%,rgba(99,102,241,0.1)_90%,rgba(16,185,129,0.4)_100%)] animate-[spin_4s_linear_infinite]" />
            
            <div className="relative z-20 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg shadow-primary/20 border border-slate-100">
               <Radio className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" />
            </div>
         </div>

         {/* Floating Static Cards */}
         
         {/* Node 1: Top Left */}
         <div className="absolute top-0 md:top-10 left-[2%] md:left-[20%] scale-75 sm:scale-90 md:scale-100 origin-top-left group hover:z-50">
            {/* Connection Line Pseudo */}
            <div className="hidden md:block absolute top-1/2 left-full w-32 h-px bg-gradient-to-r from-indigo-200 to-transparent -rotate-12 transform origin-left" />
            
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100 flex items-center gap-3 hover:-translate-y-1 transition-transform cursor-default relative z-10">
               <div className="bg-indigo-50 p-2 rounded-xl text-indigo-500">
                  <Network className="w-5 h-5" />
               </div>
               <div>
                  <div className="text-2xl font-black text-slate-800 leading-none mb-1">18</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Categorías Activas</div>
               </div>
            </div>
         </div>

         {/* Node 2: Bottom Right */}
         <div className="absolute bottom-0 md:bottom-10 right-[2%] md:right-[20%] scale-75 sm:scale-90 md:scale-100 origin-bottom-right group hover:z-50">
             {/* Connection Line Pseudo */}
            <div className="hidden md:block absolute bottom-1/2 right-full w-32 h-px bg-gradient-to-l from-emerald-200 to-transparent -rotate-12 transform origin-right" />

            <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100 flex items-center gap-3 hover:-translate-y-1 transition-transform cursor-default relative z-10">
               <div className="bg-emerald-50 p-2 rounded-xl text-emerald-500">
                  <GitCommit className="w-5 h-5" />
               </div>
               <div>
                  <div className="text-2xl font-black text-slate-800 leading-none mb-1 flex items-center gap-2">
                    126 <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Comparaciones Hoy</div>
               </div>
            </div>
         </div>
         
         {/* Signals (Fireflies) */}
         {liveSignals.map((signal) => (
           <div 
             key={signal.id} 
             className="absolute group z-10 hover:z-50 cursor-crosshair p-2 -m-2" /* Aumentar área de click/hover */
             style={{ 
               top: signal.top, 
               left: signal.left, 
               right: signal.right, 
               bottom: signal.bottom 
             }}
           >
             {/* El punto brillante */}
             <div className={`${signal.size} rounded-full ${signal.color} ${signal.shadow} animate-pulse ${signal.delay} group-hover:scale-150 transition-transform duration-300 group-hover:animate-none`} />
             
             {/* Tooltip on Hover */}
             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-slate-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-slate-700/50">
               {signal.label}
               {/* Triángulo del tooltip */}
               <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800" />
             </div>
           </div>
         ))}

      </div>
    </section>
  );
}
