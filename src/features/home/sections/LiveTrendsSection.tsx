import { TrendingUp, Activity, Globe, Sparkles, Users, Flame, Swords, PieChart } from "lucide-react";
import { useState, useEffect } from "react";

export default function LiveTrendsSection() {
  const [pulseCount, setPulseCount] = useState(342);

  useEffect(() => {
    // Simulador Dinámico de "Latidos de Red"
    const interval = setInterval(() => {
      setPulseCount(prev => prev + Math.floor(Math.random() * 4) + 1);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Mock data for the new Ranking
  const topConsensus = [
    { rank: 1, name: "Inteligencia Artificial", detail: "94% de acuerdo", percent: 94, isHot: true },
    { rank: 2, name: "Sostenibilidad", detail: "88% de acuerdo", percent: 88, isHot: false },
    { rank: 3, name: "Salud Mental", detail: "85% de acuerdo", percent: 85, isHot: true },
  ];

  const topPolarized = [
    { rank: 1, name: "Economía de Creadores", detail: "51% vs 49%", percentA: 51, percentB: 49, isHot: true },
    { rank: 2, name: "Trabajo 100% Remoto", detail: "53% vs 47%", percentA: 53, percentB: 47, isHot: false },
    { rank: 3, name: "Criptomonedas", detail: "55% vs 45%", percentA: 55, percentB: 45, isHot: false },
  ];

  return (
    <section className="relative w-full py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200 overflow-hidden">
      
      {/* Fondos limpios para reducir sobrecarga visual y dar descanso al usuario */}

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

          {/* Card 2: Radar de Tendencias Top (Span 2) - Enriched Data Visuals */}
          <div className="md:col-span-2 bg-white/70 backdrop-blur-2xl rounded-3xl p-6 md:p-8 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all flex flex-col justify-between">
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
          </div>

          {/* Fila 2 - Cambio de Layout: Red Activa ocupa 2 columnas, Categorías ocupa 1 */}

          {/* Card 4: Red Activa (Span 2) - Rediseñada a Command Center interactivo Dark Mode */}
          <div className="md:col-span-2 bg-slate-900 rounded-3xl border border-slate-800 shadow-[0_8px_30px_rgba(15,23,42,0.4)] hover:shadow-[0_12px_40px_rgba(15,23,42,0.6)] transition-shadow relative overflow-hidden flex flex-col md:flex-row group cursor-default">
             
             {/* Decorative Command Center Dark Glowing Backgrounds */}
             <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-screen">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/30 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-sky-500/5 rounded-full blur-[120px]" />
             </div>
             
             {/* Abstract Node Network SVG Background */}
             <svg className="absolute inset-0 w-full h-full opacity-[0.2] pointer-events-none" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 400">
               <g stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none">
                 <path d="M-100,200 L100,300 L300,150 L500,250 L700,100 L900,200" />
                 <path d="M0,100 L200,50 L400,200 L600,80 L800,280" />
                 <path d="M100,300 L200,50 M300,150 L400,200 M500,250 L600,80" />
               </g>
               <g fill="rgba(255,255,255,0.8)">
                 <circle cx="100" cy="300" r="3" className="animate-pulse" />
                 <circle cx="300" cy="150" r="4" style={{ animationDelay: '1s' }} className="animate-pulse" />
                 <circle cx="500" cy="250" r="3" style={{ animationDelay: '2s' }} className="animate-pulse" />
                 <circle cx="700" cy="100" r="5" className="animate-[pulse_3s_infinite]" />
                 <circle cx="200" cy="50" r="3" className="animate-[pulse_4s_infinite]" />
                 <circle cx="400" cy="200" r="4" className="animate-pulse" />
                 <circle cx="600" cy="80" r="2" style={{ animationDelay: '1.5s' }} className="animate-pulse" />
               </g>
             </svg>

             {/* Columna Izquierda: Radar / Núcleo de Red */}
             <div className="relative z-10 p-6 md:p-8 w-full md:w-[45%] lg:w-5/12 flex flex-col justify-start shrink-0">
                <div className="flex items-center justify-between mb-6 xl:mb-10 w-full">
                  <div className="flex items-center gap-2 text-white font-bold uppercase tracking-widest text-[11px] bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <Globe className="w-4 h-4 text-emerald-300" />
                    <span>Red Activa</span>
                  </div>
                  <div className="text-emerald-300 font-bold text-[10px] bg-emerald-900/40 px-2 py-1 rounded-md shadow-inner">Conectado</div>
                </div>
                
                {/* Ilustración Dinámica: Radar de Frecuencia */}
                <div className="flex flex-col items-center justify-center py-4 flex-1">
                  
                  {/* Radar/Core */}
                  <div className="relative w-40 h-40 xl:w-48 xl:h-48 flex items-center justify-center mb-8">
                    {/* Anillos de pulso radial */}
                    <div className="absolute inset-0 border border-emerald-500/30 rounded-full animate-[ping_3s_infinite]" />
                    <div className="absolute inset-4 border border-sky-500/20 rounded-full animate-[ping_3s_infinite_1s]" />
                    <div className="absolute inset-8 border border-indigo-500/20 rounded-full animate-[ping_3s_infinite_2s]" />
                    
                    {/* Constelación animada de Nodos Orbitando */}
                    <svg className="absolute inset-0 w-full h-full animate-[spin_20s_linear_infinite]" viewBox="0 0 100 100">
                       <path d="M50,50 L50,10" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 3" />
                       <circle cx="50" cy="10" r="3" fill="#34d399" className="animate-[pulse_2s_infinite]" />
                       <path d="M50,50 L85,30" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 3" />
                       <circle cx="85" cy="30" r="2.5" fill="#38bdf8" className="animate-[pulse_2s_infinite]" style={{ animationDelay: '0.5s' }} />
                       <path d="M50,50 L80,80" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 3" />
                       <circle cx="80" cy="80" r="2" fill="#a78bfa" className="animate-[pulse_2s_infinite]" style={{ animationDelay: '1s' }} />
                       <path d="M50,50 L20,75" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 3" />
                       <circle cx="20" cy="75" r="3.5" fill="#f472b6" className="animate-[pulse_2s_infinite]" style={{ animationDelay: '1.5s' }} />
                       <path d="M50,50 L15,35" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 3" />
                       <circle cx="15" cy="35" r="1.5" fill="#facc15" className="animate-[pulse_2s_infinite]" style={{ animationDelay: '2s' }} />
                    </svg>

                    {/* Núcleo Central */}
                    <div className="relative z-10 w-24 h-24 xl:w-28 xl:h-28 bg-slate-800 rounded-full border border-slate-700 shadow-[0_0_40px_rgba(52,211,153,0.15)] flex items-center justify-center flex-col overflow-hidden group/core hover:scale-105 transition-all cursor-crosshair">
                       <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/20 to-transparent opacity-60 group-hover/core:opacity-100 transition-opacity" />
                       <Activity className="w-5 h-5 text-emerald-400 mb-1 animate-pulse" />
                       <span className="relative z-10 text-3xl xl:text-4xl font-black text-white font-display tracking-tight leading-none drop-shadow-md">
                         {pulseCount}
                       </span>
                    </div>
                  </div>

                  {/* Leyenda y Explicación */}
                  <div className="text-center relative z-10">
                    <h4 className="flex items-center justify-center gap-1.5 text-white/90 text-sm font-bold uppercase tracking-widest mb-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                       Frecuencia de Red
                    </h4>
                    <p className="text-slate-400 text-xs max-w-[220px] mx-auto leading-relaxed">
                       Midiendo el latido y flujo de interacciones en tiempo real.
                    </p>
                  </div>
                </div>
             </div>

             {/* Columna Derecha: Grilla 2x2 Enriquecida */}
             {/* Columna Derecha: Dashboard HUD */}
             <div className="relative z-10 p-6 lg:p-8 w-full md:w-[55%] lg:w-7/12 flex flex-col justify-center">
                <div className="grid grid-cols-2 gap-3 xl:gap-4 h-full">
                  
                  {/* KPI 1: Usuarios Totales (Indigo Accent) */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between group/stat hover:bg-white/10 transition-colors shadow-none">
                    <div className="text-white/60 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 mb-2">
                      <Users className="w-3.5 h-3.5 text-indigo-400" /> Totales
                    </div>
                    <div className="flex flex-col">
                      <div className="text-white font-black text-2xl xl:text-3xl font-display leading-none mb-1">142.5K</div>
                      <div className="text-indigo-300 text-[10px] font-bold flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +2.4% mes</div>
                    </div>
                  </div>

                  {/* KPI 2: Activos 24h (Emerald Text) */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between group/stat hover:bg-white/10 transition-colors relative overflow-hidden shadow-none">
                    <svg className="absolute bottom-0 left-0 w-full h-1/2 opacity-10 text-emerald-400" preserveAspectRatio="none" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M0,80 L20,80 L30,20 L40,100 L50,80 L100,80" className="animate-[pulse_2s_infinite]" />
                    </svg>
                    <div className="relative z-10 text-white/60 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 mb-2">
                      <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Activos 24h
                    </div>
                    <div className="relative z-10 flex flex-col">
                      <div className="text-white font-black text-2xl xl:text-3xl font-display leading-none mb-1">18.2K</div>
                      <div className="text-emerald-400 text-[10px] font-bold">En línea ahora</div>
                    </div>
                  </div>

                  {/* KPI 3: Nuevos Hoy (Amber Accent) */}
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col justify-between group/stat hover:bg-amber-500/15 transition-colors shadow-none">
                    <div className="text-amber-200/60 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Nuevos Hoy
                    </div>
                    <div className="flex items-end justify-between">
                      <div className="text-white font-black text-2xl xl:text-3xl font-display leading-none text-shadow-sm">1,240</div>
                      <div className="text-amber-400 text-[10px] font-bold flex items-center gap-1 bg-amber-500/20 px-1.5 py-0.5 rounded-md">
                        <TrendingUp className="w-3 h-3" />
                      </div>
                    </div>
                  </div>

                  {/* KPI 4: Meta Mes (Rose Accent) */}
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex flex-col justify-between group/stat hover:bg-rose-500/15 transition-colors relative shadow-none">
                    <div className="text-rose-200/60 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 mb-2">
                      <PieChart className="w-3.5 h-3.5 text-rose-400" /> Meta Mes
                    </div>
                    
                    <div className="flex items-center justify-between w-full mt-auto">
                      <div className="flex flex-col">
                        <div className="text-white font-bold text-[18px] xl:text-xl font-display leading-none mb-0.5 text-shadow-sm">1.2M</div>
                        <div className="text-rose-200/60 text-[10px] font-medium tracking-wide">de 1.5M</div>
                      </div>
                      <div className="relative w-10 h-10 xl:w-12 xl:h-12 shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path className="text-rose-900/40" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                          <path className="text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="80, 100" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-[10px] xl:text-[11px] font-display">
                          80%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* KPI 5: Wave Chart (Sky Accent) - SPAN 2 */}
                  <div className="col-span-2 bg-sky-500/10 border border-sky-500/20 rounded-2xl p-4 sm:p-5 flex flex-col justify-between group/stat hover:bg-sky-500/15 transition-colors relative overflow-hidden shadow-none min-h-[120px]">
                    <svg className="absolute bottom-0 left-0 w-full h-[70%] opacity-30 group-hover:opacity-50 transition-opacity" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <defs>
                        <linearGradient id="wave-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                           <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.5" />
                           <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M0,100 L0,70 Q25,85 50,55 T100,20 L100,100 Z" fill="url(#wave-grad)" />
                      <path d="M0,70 Q25,85 50,55 T100,20" fill="none" stroke="#0ea5e9" strokeWidth="2" />
                    </svg>

                    <div className="relative z-10 text-sky-200/60 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 mb-4 lg:mb-6">
                      <TrendingUp className="w-3.5 h-3.5 text-sky-400" /> Señales (Últimos 7 días)
                    </div>
                    <div className="relative z-10 flex items-end gap-3 text-white mt-auto">
                      <div className="font-black text-3xl md:text-4xl xl:text-5xl font-display tracking-tight leading-none hover:scale-[1.02] transition-transform origin-left text-shadow-sm">345,000</div>
                      <div className="text-sky-900 text-[10px] font-bold mb-1 bg-sky-400 px-2 py-0.5 rounded-md shadow-[0_0_10px_rgba(56,189,248,0.3)]">Volumen alto</div>
                    </div>
                  </div>

                </div>
             </div>
          </div>

          {/* Card 3: Participación por Categorías (Ahora Span 1) */}
          <div className="md:col-span-1 bg-white/70 backdrop-blur-2xl rounded-3xl p-6 md:p-8 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all flex flex-col h-full">
             <div className="relative z-10 flex flex-col gap-1 mb-6">
               <div className="flex items-center gap-2 text-primary font-bold mb-1">
                 <Activity className="w-5 h-5" />
                 <h3>CATEGORÍAS</h3>
               </div>
               <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Volumen Hoy</span>
             </div>
             
             <div className="space-y-6 flex-1 flex flex-col justify-center -mt-2">
                {[
                  { name: 'Consumo & Marcas', percent: 38, color: 'bg-primary' },
                  { name: 'Trabajo & Economía', percent: 27, color: 'bg-emerald-500' },
                  { name: 'Tecnología e IA', percent: 19, color: 'bg-sky-500' },
                  { name: 'Entretenimiento & Cultura', percent: 16, color: 'bg-blue-300' },
                ].map(cat => (
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
          </div>

        </div>
      </div>
    </section>
  );
}
