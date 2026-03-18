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
    <div className="w-full bg-slate-900 border border-slate-800 rounded-[2rem] md:rounded-[3rem] p-6 pt-10 pb-8 md:p-12 shadow-2xl text-white relative overflow-hidden flex flex-col">
      {/* Fondo inmersivo sobrio */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.05),transparent_60%)] pointer-events-none" />

      {/* Encabezado Factual */}
      <div className="mb-0 text-center relative z-10">
        <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center justify-center gap-2">
           <Activity className="w-4 h-4 text-emerald-500" />
           Tú vs La Comunidad
        </h2>
      </div>

      {/* Score Comparativo Central (< 2 segundos de lectura) */}
      <div className="flex-1 flex flex-col items-center justify-center py-6 md:py-10 relative z-10 w-full">
         <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center mb-6">
            <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-lg">
               {/* Background Circle */}
               <circle cx="50%" cy="50%" r="46%" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-800" />
               {/* Foreground Circle */}
               <circle 
                  cx="50%" cy="50%" r="46%" 
                  fill="transparent" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  className={alignmentScore >= 50 ? "text-emerald-500" : "text-amber-500"} 
                  strokeDasharray="289" 
                  strokeDashoffset={289 - (289 * alignmentScore) / 100} 
                  strokeLinecap="round" 
               />
            </svg>
            <div className="flex flex-col items-center text-center">
               <span className="text-5xl md:text-[64px] font-black tracking-tighter leading-none">{alignmentScore}%</span>
               <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">Alineación</span>
            </div>
         </div>
         <h3 className="text-xl md:text-3xl font-black text-balance text-center max-w-lg leading-[1.15] tracking-tight">
            {factualInsight}
         </h3>
      </div>

      {/* Barras Comparativas de Soporte */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 mb-10 relative z-10 w-full">
         
         {/* Zona de Consenso */}
         {hasCoincidences && (
         <div className="bg-slate-950/30 border border-slate-800 rounded-[1.5rem] p-6 flex flex-col gap-5">
            <div className="flex items-center gap-2 mb-2">
               <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Users className="w-3.5 h-3.5" />
               </div>
               <span className="text-xs uppercase tracking-widest font-black text-slate-400">Alineado al Consenso</span>
            </div>
            {coincidences.slice(0, 2).map((item, idx) => (
                <div key={`coin-${idx}`} className="flex flex-col mb-2">
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
         <div className="bg-slate-950/30 border border-slate-800 rounded-[1.5rem] p-6 flex flex-col gap-5">
            <div className="flex items-center gap-2 mb-2">
               <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <UserRound className="w-3.5 h-3.5" />
               </div>
               <span className="text-xs uppercase tracking-widest font-black text-slate-400">Marcada Disidencia</span>
            </div>
            {discrepancies.slice(0, 2).map((item, idx) => (
                <div key={`disc-${idx}`} className="flex flex-col mb-2">
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
      <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-center gap-3 relative z-10">
         <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-wider">
             <Target className="w-3.5 h-3.5" />
             <span>Muestra: {snapshot.overview?.totalSignals || 14500}</span>
         </div>
         <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-wider">
             <Clock className="w-3.5 h-3.5" />
             <span>Últimos 7 días</span>
         </div>
         <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-wider">
             <Globe2 className="w-3.5 h-3.5" />
             <span>{isFiltered ? 'Filtro Activo' : 'Comunidad Global'}</span>
         </div>
      </div>
    </div>
  );
}
