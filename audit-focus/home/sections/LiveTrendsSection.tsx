import { TrendingUp, Activity, Globe, Sparkles, UserCheck, ArrowUpRight, Flame } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function LiveTrendsSection() {
  const [count, setCount] = useState(24000);
  const odometerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        let start = 24000;
        const end = 24821;
        const duration = 2000;
        const increment = (end - start) / (duration / 16);
        
        const timer = setInterval(() => {
          start += increment;
          if (start >= end) {
            setCount(end);
            clearInterval(timer);
          } else {
            setCount(Math.floor(start));
          }
        }, 16);
        observer.disconnect();
      }
    });
    
    if (odometerRef.current) {
      observer.observe(odometerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const formattedCount = count.toLocaleString('es-ES').split('');

  // Mock data for the new Ranking
  const topTrends = [
    { rank: 1, name: "Inteligencia Artificial", speed: "+12 lugares", isHot: true },
    { rank: 2, name: "Economía de Creadores", speed: "+5 lugares", isHot: false },
    { rank: 3, name: "Movilidad Urbana", speed: "Estable", isHot: false },
    { rank: 4, name: "Bienestar Mental", speed: "Nueva entrada", isHot: true },
  ];

  return (
    <section className="relative w-full py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200 overflow-hidden">
      
      {/* Subtle background orbs for Glassmorphism effect */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-200/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-200/40 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4 backdrop-blur-md">
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-ink mb-2">
            ¡Boom! Tu <span className="text-gradient-brand">señal</span> tiene impacto.
          </h2>
          <p className="text-lg text-slate-500">
            Así se mueve el ecosistema tras tu participación.
          </p>
        </div>

        {/* Bento Box Grid - 3 Columns Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          
          {/* Card 1: Afinidad de Usuario (Span 1) - Glassmorphism applied */}
          <div className="md:col-span-1 bg-white/70 backdrop-blur-2xl rounded-3xl p-6 md:p-8 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-indigo-100/50 rounded-full blur-2xl group-hover:bg-indigo-200/60 transition-colors" />
            
            <div className="relative z-10 flex items-center gap-2 text-primary font-bold mb-4">
              <UserCheck className="w-5 h-5" />
              <h3>AFINIDAD DE TRIBU</h3>
            </div>
            
            <div className="relative z-10 flex-1 flex flex-col justify-center">
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-6xl font-black font-display text-slate-800 tracking-tight">82</span>
                <span className="text-3xl font-black font-display text-primary">%</span>
              </div>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">
                Tus respuestas coinciden con la mayoría de tu generación.
              </p>
            </div>
            
            <div className="relative z-10 mt-6 flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 backdrop-blur-sm px-3 py-2 rounded-xl border border-primary/20 w-fit">
              <Sparkles className="w-4 h-4 animate-pulse" />
              Patrón dominante detectado
            </div>
          </div>

          {/* Card 2: Ranking de Tendencias (Span 2) */}
          <div className="md:col-span-2 bg-white/70 backdrop-blur-2xl rounded-3xl p-6 md:p-8 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all flex flex-col justify-between">
            <div className="flex items-center gap-2 text-emerald-600 font-bold mb-6">
              <TrendingUp className="w-5 h-5" />
              <h3>RADAR DE TEMAS TOP</h3>
            </div>
            
            <div className="space-y-3">
              {topTrends.map((trend, idx) => (
                <div key={trend.rank} className="group relative flex items-center justify-between p-3 md:p-4 rounded-2xl border border-slate-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/50 transition-all">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold font-display group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                      {trend.rank}
                    </span>
                    <span className="font-bold text-slate-800 md:text-lg">
                      {trend.name}
                    </span>
                    {trend.isHot && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                        <Flame className="w-3 h-3" /> Hot
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-500">
                    {idx < 2 && <ArrowUpRight className="w-4 h-4" />}
                    {trend.speed}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fila 2 */}

          {/* Card 3: Mapa Relacional Interactivo (Span 2) */}
          <div className="md:col-span-2 bg-white/70 backdrop-blur-2xl rounded-3xl p-6 md:p-8 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all min-h-[250px] relative overflow-hidden flex flex-col">
             
             {/* Decorative faint connecting lines */}
             <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
               <path d="M50,100 C150,50 250,150 400,100 C550,50 650,200 800,100" fill="none" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="4 6" />
               <path d="M100,200 C200,100 350,250 500,150" fill="none" stroke="url(#lineGradient)" strokeWidth="1.5" strokeDasharray="3 5" />
               <defs>
                 <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                   <stop offset="0%" stopColor="#818cf8" />
                   <stop offset="100%" stopColor="#34d399" />
                 </linearGradient>
               </defs>
             </svg>

             <div className="relative z-10 flex items-center justify-between mb-2">
               <div className="flex items-center gap-2 text-indigo-500 font-bold">
                 <Activity className="w-5 h-5" />
                 <h3>MAPA RELACIONAL</h3>
               </div>
               <span className="text-xs font-bold uppercase tracking-widest text-slate-400">En expansión</span>
             </div>
             
             <p className="relative z-10 text-sm text-slate-500 font-medium mb-6">Analizamos las conexiones ocultas entre categorías macro tras el último corte de la comunidad.</p>

             {/* Grafo simulado con elementos flotantes */}
             <div className="relative flex-1 w-full h-full">
                <div className="absolute top-[20%] left-[20%] text-center transform -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-primary hover:bg-primary/90 text-white w-20 h-20 md:w-24 md:h-24 rounded-full flex flex-col items-center justify-center font-bold shadow-lg shadow-primary/30 animate-[bounce_4s_ease-in-out_infinite] cursor-help relative z-30 transition-transform hover:scale-110">
                    <span className="text-xs font-medium opacity-80 mb-0.5">Consumo</span>
                    <span className="text-xl font-display">38%</span>
                  </div>
                </div>

                <div className="absolute top-[15%] right-[25%] text-center transform -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 w-16 h-16 md:w-20 md:h-20 rounded-full flex flex-col items-center justify-center font-bold shadow-sm animate-[bounce_5s_ease-in-out_infinite_reverse] cursor-help relative z-20 transition-transform hover:scale-110 hover:bg-emerald-100 hover:z-40 delay-200">
                    <span className="text-[10px] font-medium opacity-80 uppercase tracking-wider mb-0.5">Lifestyle</span>
                    <span className="text-lg font-display">27%</span>
                  </div>
                </div>

                <div className="absolute bottom-[20%] left-[45%] text-center transform -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-indigo-50 border border-indigo-200 text-indigo-600 w-14 h-14 md:w-16 md:h-16 rounded-full flex flex-col items-center justify-center font-bold shadow-sm animate-[bounce_3s_ease-in-out_infinite] cursor-help relative z-20 transition-transform hover:scale-110 hover:bg-indigo-100 hover:z-40 delay-500">
                    <span className="text-[9px] font-medium opacity-80 uppercase tracking-widest">Tech</span>
                    <span className="text-base font-display">19%</span>
                  </div>
                </div>

                <div className="absolute top-[60%] right-[10%] text-center transform -translate-x-1/2 -translate-y-1/2 hidden md:block">
                  <div className="bg-slate-50 border border-slate-200 text-slate-500 w-12 h-12 rounded-full flex flex-col items-center justify-center font-bold shadow-sm animate-[bounce_6s_ease-in-out_infinite_reverse] cursor-help relative z-10 transition-transform hover:scale-110 hover:bg-slate-100 hover:text-slate-700 delay-300">
                    <span className="text-sm font-display">16%</span>
                  </div>
                </div>
             </div>
          </div>

          {/* Card 4: Poder Colectivo (Reducido a Span 1 al estilo vertical widget) */}
          <div ref={odometerRef} className="md:col-span-1 bg-gradient-brand rounded-3xl p-6 md:p-8 border border-transparent shadow-xl relative overflow-hidden flex flex-col items-center justify-center text-center group">
             {/* Decorative background shapes */}
             <div className="absolute inset-0 opacity-20">
               <div className="absolute -left-10 top-1/2 w-40 h-40 bg-white rounded-full blur-3xl" />
               <div className="absolute -right-10 bottom-0 w-40 h-40 bg-emerald-400 rounded-full blur-3xl" />
             </div>

             <div className="relative z-10 flex flex-col justify-between h-full w-full">
                <div className="flex items-center justify-center gap-2 text-white/90 font-bold mb-6 uppercase tracking-widest text-xs">
                  <Globe className="w-4 h-4" />
                  <span>Red Activa</span>
                </div>
                
                {/* Odómetro visual verticalizado */}
                <div className="flex flex-col items-center gap-1 relative z-10 flex-1 justify-center">
                   <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                      {formattedCount.slice(0, 3).map((char, i) => (
                        <div key={`left-${char}-${i}`} className={`bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl border border-white/20 w-8 h-12 sm:w-10 sm:h-14 flex items-center justify-center text-2xl sm:text-3xl font-black font-display text-white shadow-inner ${char === '.' ? 'bg-transparent border-none w-auto self-end pb-1 sm:pb-2 text-xl' : ''}`}>
                          <span className="drop-shadow-md">{char}</span>
                        </div>
                      ))}
                   </div>
                   <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                      {formattedCount.slice(3).map((char, i) => (
                        <div key={`right-${char}-${i}`} className={`bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl border border-white/20 w-8 h-12 sm:w-10 sm:h-14 flex items-center justify-center text-2xl sm:text-3xl font-black font-display text-white shadow-inner ${char === '.' ? 'bg-transparent border-none w-auto self-end pb-1 sm:pb-2 text-xl' : ''}`}>
                          <span className="drop-shadow-md">{char}</span>
                        </div>
                      ))}
                   </div>
                </div>

                <p className="relative z-10 font-bold text-sm tracking-wide text-indigo-100 mt-6 leading-tight">
                  <span className="text-white block">Señales registradas</span>
                  en la plataforma HOY.
                </p>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}
