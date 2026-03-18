import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

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
    <div className="w-full py-16 md:py-24 bg-white border-b border-slate-100 relative overflow-hidden">
       <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-slate-200 pb-8 mb-12 gap-6">
             <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
                     <Activity className="w-5 h-5 text-rose-500 animate-pulse" />
                   </div>
                   <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-slate-500">Pulso del Momento</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-ink">Agenda en Tiempo Real.</h2>
             </div>
             <div className="hidden lg:flex text-sm text-slate-500 max-w-sm text-right font-medium">
                Las temáticas con mayor fricción y volatilidad en las últimas 24 horas dentro de la red.
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
             {insights.map((item) => {
                const isUp = item.trend === 'up';
                return (
                 <div key={item.id} className="flex flex-col group cursor-pointer bg-slate-50 rounded-3xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-slate-200">
                    <div className="flex justify-between items-start mb-6">
                        <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-500 transition-colors">{item.title}</div>
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${isUp ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'} group-hover:scale-110 transition-transform duration-300`}>
                           {isUp ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                        </div>
                    </div>
                    
                    <h3 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 mb-6 group-hover:text-indigo-600 transition-colors leading-tight flex-grow">
                        {item.entityName}
                    </h3>

                    <div className="flex items-center gap-4 mt-auto">
                       <span className={`text-4xl lg:text-5xl font-black tracking-tighter ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {item.metric}
                       </span>
                    </div>
                 </div>
                )
             })}
          </div>

       </div>
    </div>
  );
}
