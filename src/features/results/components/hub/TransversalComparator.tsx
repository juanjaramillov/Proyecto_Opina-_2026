import { Activity, Clock, Globe2, Target, Users, UserRound } from 'lucide-react';
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
    <div className="w-full bg-slate-900 border-none sm:border sm:border-slate-800 sm:rounded-[3rem] md:rounded-[4rem] p-8 pt-12 pb-10 md:p-16 lg:p-24 shadow-2xl text-white relative overflow-hidden flex flex-col">
      {/* Fondo inmersivo sobrio premium */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-black pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.08),transparent_60%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.05),transparent_60%)] pointer-events-none" />

      {/* Encabezado Factual */}
      <div className="mb-4 text-center relative z-10">
        <h2 className="text-[11px] md:text-sm font-black uppercase tracking-[0.25em] text-slate-400 mb-6 flex items-center justify-center gap-3">
           <Activity className="w-5 h-5 text-primary" />
           Tú vs La Comunidad
        </h2>
      </div>

      {/* Score Comparativo Central MASIVO (< 2 segundos de lectura) */}
      <div className="flex-1 flex flex-col items-center justify-center py-10 md:py-16 relative z-10 w-full">
         <div className="relative w-64 h-64 md:w-[360px] md:h-[360px] flex items-center justify-center mb-8 md:mb-12">
            <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_20px_rgba(16,185,129,0.2)]">
               {/* Background Circle */}
               <circle cx="50%" cy="50%" r="46%" fill="transparent" stroke="currentColor" strokeWidth="6" className="text-slate-800" />
               {/* Foreground Circle */}
               <circle 
                  cx="50%" cy="50%" r="46%" 
                  fill="transparent" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  className={alignmentScore >= 50 ? "text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" : "text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]"} 
                  strokeDasharray="289" 
                  strokeDashoffset={289 - (289 * alignmentScore) / 100} 
                  strokeLinecap="round" 
               />
            </svg>
            <div className="flex flex-col items-center text-center">
               <span className="text-7xl md:text-[100px] font-black tracking-tighter leading-none [text-shadow:0_0_40px_rgba(255,255,255,0.2)]">{alignmentScore}%</span>
               <span className="text-[12px] md:text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mt-4">Nivel de Alineación</span>
            </div>
         </div>
         <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-balance text-center max-w-3xl leading-[1.1] tracking-tight">
            {factualInsight}
         </h3>
      </div>

      {/* Barras Comparativas de Soporte */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 mb-10 relative z-10 w-full">
         
         {/* Zona de Consenso */}
         {hasCoincidences && (
         <div className="bg-slate-800/20 border border-slate-700/50 rounded-[2rem] p-8 md:p-10 flex flex-col gap-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                  <Users className="w-5 h-5" />
               </div>
               <span className="text-sm uppercase tracking-[0.15em] font-black text-slate-300">Alineado al Consenso</span>
            </div>
            {coincidences.slice(0, 2).map((item, idx) => (
                <div key={`coin-${idx}`} className="flex flex-col mb-2 scale-105 origin-left">
                   <MomentumBar 
                       entityAName={item.entityName}
                       entityBName="Resto"
                       scoreA={item.preferenceShare}
                       scoreB={100 - item.preferenceShare}
                       trendA="up"
                   />
                </div>
            ))}
         </div>
         )}
         
         {/* Zona de Disidencia */}
         {hasDiscrepancies && (
         <div className="bg-slate-800/20 border border-slate-700/50 rounded-[2rem] p-8 md:p-10 flex flex-col gap-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                  <UserRound className="w-5 h-5" />
               </div>
               <span className="text-sm uppercase tracking-[0.15em] font-black text-slate-300">Marcada Disidencia</span>
            </div>
            {discrepancies.slice(0, 2).map((item, idx) => (
                <div key={`disc-${idx}`} className="flex flex-col mb-2 scale-105 origin-left">
                    <MomentumBar 
                       entityAName={item.entityName}
                       entityBName="Resto"
                       scoreA={item.preferenceShare}
                       scoreB={100 - item.preferenceShare}
                       trendA="down"
                    />
                </div>
            ))}
         </div>
         )}
      </div>

      {/* Métricas de Confianza (Repetidas según Regla) */}
      <div className="pt-8 border-t border-slate-800/50 flex flex-wrap items-center justify-center gap-4 relative z-10 w-full max-w-4xl mx-auto">
         <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 rounded-xl text-xs font-bold text-slate-300 uppercase tracking-widest backdrop-blur-sm">
             <Target className="w-4 h-4 text-primary" />
             <span>Muestra: {snapshot.overview?.totalSignals || 14500}</span>
         </div>
         <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 rounded-xl text-xs font-bold text-slate-300 uppercase tracking-widest backdrop-blur-sm">
             <Clock className="w-4 h-4 text-emerald-500" />
             <span>Últimos 7 días</span>
         </div>
         <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 rounded-xl text-xs font-bold text-slate-300 uppercase tracking-widest backdrop-blur-sm">
             <Globe2 className="w-4 h-4 text-blue-400" />
             <span>{isFiltered ? 'Filtro Activo' : 'Comunidad Global'}</span>
         </div>
      </div>
    </div>
  );
}
