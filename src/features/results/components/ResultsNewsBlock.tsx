
import { MessageCircle, TrendingUp, TrendingDown, Sparkles, Activity } from 'lucide-react';

export const ResultsNewsBlock = () => {
  const themes = [
    {
      title: 'Prefieren marcas ecológicas aunque cuesten más',
      context: 'Discusión muy activa en redes',
      time: 'Últimas 24h',
      impact: 'Muy hablado',
      type: 'positive',
      sparkline: '20,30,25,45,40,60,75,85',
      trend: '+12%',
      metricLabel: 'Subiendo rápido'
    },
    {
      title: 'Odian esperar respuestas de un robot',
      context: 'Quejas por mal servicio al cliente',
      time: 'Últimos 3 días',
      impact: 'Enojo en redes',
      type: 'negative',
      sparkline: '80,75,85,60,50,45,30,20',
      trend: '-8%',
      metricLabel: 'Pérdida de Paciencia'
    },
    {
      title: 'Usan IA para comprar cosas rápido',
      context: 'Les gusta no hacer filas virtuales',
      time: 'Semana Actual',
      impact: 'Uso frecuente',
      type: 'neutral',
      sparkline: '40,45,42,48,50,55,60,62',
      trend: '+4%',
      metricLabel: 'Lo empiezan a usar'
    }
  ];

  const getBadgeVariant = (type: string) => {
    switch(type) {
      case 'positive': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'negative': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getSparklineColor = (type: string) => {
    switch(type) {
      case 'positive': return '#10b981';
      case 'negative': return '#f43f5e';
      default: return '#3b82f6';
    }
  };

  return (
    <section className="w-full py-24 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
             <span className="inline-block mb-4 border border-slate-200 text-slate-500 rounded-full px-4 py-1 uppercase tracking-widest text-xs font-semibold">
                Lo que la gente habla
             </span>
             <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-4 flex items-center gap-4">
                Temas más Comentados <Activity className="w-10 h-10 text-brand-primary animate-pulse" />
             </h2>
             <p className="text-lg text-slate-500 max-w-xl">
                De qué están hablando las personas en redes ahora y si están criticando o aplaudiendo a las marcas asociadas.
             </p>
          </div>
          <button className="hidden md:flex items-center justify-center text-slate-600 hover:text-slate-900 font-semibold gap-2 py-2 px-4 transition-colors">
            Ver todas las opiniones <TrendingUp className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((item, idx) => (
            <div key={idx} className="group p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 rounded-3xl bg-white relative overflow-hidden flex flex-col justify-between">
               
               <div className="absolute top-0 left-0 w-full h-1.5 opacity-80" style={{ backgroundColor: getSparklineColor(item.type) }} />

               <div>
                 <div className="flex justify-between items-start mb-6">
                   <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-bold border ${getBadgeVariant(item.type)}`}>
                     {item.impact}
                   </span>
                   <span className="text-xs font-bold text-slate-400">{item.time}</span>
                 </div>
                 
                 <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight group-hover:text-brand-primary transition-colors">
                   {item.title}
                 </h3>
                 <p className="text-sm font-medium text-slate-500 mb-8 flex items-center gap-2">
                   <MessageCircle className="w-4 h-4 text-slate-400" />
                   {item.context}
                 </p>
               </div>

               <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div>
                     <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{item.metricLabel}</div>
                     <div className="text-lg font-black flex items-center gap-1.5" style={{ color: getSparklineColor(item.type) }}>
                        {item.type === 'positive' ? <TrendingUp className="w-4 h-4" /> : item.type === 'negative' ? <TrendingDown className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                        {item.trend}
                     </div>
                  </div>
                  
                  <div className="w-24 h-10">
                     <svg viewBox="0 0 100 100" className="w-full h-full preserve-aspect-ratio-none" preserveAspectRatio="none">
                        <polyline 
                           fill="none" 
                           stroke={getSparklineColor(item.type)} 
                           strokeWidth="5" 
                           strokeLinecap="round" 
                           strokeLinejoin="round" 
                           points={item.sparkline.split(',').map((val, i, arr) => `${(i / (arr.length - 1)) * 100},${100 - parseInt(val)}`).join(' ')} 
                        />
                     </svg>
                  </div>
               </div>
            </div>
          ))}
        </div>
        
        <button className="flex w-full mt-8 md:hidden items-center justify-center text-slate-600 font-semibold gap-2 py-2 transition-colors">
          Ver todas las opiniones <TrendingUp className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};
