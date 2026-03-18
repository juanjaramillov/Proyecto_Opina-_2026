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
    <div className="w-full mt-24 mb-16 px-2">
      <div className="bg-gradient-to-br from-indigo-50/50 to-blue-50/30 border border-indigo-100/50 rounded-[2rem] p-8 md:p-12 text-center relative overflow-hidden group">
        
        {/* Adornos visuales */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20"></div>

        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-white border border-indigo-100 flex items-center justify-center shadow-sm mb-6">
            <Target className="w-8 h-8 text-indigo-600" />
          </div>

          <h2 className="text-3xl md:text-4xl font-black text-ink tracking-tight mb-4">
            A {remaining} señales del siguiente nivel
          </h2>
          
          <p className="text-base text-text-secondary font-medium mb-8 leading-relaxed max-w-lg">
            Tu impacto en el ecosistema crece con cada respuesta. Desbloquea análisis de profundidad exclusivos al alcanzar la meta.
          </p>

          {/* Barra de Progreso Larga */}
          <div className="w-full max-w-md mb-10">
            <div className="flex justify-between items-center text-xs font-bold text-ink mb-2 uppercase tracking-widest">
                <span>Nivel Actual</span>
                <span className="text-indigo-600">{total} / {nextTarget}</span>
            </div>
            <div className="h-3 w-full bg-white hover:bg-slate-50 transition-colors rounded-full overflow-hidden border border-indigo-100/50 shadow-inner">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-1000 relative overflow-hidden" 
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full animate-shimmer"></div>
                </div>
            </div>
          </div>

          <button 
              onClick={() => nav('/signals')}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold px-10 py-4 rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-xl hover:shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5"
          >
              <Zap className="w-5 h-5" />
              Aportar Nuevas Señales
          </button>
        </div>
      </div>
    </div>
  );
}
