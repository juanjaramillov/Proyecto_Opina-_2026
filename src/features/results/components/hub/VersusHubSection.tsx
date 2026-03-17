import { MasterHubSnapshot } from '../../../../read-models/b2c/hub-types';
import { ComparisonCard } from '../ComparisonCard';
import { LockKeyhole, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface VersusHubSectionProps {
  snapshot: MasterHubSnapshot;
  loading: boolean;
}

export function VersusHubSection({ snapshot, loading }: VersusHubSectionProps) {
  const nav = useNavigate();
  const versus = snapshot.modules.versus;

  const legacySnapshotAdapter = {
    comparisons: versus.comparisons
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;

  const privacyBlocked = snapshot.cohortState.isFiltered && snapshot.cohortState.privacyState === 'insufficient_cohort';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {privacyBlocked ? (
        <div className="card p-8 border border-amber-200 bg-amber-50 shadow-sm flex flex-col justify-center items-center text-center rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
            <LockKeyhole className="w-8 h-8 text-amber-500" />
          </div>
          <h3 className="text-lg font-black text-amber-900 mb-2">Segmento muy específico</h3>
          <p className="text-sm font-medium text-amber-800/80 max-w-lg">
            Para proteger el anonimato y evitar sesgos de micro-segmentación, Opina+ requiere un tamaño de cohorte mínimo para mostrar comparaciones. 
            Prueba a flexibilizar tus filtros demográficos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col h-full">
            <ComparisonCard snapshot={legacySnapshotAdapter} loading={loading} />
          </div>
          
          <div className="card border border-stroke shadow-sm p-6 flex flex-col justify-start bg-white">
            <h4 className="text-sm font-black uppercase tracking-widest text-ink mb-6 flex justify-between items-center">
              <span>Afinidad por Categorías</span>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">Top 3 Sectores</span>
            </h4>
            
            {snapshot.modules.versus.insights.length === 0 ? (
               <div className="flex flex-col items-center justify-center flex-1 h-full min-h-[220px] text-center rounded-xl bg-surface2/30 relative overflow-hidden group border border-stroke">
                 <div className="absolute inset-x-8 inset-y-8 flex flex-col gap-4 opacity-10 blur-[2px] pointer-events-none">
                     <div className="h-6 bg-primary rounded-full w-full"></div>
                     <div className="h-6 bg-primary rounded-full w-3/4"></div>
                     <div className="h-6 bg-primary rounded-full w-5/6"></div>
                 </div>
                 <div className="relative z-10 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-white border border-stroke flex items-center justify-center mb-3 shadow-sm">
                        <LockKeyhole className="w-5 h-5 text-text-muted" />
                    </div>
                    <p className="text-sm font-bold text-ink mb-1">Mapa de Afinidad Bloqueado</p>
                    <p className="text-xs font-medium text-text-secondary max-w-[200px] leading-relaxed mb-4">
                      Participa en duelos rápidos para ver tus inclinaciones sectoriales.
                    </p>
                    <button 
                       onClick={() => nav('/experience')}
                       className="text-[10px] font-black uppercase tracking-widest bg-primary text-white px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow flex items-center gap-1"
                    >
                       Revelar Categorías <ArrowRight className="w-3 h-3" />
                    </button>
                 </div>
               </div>
            ) : (
               <div className="space-y-5">
                 {/* Próximamente integración data real */}
               </div>
            )}
            
            {snapshot.modules.versus.insights.length > 0 && (
              <p className="text-[11px] text-text-muted font-medium mt-auto pt-6">
                Basado en tu historial de enfrentamientos.
              </p>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
