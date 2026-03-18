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
    <div className="w-full relative min-h-[50vh] lg:min-h-[60vh] flex flex-col justify-center overflow-hidden mb-16 lg:mb-24 bg-white">
      {/* Fondo de ruido o malla sutil */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_center,black_1px,transparent_1px)] bg-[length:24px_24px] pointer-events-none"></div>

      <div className="w-full flex flex-col lg:flex-row items-center lg:items-stretch h-full">
        
        {/* Lado Izquierdo: Porcentaje Titánico Sangrado */}
        <div className="w-full lg:w-1/2 flex items-center justify-start lg:justify-end relative lg:pr-12 pt-16 lg:pt-0 overflow-hidden lg:overflow-visible">
            <h1 className="text-[180px] md:text-[240px] lg:text-[280px] xl:text-[340px] leading-[0.75] tracking-tighter font-black text-ink flex items-start -ml-8 lg:-ml-0 relative z-10 select-none">
              {factualNumber}
              <span className="text-7xl md:text-9xl lg:text-[140px] text-primary mt-4 md:mt-8 -ml-4 lg:-ml-8">%</span>
            </h1>
        </div>

        {/* Lado Derecho: Frase Factual y Métricas */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 lg:px-12 pb-16 pt-8 lg:py-0 relative z-20">
            <p className="text-2xl md:text-4xl lg:text-[44px] xl:text-[52px] font-black leading-[1.05] tracking-tight text-ink max-w-[90%] lg:max-w-[800px] text-balance mb-8">
              {factualText}
            </p>

            <div className="flex flex-wrap items-center gap-3">
               <div className="flex items-center gap-2 px-4 py-2 bg-surface2 rounded-xl text-[11px] font-bold text-ink uppercase tracking-wider">
                 <Target className="w-4 h-4 text-primary" />
                 <span>{snapshot.overview?.totalSignals || 14500} señales</span>
               </div>
               <div className="flex items-center gap-2 px-4 py-2 bg-surface2 rounded-xl text-[11px] font-bold text-ink uppercase tracking-wider">
                 <Clock className="w-4 h-4 text-primary" />
                 <span>{timeFrame}</span>
               </div>
               <div className="flex items-center gap-2 px-4 py-2 bg-surface2 rounded-xl text-[11px] font-bold text-ink uppercase tracking-wider">
                 <Globe2 className="w-4 h-4 text-primary" />
                 <span>{segment}</span>
               </div>
            </div>
        </div>
      </div>

      {/* Call-to-Scroll */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce opacity-40">
        <ChevronDown className="w-8 h-8 text-ink" />
      </div>
    </div>
  );
}
