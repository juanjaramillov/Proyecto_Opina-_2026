import { UserResultsSnapshot } from '../../../read-models/types';
import { Network, Users, UserRound, ArrowRightLeft } from 'lucide-react';

interface ComparisonCardProps {
  snapshot: UserResultsSnapshot;
  loading: boolean;
}

export function ComparisonCard({ snapshot, loading }: ComparisonCardProps) {
  if (loading) {
    return (
      <div className="card p-6 border border-stroke bg-white shadow-sm flex flex-col gap-4">
        <div className="h-6 w-1/3 bg-slate-200 animate-pulse rounded"></div>
        <div className="space-y-4 mt-2">
          <div className="h-16 w-full bg-slate-100 animate-pulse rounded"></div>
          <div className="h-16 w-full bg-slate-100 animate-pulse rounded"></div>
        </div>
      </div>
    );
  }

  const hasComparisons = snapshot.comparisons && snapshot.comparisons.length > 0;
  if (!hasComparisons) {
    return (
      <div className="card p-6 border border-stroke bg-white shadow-sm flex flex-col relative overflow-hidden group hover:border-accent/30 transition-colors">
        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500 group-hover:scale-110">
          <ArrowRightLeft className="w-24 h-24 text-accent" />
        </div>
        <div className="z-10 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20">
              <Network className="w-4 h-4 text-accent" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary">Cruces de Opinión</h3>
          </div>
          <p className="text-xs font-medium text-text-secondary leading-snug mt-auto bg-surface2 p-3 rounded-lg border border-stroke">
            Interactúa en Versus para descubrir si piensas como la mayoría o mantienes un perfil disruptivo.
          </p>
        </div>
      </div>
    );
  }

  // Ordenar por diferencia para mostrar los más polarizantes primero
  const sortedComparisons = [...snapshot.comparisons].sort((a, b) => {
     const diffA = Math.abs(50 - a.preferenceShare);
     const diffB = Math.abs(50 - b.preferenceShare);
     return diffB - diffA; // mayor polaridad primero
  }).slice(0, 4); // mostrar max 4 para no saturar 

  return (
    <div className="card p-6 border border-stroke bg-white shadow-sm flex flex-col gap-4 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
        <Network className="w-24 h-24 text-accent transform scale-125" />
      </div>

      <div className="z-10 flex items-center justify-between border-b border-stroke pb-4 mb-2">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20 shadow-sm">
             <Network className="w-4 h-4 text-accent" />
           </div>
           <h3 className="text-xs font-black uppercase tracking-widest text-ink">Alineación Social</h3>
        </div>
        <span className="text-[9px] text-text-muted font-black tracking-widest uppercase bg-surface2 px-2 py-1 rounded shadow-sm border border-stroke/50">
          Versus Recientes
        </span>
      </div>
      
      <div className="space-y-4 z-10 w-full min-w-0">
        {sortedComparisons.map((comp, idx) => {
          const isContrarian = !comp.majorityPrefers;
          const share = comp.preferenceShare;
          
          return (
            <div key={idx} className="group relative w-full">
              <div className="flex justify-between items-start mb-2 gap-2">
                <span className="text-xs font-bold text-ink truncate flex-shrink min-w-0" title={comp.entityName}>{comp.entityName}</span>
                <span className={`flex-shrink-0 flex items-center gap-1 text-[9px] uppercase tracking-widest font-black px-2 py-0.5 rounded border shadow-sm ${
                  isContrarian 
                    ? 'bg-accent/10 border-accent/20 text-accent' 
                    : 'bg-primary/10 border-primary/20 text-primary'
                }`}>
                  {isContrarian ? <UserRound className="w-2.5 h-2.5" /> : <Users className="w-2.5 h-2.5" />}
                  {isContrarian ? 'Disidente' : 'Consenso'}
                </span>
              </div>
              
              <div className="w-full bg-surface2 h-2 rounded-full overflow-hidden flex shadow-inner">
                {/* Mi postura (izquierda) vs Resto (derecha) */}
                <div 
                  className={`h-full transition-all duration-1000 ease-out border-r border-white/20 ${isContrarian ? 'bg-accent' : 'bg-primary'}`} 
                  style={{ width: `${share}%` }}
                />
                <div 
                  className="h-full bg-slate-300 transition-all duration-1000 ease-out" 
                  style={{ width: `${100 - share}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-text-muted mt-1 px-1">
                <span>Yo ({share.toFixed(0)}%)</span>
                <span>Resto ({(100 - share).toFixed(0)}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
