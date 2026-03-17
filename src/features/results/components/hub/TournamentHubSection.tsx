import { MasterHubSnapshot } from '../../../../read-models/b2c/hub-types';
import { Trophy, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TournamentHubSectionProps {
  snapshot: MasterHubSnapshot;
  loading: boolean;
}

export function TournamentHubSection({ loading }: TournamentHubSectionProps) {
  const nav = useNavigate();

  if (loading) {
    return <div className="h-64 animate-pulse bg-surface2 rounded-2xl w-full border border-stroke" />;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Estado Vacío de Torneo */}
      <div className="card p-10 border border-stroke bg-surface2/30 shadow-sm rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden group">
        <div className="w-20 h-20 rounded-full bg-white border border-stroke flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
           <Trophy className="w-8 h-8 text-primary" strokeWidth={1.5} />
        </div>
        <h3 className="text-xl font-black text-ink mb-3 tracking-tight">Jerarquía de Sector Bloqueada</h3>
        <p className="text-sm font-medium text-text-secondary max-w-md mx-auto leading-relaxed mb-6">
          Participa en torneos para calibrar tu postura relativa. Un mapa detallado de tus preferencias frente al ecosistema aparecerá aquí una vez que votes.
        </p>
        <button 
           onClick={() => nav('/signals')}
           className="btn-secondary px-6 py-2 border-stroke bg-white hover:bg-surface2 transition-all flex items-center gap-2"
        >
           Ver Torneos Activos <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
