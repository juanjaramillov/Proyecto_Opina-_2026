import { Layers, Trophy, AlertCircle, Activity, TrendingUp } from "lucide-react";
import { ResultsCommunitySnapshot } from "../../../read-models/b2c/resultsCommunityTypes";
import { MetricAvailabilityCard } from "../../../components/ui/MetricAvailabilityCard";

interface Props {
  tournamentData: ResultsCommunitySnapshot["blocks"]["tournament"];
}

export function ResultsTournamentBlock({ tournamentData }: Props) {
  if (!tournamentData.visible || tournamentData.availability === "disabled") return null;

  const { metrics, availability } = tournamentData;

  return (
    <section className="w-full max-w-6xl mx-auto px-4 mt-8">
      <div className="w-full bg-white rounded-4xl border border-stroke shadow-glass overflow-hidden flex relative">
      
      {/* Decorative Left Border */}
      <div className="w-1.5 h-full bg-brand absolute left-0 top-0 bottom-0" />
      
      {/* Top Left Icon Container */}
      <div className="absolute left-6 top-6 w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
        <Layers className="w-5 h-5 text-brand" />
      </div>

      <div className="w-full p-6 md:p-8 md:pl-[5.5rem] pl-20 relative flex flex-col">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 w-full border-b border-stroke pb-6 mb-6">
           <div>
             <div className="text-[10px] font-black text-brand uppercase tracking-[0.2em] mb-1">
               ANÁLISIS DE TORNEOS DE MARCA
             </div>
             <div className="flex flex-wrap items-center gap-3 mb-2">
               <h2 className="text-2xl md:text-3xl font-black text-ink tracking-tight leading-none">
                 El campeón invicto actual
               </h2>
               {availability === "success" && (
                   /* V17 · animate-pulse removido (cliché) · pill estática · accent semántico */
                   <span className="px-1.5 py-0.5 bg-accent text-white rounded text-[9px] font-black uppercase tracking-wider shadow-sm">
                     Dominante
                   </span>
               )}
             </div>
             <p className="text-sm md:text-base font-medium text-slate-500 leading-relaxed">
               Resultados del análisis progresivo de preferencias 1 a 1 de la comunidad.
             </p>
           </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          
          {/* Col 1: Líder actual ( spans 4 ) */}
          <div className="lg:col-span-6 flex flex-col">
             <div className="mb-4">
                <h3 className="text-sm font-black text-ink">Ganador del Torneo</h3>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mt-0.5">La opción que superó todas las rondas</p>
             </div>
             
             {availability === "success" || availability === "degraded" ? (
                 <div className="relative bg-surface2 border border-stroke rounded-2xl p-6 flex flex-col items-center justify-center text-center h-full shadow-sm overflow-hidden group">
                   <div className="absolute inset-0 bg-white/40 blur-xl group-hover:bg-white/60 transition-colors" />
                   <div className="relative z-10 flex flex-col items-center">
                     <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                       <Trophy className="w-6 h-6 text-brand" />
                     </div>
                     <div className="font-black text-xl text-ink flex flex-col items-center justify-center gap-1 mb-1 leading-tight">
                       {metrics.currentChampionEntity || "Calculando..."}
                       {metrics.championStabilityLabel && (
                           <span className="px-1.5 py-0.5 mt-1 bg-accent/10 text-accent rounded text-[9px] uppercase tracking-widest font-black flex items-center gap-1">
                             <TrendingUp className="w-3 h-3" /> {metrics.championStabilityLabel}
                           </span>
                       )}
                     </div>
                     <div className="text-[10px] font-bold text-brand mt-2">Coronado por la mayoría</div>
                   </div>
                 </div>
             ) : (
                 <div className="h-full flex items-center justify-center">
                   <MetricAvailabilityCard 
                      label="TORNEO EN PROCESO" 
                      status="insufficient_data" 
                      helperText="No se han completado suficientes cruces 1 a 1 para coronar un campeón."
                   />
                 </div>
             )}
          </div>

          {/* Col 2: Contexto Competitivo ( spans 6 ) */}
          <div className="lg:col-span-6 flex flex-col">
             <div className="mb-4">
                <h3 className="text-sm font-black text-ink">Contexto Competitivo</h3>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mt-0.5">Detalles estadísticos del camino a la victoria</p>
             </div>
             
             <div className="flex flex-col gap-3 justify-center h-full">
                {availability === "success" || availability === "degraded" ? (
                    <>
                      {metrics.mostDifficultPathEntity && (
                          <div className="bg-surface2 border border-stroke rounded-xl p-4 flex items-start gap-3">
                            <div className="p-1.5 bg-brand/10 text-brand rounded shrink-0">
                              <Activity className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-sm font-black text-ink leading-tight">Rivales Difíciles</div>
                              <div className="text-[11px] font-medium text-slate-500 mt-1">El camino más difícil fue superado por <strong>{metrics.mostDifficultPathEntity}</strong>.</div>
                            </div>
                          </div>
                      )}

                      {metrics.upsetRateLabel && (
                          <div className="bg-surface2 border border-stroke rounded-xl p-4 flex items-start gap-3">
                            <div className="p-1.5 bg-stroke/50 text-slate-500 rounded shrink-0">
                              <AlertCircle className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-sm font-black text-ink leading-tight">Nivel de Sorpresas</div>
                              <div className="text-[11px] font-medium text-slate-500 mt-1">{metrics.upsetRateLabel}</div>
                            </div>
                          </div>
                      )}
                      
                      {!metrics.mostDifficultPathEntity && !metrics.upsetRateLabel && (
                          <div className="text-xs text-slate-500 italic">
                            Evaluando desempeño histórico comparativo de las batallas...
                          </div>
                      )}
                    </>
                ) : (
                     <div className="h-full flex items-center justify-center">
                       <MetricAvailabilityCard 
                          label="VOLATILIDAD" 
                          status="pending" 
                          helperText="Calculando el índice de sorpresas en el bracket actual."
                       />
                     </div>
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
    </section>
  );
}
