
import { ArrowRight, Sparkles, AlertCircle, Users, Activity, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ResultsCommunitySnapshot } from '../../../read-models/b2c/resultsCommunityTypes';

interface Props {
  footerNarrative?: ResultsCommunitySnapshot['footerNarrative'];
}

export const ResultsWowClosing = ({ footerNarrative }: Props) => {
  const navigate = useNavigate();

  return (
    <section className="w-full py-20 bg-brand text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />
      
      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <Sparkles className="w-12 h-12 text-white/50 mx-auto mb-6" />
        
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-6">
          {footerNarrative?.title || (
            <>La opinión ciudadana <br className="hidden md:block" /> es un mapa en movimiento.</>
          )}
        </h2>
        
        <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
          {footerNarrative?.description || "Sigue explorando señales, evalúa nuevas marcas y ayuda a construir el ecosistema con lectura continua."}
        </p>

        {/* KPIs Narrativos del Footer */}
        {footerNarrative && footerNarrative.metrics && (
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 text-left max-w-3xl mx-auto">
             {footerNarrative.metrics.generationGapLabel && (
                <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2 text-white/60">
                     <Users className="w-4 h-4" />
                     <span className="text-xs font-bold uppercase tracking-wider">Brecha Gen.</span>
                  </div>
                  <div className="font-bold text-white leading-tight">
                    {footerNarrative.metrics.generationGapLabel}
                  </div>
                </div>
             )}
             {footerNarrative.metrics.territoryGapLabel && (
                <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2 text-white/60">
                     <AlertCircle className="w-4 h-4" />
                     <span className="text-xs font-bold uppercase tracking-wider">Territorio</span>
                  </div>
                  <div className="font-bold text-white leading-tight">
                    {footerNarrative.metrics.territoryGapLabel}
                  </div>
                </div>
             )}
             {footerNarrative.metrics.communityActivityLabel && (
                <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2 text-white/60">
                     <Activity className="w-4 h-4" />
                     <span className="text-xs font-bold uppercase tracking-wider">Actividad</span>
                  </div>
                  <div className="font-bold text-white leading-tight">
                    {footerNarrative.metrics.communityActivityLabel}
                  </div>
                </div>
             )}
             {footerNarrative.metrics.sampleQualityLabel && (
                <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2 text-white/60">
                     <CheckCircle2 className="w-4 h-4" />
                     <span className="text-xs font-bold uppercase tracking-wider">Calidad Muestra</span>
                  </div>
                  <div className="font-bold text-white leading-tight">
                    {footerNarrative.metrics.sampleQualityLabel}
                  </div>
                </div>
             )}
           </div>
        )}
        
        <button 
          onClick={() => navigate('/signals')}
          className="inline-flex items-center justify-center bg-white text-brand hover:bg-surface2 font-bold text-lg px-8 py-4 rounded-full shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] transition-all hover:scale-105"
        >
          Explorar Señales <ArrowRight className="ml-2 w-5 h-5" />
        </button>
      </div>
    </section>
  );
};
