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
    <div className="w-full mt-12 lg:mt-24 mb-16 relative">
       {/* Header Minimalista */}
       <div className="flex flex-col md:w-1/3 mb-12">
          <div className="flex items-center gap-3 mb-2">
              <Layers className="w-5 h-5 text-ink" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-ink">Ecosistema Vivo</h2>
          </div>
          <p className="text-3xl font-black text-ink leading-tight tracking-tight">Data microscópica de cada módulo.</p>
       </div>

       {/* Grid Modular Bento asimétrico */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 auto-rows-min">
          {modules.map((mod, index) => {
             const isHeroBento = index === 0; // Versus
             const isSecondaryBento = index === 1; // Torneo
             
             // Estilos puros Data-Viz
             const baseStyle = "relative overflow-hidden p-6 md:p-8 flex flex-col transition-all duration-700 h-full border";
             const activeStyle = isHeroBento 
                 ? 'bg-slate-950 border-transparent text-white' 
                 : isSecondaryBento
                    ? 'bg-slate-100 border-transparent text-ink'
                    : 'bg-white border-stroke text-ink hover:bg-slate-50 cursor-pointer';

             return (
                <div 
                   key={mod.id} 
                   className={`${baseStyle} ${mod.active ? activeStyle : 'bg-surface2/30 border-dashed border-stroke/50 text-text-muted opacity-80'} ${isHeroBento ? 'md:col-span-2 lg:col-span-2 lg:row-span-2 min-h-[360px]' : 'min-h-[260px]'}`}
                >
                   {/* Capa de Información Típica */}
                   <div className="flex items-start justify-between relative z-20 mb-auto">
                        <div className="flex flex-col">
                            <h3 className={`${isHeroBento ? 'text-4xl md:text-5xl mb-2' : 'text-xl md:text-2xl mb-1'} font-black tracking-tighter uppercase`}>{mod.name}</h3>
                            <p className={`${isHeroBento ? 'text-slate-400' : 'text-text-secondary'} text-xs font-bold uppercase tracking-[0.1em]`}>{mod.description}</p>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 ${mod.active ? (isHeroBento ? 'text-emerald-400' : 'text-ink') : 'text-text-muted'}`}>
                           {mod.metric}
                        </span>
                   </div>

                   {/* VISUALIZACIONES ESTILIZADAS NATIVAS (NO ICONOS) */}
                   <div className="mt-12 relative z-10 w-full flex-grow flex items-end">
                       {/* 1. VERSUS: Mapa de Tensión (Heatmap Layout) */}
                       {mod.id === 'versus' && (
                           <div className="w-full h-full flex flex-col justify-end gap-3 pb-4">
                               <div className="w-full flex justify-between items-end gap-1 overflow-hidden opacity-30">
                                   <div className="flex-1 bg-red-500 h-[2px]"></div>
                                   <div className="flex-1 bg-blue-500 h-[60px]"></div>
                                   <div className="flex-1 bg-emerald-500 h-[120px]"></div>
                                   <div className="flex-1 bg-amber-500 h-[40px]"></div>
                                   <div className="flex-1 bg-cyan-500 h-[90px]"></div>
                                   <div className="flex-1 bg-purple-500 h-[150px]"></div>
                                   <div className="flex-1 bg-rose-500 h-[30px]"></div>
                               </div>
                               <div className="w-full border-t border-slate-800 pt-3 flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-[0.15em]">
                                   <span>Tensión Alta</span>
                                   <span>Baja</span>
                               </div>
                           </div>
                       )}

                       {/* 2. TORNEO: Estructura Piramidal (Bracket) */}
                       {mod.id === 'torneo' && (
                           <div className="w-full flex items-end justify-center gap-1 opacity-70">
                               <div className="w-full max-w-[120px] pb-4">
                                   <div className="border-t border-l border-r border-ink/20 h-8 rounded-t-sm mb-1"></div>
                                   <div className="flex gap-1 justify-between">
                                       <div className="w-1/2 h-6 border-t border-l border-ink/20 rounded-tl-sm"></div>
                                       <div className="w-1/2 h-6 border-t border-r border-ink/20 rounded-tr-sm"></div>
                                   </div>
                               </div>
                           </div>
                       )}

                       {/* OTROS: Cerrados o en construcción */}
                       {(!mod.active && mod.id !== 'versus' && mod.id !== 'torneo') && (
                           <div className="w-full opacity-10 flex justify-center pb-4">
                               <div className={`scale-[5]`}>{mod.icon}</div>
                           </div>
                       )}
                   </div>
                </div>
             );
          })}
       </div>
    </div>
  );
}
