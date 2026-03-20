import { UserResultsSnapshot } from '../../../read-models/types';
import { Target, CheckCircle2, LockKeyhole, AlertCircle } from 'lucide-react';

interface MySignalsSummaryProps {
  snapshot: UserResultsSnapshot;
  loading: boolean;
}

export function MySignalsSummary({ snapshot, loading }: MySignalsSummaryProps) {
  if (loading) {
    return (
      <div className="card p-6 border border-stroke bg-white shadow-sm flex flex-col gap-4">
        <div className="h-6 w-1/3 bg-slate-200 animate-pulse rounded"></div>
        <div className="h-10 w-1/2 bg-slate-200 animate-pulse rounded"></div>
        <div className="h-4 w-2/3 bg-slate-200 animate-pulse rounded"></div>
      </div>
    );
  }

  const { total, topModules } = snapshot.signals;
  
  // Lógica estado de los "Stones" o pilares de desbloqueo
  const hasVersus = topModules.some(m => m.moduleType === 'versus' && m.count >= 5);
  const hasTorneo = topModules.some(m => m.moduleType === 'torneo' && m.count > 0);
  const hasNews = topModules.some(m => m.moduleType === 'actualidad' && m.count > 0);
  
  const pillars = [
    { 
      id: 'versus', 
      label: 'Afinidad Versus', 
      active: hasVersus, 
      req: '5 señales',
      desc: 'Suficiente masa en duelos rápidos.'
    },
    { 
      id: 'tourney', 
      label: 'Jerarquía de Sector', 
      active: hasTorneo, 
      req: '1 torneo',
      desc: 'Participación en clasificatorias.'
    },
    { 
      id: 'news', 
      label: 'Pulso de Tendencia', 
      active: hasNews, 
      req: '1 lectura',
      desc: 'Respuesta ante eventos macro.'
    }
  ];

  return (
    <div className="card p-6 border border-stroke bg-white shadow-sm flex flex-col relative overflow-hidden group hover:border-primary/20 transition-all duration-300">
      <div className="absolute top-0 right-0 p-6 opacity-[0.02] pointer-events-none">
        <Target className="w-32 h-32 text-primary -mt-8 -mr-8" />
      </div>
      
      <div className="z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                <span className="material-symbols-outlined text-[16px] text-primary">dynamic_feed</span>
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary">Red Personal Activa</h3>
            </div>
            {total > 0 && (
                <div className="text-right">
                    <span className="text-2xl font-black text-ink tracking-tighter leading-none">{total}</span>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">señales</span>
                </div>
            )}
        </div>
        
        {total === 0 ? (
          <div className="mt-auto mb-2 flex items-start gap-3 p-4 bg-surface2/50 rounded-xl border border-stroke/50">
            <AlertCircle className="w-5 h-5 text-text-muted shrink-0" />
            <p className="text-sm font-medium text-text-secondary leading-snug">
              Plataforma en blanco. Inicia tu primera batalla en el Hub para activar el motor analítico y registrar tu primer punto de datos.
            </p>
          </div>
        ) : (
          <div className="mt-auto space-y-4">
             <div className="h-px w-full bg-stroke/50"></div>
             <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Mapa de Disponibilidad</p>
             <div className="grid grid-cols-1 gap-3">
               {pillars.map(pillar => (
                  <div key={pillar.id} className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${pillar.active ? 'bg-primary/5 border-primary/20' : 'bg-surface2/30 border-stroke'}`}>
                     <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${pillar.active ? 'bg-white text-primary shadow-sm' : 'bg-white text-text-muted/50 border border-stroke'}`}>
                           {pillar.active ? <CheckCircle2 className="w-4 h-4" /> : <LockKeyhole className="w-4 h-4" />}
                        </div>
                        <div>
                           <p className={`text-sm font-bold leading-tight ${pillar.active ? 'text-ink' : 'text-text-muted'}`}>{pillar.label}</p>
                           <p className="text-[10px] text-text-secondary/70 mt-0.5 font-medium">{pillar.desc}</p>
                        </div>
                     </div>
                     {!pillar.active && (
                        <span className="text-[10px] font-bold bg-white border border-stroke text-text-muted px-2 py-1 rounded-md shrink-0">
                           Req: {pillar.req}
                        </span>
                     )}
                  </div>
               ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
