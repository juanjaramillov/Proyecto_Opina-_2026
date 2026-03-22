import { TrendingUp, Activity, Globe, Sparkles, Users, Flame, Swords, PieChart } from "lucide-react";
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

  const formattedCount = Math.floor(count).toString().split('');

  // Mock data for the new Ranking
  const topConsensus = [
    { rank: 1, name: "Inteligencia Artificial", detail: "94% de acuerdo", isHot: true },
    { rank: 2, name: "Sostenibilidad", detail: "88% de acuerdo", isHot: false },
    { rank: 3, name: "Salud Mental", detail: "85% de acuerdo", isHot: true },
  ];

  const topPolarized = [
    { rank: 1, name: "Economía de Creadores", detail: "51% vs 49%", isHot: true },
    { rank: 2, name: "Trabajo 100% Remoto", detail: "53% vs 47%", isHot: false },
    { rank: 3, name: "Criptomonedas", detail: "55% vs 45%", isHot: false },
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
            ¡Boom! El pulso de la <span className="text-gradient-brand">comunidad</span>.
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Descubre las principales conclusiones, tendencias y preferencias generadas por los votos de todos los usuarios.
          </p>
        </div>

        {/* Bento Box Grid - 3 Columns Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          
          {/* Card 1: Consenso Comunitario (Span 1) - Glassmorphism applied */}
          <div className="md:col-span-1 bg-white/70 backdrop-blur-2xl rounded-3xl p-6 md:p-8 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-indigo-100/50 rounded-full blur-2xl group-hover:bg-indigo-200/60 transition-colors" />
            
            <div className="relative z-10 flex items-center gap-2 text-primary font-bold mb-4">
              <Users className="w-5 h-5" />
              <h3>CONSENSO DESTACADO</h3>
            </div>
            
            <div className="relative z-10 flex-1 flex flex-col justify-center">
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-6xl font-black font-display text-slate-800 tracking-tight">82</span>
                <span className="text-3xl font-black font-display text-primary">%</span>
              </div>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">
                De la comunidad cree que el modelo de trabajo híbrido es superior al 100% presencial.
              </p>
            </div>
            
            <div className="relative z-10 mt-6 flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 backdrop-blur-sm px-3 py-2 rounded-xl border border-primary/20 w-fit">
              <Sparkles className="w-4 h-4 animate-pulse" />
              Preferencia dominante
            </div>
          </div>

          {/* Card 2: Ranking de Tendencias (Span 2) */}
          <div className="md:col-span-2 bg-white/70 backdrop-blur-2xl rounded-3xl p-6 md:p-8 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all flex flex-col justify-between">
            <div className="flex items-center gap-2 text-emerald-600 font-bold mb-6">
              <TrendingUp className="w-5 h-5" />
              <h3>RADAR DE TENDENCIAS TOP</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Consenso */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Mayor Consenso
                </h4>
                <div className="space-y-2.5">
                  {topConsensus.map((trend) => (
                    <div key={`cons-${trend.rank}`} className="group relative flex items-center justify-between p-2.5 md:p-3 rounded-2xl border border-slate-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/50 transition-all">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-500 font-bold font-display text-sm group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                          {trend.rank}
                        </span>
                        <span className="font-bold text-slate-800 text-sm">
                          {trend.name}
                        </span>
                        {trend.isHot && (
                          <span className="hidden xl:inline-flex items-center gap-1 text-[9px] uppercase tracking-widest font-black text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-100">
                            <Flame className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                        <PieChart className="w-3 h-3" />
                        {trend.detail}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Polarizados */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Más Polarizados
                </h4>
                <div className="space-y-2.5">
                  {topPolarized.map((trend) => (
                    <div key={`pol-${trend.rank}`} className="group relative flex items-center justify-between p-2.5 md:p-3 rounded-2xl border border-slate-100 bg-white hover:border-rose-200 hover:bg-rose-50/50 transition-all">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-500 font-bold font-display text-sm group-hover:bg-rose-100 group-hover:text-rose-600 transition-colors">
                          {trend.rank}
                        </span>
                        <span className="font-bold text-slate-800 text-sm">
                          {trend.name}
                        </span>
                        {trend.isHot && (
                          <span className="hidden xl:inline-flex items-center gap-1 text-[9px] uppercase tracking-widest font-black text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-100">
                            <Flame className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">
                        <Swords className="w-3 h-3" />
                        {trend.detail}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Fila 2 */}

          {/* Card 3: Participación por Categorías (Span 2) */}
          <div className="md:col-span-2 bg-white/70 backdrop-blur-2xl rounded-3xl p-6 md:p-8 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all flex flex-col justify-between h-full">
             <div className="relative z-10 flex items-center justify-between mb-2">
               <div className="flex items-center gap-2 text-indigo-500 font-bold">
                 <Activity className="w-5 h-5" />
                 <h3>SEÑALES POR CATEGORÍA</h3>
               </div>
               <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Volumen Hoy</span>
             </div>
             
             <p className="text-sm text-slate-500 font-medium mb-8">
               ¿En qué temas la comunidad está aportando mayor inteligencia colectiva?
             </p>

             <div className="space-y-5 flex-1 flex flex-col justify-center">
                {[
                  { name: 'Consumo & Marcas', percent: 38, color: 'bg-primary' },
                  { name: 'Trabajo & Economía', percent: 27, color: 'bg-emerald-500' },
                  { name: 'Tecnología e IA', percent: 19, color: 'bg-indigo-400' },
                  { name: 'Entretenimiento & Cultura', percent: 16, color: 'bg-amber-400' },
                ].map(cat => (
                  <div key={cat.name} className="flex flex-col gap-2 group cursor-default">
                    <div className="flex justify-between items-end text-xs font-bold text-slate-700">
                      <span className="group-hover:text-primary transition-colors">{cat.name}</span>
                      <span className="text-slate-400">{cat.percent}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${cat.color} rounded-full transition-all duration-1000 ease-out`} 
                        style={{ width: `${cat.percent}%` }} 
                      />
                    </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Card 4: Poder Colectivo (Smaller Widget) */}
          <div ref={odometerRef} className="md:col-span-1 bg-gradient-brand rounded-3xl p-6 border border-transparent shadow-[0_8px_30px_rgba(59,130,246,0.15)] hover:shadow-[0_12px_40px_rgba(59,130,246,0.25)] transition-shadow relative overflow-hidden flex flex-col justify-between h-full">
             {/* Decorative background shapes */}
             <div className="absolute inset-0 opacity-20 pointer-events-none">
               <div className="absolute -left-10 top-1/2 w-40 h-40 bg-white rounded-full blur-3xl" />
               <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-400 rounded-full blur-3xl" />
             </div>

             <div className="relative z-10 w-full mb-6">
                <div className="flex items-center gap-2 text-white/90 font-bold uppercase tracking-widest text-[10px]">
                  <Globe className="w-4 h-4" />
                  <span>Red Activa</span>
                </div>
             </div>
             
             <div className="relative z-10 flex-1 flex flex-col justify-center w-full mb-8">
                <div className="text-white/80 text-[10px] font-bold uppercase tracking-widest mb-3 text-center">Señales registradas HOY</div>
                {/* Odómetro visual pequeño */}
                <div className="flex items-center gap-0.5 sm:gap-1 w-full justify-center">
                   {formattedCount.map((char, i) => (
                     <div key={`clock-${char}-${i}`} className={`bg-white/10 backdrop-blur-md rounded-md sm:rounded-lg border border-white/20 px-1.5 sm:px-2 py-1 flex items-center justify-center text-xl sm:text-2xl font-black font-display text-white shadow-inner ${char === '.' ? 'bg-transparent border-none w-auto self-end text-lg px-0 pb-0.5' : ''}`}>
                       <span>{char}</span>
                     </div>
                   ))}
                </div>
             </div>

             <div className="relative z-10 border-t border-white/10 pt-5 mt-auto">
                <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                   <div>
                      <div className="text-indigo-200 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Users className="w-3 h-3 text-indigo-300" />
                        Usuarios Totales
                      </div>
                      <div className="text-white font-bold text-lg font-display">142.5K</div>
                   </div>
                   <div>
                      <div className="text-indigo-200 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Activos (24h)
                      </div>
                      <div className="text-white font-bold text-lg font-display">18.2K</div>
                   </div>
                   <div>
                      <div className="text-indigo-200 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Globe className="w-3 h-3 text-indigo-300" />
                        Señales (Mes)
                      </div>
                      <div className="text-white font-bold text-lg font-display">1.2M</div>
                   </div>
                   <div>
                      <div className="text-indigo-200 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <TrendingUp className="w-3 h-3 text-indigo-300" />
                        Señales (7d)
                      </div>
                      <div className="text-white font-bold text-lg font-display">345K</div>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}
