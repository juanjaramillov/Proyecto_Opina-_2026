import { MasterHubSnapshot } from "../../../read-models/b2c/hub-types";
import { MySignalsSummary } from "./MySignalsSummary";

interface ResultsCrossSummaryProps {
  snapshot: MasterHubSnapshot;
  loading: boolean;
}

export function ResultsCrossSummary({ snapshot, loading }: ResultsCrossSummaryProps) {
  return (
    <div className="mb-16 bg-surface2/20 rounded-[2rem] p-8 border border-stroke/50 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 relative">
      {loading && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 rounded-3xl"></div>}
      <h2 className="text-xl font-black text-ink mb-6 px-2 tracking-tight">Tu Resumen Transversal</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MySignalsSummary 
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          snapshot={{ signals: snapshot.overview, sufficiency: snapshot.sufficiency } as any} 
          loading={loading} 
        />
        {/* Status Card Rehecha Visualmente (Opina+ Brand Look) */}
        <div className={`card p-6 border shadow-sm flex flex-col justify-start relative overflow-hidden group border-stroke bg-surface2/30`}>
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500 group-hover:scale-110 transform origin-top-right">
            <span className="material-symbols-outlined text-[100px] text-primary">diamond</span>
          </div>
          
          <div className="flex items-center gap-2 mb-4 z-10">
            <div className="w-8 h-8 rounded-full bg-surface border border-stroke flex items-center justify-center shadow-sm">
              <span className={`material-symbols-outlined text-[16px] text-text-muted`}>workspace_premium</span>
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary">Rango Cívico en Opina+</h3>
          </div>

          <div className="z-10 mt-2">
            <h4 className="text-3xl font-black text-ink tracking-tight mb-1">
              {snapshot.sufficiency !== 'insufficient_data' ? 'Influyente' : 'Recién Llegado'}
            </h4>
            <p className="text-sm font-bold text-text-muted mb-6">
              {snapshot.sufficiency !== 'insufficient_data' ? 'Comienzas a influir' : 'Fase de Calibración'}
            </p>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-ink mb-1 uppercase tracking-widest text-[9px]">
                  <span>Progreso al Siguiente Nivel</span>
                  <span className="text-primary">{snapshot.overview?.totalSignals || 0} / 50</span>
                </div>
                <div className="h-2 w-full bg-surface2 hover:bg-stroke transition-colors rounded-full overflow-hidden border border-stroke/50">
                  <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${Math.min(((snapshot.overview?.totalSignals || 0) / 50) * 100, 100)}%` }}></div>
                </div>
              </div>

              {snapshot.sufficiency !== 'insufficient_data' && (
                <div className="bg-surface/60 p-3 rounded-xl border border-stroke backdrop-blur-sm">
                  <p className="text-xs font-medium text-text-secondary leading-relaxed">
                    <span className="font-bold text-ink block mb-1">Status Activo:</span> 
                    Sube de nivel para acceder a análisis de tendencia exclusivos.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
