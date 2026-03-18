export function ResultsPulse() {
  const insights = [
    {
      id: 1,
      type: 'hot',
      title: "Extrema Polarización",
      metric: "52/48",
      entityName: "Inteligencia Artificial",
      trend: "up"
    },
    {
      id: 2,
      type: 'growing',
      title: "Consenso Acelerado",
      metric: "89%",
      entityName: "Regulación de Redes",
      trend: "up"
    },
    {
      id: 3,
      type: 'falling',
      title: "Pérdida de Interés",
      metric: "-22%",
      entityName: "Formatos Cortos",
      trend: "down"
    }
  ];

  return (
    <div className="w-full py-16 md:py-24 bg-white border-b border-slate-100">
       <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-slate-200 pb-8 mb-12 gap-6">
             <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></div>
                   <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-slate-500">Pulso del Momento</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-ink">Agenda en Tiempo Real.</h2>
             </div>
             <div className="hidden lg:flex text-sm text-slate-500 max-w-sm text-right">
                Las temáticas con mayor fricción y volatilidad en las últimas 24 horas dentro de la red.
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
             {insights.map((item) => (
                <div key={item.id} className="flex flex-col group cursor-pointer border-l-2 border-transparent hover:border-primary pl-4 -ml-4 transition-all">
                   <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{item.title}</div>
                   <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-ink mb-4 group-hover:text-primary transition-colors leading-tight">
                       {item.entityName}
                   </h3>
                   <div className="flex items-center gap-4 mt-auto">
                      <span className="text-4xl lg:text-5xl font-black tracking-tighter text-slate-800">{item.metric}</span>
                      <span className={`flex items-center justify-center w-8 h-8 rounded-full text-lg font-bold ${item.trend === 'up' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                         {item.trend === 'up' ? '↑' : '↓'}
                      </span>
                   </div>
                </div>
             ))}
          </div>

       </div>
    </div>
  );
}
