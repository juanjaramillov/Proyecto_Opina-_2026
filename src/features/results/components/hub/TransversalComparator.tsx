import { Activity, Globe2, Target, Users, UserRound } from 'lucide-react';
import { MasterHubSnapshot, VersusModuleResult } from '../../../../read-models/b2c/hub-types';
import { UserComparisonInsight } from '../../../../read-models/types';
import { MomentumBar } from '../MomentumBar';

interface TransversalComparatorProps {
  snapshot: MasterHubSnapshot;
  loading: boolean;
  onClearFilter?: () => void;
}

export function TransversalComparator({ snapshot, loading, onClearFilter }: TransversalComparatorProps) {
  const isFiltered = snapshot.cohortState.isFiltered;
  const privacyState = snapshot.cohortState.privacyState;

  // Estados de carga
  if (loading) {
    return (
      <div className="w-full bg-slate-900 border border-slate-800 rounded-[2rem] p-8 md:p-12 min-h-[400px] flex flex-col gap-6 shadow-2xl">
        <div className="h-8 w-1/3 bg-slate-800 animate-pulse rounded"></div>
        <div className="flex-1 w-full flex items-center justify-center">
            <div className="w-48 h-48 rounded-full border-8 border-slate-800 animate-pulse"></div>
        </div>
      </div>
    );
  }

  const versusComparisons = (snapshot.modules.versus as VersusModuleResult)?.comparisons || [];
  const hasComparisons = versusComparisons.length > 0;

  // Empty State Elegante
  if (!hasComparisons) {
    return (
      <div className="w-full bg-slate-900 border border-slate-800 rounded-[2rem] p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[400px] shadow-2xl relative overflow-hidden">
        <Activity className="w-16 h-16 text-slate-700 mb-6" />
        <h2 className="text-2xl font-black text-white mb-3 tracking-tight">Espejo en Construcción</h2>
        <p className="text-sm font-medium text-slate-400 max-w-sm">No tenemos suficientes señales tuyas para generar una comparación robusta frente a la comunidad.</p>
      </div>
    );
  }

  // Estado Privacidad
  if (isFiltered && privacyState === 'insufficient_cohort') {
    return (
      <div className="w-full bg-slate-900 border border-slate-800 rounded-[2rem] p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[400px] shadow-2xl relative overflow-hidden">
        <h2 className="text-2xl font-black text-white mb-3 tracking-tight">Protección de Anonimato</h2>
        <p className="text-sm font-medium text-slate-400 max-w-sm mb-6">El filtro aplicado reduce tanto la muestra que no podemos mostrar datos de comparación sin comprometer la privacidad del cohorte.</p>
        {onClearFilter && (
            <button onClick={onClearFilter} className="px-6 py-3 bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-700 transition">
                Limpiar Filtros
            </button>
        )}
      </div>
    );
  }

  const coincidences = versusComparisons
    .filter((c: UserComparisonInsight) => c.majorityPrefers === true)
    .sort((a, b) => b.preferenceShare - a.preferenceShare);

  const discrepancies = versusComparisons
    .filter((c: UserComparisonInsight) => c.majorityPrefers === false)
    .sort((a, b) => b.preferenceShare - a.preferenceShare);

  const hasCoincidences = coincidences.length > 0;
  const hasDiscrepancies = discrepancies.length > 0;

  // Cálculo de un 'Score de Alineación' simple (0 a 100)
  const totalAnalyzed = coincidences.length + discrepancies.length;
  const alignmentScore = totalAnalyzed > 0 
      ? Math.round((coincidences.length / totalAnalyzed) * 100) 
      : 50;

  // Frase factual según el score
  const factualInsight = alignmentScore >= 50 
      ? `Coincides con la mayoría en un ${alignmentScore}% de tus posturas.`
      : `Eres partícipe de la minoría disidente en un ${100 - alignmentScore}% de los casos.`;

  return (
    <div className="w-full bg-slate-950 py-16 md:py-24 relative overflow-hidden flex flex-col min-h-[85vh] lg:min-h-[100vh]">
      {/* Fondos y Luces Radiales Masivas */}
      <div className="absolute inset-0 pointer-events-none">
          {/* Luz principal según score */}
          <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[150vw] md:w-[1000px] h-[75vw] md:h-[500px] opacity-20 blur-[100px] rounded-t-full transition-colors duration-1000 ${alignmentScore >= 50 ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
          {/* Malla oscura sutil de fondo */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"></div>
      </div>

      {/* Encabezado Factual Superior */}
      <div className="w-full max-w-[1200px] mx-auto px-6 relative z-20 text-center mb-12 lg:mb-0">
        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-slate-900 border border-slate-800 text-xs md:text-sm font-black uppercase tracking-[0.2em] text-slate-400 shadow-2xl mb-8">
           <Activity className="w-4 h-4 text-white" />
           Tú vs La Comunidad
        </div>
        
        {/* Frase Factual arriba del gráfico */}
        <h3 className="text-4xl md:text-6xl lg:text-7xl font-black text-white text-balance max-w-4xl mx-auto leading-[1.05] tracking-tighter mb-4 drop-shadow-2xl">
            {factualInsight}
        </h3>
      </div>

      {/* MEDIDOR RADIAL GIGANTE (Semicírculo desde abajo) */}
      <div className="flex-1 w-full flex flex-col justify-end items-center relative z-10 mt-12 md:mt-24 pointer-events-none">
         <div className="relative w-[120vw] h-[60vw] md:w-[800px] md:h-[400px] flex items-end justify-center overflow-hidden">
            <svg 
               className={`absolute bottom-0 w-full h-[200%] md:h-[800px] origin-bottom transition-all duration-1000 ease-out ${alignmentScore >= 50 ? 'drop-shadow-[0_0_40px_rgba(16,185,129,0.3)] text-emerald-500' : 'drop-shadow-[0_0_40px_rgba(251,191,36,0.3)] text-amber-500'}`}
               viewBox="0 0 100 100"
            >
               {/* Background Arc */}
               <path d="M 5 50 A 45 45 0 0 1 95 50" fill="none" stroke="currentColor" strokeWidth="2" strokeOpacity="0.1" strokeLinecap="round" />
               <path d="M 12 50 A 38 38 0 0 1 88 50" fill="none" stroke="currentColor" strokeWidth="4" strokeOpacity="0.2" strokeLinecap="round" />
               
               {/* Foreground Score Arc */}
               <path 
                 d="M 12 50 A 38 38 0 0 1 88 50" 
                 fill="none" 
                 stroke="currentColor" 
                 strokeWidth="6"
                 strokeLinecap="round"
                 strokeDasharray="119.38" // half circumference of r=38
                 strokeDashoffset={119.38 - (119.38 * alignmentScore) / 100}
                 className="transition-all duration-1500 ease-[cubic-bezier(0.2,1,0.2,1)]"
               />
            </svg>
            
            {/* Texto de Porcentaje Masivo (Centrado en la base del arco) */}
            <div className="absolute bottom-4 md:bottom-12 flex flex-col items-center">
               <span className="text-[80px] md:text-[140px] font-black tracking-tighter leading-none text-white [text-shadow:0_0_80px_rgba(255,255,255,0.4)]">
                 {alignmentScore}%
               </span>
               <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-slate-400 mt-2 md:mt-4">
                 Alineación Global
               </span>
            </div>
         </div>
      </div>

      {/* Zona Inferior: Modulos de Consenso y Disidencia */}
      <div className="w-full max-w-[1200px] mx-auto px-6 relative z-20 -mt-8 md:-mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
             
             {/* Consenso */}
             {hasCoincidences && (
             <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-10 flex flex-col gap-5 relative overflow-hidden group hover:border-slate-700 transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-emerald-500/20 transition-colors"></div>
                <div className="flex items-center gap-3 relative z-10">
                   <Users className="w-5 h-5 text-emerald-400" />
                   <span className="text-xs md:text-sm uppercase tracking-[0.2em] font-black text-slate-300">Consenso Principal</span>
                </div>
                <div className="space-y-3 relative z-10">
                   {coincidences.slice(0, 2).map((item, idx) => (
                       <MomentumBar 
                           key={`coin-${idx}`}
                           entityAName={item.entityName}
                           entityBName="Resto"
                           scoreA={item.preferenceShare}
                           scoreB={100 - item.preferenceShare}
                           trendA="up"
                       />
                   ))}
                </div>
             </div>
             )}

             {/* Disidencia */}
             {hasDiscrepancies && (
             <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-10 flex flex-col gap-5 relative overflow-hidden group hover:border-slate-700 transition-colors mt-4 lg:mt-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-amber-500/20 transition-colors"></div>
                <div className="flex items-center gap-3 relative z-10">
                   <UserRound className="w-5 h-5 text-amber-400" />
                   <span className="text-xs md:text-sm uppercase tracking-[0.2em] font-black text-slate-300">Zona de Disidencia</span>
                </div>
                <div className="space-y-3 relative z-10">
                   {discrepancies.slice(0, 2).map((item, idx) => (
                       <MomentumBar 
                           key={`disc-${idx}`}
                           entityAName={item.entityName}
                           entityBName="Resto"
                           scoreA={item.preferenceShare}
                           scoreB={100 - item.preferenceShare}
                           trendA="down"
                       />
                   ))}
                </div>
             </div>
             )}
          </div>

          {/* Filtros Contextuales Activos */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-12 opacity-60 hover:opacity-100 transition-opacity">
             <div className="flex items-center gap-2 px-3 py-1.5 border border-slate-800 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                 <Target className="w-3.5 h-3.5" />
                 <span>{snapshot.overview?.totalSignals || 14500} Señales</span>
             </div>
             {isFiltered && (
                 <div className="flex items-center gap-2 px-3 py-1.5 border border-indigo-900/50 bg-indigo-900/20 rounded-lg text-[10px] font-bold text-indigo-300 uppercase tracking-widest">
                     <Globe2 className="w-3.5 h-3.5" />
                     <span>Filtro Cohorte Activo</span>
                 </div>
             )}
          </div>
      </div>
    </div>
  );
}
