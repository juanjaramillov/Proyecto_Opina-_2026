import { MasterHubSnapshot } from '../../../read-models/b2c/hub-types';
import { Target, Clock, Globe2, ChevronDown } from 'lucide-react';

interface ResultsHeroFactualProps {
  snapshot: MasterHubSnapshot;
}

export function ResultsHeroFactual({ snapshot }: ResultsHeroFactualProps) {
  // Datos Factuales (Mock para UX/UI, en el futuro vendrán del backend)
  const factualTitle = "78% de la comunidad prioriza la experiencia local frente a opciones globales.";
  const factualNumber = 78;
  const timeFrame = "Últimos 7 días";
  const segment = "Comunidad Global";

  return (
    <div className="w-full flex flex-col justify-center min-h-[40vh] lg:min-h-[35vh] relative mb-12 lg:mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-5xl">
        {/* Titular Vivo y Sustento Visual */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8 pt-8 lg:pt-4">
          {/* Mini-gráfico limpio */}
          <div className="shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-full border-[6px] border-stroke relative flex items-center justify-center bg-white shadow-sm">
             <svg className="absolute inset-0 w-full h-full -rotate-90">
               <circle 
                  cx="50%" cy="50%" r="42%" 
                  fill="transparent" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  className="text-primary" 
                  strokeDasharray="264" 
                  strokeDashoffset={264 - (264 * factualNumber) / 100} 
                  strokeLinecap="round" 
               />
             </svg>
             <span className="text-2xl md:text-3xl font-black text-ink tracking-tighter">{factualNumber}%</span>
          </div>

          {/* Titular Factual */}
          <h1 className="text-3xl md:text-4xl lg:text-[42px] font-black text-ink leading-[1.1] tracking-tight text-balance">
            {factualTitle}
          </h1>
        </div>

        {/* Métricas de Confianza (Row inferior) */}
        <div className="flex flex-wrap items-center gap-3">
           <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-stroke rounded-lg text-[11px] font-bold text-text-secondary uppercase tracking-wider">
             <Target className="w-3.5 h-3.5 text-primary" />
             <span>{snapshot.overview?.totalSignals || 14500} señales</span>
           </div>
           <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-stroke rounded-lg text-[11px] font-bold text-text-secondary uppercase tracking-wider">
             <Clock className="w-3.5 h-3.5 text-primary" />
             <span>{timeFrame}</span>
           </div>
           <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-stroke rounded-lg text-[11px] font-bold text-text-secondary uppercase tracking-wider">
             <Globe2 className="w-3.5 h-3.5 text-primary" />
             <span>{segment}</span>
           </div>
        </div>
      </div>

      {/* Call-to-Scroll Minimalista */}
      <div className="absolute -bottom-8 lg:-bottom-12 left-0 right-0 flex justify-center lg:justify-start lg:ml-2">
        <div className="flex flex-col items-center gap-1 animate-bounce opacity-50">
           <ChevronDown className="w-6 h-6 text-ink" />
        </div>
      </div>
    </div>
  );
}
