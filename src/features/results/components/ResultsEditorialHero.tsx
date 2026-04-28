import { Clock, TrendingUp, Shield, Scale } from "lucide-react";
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

      <div className="relative w-full rounded-3xl overflow-hidden bg-surface2 shadow-xl border border-stroke">
        {/* Background Gradients and Neo-Waves */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-white via-surface2 to-surface2" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-brand/5 to-transparent pointer-events-none" />
        
        {/* SVG Neon Waves */}
        <svg className="absolute bottom-0 left-0 w-full h-32 opacity-20" preserveAspectRatio="none" viewBox="0 0 1000 100">
          <path d="M0,50 Q250,90 500,50 T1000,50 L1000,100 L0,100 Z" fill="url(#wave-gradient-1)" opacity="0.5" />
          <path d="M0,70 Q300,30 600,70 T1000,70 L1000,100 L0,100 Z" fill="url(#wave-gradient-2)" opacity="0.8" />
          <defs>
            <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
            <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
          </defs>
        </svg>

        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="flex-1">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-stroke mb-6 shadow-sm">
              <span className={`w-2 h-2 rounded-full ${signalStatus === "success" ? "bg-brand animate-pulse" : "bg-accent"}`} />
              <span className="text-[10px] md:text-xs font-bold text-ink uppercase tracking-widest">
                {heroData.title}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl md:text-5xl font-black text-ink leading-[1.1] tracking-tighter mb-4 max-w-3xl">
              {heroData.metrics.mainInsightHeadline || heroData.subtitle}
            </h1>
            
            <p className="text-base md:text-lg text-slate-600 font-medium mb-8 max-w-2xl leading-relaxed">
              {heroData.description}
            </p>

            {/* Footer info bars */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
              {signalStatus === "success" ? (
                  <div className="flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent px-3 py-1.5 rounded-full">
                    <Clock className="w-3.5 h-3.5" />
                    Señales Continuas
                  </div>
              ) : (
                   <div className="flex items-center gap-2 bg-surface2 border border-stroke text-slate-500 px-3 py-1.5 rounded-full">
                    Recopilando Datos Recientes
                  </div>
              )}
              {heroData.metrics.sampleQualityLabel && (
                  <div className="text-slate-500 border-l border-stroke pl-4">
                    {heroData.metrics.sampleQualityLabel}
                  </div>
              )}
            </div>

            {/* Capa universal de calidad (integrity_score + mass_to_revert) */}
            {(heroData.metrics.integrityLabel || heroData.metrics.massToRevertLabel) && (
              <div className="flex flex-wrap items-center gap-2 mt-4">
                {heroData.metrics.integrityLabel && (
                  <div
                    className="flex items-center gap-1.5 bg-white border border-stroke text-slate-700 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
                    title={`Integridad: ${heroData.metrics.integrityScore ?? "—"}/100. Combina frescura + tamaño efectivo + consistencia.`}
                  >
                    <Shield className="w-3.5 h-3.5 text-brand" />
                    {heroData.metrics.integrityLabel}
                  </div>
                )}
                {heroData.metrics.massToRevertLabel && (
                  <div
                    className="flex items-center gap-1.5 bg-white border border-stroke text-slate-700 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
                    title="Cuántos duelos efectivos tendrían que voltearse para revertir el liderazgo actual."
                  >
                    <Scale className="w-3.5 h-3.5 text-accent" />
                    {heroData.metrics.massToRevertLabel}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="shrink-0 w-full md:w-auto">
             {/* Data highlight box OR fallback */}
             {signalStatus === "success" || signalStatus === "degraded" ? (
                 <div className="bg-white border border-stroke rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center min-w-[240px] shadow-sm">
                   <div className="text-4xl md:text-5xl font-black text-ink tracking-tighter mb-1">
                     {activeSignals.toLocaleString()}
                   </div>
                   <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 text-center">
                     Señales Base<br/>Procesadas
                   </div>
                   {signalStatus === "success" && (
                       <div className="flex items-center gap-1.5 px-3 py-1 bg-brand/10 text-brand rounded-full border border-brand/20 text-xs font-black tracking-wide">
                         <div className="bg-brand rounded-full p-0.5"><TrendingUp className="w-3 h-3 text-white" /></div>
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
