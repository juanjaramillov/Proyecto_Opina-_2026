import { Activity, AlertCircle, Info, Target } from "lucide-react";
import { MasterHubSnapshot } from "../../../read-models/b2c/hub-types";

interface ResultsHeroProps {
  snapshot: MasterHubSnapshot;
}

export function ResultsHero({ snapshot }: ResultsHeroProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
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

      {/* Columna Derecha: Ilustración Inmersiva (El Núcleo) */}
      <div className="lg:col-span-5 flex items-center justify-center relative min-h-[350px] lg:min-h-full mt-8 lg:mt-0">
        {/* Fondo radiante */}
        <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] ${snapshot.sufficiency === 'sufficient_data' ? 'from-primary/20' : 'from-amber-500/20'} to-transparent blur-3xl rounded-full opacity-60 animate-pulse`} />
        
        {/* Estructura del Núcleo (3D CSS) */}
        <div className="relative w-72 h-72 flex items-center justify-center perspective-1000 group">
            {/* Órbitas rotatorias */}
            <div className="absolute inset-0 rounded-full border border-primary/20 border-l-primary/60 border-r-primary/60 animate-[spin_12s_linear_infinite] group-hover:border-primary/80 transition-colors duration-700" style={{ transform: 'rotateX(60deg) rotateY(20deg)' }} />
            <div className="absolute inset-6 rounded-full border border-indigo-400/20 border-t-indigo-400/60 border-b-indigo-400/60 animate-[spin_8s_linear_infinite_reverse]" style={{ transform: 'rotateX(40deg) rotateY(-20deg)' }} />
            <div className="absolute inset-12 rounded-full border border-emerald-400/20 border-l-emerald-400/60 animate-[spin_6s_linear_infinite]" style={{ transform: 'rotateX(70deg)' }} />
            
            {/* Centro Brillante */}
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${snapshot.sufficiency === 'sufficient_data' ? 'from-primary to-indigo-600 shadow-[0_0_50px_rgba(37,99,235,0.5)]' : 'from-amber-400 to-orange-500 shadow-[0_0_50px_rgba(245,158,11,0.5)]'} relative z-10 flex items-center justify-center transform transition-all group-hover:scale-110 duration-700 ease-elastic`}>
                <Activity className="w-10 h-10 text-white animate-pulse" />
                {/* Partículas atractoras */}
                <div className="absolute w-2.5 h-2.5 bg-white rounded-full top-0 -translate-y-10 animate-[ping_2s_infinite]" />
                <div className="absolute w-1.5 h-1.5 bg-white/80 rounded-full bottom-0 translate-y-12 translate-x-12 animate-[ping_3s_infinite_1s]" />
                <div className="absolute w-3 h-3 bg-white/60 rounded-full left-0 -translate-x-12 translate-y-6 animate-[ping_2.5s_infinite_0.5s]" />
                <div className="absolute w-2 h-2 bg-indigo-200/80 rounded-full right-0 translate-x-10 -translate-y-8 animate-[bounce_2s_infinite]" />
            </div>
            
            {/* Anillos de eco */}
            <div className={`absolute inset-0 rounded-full border border-${snapshot.sufficiency === 'sufficient_data' ? 'primary' : 'amber-500'}/30 animate-[ping_3s_infinite] scale-150`} />
        </div>

        {/* Float Stats (Glassmorphism) */}
        <div className="absolute bottom-0 right-0 lg:-right-4 bg-white/70 backdrop-blur-xl border border-stroke/50 shadow-2xl p-5 rounded-3xl animate-in slide-in-from-bottom-8 duration-1000 delay-300">
            <p className="text-[10px] uppercase tracking-widest font-black text-text-muted mb-1 flex items-center gap-1.5">
               <Target className="w-3 h-3 text-primary" /> Volumen Total
            </p>
            <div className="text-4xl font-black text-ink flex items-baseline gap-1 tracking-tighter">
                {snapshot.overview.totalSignals} <span className="text-sm font-medium text-text-secondary tracking-normal">señales</span>
            </div>
        </div>
      </div>
    </div>
  );
}
