import { TrendingUp, TrendingDown } from 'lucide-react';

export function ResultsPulse() {
  const insights = [
    {
      id: 1,
      title: "Movilidad Eléctrica",
      metric: "+40%",
      conclusion: "Aumentó tracción esta semana",
      trend: "up"
    },
    {
      id: 2,
      title: "Comida Saludable",
      metric: "-15%",
      conclusion: "Cayó el interés global",
      trend: "down"
    }
  ];

  return (
    <div className="w-full py-16 md:py-32 bg-white border-b border-slate-100 relative overflow-hidden">
       <div className="max-w-[1000px] mx-auto px-6 md:px-12 relative z-10 flex flex-col gap-16">
          
          <div className="flex flex-col border-b border-slate-200 pb-10">
             <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Pulso del Momento</span>
             <h2 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.1] text-balance">
                Qué está pasando ahora.
             </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
             {insights.map((item) => {
                const isUp = item.trend === 'up';
                return (
                 <div key={item.id} className="flex flex-col group cursor-pointer bg-slate-50 rounded-[2.5rem] p-10 md:p-12 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-500 border border-slate-100 hover:border-slate-200 hover:-translate-y-2">
                    
                    <h3 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors leading-tight">
                        {item.title}
                    </h3>
                    
                    <p className="text-lg font-medium text-slate-500 mb-12 max-w-sm">
                        {item.conclusion}
                    </p>

                    <div className="flex items-end justify-between mt-auto">
                       <span className={`text-7xl md:text-[90px] font-black tracking-tighter leading-none ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {item.metric}
                       </span>
                       <div className={`flex items-center justify-center w-14 h-14 rounded-[1.25rem] ${isUp ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'} group-hover:scale-110 transition-transform duration-500`}>
                           {isUp ? <TrendingUp className="w-7 h-7" /> : <TrendingDown className="w-7 h-7" />}
                        </div>
                    </div>
                 </div>
                )
             })}
          </div>

       </div>
    </div>
  );
}
