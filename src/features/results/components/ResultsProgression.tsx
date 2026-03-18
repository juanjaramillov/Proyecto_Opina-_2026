import { useNavigate } from 'react-router-dom';
import { MasterHubSnapshot } from '../../../read-models/b2c/hub-types';
import { User, Sparkles, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

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
       <div className="max-w-[1000px] mx-auto px-6 md:px-12 relative z-10 text-center flex flex-col items-center">
            
            <div className="w-16 h-16 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center mb-8 relative">
               <User className="text-indigo-500 w-8 h-8" />
               <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-slate-50 text-white shadow-sm">
                   <Sparkles className="w-3 h-3" />
               </div>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 mb-6 leading-[1.1] max-w-3xl text-balance">
                 Tu influencia clínica sigue creciendo.
            </h2>
            
            <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mb-12">
                A {remaining} señales predecimos que se desbloquearán nuevos atributos cognitivos para ti.
            </p>

            {/* Premium Progress Bar */}
            <div className="w-full max-w-lg mx-auto bg-white border border-slate-200 rounded-[2rem] p-6 mb-12 shadow-sm relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-[-100%] group-hover:translate-x-[100%] ease-in-out"></div>
                <div className="flex justify-between items-end mb-4 px-2 relative z-10">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <ShieldCheck className="w-4 h-4 text-emerald-500" />
                       Nivel {total < 50 ? 1 : total < 100 ? 2 : 3}
                    </span>
                    <span className="text-2xl font-black text-indigo-500">{total} / {nextTarget}</span>
                </div>
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-[2px] relative z-10">
                   <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full relative" style={{width: `${progressPercent}%`}}></div>
                </div>
            </div>

            <button 
              onClick={() => nav('/signals')}
              className="group relative flex items-center justify-center gap-4 bg-slate-900 text-white font-bold px-10 md:px-14 py-5 md:py-6 rounded-full w-full md:w-auto overflow-hidden hover:bg-slate-800 transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20"
            >
               <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400" />
               <span className="text-lg md:text-xl tracking-wide uppercase">Generar Impacto</span>
               <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>
            
       </div>
    </div>
  );
}
