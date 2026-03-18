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
    <div className="w-full relative mt-0 pb-0">
      <div className="bg-slate-950 text-center relative overflow-hidden group shadow-2xl py-24 md:py-40 px-4">
        
        {/* Luz inmersiva */}
        <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[100vw] h-[100vw] max-w-[1200px] max-h-[1200px] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1)_0%,transparent_70%)] rounded-full pointer-events-none opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-indigo-950/50 to-transparent pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.2)] mb-10 transition-all group-hover:scale-125 group-hover:rotate-12 duration-700 ease-out group-hover:bg-indigo-500/20 group-hover:shadow-[0_0_80px_rgba(99,102,241,0.4)]">
            <Target className="w-10 h-10 md:w-12 md:h-12 text-indigo-400 group-hover:text-white transition-colors duration-500" />
          </div>

          <h2 className="text-xs md:text-sm font-black uppercase tracking-[0.4em] text-indigo-400 mb-6 flex items-center justify-center gap-2">
             EXP / Evolución Activa
          </h2>

          <h3 className="text-5xl md:text-7xl lg:text-[100px] font-black text-white tracking-tighter leading-[0.9] mb-8 md:mb-12 uppercase text-balance">
            A <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 drop-shadow-[0_0_30px_rgba(99,102,241,0.5)]">{remaining}</span> de tu<br/>siguiente nivel.
          </h3>
          
          <p className="text-lg md:text-2xl text-slate-400 font-medium mb-16 leading-tight max-w-2xl text-balance">
            Tu huella en el modelo crece exponencialmente. Sigue votando para desbloquear datos clasificados.
          </p>

          {/* Barra de Progreso Minimalista HUD */}
          <div className="w-full max-w-2xl mb-16 relative">
             <div className="flex justify-between items-end mb-4 px-1">
                 <div className="flex flex-col items-start">
                     <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Nivel Actual</span>
                     <span className="text-2xl font-black text-white">Tier {total < 50 ? 1 : total < 100 ? 2 : 3}</span>
                 </div>
                 <span className="text-3xl font-black text-indigo-400 tracking-tighter">{total}<span className="text-slate-600">/{nextTarget}</span></span>
             </div>
             <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.8)] transition-all duration-1000 ease-out relative" 
                  style={{ width: `${progressPercent}%` }}
                >
                    <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/40"></div>
                </div>
             </div>
          </div>

          {/* CTA Brutalista Brillante */}
          <button 
              onClick={() => nav('/signals')}
              className="group/btn relative flex items-center justify-center gap-4 bg-white text-slate-950 text-2xl md:text-4xl font-black px-12 md:px-20 py-8 md:py-10 rounded-full w-[90%] md:w-auto shadow-[0_0_60px_rgba(255,255,255,0.15)] hover:shadow-[0_0_100px_rgba(255,255,255,0.4)] transition-all duration-500 hover:scale-105"
          >
              <Zap className="w-8 h-8 md:w-10 md:h-10 text-indigo-600 md:group-hover/btn:animate-pulse" />
              <span>Aportar Ahora</span>
              <div className="absolute inset-0 rounded-full border border-white opacity-0 group-hover/btn:opacity-50 group-hover/btn:scale-110 transition-all duration-500 pointer-events-none"></div>
          </button>
        </div>
      </div>
    </div>
  );
}
