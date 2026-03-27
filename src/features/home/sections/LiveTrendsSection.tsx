import { TrendingUp, Activity, Sparkles, Users, Flame, Swords, PieChart } from "lucide-react";
import { LiveTrendBento } from "../components/LiveTrendBento";
import { LiveTrendNetworkNode } from "../components/LiveTrendNetworkNode";
import { useState, useEffect } from "react";
import { isLaunchSyntheticMode } from "../../../config/dataMode";
import { homeLaunchSyntheticData } from "../data/launch/homeLaunchSyntheticData";

// Secuencia controlada para la simulación de latidos sin usar Math.random()
const PULSE_SEQUENCE = [1, 2, 0, 3, 1, 2, 1, 0, 2];

export default function LiveTrendsSection() {
  // En modo sintético, usamos el baseline oficial. Si estuviéramos en real, partiríamos de 0 o de endpoint.
  const baseline = isLaunchSyntheticMode ? homeLaunchSyntheticData.pulseBaseline : 0;
  const [pulseCount, setPulseCount] = useState(baseline);

  useEffect(() => {
    if (!isLaunchSyntheticMode) return;

    let tick = 0;
    const interval = setInterval(() => {
      setPulseCount(prev => prev + PULSE_SEQUENCE[tick % PULSE_SEQUENCE.length]);
      tick++;
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Seleccionar fuente de datos oficial (por ahora solo la sintética existe en la UI local, pero preparada para condicional)
  const data = isLaunchSyntheticMode ? homeLaunchSyntheticData : null;
  
  if (!data) {
    // Fallback simple si no hay datos (p. ej modo 'real' sin fetch todavía)
    return null; 
  }

  const { topConsensus, topPolarized, categories, networkPulseInfo } = data;

  return (
    <section className="relative w-full py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200 overflow-hidden">
      
      {/* Fondos limpios para reducir sobrecarga visual y dar descanso al usuario */}

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4 backdrop-blur-md">
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-ink mb-2">
            ¡Boom! Las señales de la <span className="text-gradient-brand">comunidad</span>.
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Descubre las principales conclusiones, tendencias y preferencias generadas por las señales de todos los usuarios.
          </p>
        </div>

        {/* Bento Box Grid - 3 Columns Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          
          {/* Card 1: Consenso Comunitario (Span 1) - Glassmorphism applied */}
          <LiveTrendBento className="md:col-span-1">
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
          </LiveTrendBento>

          {/* Card 2: Radar de Tendencias Top (Span 2) - Enriched Data Visuals */}
          <LiveTrendBento className="md:col-span-2">
            <div className="flex items-center gap-2 text-emerald-600 font-bold mb-6">
              <TrendingUp className="w-5 h-5" />
              <h3>RADAR DE TENDENCIAS TOP</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Consenso */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Mayor Consenso
                </h4>
                <div className="space-y-3">
                  {topConsensus.map((trend) => (
                    <div key={`cons-${trend.rank}`} className="group relative flex flex-col gap-1 p-3 rounded-2xl border border-slate-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/50 transition-all cursor-default">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-500 font-bold font-display text-sm group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                            {trend.rank}
                          </span>
                          <span className="font-bold text-slate-800 text-sm">
                            {trend.name}
                          </span>
                          {trend.isHot && (
                            <span className="hidden xl:inline-flex items-center gap-1 text-[9px] uppercase tracking-widest font-black text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-100">
                              <Flame className="w-3 h-3 animate-pulse" />
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                          <PieChart className="w-3 h-3" />
                          {trend.detail}
                        </div>
                      </div>
                      
                      {/* Mini Sparkbar Consenso */}
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${trend.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Polarizados */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
                  Más Polarizados
                </h4>
                <div className="space-y-3">
                  {topPolarized.map((trend) => (
                    <div key={`pol-${trend.rank}`} className="group relative flex flex-col gap-1 p-3 rounded-2xl border border-slate-100 bg-white hover:border-rose-200 hover:bg-rose-50/50 transition-all cursor-default">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-500 font-bold font-display text-sm group-hover:bg-rose-100 group-hover:text-rose-600 transition-colors">
                            {trend.rank}
                          </span>
                          <span className="font-bold text-slate-800 text-sm">
                            {trend.name}
                          </span>
                          {trend.isHot && (
                            <span className="hidden xl:inline-flex items-center gap-1 text-[9px] uppercase tracking-widest font-black text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded-md border border-sky-100">
                              <Flame className="w-3 h-3 animate-pulse" />
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-sky-600 bg-sky-50 px-2 py-1 rounded-lg">
                          <Swords className="w-3 h-3" />
                          {trend.detail}
                        </div>
                      </div>
                      
                      {/* Mini Split-bar Polarizada */}
                      <div className="w-full flex h-1.5 rounded-full overflow-hidden mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
                         <div className="h-full bg-primary" style={{ width: `${trend.percentA}%` }} />
                         <div className="h-full bg-emerald-400" style={{ width: `${trend.percentB}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </LiveTrendBento>

          {/* Fila 2 - Cambio de Layout: Red Activa ocupa 2 columnas, Categorías ocupa 1 */}

          {/* Card 4: Red Activa (Span 2) - Rediseñada a Command Center interactivo Dark Mode */}
          <LiveTrendNetworkNode pulseCount={pulseCount} networkPulseInfo={networkPulseInfo} />

          {/* Card 3: Participación por Categorías (Ahora Span 1) */}
          <LiveTrendBento className="md:col-span-1 h-full">
             <div className="relative z-10 flex flex-col gap-1 mb-6">
               <div className="flex items-center gap-2 text-primary font-bold mb-1">
                 <Activity className="w-5 h-5" />
                 <h3>CATEGORÍAS</h3>
               </div>
               <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Volumen Hoy</span>
             </div>
             
             <div className="space-y-6 flex-1 flex flex-col justify-center -mt-2">
                {categories.map(cat => (
                  <div key={cat.name} className="flex flex-col gap-2 group cursor-default">
                    <div className="flex justify-between items-end text-xs font-bold text-slate-700">
                      <span className="group-hover:text-primary transition-colors leading-tight max-w-[70%]">{cat.name}</span>
                      <span className="text-slate-500 font-display font-bold">{cat.percent}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className={`h-full ${cat.color} rounded-full transition-all duration-1000 ease-out`} 
                        style={{ width: `${cat.percent}%` }} 
                      />
                    </div>
                  </div>
                ))}
             </div>
          </LiveTrendBento>

        </div>
      </div>
    </section>
  );
}
