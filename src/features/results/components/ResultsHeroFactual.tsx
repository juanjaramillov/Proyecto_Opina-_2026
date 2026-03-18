import { MasterHubSnapshot } from '../../../read-models/b2c/hub-types';

interface ResultsHeroFactualProps {
  snapshot: MasterHubSnapshot;
}

export function ResultsHeroFactual({ snapshot }: ResultsHeroFactualProps) {
  const factualNumber = 82;
  const factualText = "Alta sintonía con la red. Tu perfil refleja un fuerte consenso con la mayoría activa.";

  return (
    <div className="w-full relative min-h-[60vh] md:min-h-[70vh] flex flex-col justify-center overflow-hidden bg-white">
      {/* Container that breaks normal bounds */}
      <div className="w-full flex flex-col md:flex-row items-center h-full relative z-10 pt-20 pb-16">
        
        {/* Massive Number Bleeding Off Left */}
        <div className="w-full md:w-[60%] flex items-center justify-start relative">
            <h1 
               className="text-[55vw] md:text-[350px] lg:text-[450px] font-black tracking-tighter leading-[0.75] text-ink -ml-[8vw] select-none"
               style={{ letterSpacing: '-0.08em' }}
            >
              {factualNumber}<span className="text-[25vw] md:text-[150px] lg:text-[200px] text-primary -ml-[2vw]">%</span>
            </h1>
        </div>

        {/* Floating Context Text */}
        <div className="w-full md:w-[40%] px-6 md:px-12 md:-ml-12 mt-12 md:mt-0 relative z-20">
            <p className="text-4xl md:text-5xl lg:text-[64px] font-black leading-[0.9] tracking-tight text-ink text-balance">
              {factualText}
            </p>
            <div className="mt-12 flex gap-6">
               <div className="flex flex-col">
                 <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400">Volumen</span>
                 <span className="text-sm font-black text-ink">{snapshot.overview?.totalSignals || 14500} Señales</span>
               </div>
               <div className="flex flex-col">
                 <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400">Contexto</span>
                 <span className="text-sm font-black text-ink">Comunidad Global</span>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
}
