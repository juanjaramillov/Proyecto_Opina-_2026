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
      <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50 rounded-l-[100px] opacity-50 -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16">
          <div>
            <span className="inline-block mb-4 border border-slate-200 text-slate-500 rounded-full px-4 py-1 uppercase tracking-widest text-xs font-semibold">
               ANÁLISIS DE PROFUNDIDAD
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">
              La radiografía de la calidad
            </h2>
            <p className="text-xl text-slate-500 max-w-xl">
              Lo que la comunidad realmente valora y lo que más critican al evaluar a fondo sus marcas favoritas.
            </p>
          </div>
          <button className="flex items-center justify-center mt-6 md:mt-0 rounded-full font-semibold px-6 py-2 border border-slate-200 hover:bg-slate-50 transition-colors" disabled>
            Ver Detalles <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        </div>

        {availability === "success" || availability === "degraded" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Main Insight / Hero Metric */}
            <div className="lg:col-span-4 border-0 shadow-xl shadow-brand-primary/5 bg-gradient-to-br from-indigo-50/50 to-indigo-100/30 overflow-hidden rounded-3xl relative p-8 flex flex-col justify-center min-h-[300px]">
               <div className="absolute top-0 left-0 w-full h-2 bg-brand-primary" />
               <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-6">
                 <Star className="w-6 h-6 text-brand-primary fill-brand-primary/20" />
               </div>
               <h3 className="text-sm font-black text-indigo-900 uppercase tracking-widest mb-2">Entidad Mejor Evaluada</h3>
               <div className="text-3xl font-black text-slate-900 leading-tight mb-4">
                 {metrics.bestRatedEntity || "Evaluando..."}
               </div>
               
               {metrics.npsLeaderEntity && (
                   <div className="mt-auto bg-white/60 p-4 rounded-2xl border border-indigo-100">
                     <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                       Líder en Recomendación (NPS)
                     </div>
                     <div className="font-bold text-slate-800 flex items-center gap-2">
                       <TrendingUp className="w-4 h-4 text-emerald-500" />
                       {metrics.npsLeaderEntity}
                     </div>
                   </div>
               )}
            </div>

            {/* Strengths & Weaknesses Detailed View */}
            <div className="lg:col-span-8 grid sm:grid-cols-2 gap-6">
               <div className="border border-slate-100 shadow-xl shadow-emerald-900/5 bg-white overflow-hidden rounded-3xl relative h-full flex flex-col">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-emerald-500" />
                  <div className="p-8 flex-grow flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Principal Fortaleza</h3>
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-0.5">Lo que más celebran</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 p-6 text-center">
                       <div className="text-3xl font-black text-slate-800">
                         {metrics.topStrengthAttribute || "No determinado"}
                       </div>
                       {metrics.qualityPerceptionLabel && (
                           <div className="text-sm font-medium text-slate-600 mt-3 pt-3 border-t border-emerald-100 italic">
                             "{metrics.qualityPerceptionLabel}"
                           </div>
                       )}
                    </div>
                  </div>
               </div>

               <div className="border border-slate-100 shadow-xl shadow-amber-900/5 bg-white overflow-hidden rounded-3xl relative h-full flex flex-col">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-amber-500" />
                  <div className="p-8 flex-grow flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Principal Fricción</h3>
                        <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mt-0.5">La debilidad más frecuente</p>
                      </div>
                    </div>

                    <div className="mt-4 bg-orange-50/50 rounded-2xl border border-orange-100 p-6 text-center">
                       <div className="text-3xl font-black text-slate-800">
                         {metrics.topPainAttribute || "No determinado"}
                       </div>
                       {metrics.worstRatedEntity && (
                           <div className="text-[11px] font-bold text-orange-700 bg-orange-100/50 inline-block px-3 py-1.5 rounded-full mt-4 border border-orange-200">
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
