import { MasterHubSnapshot } from '../../../read-models/b2c/hub-types';
import { Target, Clock, Globe2, ChevronDown } from 'lucide-react';

interface ResultsHeroFactualProps {
  snapshot: MasterHubSnapshot;
}

export function ResultsHeroFactual({ snapshot }: ResultsHeroFactualProps) {
  // Datos Factuales (Mock para UX/UI, en el futuro vendrán del backend)
  const factualNumber = 78;
  const factualText = "de la comunidad prioriza la experiencia local frente a opciones globales.";
  const timeFrame = "Últimos 7 días";
  const segment = "Comunidad Global";

  return (
    <div className="w-full flex flex-col justify-center min-h-[40vh] lg:min-h-[45vh] relative mb-12 lg:mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-5xl mx-auto w-full">
        {/* Titular Vivo Editorial */}
        <div className="flex flex-col mb-10 pt-8 lg:pt-12">
            <h1 className="text-[120px] md:text-[160px] leading-[0.8] tracking-tighter font-black text-ink mb-6 flex items-baseline">
              {factualNumber}<span className="text-6xl md:text-8xl text-primary -ml-2">%</span>
            </h1>
            <p className="text-3xl md:text-[42px] lg:text-[56px] font-black leading-[1.05] tracking-tight text-balance max-w-3xl text-ink">
              {factualText}
            </p>
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
