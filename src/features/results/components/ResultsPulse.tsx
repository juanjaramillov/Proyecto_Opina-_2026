import { Flame, TrendingUp, TrendingDown, Activity } from 'lucide-react';

export function ResultsPulse() {
  // Datos Falsos Factuales para propósitos UI
  const insights = [
    {
      id: 1,
      type: 'hot',
      icon: <Flame className="w-5 h-5 text-rose-500" />,
      title: "Tema más debatido",
      metric: "52/48",
      entityName: "Inteligencia Artificial en Educación",
      subtitle: "Extrema polarización detectada en las últimas 24hs."
    },
    {
      id: 2,
      type: 'growing',
      icon: <TrendingUp className="w-5 h-5 text-emerald-500" />,
      title: "Consenso Creciente",
      metric: "89%",
      entityName: "Regulación de Redes Sociales",
      subtitle: "+15% de adopción en el último mes."
    },
    {
      id: 3,
      type: 'falling',
      icon: <TrendingDown className="w-5 h-5 text-amber-500" />,
      title: "Pérdida de Interés",
      metric: "-22%",
      entityName: "Formatos de Video Corto",
      subtitle: "Caída de participación generalizada."
    }
  ];

  return (
    <div className="w-full flex-col mt-4 lg:mt-8 mb-16 relative">
       {/* Sección Header */}
       <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-stroke shadow-sm">
             <Activity className="w-4 h-4 text-ink" />
          </div>
          <div>
              <h2 className="text-xl font-black text-ink tracking-tight flex items-center gap-2">Pulso del Momento</h2>
              <p className="text-sm font-medium text-text-secondary mt-0.5">Qué está moviendo a la comunidad ahora mismo.</p>
          </div>
       </div>

       {/* Carrusel / Grid de Tarjetas de Tendencia */}
       {/* En mobile, scroll horizontal (snap), en desktop grid */}
       <div className="w-full relative">
           <div className="flex overflow-x-auto lg:grid lg:grid-cols-3 gap-4 md:gap-6 pb-6 lg:pb-0 snap-x snap-mandatory hide-scrollbar">
              {insights.map(item => (
                 <div 
                     key={item.id} 
                     className="min-w-[280px] sm:min-w-[320px] lg:min-w-0 snap-start bg-white border border-stroke rounded-[1.5rem] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                 >
                     {/* Fondo suave para el badge */}
                     <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.03),transparent_70%)] rounded-bl-full pointer-events-none" />
                     
                     <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                           {item.icon}
                           <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{item.title}</span>
                        </div>
                        <span className="bg-surface border border-stroke text-ink font-bold text-sm px-2.5 py-1 rounded-lg shadow-sm">
                           {item.metric}
                        </span>
                     </div>
                     
                     <h3 className="text-xl font-black text-ink leading-[1.15] mb-2 pr-4">{item.entityName}</h3>
                     <p className="text-sm font-medium text-text-secondary">{item.subtitle}</p>

                     {/* Progress bar visual for impact */}
                     <div className="w-full h-1.5 bg-surface rounded-full mt-6 overflow-hidden">
                        <div className={`h-full rounded-full ${item.type === 'hot' ? 'bg-rose-500' : item.type === 'growing' ? 'bg-emerald-500' : 'bg-amber-500'} opacity-80 group-hover:opacity-100 transition-opacity`} style={{ width: item.type === 'hot' ? '50%' : item.type === 'growing' ? '89%' : '30%' }}></div>
                     </div>
                 </div>
              ))}
           </div>
       </div>
    </div>
  );
}
