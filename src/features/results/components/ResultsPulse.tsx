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
       <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center shadow-lg">
             <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
              <h2 className="text-2xl md:text-3xl font-black text-ink tracking-tight flex items-center gap-2">Pulso del Momento</h2>
              <p className="text-base font-medium text-text-secondary mt-1">Qué está moviendo a la comunidad ahora mismo.</p>
          </div>
       </div>

       {/* Carrusel / Grid de Tarjetas de Tendencia */}
       {/* En mobile, scroll horizontal (snap), en desktop grid */}
       <div className="w-full relative">
           <div className="flex overflow-x-auto lg:grid lg:grid-cols-3 gap-4 md:gap-6 pb-6 lg:pb-0 snap-x snap-mandatory hide-scrollbar">
              {insights.map(item => (
                 <div 
                     key={item.id} 
                     className="min-w-[300px] sm:min-w-[360px] lg:min-w-0 min-h-[280px] md:min-h-[320px] snap-start bg-white border border-stroke rounded-[2rem] md:rounded-[2.5rem] p-8 flex flex-col justify-between shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
                 >
                     {/* Fondo inmersivo temático */}
                     <div className={`absolute inset-0 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none ${item.type === 'hot' ? 'bg-[radial-gradient(circle_at_top_right,theme(colors.rose.500),transparent_70%)]' : item.type === 'growing' ? 'bg-[radial-gradient(circle_at_top_right,theme(colors.emerald.500),transparent_70%)]' : 'bg-[radial-gradient(circle_at_top_right,theme(colors.amber.500),transparent_70%)]'}`} />
                     
                     <div className="flex items-start justify-between mb-8 relative z-10">
                        <div className="flex items-center gap-3">
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.type === 'hot' ? 'bg-rose-50 text-rose-500' : item.type === 'growing' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                               {item.icon}
                           </div>
                           <span className="text-xs font-black uppercase tracking-[0.2em] text-text-muted">{item.title}</span>
                        </div>
                        <span className="bg-surface border border-stroke text-ink font-black text-lg md:text-xl px-4 py-1.5 rounded-xl shadow-sm">
                           {item.metric}
                        </span>
                     </div>
                     
                     <div className="relative z-10 mt-auto">
                        <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-ink leading-[1.1] mb-3 md:mb-4 pr-4 tracking-tight">{item.entityName}</h3>
                        <p className="text-sm md:text-base font-medium text-text-secondary max-w-[90%]">{item.subtitle}</p>

                        {/* Progress bar visual for impact masivo */}
                        <div className="w-full h-2 md:h-2.5 bg-surface rounded-full mt-8 overflow-hidden">
                           <div className={`h-full rounded-full ${item.type === 'hot' ? 'bg-rose-500' : item.type === 'growing' ? 'bg-emerald-500' : 'bg-amber-500'} opacity-80 group-hover:opacity-100 transition-all duration-700 ease-out`} style={{ width: item.type === 'hot' ? '50%' : item.type === 'growing' ? '89%' : '30%' }}></div>
                        </div>
                     </div>
                 </div>
              ))}
           </div>
       </div>
    </div>
  );
}
