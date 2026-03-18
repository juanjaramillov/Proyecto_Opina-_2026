import { MasterHubSnapshot } from '../../../read-models/b2c/hub-types';
import { ArrowRightLeft, Trophy, Layers, Radio, MapPin } from 'lucide-react';

interface ResultsEcosystemProps {
  snapshot: MasterHubSnapshot;
}

export function ResultsEcosystem({ snapshot }: ResultsEcosystemProps) {
  // Hardcoded structure for the ecosystem visualization
  const modules = [
    {
      id: 'versus',
      name: 'Versus',
      icon: <ArrowRightLeft className="w-5 h-5 text-indigo-500" />,
      description: 'Cruces directos de opinión',
      metric: `${snapshot.overview?.totalSignals || 12} resueltos`,
      active: true,
      bgIcon: 'compare_arrows'
    },
    {
      id: 'torneo',
      name: 'Batallas',
      icon: <Trophy className="w-5 h-5 text-amber-500" />,
      description: 'Eliminatorias de marca',
      metric: '3 torneos activos',
      active: true,
      bgIcon: 'emoji_events'
    },
    {
      id: 'profundidad',
      name: 'Profundidad',
      icon: <Layers className="w-5 h-5 text-emerald-500" />,
      description: 'Análisis multicapa',
      metric: 'Desbloquea al contestar +',
      active: false,
      bgIcon: 'layers'
    },
    {
      id: 'actualidad',
      name: 'Actualidad',
      icon: <Radio className="w-5 h-5 text-rose-500" />,
      description: 'Temas en tiempo real',
      metric: 'Frecuencia semanal',
      active: false,
      bgIcon: 'podcasts'
    },
    {
      id: 'lugares',
      name: 'Lugares',
      icon: <MapPin className="w-5 h-5 text-blue-500" />,
      description: 'Reviews geolocalizados',
      metric: 'Beta',
      active: false,
      bgIcon: 'pin_drop'
    }
  ];

  return (
    <div className="w-full mt-4 lg:mt-8 mb-16 relative">
       {/* Header */}
       <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-stroke shadow-sm">
             <Layers className="w-4 h-4 text-ink" />
          </div>
          <div>
              <h2 className="text-xl font-black text-ink tracking-tight">Ecosistema de Señales</h2>
              <p className="text-sm font-medium text-text-secondary mt-0.5">Explora tus resultados por familia de iteración.</p>
          </div>
       </div>

       {/* Grid Modular Bento */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-min">
          {modules.map((mod, index) => {
             const isHeroBento = index === 0;
             const activeStyle = isHeroBento 
                 ? 'bg-slate-900 border-slate-800 text-white shadow-2xl hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]' 
                 : 'bg-white border-stroke text-ink hover:shadow-xl hover:-translate-y-1';
             
             return (
                <div 
                   key={mod.id} 
                   className={`relative overflow-hidden group rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 flex flex-col transition-all duration-500 ${mod.active ? `${activeStyle} cursor-pointer` : 'bg-surface2/50 border-transparent text-text-muted opacity-70 cursor-not-allowed'} ${isHeroBento ? 'md:col-span-2 lg:col-span-2 lg:row-span-2 min-h-[300px] lg:min-h-[400px]' : 'min-h-[220px]'}`}
                >
                   {/* Background Icon Watermark Masivo */}
                   <div className={`absolute -bottom-8 -right-8 w-48 h-48 opacity-[0.02] group-hover:opacity-[0.05] group-hover:scale-110 group-hover:-rotate-6 transition-all duration-700 pointer-events-none flex items-center justify-center ${isHeroBento ? 'w-80 h-80 -bottom-16 -right-16 opacity-[0.05] group-hover:opacity-[0.1]' : ''}`}>
                      <span className="material-symbols-outlined text-[150px] md:text-[200px]">{mod.bgIcon}</span>
                   </div>

                   <div className="flex flex-col h-full relative z-10">
                      <div className="flex items-center justify-between mb-auto">
                         <div className={`w-12 h-12 md:w-16 md:h-16 rounded-[1rem] md:rounded-[1.25rem] flex items-center justify-center ${mod.active ? (isHeroBento ? 'bg-slate-800 border border-slate-700/50' : 'bg-surface border border-stroke shadow-sm') : 'bg-surface2 border-transparent'}`}>
                            <div className={`${isHeroBento ? 'scale-150' : 'scale-125'}`}>{mod.icon}</div>
                         </div>
                         <span className={`text-[10px] md:text-xs font-black uppercase tracking-[0.2em] px-3 py-1.5 md:px-4 md:py-2 rounded-xl backdrop-blur-md ${mod.active ? (isHeroBento ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-surface text-ink border border-stroke shadow-sm') : 'bg-surface text-text-muted border border-stroke'}`}>
                            {mod.metric}
                         </span>
                      </div>

                      <div className={`mt-8 ${isHeroBento ? 'mt-auto' : ''}`}>
                         <h3 className={`${isHeroBento ? 'text-3xl md:text-4xl lg:text-5xl mb-3' : 'text-xl md:text-2xl mb-2'} font-black tracking-tight`}>{mod.name}</h3>
                         <p className={`${isHeroBento ? 'text-base md:text-lg text-slate-400' : 'text-sm font-medium'} max-w-[90%]`}>{mod.description}</p>
                      </div>
                   </div>

                   {/* Hover Glow Line */}
                   {mod.active && (
                       <div className={`absolute bottom-0 left-0 h-1 md:h-1.5 w-0 group-hover:w-full transition-all duration-700 ease-in-out ${isHeroBento ? 'bg-gradient-to-r from-emerald-500 to-blue-500' : 'bg-primary'}`}></div>
                   )}
                </div>
             );
          })}
       </div>
    </div>
  );
}
