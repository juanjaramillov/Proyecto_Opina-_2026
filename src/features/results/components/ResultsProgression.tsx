import { useNavigate } from 'react-router-dom';
import { MasterHubSnapshot } from '../../../read-models/b2c/hub-types';
import { Target, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

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
    <div className="w-full bg-white py-24 md:py-32 relative overflow-hidden border-t border-slate-100">
       <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col items-center text-center relative z-20">
          
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-8 relative">
            <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl animate-pulse"></div>
            <Target className="w-8 h-8 md:w-10 md:h-10 text-indigo-500 relative z-10" />
          </div>

          <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-slate-500 mb-6">
             Tu Rango de Influencia
          </p>

          <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-ink tracking-tight leading-[0.9] mb-8 text-balance max-w-4xl">
             A {remaining} señales de desbloquear el <span className="text-indigo-600">Nivel {total < 50 ? 2 : total < 100 ? 3 : 4}</span>.
          </h2>
          
          <p className="text-sm md:text-base font-medium text-slate-500 max-w-2xl mb-12 text-balance leading-relaxed">
             Sigue sumando puntos para ampliar la profundidad de tu análisis, acceder a Torneos cerrados y amplificar el peso de tu voto en la comunidad.
          </p>

          {/* Premium HUD Progress Bar */}
          <div className="w-full max-w-3xl mb-16 p-6 md:p-8 bg-slate-50 border border-slate-200 rounded-[2rem] shadow-sm flex flex-col items-center">
             <div className="flex w-full justify-between items-end mb-6 px-2">
                 <div className="flex flex-col items-start gap-1">
                     <span className="flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        Nivel {total < 50 ? 1 : total < 100 ? 2 : 3}
                     </span>
                     <span className="text-2xl md:text-3xl font-black text-ink leading-none">Scout</span>
                 </div>
                 <div className="text-right">
                    <span className="text-4xl md:text-5xl font-black text-indigo-600 tracking-tighter leading-none">{total}</span>
                    <span className="text-slate-400 text-lg md:text-xl font-bold ml-1">/ {nextTarget}</span>
                 </div>
             </div>
             
             <div className="h-4 w-full bg-slate-200/60 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-primary rounded-full relative overflow-hidden" 
                  style={{ width: `${progressPercent}%` }}
                >
                    <div className="absolute top-0 right-0 bottom-0 w-20 bg-white/20 skew-x-12 translate-x-10 animate-pulse"></div>
                </div>
             </div>
          </div>

          <button 
              onClick={() => nav('/signals')}
              className="group relative flex items-center justify-center gap-4 bg-ink text-white font-bold px-10 md:px-14 py-5 md:py-6 rounded-full w-full md:w-auto overflow-hidden hover:bg-slate-800 transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20"
          >
              <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              <span className="text-lg md:text-xl tracking-wide uppercase">Generar Impacto</span>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>

       </div>
    </div>
  );
}
