import { MasterHubSnapshot } from '../../../read-models/b2c/hub-types';
import { Zap, Activity, CheckCircle2, SplitSquareHorizontal } from 'lucide-react';

interface ResultsHeroFactualProps {
  snapshot: MasterHubSnapshot;
}

export function ResultsHeroFactual({ snapshot }: ResultsHeroFactualProps) {
  const total = snapshot.overview?.totalSignals || 0;
  
  // Mocks para visualización B2C basada en la propuesta V3.
  const isFiltered = snapshot.cohortState.isFiltered;
  const consensusTopic = isFiltered ? "Tu Segmento" : "la Comunidad";
  const consensusPercent = 89;
  
  const polarTopic = "Home Office vs Oficina";
  const polarLeft = 52;
  const polarRight = 48;

  return (
    <div className="w-full bg-slate-50 pt-32 pb-16 relative overflow-hidden border-b border-slate-200">
      
      {/* Background sutil */}
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-white to-transparent pointer-events-none"></div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header simple y directo */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] text-balance">
                    El Pulso de {consensusTopic}
                </h1>
                <p className="text-lg text-slate-500 font-medium mt-4 max-w-2xl">
                    Descubre los consensos absolutos y las mayores fracturas en la inteligencia colectiva hoy.
                </p>
            </div>
            
            <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm shrink-0">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-indigo-500 animate-pulse" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Señales Activas</span>
                    <span className="text-xl font-black text-slate-900 leading-none">{total}</span>
                </div>
            </div>
        </div>

        {/* Grid de Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. El Gran Consenso */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col group hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-emerald-50 w-12 h-12 rounded-2xl flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">Gran Consenso</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight">Trabajo Remoto 4 Días</h3>
                <p className="text-sm text-slate-500 font-medium mb-6 flex-grow">La comunidad avala contundentemente esta postura.</p>
                
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                        <span className="text-4xl font-black text-emerald-500">{consensusPercent}%</span>
                        <span className="text-xs font-bold text-slate-400 uppercase">Aprobación</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${consensusPercent}%` }}></div>
                    </div>
                </div>
            </div>

            {/* 2. La Gran Polarización */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col group hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-rose-50 w-12 h-12 rounded-2xl flex items-center justify-center">
                        <SplitSquareHorizontal className="w-6 h-6 text-rose-500" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-rose-600">Alta Tensión</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight">{polarTopic}</h3>
                <p className="text-sm text-slate-500 font-medium mb-6 flex-grow">La dicotomía que más divide las opiniones hoy.</p>
                
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between text-lg font-black">
                        <span className="text-indigo-600">{polarLeft}%</span>
                        <span className="text-rose-500">{polarRight}%</span>
                    </div>
                    <div className="flex h-3 w-full rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${polarLeft}%` }}></div>
                        <div className="h-full bg-rose-500" style={{ width: `${polarRight}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                        <span>Home Office</span>
                        <span>Oficina 100%</span>
                    </div>
                </div>
            </div>

            {/* 3. Categoría Ignición */}
            <div className="bg-slate-900 p-8 rounded-3xl flex flex-col group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden h-full lg:col-span-1 md:col-span-2">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent pointer-events-none"></div>
                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="bg-white/10 backdrop-blur-sm w-12 h-12 rounded-2xl flex items-center justify-center">
                        <Zap className="w-6 h-6 text-yellow-400" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-300">Zona Caliente</span>
                </div>
                <h3 className="text-2xl font-black text-white mb-2 leading-tight">Inteligencia Artificial</h3>
                <p className="text-sm text-slate-400 font-medium mb-8 flex-grow">Donde se están concentrando las disrupciones.</p>
                
                <div className="flex flex-col gap-2 relative z-10">
                    <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1.5 bg-white/10 text-white text-xs font-bold rounded-full">OpenAI</span>
                        <span className="px-3 py-1.5 bg-white/10 text-white text-xs font-bold rounded-full">Regulación</span>
                        <span className="px-3 py-1.5 bg-white/10 text-white text-xs font-bold rounded-full">Ética</span>
                    </div>
                </div>
            </div>

        </div>

      </div>
    </div>
  );
}
