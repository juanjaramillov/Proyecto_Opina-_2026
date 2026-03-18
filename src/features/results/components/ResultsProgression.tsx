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
    <div className="w-full mt-16 md:mt-24 mb-16 lg:mb-24 px-0">
      <div className="bg-slate-900 border-none sm:border sm:border-slate-800 sm:rounded-[4rem] p-10 md:p-16 lg:p-20 text-center relative overflow-hidden group shadow-2xl">
        
        {/* Adornos visuales Gamificados */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_60%)] rounded-full pointer-events-none -mr-40 -mt-40"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.1),transparent_60%)] rounded-full pointer-events-none -ml-40 -mb-40"></div>

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)] mb-8 transition-transform group-hover:scale-110 group-hover:rotate-3 duration-500">
            <Target className="w-8 h-8 md:w-10 md:h-10 text-indigo-400" />
          </div>

          <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-slate-400 mb-4 flex items-center justify-center gap-2">
             Siguiente Hito: Profundidad Analítica
          </h2>

          <h3 className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tighter leading-[1.1] mb-6 md:mb-8 text-balance">
            A <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">{remaining}</span> señales de evolucionar.
          </h3>
          
          <p className="text-base md:text-lg text-slate-300 font-medium mb-12 leading-relaxed max-w-xl text-balance">
            Tu peso en la red está creciendo. Alcanzar la meta desbloqueará permisos exclusivos y análisis granulares que la mayoría no ve.
          </p>

          {/* Barra de Progreso Larga Premium */}
          <div className="w-full max-w-2xl mb-12">
            <div className="flex justify-between items-center text-[10px] md:text-xs font-black text-slate-400 mb-3 uppercase tracking-widest px-2">
                <span>Rango Actual (Nivel {total < 50 ? 1 : total < 100 ? 2 : 3})</span>
                <span className="text-indigo-400">{total} / {nextTarget}</span>
            </div>
            <div className="h-4 md:h-5 w-full bg-slate-950/50 rounded-full overflow-hidden border border-slate-800 shadow-inner relative">
                {/* Relleno con gradiente animado */}
                <div 
                  className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(99,102,241,0.5)]" 
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:24px_24px] animate-shimmer"></div>
                </div>
            </div>
          </div>

          <button 
              onClick={() => nav('/signals')}
              className="flex items-center gap-3 bg-white hover:bg-slate-50 text-indigo-950 text-xl md:text-2xl font-black px-12 py-5 md:py-6 rounded-2xl shadow-[0_10px_40px_rgba(255,255,255,0.2)] hover:shadow-[0_20px_60px_rgba(255,255,255,0.3)] transition-all transform hover:-translate-y-1"
          >
              <Zap className="w-6 h-6 md:w-8 md:h-8 text-indigo-600" />
              Aportar Señales Ahora
          </button>
        </div>
      </div>
    </div>
  );
}
