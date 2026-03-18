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

       {/* Grid Modular */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {modules.map(mod => (
            <div 
               key={mod.id} 
               className={`relative overflow-hidden group rounded-3xl border p-6 flex flex-col transition-all duration-300 ${mod.active ? 'bg-white border-stroke hover:shadow-lg hover:border-primary/30 cursor-pointer' : 'bg-surface2/50 border-transparent opacity-80 cursor-not-allowed'}`}
            >
               {/* Background Icon Watermark */}
               <div className="absolute -bottom-4 -right-4 w-32 h-32 opacity-[0.03] group-hover:opacity-[0.06] group-hover:scale-110 transition-all pointer-events-none flex items-center justify-center">
                  <span className="material-symbols-outlined text-[100px]">{mod.bgIcon}</span>
               </div>

               <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-sm ${mod.active ? 'bg-surface border-stroke' : 'bg-surface2 border-transparent'}`}>
                     {mod.icon}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${mod.active ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-surface border border-stroke text-text-muted'}`}>
                     {mod.metric}
                  </span>
               </div>

               <div className="flex-1 relative z-10 mt-2">
                  <h3 className={`text-lg font-black tracking-tight mb-1 ${mod.active ? 'text-ink' : 'text-text-muted'}`}>{mod.name}</h3>
                  <p className="text-sm font-medium text-text-secondary">{mod.description}</p>
               </div>

               {/* Hover Line */}
               {mod.active && (
                   <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary group-hover:w-full transition-all duration-500"></div>
               )}
            </div>
          ))}
       </div>
    </div>
  );
}
