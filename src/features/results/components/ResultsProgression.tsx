import { useNavigate } from 'react-router-dom';
import { MasterHubSnapshot } from '../../../read-models/b2c/hub-types';
import { Unlock, Sparkles, Target, ArrowRight } from 'lucide-react';

interface ResultsProgressionProps {
  snapshot: MasterHubSnapshot;
}

export function ResultsProgression({ snapshot }: ResultsProgressionProps) {
  const nav = useNavigate();
  const total = snapshot.overview?.totalSignals || 0;
  
  const nextTarget = total < 50 ? 50 : total < 100 ? 100 : 500;
  const progressPercent = Math.min((total / nextTarget) * 100, 100);
  const remaining = nextTarget - total;

  return (
    <div className="w-full bg-slate-50 py-24 md:py-32 relative overflow-hidden border-t border-slate-200">
       <div className="max-w-[1000px] mx-auto px-6 md:px-12 relative z-10 flex flex-col items-center">
            
            <div className="w-20 h-20 rounded-[2rem] bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-10 relative group-hover:scale-110 transition-transform">
               <Unlock className="text-indigo-500 w-10 h-10" />
               <div className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-slate-50 text-white shadow-sm">
                   <Sparkles className="w-4 h-4" />
               </div>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter text-slate-900 mb-8 leading-[0.9] text-center text-balance max-w-4xl">
                 Te faltan {remaining} señales para ver cómo piensa tu grupo etario.
            </h2>
            
            <p className="text-lg md:text-2xl text-slate-500 font-medium max-w-2xl mb-16 text-center text-balance">
                Desbloquea el "Filtro Generacional" y descubre si los Millennials y Gen Z realmente piensan diferente a ti en temas clave.
            </p>

            {/* Premium Progress Engine */}
            <div className="w-full max-w-2xl mx-auto bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-10 mb-16 shadow-2xl shadow-indigo-500/5 relative overflow-hidden">
                <div className="flex justify-between items-end mb-6 relative z-10">
                    <span className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                       <Target className="w-5 h-5 text-indigo-500" />
                       Nivel {total < 50 ? 1 : total < 100 ? 2 : 3}
                    </span>
                    <span className="text-3xl font-black text-indigo-500 tracking-tighter">{total} / {nextTarget}</span>
                </div>
                <div className="w-full h-5 bg-slate-100 rounded-full overflow-hidden p-1 relative z-10">
                   <div className="h-full bg-indigo-500 rounded-full shadow-sm relative transition-all duration-1000" style={{width: `${progressPercent}%`}}></div>
                </div>
            </div>

            <button 
              onClick={() => nav('/signals')}
              className="group flex items-center justify-center gap-4 bg-indigo-600 text-white font-black text-xl md:text-2xl px-12 md:px-16 py-6 md:py-8 rounded-[2rem] w-full md:w-auto overflow-hidden hover:bg-indigo-500 transition-all duration-300 hover:-translate-y-1 active:scale-95 shadow-2xl shadow-indigo-500/40 border border-indigo-400"
            >
               <span>Generar Impacto Ahora</span>
               <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>
            
       </div>
    </div>
  );
}
