import { MessageCircle, Flame, Users, Zap, AlertTriangle, TrendingUp } from 'lucide-react';
import { ResultsCommunitySnapshot } from "../../../read-models/b2c/resultsCommunityTypes";
import { MetricAvailabilityCard } from "../../../components/ui/MetricAvailabilityCard";

interface Props {
  newsData: ResultsCommunitySnapshot["blocks"]["news"];
}

export const ResultsNewsBlock = ({ newsData }: Props) => {
  if (!newsData.visible || newsData.availability === "disabled") return null;

  const { metrics, availability } = newsData;

  const hasAnyTopic = metrics.hotTopicTitle || metrics.topicWithMostConsensus || metrics.topicWithMostDivision || metrics.fastestReactionTopic;

  return (
    <section className="w-full py-24 bg-surface2 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
             <span className="inline-block mb-4 border border-stroke text-slate-500 rounded-full px-4 py-1 uppercase tracking-widest text-xs font-semibold">
                EL PULSO DE LA ACTUALIDAD
             </span>
             {/* V17 · animate-pulse removido del Flame icon (cliché breaking news) */}
             <h2 className="text-4xl md:text-5xl font-black text-ink tracking-tight leading-none mb-4 flex items-center gap-4">
                Lo que está en debate <Flame className="w-10 h-10 text-brand" />
             </h2>
             <p className="text-lg text-slate-500 max-w-xl">
                Temas de discusión activa, qué une a la comunidad y qué genera mayor división hoy.
             </p>
          </div>
          <button className="hidden md:flex items-center justify-center text-slate-500 hover:text-ink font-semibold gap-2 py-2 px-4 transition-colors" disabled>
            Ver todas las opiniones <TrendingUp className="w-4 h-4" />
          </button>
        </div>

        {availability === "success" || (availability === "degraded" && hasAnyTopic) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Tema del Momento */}
              {metrics.hotTopicTitle && (
                  <div className="group p-8 border border-brand/20 shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl bg-white relative overflow-hidden flex flex-col justify-between">
                     <div className="absolute top-0 left-0 w-full h-1.5 bg-brand" />
                     <div>
                       <div className="flex justify-between items-start mb-6">
                         <span className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-black uppercase tracking-wider bg-brand/10 text-brand border border-brand/20">
                           Tema Más Candente
                         </span>
                         {metrics.hotTopicHeatIndex && (
                             /* V17 · emoji 🔥 decorativo eliminado · queda métrica limpia */
                             <span className="text-xs font-bold text-slate-500">
                               {metrics.hotTopicHeatIndex} interacciones
                             </span>
                         )}
                       </div>
                       <h3 className="text-2xl font-black text-ink mb-3 leading-tight group-hover:text-brand transition-colors">
                         {metrics.hotTopicTitle}
                       </h3>
                       {metrics.hotTopicPolarizationLabel && (
                           <p className="text-sm font-bold text-slate-500 flex items-center gap-2">
                             <MessageCircle className="w-4 h-4 text-slate-500" />
                             {metrics.hotTopicPolarizationLabel}
                           </p>
                       )}
                     </div>
                  </div>
              )}

              {/* Tema de Mayor Consenso */}
              {metrics.topicWithMostConsensus && (
                  <div className="group p-8 border border-accent/20 shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl bg-white relative overflow-hidden flex flex-col justify-between">
                     <div className="absolute top-0 left-0 w-full h-1.5 bg-accent" />
                     <div>
                       <div className="flex justify-between items-start mb-6">
                         <span className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-black uppercase tracking-wider bg-accent/10 text-accent border border-accent/20 gap-1.5">
                           <Users className="w-3.5 h-3.5" /> Mayor Consenso
                         </span>
                       </div>
                       <h3 className="text-xl font-bold text-ink mb-3 leading-tight group-hover:text-accent transition-colors">
                         {metrics.topicWithMostConsensus}
                       </h3>
                       <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                         La gran mayoría opina igual sobre este tema.
                       </p>
                     </div>
                  </div>
              )}

              {/* Tema de Mayor División */}
              {metrics.topicWithMostDivision && (
                  <div className="group p-8 border border-stroke shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl bg-white relative overflow-hidden flex flex-col justify-between">
                     <div className="absolute top-0 left-0 w-full h-1.5 bg-text-muted/20" />
                     <div>
                       <div className="flex justify-between items-start mb-6">
                         <span className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-black uppercase tracking-wider bg-surface2 text-slate-500 border border-stroke gap-1.5">
                           <AlertTriangle className="w-3.5 h-3.5" /> Mayor División
                         </span>
                       </div>
                       <h3 className="text-xl font-bold text-ink mb-3 leading-tight group-hover:text-ink transition-colors">
                         {metrics.topicWithMostDivision}
                       </h3>
                       <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                         Comunidad polarizada, nadie se pone de acuerdo.
                       </p>
                     </div>
                  </div>
              )}

              {/* Reacción Más Rápida */}
              {metrics.fastestReactionTopic && (
                  <div className="group p-8 border border-brand/20 shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl bg-white relative overflow-hidden flex flex-col justify-between md:col-span-2 lg:col-span-1">
                     <div className="absolute top-0 left-0 w-full h-1.5 bg-brand" />
                     <div>
                       <div className="flex justify-between items-start mb-6">
                         <span className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-black uppercase tracking-wider bg-brand/10 text-brand border border-brand/20 gap-1.5">
                           <Zap className="w-3.5 h-3.5" /> Reacción Inmediata
                         </span>
                       </div>
                       <h3 className="text-xl font-bold text-ink mb-3 leading-tight group-hover:text-brand transition-colors">
                         {metrics.fastestReactionTopic}
                       </h3>
                       <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                         La noticia que hizo reaccionar a todos más rápido.
                       </p>
                     </div>
                  </div>
              )}
            </div>
        ) : (
            <div className="py-12 flex items-center justify-center">
               <MetricAvailabilityCard 
                  label="ACTUALIDAD EN PROCESO" 
                  status="insufficient_data" 
                  helperText="Monitoreando señales en vivo. Cuando haya un tema candente de actualidad aparecerá aquí."
               />
            </div>
        )}
        
        <button className="flex w-full mt-8 md:hidden items-center justify-center text-slate-500 font-semibold gap-2 py-2 transition-colors">
          Ver todas las opiniones <TrendingUp className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};
