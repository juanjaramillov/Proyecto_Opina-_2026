import { Zap, Trophy, Swords } from "lucide-react";
import { ResultsCommunitySnapshot } from "../../../read-models/b2c/resultsCommunityTypes";
import { MetricAvailabilityCard } from "../../../components/ui/MetricAvailabilityCard";
import { SignalNode } from "../../../components/ui/foundation";

interface Props {
  versusData: ResultsCommunitySnapshot["blocks"]["versus"];
}

export function ResultsVersusBlock({ versusData }: Props) {
  if (!versusData.visible || versusData.availability === "disabled") return null;

  const { metrics, availability } = versusData;

  return (
    <section className="w-full bg-white text-ink border-t border-stroke mt-12 py-16 px-4 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      <div className="w-full max-w-6xl mx-auto relative z-10 flex flex-col">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stroke pb-8 mb-10">
           <div className="max-w-2xl">
             <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
                 <Zap className="w-5 h-5 text-brand" />
               </div>
               <span className="text-[10px] font-black text-brand uppercase tracking-[0.2em] bg-brand/5 px-3 py-1 rounded-full border border-brand/10">
                 QUÉ ESTÁ ELIGIENDO LA GENTE
               </span>
             </div>
             <h2 className="text-3xl md:text-5xl font-black text-ink tracking-tight leading-none mb-4">
               Decisiones de Compra
             </h2>
             <p className="text-base md:text-xl font-medium text-slate-600 leading-relaxed">
               Qué factores están haciendo que las personas elijan una opción sobre otra hoy mismo.
             </p>
           </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          
          {/* Left Col: Dominio Conceptos (Cols 1 to 5) */}
          <div className="lg:col-span-5 flex flex-col">
             <div className="mb-8 flex items-center gap-3">
                <Trophy className="w-5 h-5 text-brand" />
                <div>
                  <h3 className="text-xl font-black text-ink leading-none">Líder en Tendencia</h3>
                  <p className="text-xs font-medium text-slate-600 mt-1">Lo que la mayoría de compradores prefiere</p>
                </div>
             </div>

             <div className="space-y-8 flex-1">
               {availability === "success" || availability === "degraded" ? (
                 <>
                   {/* Item 1 */}
                   {metrics.leaderEntityName && (
                     <div>
                       <div className="flex justify-between items-end mb-2">
                          <div className="flex items-center gap-2">
                             <span className="text-4xl font-black text-brand tracking-tighter leading-none">1</span>
                             <div className="flex flex-col">
                               <span className="font-black text-ink text-lg leading-none">{metrics.leaderEntityName}</span>
                               <span className="text-[10px] flex items-center gap-1 text-accent uppercase tracking-widest font-bold mt-1">
                                 {metrics.dominantChoiceLabel || "Tendencia Fuerte"}
                               </span>
                             </div>
                          </div>
                          {metrics.preferenceShareLeader && (
                             <div className="font-black text-3xl text-ink tracking-tighter">{metrics.preferenceShareLeader}</div>
                          )}
                       </div>
                       <div className="h-4 w-full bg-surface2 rounded-full overflow-hidden shadow-inner">
                          <div className="h-full bg-brand rounded-full shadow-[0_0_10px_rgba(37,99,235,0.3)]" style={{ width: metrics.preferenceShareLeader || '100%' }} />
                       </div>
                     </div>
                   )}

                   {/* Insight Box */}
                   {(metrics.mostContestedCategory || metrics.fragmentationLabel) && (
                     <div className="w-full bg-surface2 border border-stroke rounded-2xl p-5 mt-8 backdrop-blur-md">
                       <div className="flex gap-3 items-start">
                         {/* V17 · dot decorativo con shadow → SignalNode validated · marca insight defendible */}
                         <div className="mt-1 shrink-0">
                           <SignalNode state="validated" size="sm" />
                         </div>
                         <p className="text-sm font-medium text-slate-600">
                           <strong className="text-ink font-black">{metrics.mostContestedCategory || "Disputa Actual"}:</strong> {metrics.fragmentationLabel}
                         </p>
                       </div>
                     </div>
                   )}

                   {/* Calidad estadística del líder (capa universal) */}
                   {metrics.sampleQuality && (metrics.sampleQuality.nEff != null || metrics.sampleQuality.freshnessHours != null) && (
                     <div className="flex flex-wrap items-center gap-2 mt-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">
                       {metrics.sampleQuality.nEff != null && metrics.sampleQuality.nEff > 0 && (
                         <span className="px-2.5 py-1 bg-slate-100 rounded-full" title="Tamaño efectivo de muestra">
                           {metrics.sampleQuality.nEff} duelos efectivos
                         </span>
                       )}
                       {metrics.sampleQuality.freshnessHours != null && (
                         <span className="px-2.5 py-1 bg-slate-100 rounded-full" title="Antigüedad del último dato agregado">
                           hace {metrics.sampleQuality.freshnessHours}h
                         </span>
                       )}
                       {metrics.sampleQuality.qualityLabel && (
                         <span className="px-2.5 py-1 bg-accent-100 text-accent-700 rounded-full">
                           {metrics.sampleQuality.qualityLabel}
                         </span>
                       )}
                     </div>
                   )}
                 </>
               ) : (
                 <MetricAvailabilityCard 
                    label="PROCESANDO TENDENCIAS" 
                    status="insufficient_data" 
                    helperText="Aún no hay suficiente distancia estadística para definir un líder claro en esta ventana de tiempo."
                 />
               )}
             </div>
          </div>

          {/* Right Col: Duelos Conceptuales (Cols 6 to 12) */}
          <div className="lg:col-span-7 flex flex-col">
             <div className="mb-8 flex items-center gap-3">
                <Swords className="w-5 h-5 text-brand" />
                <div>
                  <h3 className="text-xl font-black text-ink leading-none">Dinámicas de la Categoría</h3>
                  <p className="text-xs font-medium text-slate-600 mt-1">Fragmentaciones y tensiones detectadas</p>
                </div>
             </div>

             <div className="flex flex-col gap-4">
                <div className="relative w-full bg-surface2 border border-stroke rounded-4xl p-6 md:p-8 overflow-hidden flex flex-col items-center justify-center text-center">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-brand/5 blur-[50px] pointer-events-none" />
                  
                  <MetricAvailabilityCard 
                    label="DUELOS Y FRAGMENTACIÓN" 
                    status="pending" 
                    helperText="Calculando interacciones cruzadas y tensiones de marca. Requiere más volumen de batallas serializadas para asegurar confianza estadística."
                  />
                </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}
