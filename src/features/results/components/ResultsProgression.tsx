import { useNavigate } from 'react-router-dom';
import { MasterHubSnapshot } from '../../../read-models/b2c/hub-types';
import { Target, Zap } from 'lucide-react';

interface ResultsProgressionProps {
  snapshot: MasterHubSnapshot;
}

export function ResultsProgression({ snapshot }: ResultsProgressionProps) {
  const nav = useNavigate();
  const total = snapshot.overview?.totalSignals || 0;
  
  // Lógica ficticia para niveles.
  const nextTarget = total < 50 ? 50 : total < 100 ? 100 : 500;
  const progressPercent = Math.min((total / nextTarget) * 100, 100);
  const remaining = nextTarget - total;

  return (
    <div className="w-full relative mt-0 pb-0 bg-slate-950 flex flex-col items-center justify-center min-h-[90vh] overflow-hidden">
       {/* Abismo Inmersivo (Background Glows) */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] max-w-[1500px] max-h-[1500px] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0%,transparent_60%)] rounded-full pointer-events-none opacity-60 mix-blend-screen"></div>
       <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black to-transparent pointer-events-none z-10"></div>
       <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

       <div className="relative z-20 max-w-5xl mx-auto px-6 w-full flex flex-col items-center text-center">
          
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.3)] mb-12 transition-all group-hover:scale-125 group-hover:rotate-12 duration-700 ease-out">
            <Target className="w-8 h-8 md:w-10 md:h-10 text-indigo-400" />
          </div>

          <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.5em] text-indigo-400 mb-8 md:mb-12 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
             Sistema de Progresión
          </p>

          <h2 className="text-[12vw] md:text-[8vw] lg:text-[120px] font-black text-white tracking-tighter leading-[0.8] mb-12 md:mb-16 uppercase text-balance drop-shadow-2xl">
             A <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 via-purple-400 to-cyan-400 drop-shadow-[0_0_30px_rgba(99,102,241,0.5)]">{remaining}</span> Señales<br/>Del Nivel Sig.
          </h2>

          {/* Barra de Progreso Minimalista HUD */}
          <div className="w-full max-w-2xl mb-24 relative p-6 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-[2rem]">
             <div className="flex justify-between items-end mb-6 px-2">
                 <div className="flex flex-col items-start gap-1">
                     <span className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-500">Tier Actual</span>
                     <span className="text-3xl font-black text-white leading-none">Nivel {total < 50 ? 1 : total < 100 ? 2 : 3}</span>
                 </div>
                 <span className="text-4xl md:text-5xl font-black text-indigo-400 tracking-tighter leading-none">{total}<span className="text-slate-600 text-2xl">/{nextTarget}</span></span>
             </div>
             <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                <div 
                  className="h-full bg-indigo-500 shadow-[0_0_30px_rgba(99,102,241,1)] transition-all duration-1000 ease-out relative" 
                  style={{ width: `${progressPercent}%` }}
                >
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-r from-transparent to-white/50 blur-[2px]"></div>
                </div>
             </div>
          </div>

          {/* CTA Brutalista Colosal */}
          <button 
              onClick={() => nav('/signals')}
              className="group/btn relative flex flex-col md:flex-row items-center justify-center gap-4 bg-white text-slate-950 font-black px-12 md:px-24 py-8 md:py-10 rounded-full w-[95%] md:w-auto shadow-[0_0_80px_rgba(255,255,255,0.15)] hover:shadow-[0_0_120px_rgba(255,255,255,0.4)] transition-all duration-500 hover:scale-[1.03] active:scale-95"
          >
              <Zap className="w-10 h-10 md:w-12 md:h-12 text-indigo-600 animate-pulse" />
              <span className="text-3xl md:text-5xl tracking-tighter uppercase leading-none">Aportar Ahora</span>
              <div className="absolute inset-0 rounded-full border-2 border-white opacity-0 group-hover/btn:opacity-50 group-hover/btn:scale-110 transition-all duration-500 pointer-events-none"></div>
          </button>
       </div>
    </div>
  );
}
