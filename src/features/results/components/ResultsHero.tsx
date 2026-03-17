import { useNavigate } from "react-router-dom";
import { Activity, AlertCircle, Info, Target } from "lucide-react";
import { MasterHubSnapshot } from "../../../read-models/b2c/hub-types";

interface ResultsHeroProps {
  snapshot: MasterHubSnapshot;
  loading: boolean;
}

export function ResultsHero({ snapshot, loading }: ResultsHeroProps) {
  const nav = useNavigate();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 pb-16 border-b border-stroke/50 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Columna Izquierda: Copys y micro insights (7/12) */}
      <div className="lg:col-span-7 flex flex-col justify-center">
        {/* Badges de apoyo */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className={`px-2.5 py-1 rounded-full border text-[10px] font-black text-ink uppercase tracking-widest flex items-center gap-1.5 shadow-sm ${
            snapshot.sufficiency === 'sufficient_data' 
              ? 'bg-primary/5 border-primary/20 text-primary' 
              : snapshot.sufficiency === 'partial_data'
                ? 'bg-amber-500/5 border-amber-500/20 text-amber-600'
                : 'bg-red-500/5 border-red-500/20 text-red-600'
          }`}>
            {snapshot.sufficiency === 'sufficient_data' && <Activity className="w-3.5 h-3.5" />}
            {snapshot.sufficiency === 'partial_data' && <Info className="w-3.5 h-3.5" />}
            {snapshot.sufficiency === 'insufficient_data' && <AlertCircle className="w-3.5 h-3.5" />}
            {snapshot.sufficiency === 'sufficient_data' ? 'Señal Robusta' : snapshot.sufficiency === 'partial_data' ? 'Señal en Consolidación' : 'Señal Exploratoria'}
          </span>
          <span className="px-3 py-1 bg-surface border border-stroke rounded-full text-[10px] font-bold tracking-widest uppercase text-text-muted">
            Perfil {snapshot.user.profileCompleteness}%
          </span>
        </div>

        {/* Titular Editorial Fuerte */}
        <h1 className="text-4xl md:text-5xl lg:text-[52px] font-black text-ink leading-[1.05] tracking-tight mb-5 text-balance">
          {snapshot.sufficiency === 'sufficient_data' 
              ? <>Tus posiciones frente al consumo, <span className="text-gradient-brand">en un solo lugar.</span></>
              : snapshot.overview.totalSignals > 0
                ? <>Ya comenzaste a construir tu lectura <span className="text-gradient-brand">dentro de Opina+.</span></>
                : <>Tu red personal de señales <span className="text-gradient-brand">todavía está en construcción.</span></>
          }
        </h1>

        {/* Subtítulo Útil */}
        <p className="text-lg text-text-secondary font-medium leading-relaxed max-w-xl text-balance">
          {snapshot.sufficiency === 'sufficient_data'
              ? 'Tus patrones muestran una alta estabilidad comparado con tu grupo demográfico en los módulos activos.'
              : 'Algunas capas ya están activas; otras se desbloquean a medida que incrementes tu participación en los diferentes módulos interactivos.'
          }
        </p>

        {/* Micro-insights secundarios */}
        {snapshot.cohortState.isFiltered && snapshot.cohortState.privacyState !== 'insufficient_cohort' && (
          <div className="mt-8 flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-2xl w-max">
            <Target className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-ink leading-tight">Lente Demográfico Activo</p>
              <p className="text-xs text-text-secondary mt-0.5">La lectura actual aísla el comportamiento de tu segmento específico.</p>
            </div>
          </div>
        )}
      </div>

      {/* Columna Derecha: Visual Principal (5/12) */}
      <div className="lg:col-span-5 flex items-center justify-end relative mt-8 lg:mt-0">
        <div className="w-full max-w-md bg-surface border border-stroke rounded-[32px] p-8 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-700 pointer-events-none">
            <Activity className="w-48 h-48 text-primary -mr-12 -mt-12" />
          </div>

          <h3 className="text-sm font-black uppercase tracking-widest text-ink mb-8">Huella de Señal</h3>
          
          <div className="space-y-6 relative z-10">
            {[
              { label: 'Decisiones Rápidas (Versus)', type: 'versus', color: 'bg-primary' },
              { label: 'Comparación Múltiple (Torneos)', type: 'torneo', color: 'bg-indigo-500' },
              { label: 'Temas Coyunturales (Actualidad)', type: 'actualidad', color: 'bg-rose-500' }
            ].map(mod => {
              const totalSignals = snapshot.overview.totalSignals || 1; // avoid /0
              const count = snapshot.overview.topModules.find(m => m.moduleType === mod.type)?.count || 0;
              const pct = (count / totalSignals) * 100;

              return (
                <div key={mod.type} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-text-secondary">{mod.label}</span>
                    <span className="text-ink">{pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 w-full bg-surface2 rounded-full overflow-hidden">
                    <div className={`h-full ${mod.color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-8 pt-6 border-t border-stroke flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Volumen Total</span>
              <div className="text-2xl font-black text-ink">{snapshot.overview.totalSignals} <span className="text-sm text-text-secondary font-medium">señales</span></div>
            </div>
            <div className="flex items-center gap-3">
              {snapshot.user.profileCompleteness < 100 && (
                <button 
                  onClick={() => nav('/complete-profile')}
                  className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary-muted transition-colors flex items-center gap-1"
                  disabled={loading}
                >
                  Completar Perfil
                </button>
              )}
              <div className="w-10 h-10 rounded-full border border-stroke flex items-center justify-center bg-surface2 relative">
                <div className="absolute inset-0 rounded-full border-[3px] border-primary border-t-transparent animate-spin-slow" style={{ animationDuration: '3s', opacity: 0.3 }} />
                <Target className="w-4 h-4 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
