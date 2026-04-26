import { TrendingUp, ArrowRight, ShieldCheck, AlertTriangle, Star } from 'lucide-react';
import { ResultsCommunitySnapshot } from "../../../read-models/b2c/resultsCommunityTypes";
import { MetricAvailabilityCard } from "../../../components/ui/MetricAvailabilityCard";

interface Props {
  depthData: ResultsCommunitySnapshot["blocks"]["depth"];
}

export const ResultsDepthBlock = ({ depthData }: Props) => {
  if (!depthData.visible || depthData.availability === "disabled") return null;

  const { metrics, availability } = depthData;

  return (
    <section className="w-full py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-surface2 rounded-l-[100px] opacity-50 -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16">
          <div>
            <span className="inline-block mb-4 border border-stroke text-slate-500 rounded-full px-4 py-1 uppercase tracking-widest text-xs font-semibold">
               ANÁLISIS DE PROFUNDIDAD
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-ink tracking-tight leading-none mb-4">
              La radiografía de la calidad
            </h2>
            <p className="text-xl text-slate-500 max-w-xl">
              Lo que la comunidad realmente valora y lo que más critican al evaluar a fondo sus marcas favoritas.
            </p>
          </div>
          <button className="flex items-center justify-center mt-6 md:mt-0 rounded-full font-semibold px-6 py-2 border border-stroke hover:bg-surface2 transition-colors" disabled>
            Ver Detalles <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        </div>

        {availability === "success" || availability === "degraded" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Main Insight / Hero Metric */}
            <div className="lg:col-span-4 border-0 shadow-xl shadow-brand/5 bg-gradient-to-br from-brand/5 to-brand/10 overflow-hidden rounded-3xl relative p-8 flex flex-col justify-center min-h-[300px]">
               <div className="absolute top-0 left-0 w-full h-2 bg-brand" />
               <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center mb-6">
                 <Star className="w-6 h-6 text-brand fill-brand/20" />
               </div>
               <h3 className="text-sm font-black text-ink uppercase tracking-widest mb-2">Entidad Mejor Evaluada</h3>
               <div className="text-3xl font-black text-ink leading-tight mb-4">
                 {metrics.bestRatedEntity || "Evaluando..."}
               </div>
               
               {metrics.npsLeaderEntity && (
                   <div className="mt-auto bg-white/60 p-4 rounded-2xl border border-brand/20">
                     <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                       Líder en Recomendación (NPS)
                     </div>
                     <div className="font-bold text-ink flex items-center gap-2">
                       <TrendingUp className="w-4 h-4 text-accent" />
                       {metrics.npsLeaderEntity}
                     </div>
                   </div>
               )}
            </div>

            {/* Strengths & Weaknesses Detailed View */}
            <div className="lg:col-span-8 grid sm:grid-cols-2 gap-6">
               <div className="border border-stroke shadow-xl shadow-accent/5 bg-white overflow-hidden rounded-3xl relative h-full flex flex-col">
                  <div className="absolute top-0 left-0 w-full h-2 bg-accent" />
                  <div className="p-8 flex-grow flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-ink">Principal Fortaleza</h3>
                        <p className="text-xs font-bold text-accent uppercase tracking-widest mt-0.5">Lo que más celebran</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 bg-accent/5 rounded-2xl border border-accent/20 p-6 text-center">
                       <div className="text-3xl font-black text-ink">
                         {metrics.topStrengthAttribute || "No determinado"}
                       </div>
                       {metrics.qualityPerceptionLabel && (
                           <div className="text-sm font-medium text-slate-500 mt-3 pt-3 border-t border-accent/20 italic">
                             "{metrics.qualityPerceptionLabel}"
                           </div>
                       )}
                    </div>
                  </div>
               </div>

               <div className="border border-stroke shadow-sm bg-white overflow-hidden rounded-3xl relative h-full flex flex-col">
                  <div className="absolute top-0 left-0 w-full h-2 bg-text-muted/20" />
                  <div className="p-8 flex-grow flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-surface2 flex items-center justify-center shrink-0 border border-stroke">
                        <AlertTriangle className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-ink">Principal Fricción</h3>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">La debilidad más frecuente</p>
                      </div>
                    </div>

                    <div className="mt-4 bg-surface2 rounded-2xl border border-stroke p-6 text-center">
                       <div className="text-3xl font-black text-ink">
                         {metrics.topPainAttribute || "No determinado"}
                       </div>
                       {metrics.worstRatedEntity && (
                           <div className="text-[11px] font-bold text-ink bg-white inline-block px-3 py-1.5 rounded-full mt-4 border border-stroke shadow-sm">
                             Más acentuado en: {metrics.worstRatedEntity}
                           </div>
                       )}
                    </div>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="py-12 flex items-center justify-center">
             <MetricAvailabilityCard 
                label="ANÁLISIS PROFUNDO" 
                status="insufficient_data" 
                helperText="Se requieren más evaluaciones con atributos clave para generar el perfil detallado de experiencia."
             />
          </div>
        )}
      </div>
    </section>
  );
};
