import { MasterHubSnapshot, VersusModuleResult } from '../../../../read-models/b2c/hub-types';
import { UserComparisonInsight } from '../../../../read-models/types';
import { MomentumBar } from '../MomentumBar';

interface TransversalComparatorProps {
  snapshot: MasterHubSnapshot;
  loading: boolean;
}

export function TransversalComparator({ snapshot, loading }: TransversalComparatorProps) {
  const isFiltered = snapshot.cohortState.isFiltered;
  const privacyState = snapshot.cohortState.privacyState;

  if (loading || (isFiltered && privacyState === 'insufficient_cohort')) {
     return <div className="w-full min-h-[40vh] bg-slate-950 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-slate-800 border-t-slate-500 animate-spin"></div></div>;
  }

  const versusComparisons = (snapshot.modules.versus as VersusModuleResult)?.comparisons || [];
  if (!versusComparisons.length) return null;

  const coincidences = versusComparisons
    .filter((c: UserComparisonInsight) => c.majorityPrefers === true)
    .sort((a, b) => b.preferenceShare - a.preferenceShare);
  const discrepancies = versusComparisons
    .filter((c: UserComparisonInsight) => c.majorityPrefers === false)
    .sort((a, b) => b.preferenceShare - a.preferenceShare);

  const totalAnalyzed = coincidences.length + discrepancies.length;
  const alignmentScore = totalAnalyzed > 0 
      ? Math.round((coincidences.length / totalAnalyzed) * 100) 
      : 0;

  const bgGlowClass = alignmentScore >= 50 ? 'bg-emerald-500' : 'bg-rose-500';
  const textScoreClass = alignmentScore >= 50 ? 'text-emerald-400' : 'text-rose-400';

  return (
    <div className="w-full bg-slate-950 py-16 md:py-24 relative overflow-hidden">
       {/* Ambient Light from side */}
       <div className={`absolute top-1/2 -translate-y-1/2 left-0 w-[50vw] md:w-[600px] aspect-square ${bgGlowClass} opacity-5 md:opacity-[0.03] blur-[120px] rounded-full pointer-events-none`} />

       <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 relative z-10 flex flex-col lg:flex-row gap-16 lg:gap-24">
         
         {/* Left Side: Alignment Score & Context */}
         <div className="w-full lg:w-1/3 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-slate-800/50 pb-12 lg:pb-0 lg:pr-16">
            <div className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-slate-500 mb-6 flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                Tú vs La Comunidad
            </div>
            
            <div className={`text-7xl md:text-8xl lg:text-[120px] font-black ${textScoreClass} leading-none tracking-tighter mb-4`}>
               {alignmentScore}%
            </div>
            
            <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight text-balance leading-snug mb-4">
               {alignmentScore >= 50 
                   ? 'Tu perfil está en alta sintonía con el consenso mayoritario.'
                   : 'Tu perfil representa una fuerte voz disidente en la red.'}
            </h3>
            <p className="text-sm font-medium text-slate-400">
               Basado en {totalAnalyzed} decisiones comparables recientes.
            </p>
         </div>

         {/* Right Side: Data Points */}
         <div className="w-full lg:w-2/3 flex flex-col md:flex-row gap-12 lg:gap-16">
             {/* Coincidencias */}
             {coincidences.length > 0 && (
                 <div className="flex-1 flex flex-col gap-8">
                    <div className="flex items-center gap-3">
                       <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400">👍</span>
                       <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400/80">Consenso Principal</span>
                    </div>
                    <div className="space-y-8">
                       {coincidences.slice(0,3).map((item, idx) => (
                           <div key={`coin-${idx}`} className="flex flex-col gap-3">
                              <div className="text-white font-bold text-lg md:text-xl leading-none tracking-tight">{item.entityName}</div>
                              <div className="opacity-90">
                                <MomentumBar entityAName={item.entityName} entityBName="Resto" scoreA={item.preferenceShare} scoreB={100-item.preferenceShare} trendA="up" />
                              </div>
                           </div>
                       ))}
                    </div>
                 </div>
             )}

             {/* Discrepancias */}
             {discrepancies.length > 0 && (
                 <div className="flex-1 flex flex-col gap-8">
                    <div className="flex items-center gap-3">
                       <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/10 text-amber-400">⚡</span>
                       <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-500/80">Zonas de Disidencia</span>
                    </div>
                    <div className="space-y-8">
                       {discrepancies.slice(0,3).map((item, idx) => (
                           <div key={`disc-${idx}`} className="flex flex-col gap-3">
                              <div className="text-white font-bold text-lg md:text-xl leading-none tracking-tight">{item.entityName}</div>
                              <div className="opacity-90">
                                <MomentumBar entityAName={item.entityName} entityBName="Resto" scoreA={item.preferenceShare} scoreB={100-item.preferenceShare} trendA="down" />
                              </div>
                           </div>
                       ))}
                    </div>
                 </div>
             )}
         </div>

       </div>
    </div>
  );
}
