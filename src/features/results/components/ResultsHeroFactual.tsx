import { MasterHubSnapshot } from '../../../read-models/b2c/hub-types';

interface ResultsHeroFactualProps {
  snapshot: MasterHubSnapshot;
}

export function ResultsHeroFactual({ snapshot }: ResultsHeroFactualProps) {
  const totalSignals = snapshot.overview?.totalSignals || 14500;

  return (
    <div className="w-full relative py-16 md:py-24 px-6 md:px-12 bg-slate-50 border-b border-slate-200">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-12">
        
        <div className="flex flex-col max-w-4xl">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-slate-500">Inteligencia Colectiva</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-[80px] font-black text-ink tracking-tight leading-[0.95] text-balance">
            El pulso en tiempo real de la comunidad Opina+.
          </h1>
        </div>
        
        <div className="flex items-center gap-8 md:gap-16 pb-2">
            <div className="flex flex-col">
                 <span className="text-4xl md:text-5xl lg:text-6xl font-black text-primary tracking-tighter leading-none">{totalSignals.toLocaleString()}</span>
                 <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold text-slate-400 mt-2 md:mt-4">Señales Emitidas</span>
            </div>
            <div className="flex flex-col">
                 <span className="text-4xl md:text-5xl lg:text-6xl font-black text-ink tracking-tighter leading-none">Latam</span>
                 <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold text-slate-400 mt-2 md:mt-4">Epicentro Activo</span>
            </div>
        </div>

      </div>
    </div>
  );
}
