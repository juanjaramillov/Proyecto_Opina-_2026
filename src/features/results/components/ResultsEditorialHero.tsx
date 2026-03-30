import { Clock, TrendingUp } from "lucide-react";
import { ResultsCommunitySnapshot } from "../../../read-models/b2c/resultsCommunityTypes";
import { MetricAvailabilityCard } from "../../../components/ui/MetricAvailabilityCard";

interface Props {
  heroData: ResultsCommunitySnapshot["hero"];
}

export function ResultsEditorialHero({ heroData }: Props) {
  const signalStatus = heroData.availability;
  const activeSignals = heroData.metrics.activeSignals || 0;
  
  return (
    <div className="w-full max-w-6xl mx-auto px-4 mt-8">
      {/* Decorative top info */}
      <div className="flex justify-center mb-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">
        {heroData.metrics.freshnessHours ? (
            `Actualizado en las últimas ${heroData.metrics.freshnessHours} horas • Muestra regional`
        ) : (
            `Actividad Regional • Muestra sujeta a validación`
        )}
      </div>

      <div className="relative w-full rounded-3xl overflow-hidden bg-slate-900 shadow-2xl">
        {/* Background Gradients and Neo-Waves */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-900" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-fuchsia-600/20 to-transparent mix-blend-screen pointer-events-none" />
        
        {/* SVG Neon Waves */}
        <svg className="absolute bottom-0 left-0 w-full h-32 opacity-80" preserveAspectRatio="none" viewBox="0 0 1000 100">
          <path d="M0,50 Q250,90 500,50 T1000,50 L1000,100 L0,100 Z" fill="url(#wave-gradient-1)" opacity="0.5" />
          <path d="M0,70 Q300,30 600,70 T1000,70 L1000,100 L0,100 Z" fill="url(#wave-gradient-2)" opacity="0.8" />
          <defs>
            <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="50%" stopColor="#9333EA" />
              <stop offset="100%" stopColor="#E11D48" />
            </linearGradient>
            <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0EA5E9" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>
          </defs>
        </svg>

        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="flex-1">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
              <span className={`w-2 h-2 rounded-full ${signalStatus === "success" ? "bg-indigo-400 animate-pulse" : "bg-orange-400"}`} />
              <span className="text-[10px] md:text-xs font-bold text-indigo-100 uppercase tracking-widest">
                {heroData.title}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl md:text-5xl font-black text-white leading-[1.1] tracking-tighter mb-4 max-w-3xl">
              {heroData.metrics.mainInsightHeadline || heroData.subtitle}
            </h1>
            
            <p className="text-base md:text-lg text-slate-300 font-medium mb-8 max-w-2xl leading-relaxed">
              {heroData.description}
            </p>

            {/* Footer info bars */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
              {signalStatus === "success" ? (
                  <div className="flex items-center gap-2 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-300 px-3 py-1.5 rounded-full">
                    <Clock className="w-3.5 h-3.5" />
                    Señales Continuas
                  </div>
              ) : (
                   <div className="flex items-center gap-2 bg-orange-500/20 backdrop-blur-md border border-orange-500/30 text-orange-300 px-3 py-1.5 rounded-full">
                    Recopilando Datos Recientes
                  </div>
              )}
              {heroData.metrics.sampleQualityLabel && (
                  <div className="text-slate-400 border-l border-white/10 pl-4">
                    {heroData.metrics.sampleQualityLabel}
                  </div>
              )}
            </div>
          </div>

          <div className="shrink-0 w-full md:w-auto">
             {/* Data highlight box OR fallback */}
             {signalStatus === "success" || signalStatus === "degraded" ? (
                 <div className="bg-slate-950/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center min-w-[240px] shadow-2xl">
                   <div className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-1">
                     {activeSignals.toLocaleString()}
                   </div>
                   <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">
                     Señales Base<br/>Procesadas
                   </div>
                   {signalStatus === "success" && (
                       <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30 text-xs font-black tracking-wide">
                         <div className="bg-indigo-500 rounded-full p-0.5"><TrendingUp className="w-3 h-3 text-white" /></div>
                         En crecimiento
                       </div>
                   )}
                 </div>
             ) : (
                 <div className="min-w-[240px]">
                    <MetricAvailabilityCard 
                        label="SEÑALES EN FLUJO CONTINUO" 
                        status={(signalStatus === "insufficient_data" || signalStatus === "error") ? "insufficient_data" : "pending"} 
                        helperText="Se requieren más interacciones activas para proyectar resultados en vivo."
                    />
                 </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
}
