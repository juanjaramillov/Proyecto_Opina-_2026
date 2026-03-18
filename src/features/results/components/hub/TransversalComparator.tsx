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
     return <div className="w-full min-h-[50vh] bg-slate-950 flex items-center justify-center"><div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-slate-500 animate-spin"></div></div>;
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
      : 50;

  const bgGlowClass = alignmentScore >= 50 ? 'bg-emerald-500' : 'bg-rose-500';
  const textScoreClass = alignmentScore >= 50 ? 'text-emerald-400' : 'text-rose-400';
  const borderOrbitClass = alignmentScore >= 50 ? 'border-t-emerald-500/50' : 'border-t-rose-500/50';

  const factualInsight = alignmentScore >= 50 
      ? `Coincides con la mayoría en un ${alignmentScore}% de tus posturas.`
      : `Eres partícipe de la minoría disidente en un ${100 - alignmentScore}% de los casos.`;

  return (
    <div className="w-full bg-slate-950 flex flex-col relative overflow-hidden min-h-[100vh] lg:min-h-[120vh]">
       {/* Ambient Light from bottom */}
       <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[200vw] md:w-[150vw] xl:w-[1200px] aspect-square ${bgGlowClass} opacity-10 md:opacity-15 blur-[120px] rounded-[100%] pointer-events-none transition-colors duration-1000 translate-y-1/2`} />
       {/* Grid overlay */}
       <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] md:bg-[size:100px_100px] pointer-events-none opacity-50 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]"></div>

       {/* Top Header */}
       <div className="w-full relative z-20 pt-24 md:pt-32 px-6 md:px-12 flex flex-col items-center">
         <div className="text-[10px] xl:text-xs font-black uppercase tracking-[0.4em] text-slate-500 mb-8 border border-slate-800 px-6 py-2 rounded-full backdrop-blur-md">Tú vs La Comunidad</div>
         <h3 className="text-4xl md:text-6xl lg:text-[80px] font-black text-white text-center tracking-tighter leading-[0.9] text-balance max-w-6xl">
            {factualInsight}
         </h3>
       </div>

       {/* Center / Bottom: The HUD Space */}
       <div className="flex-1 w-full relative z-10 flex flex-col justify-end items-center mt-20">
          
          {/* Data Points - Free floating without cards */}
          <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 px-6 md:px-12 pb-[50vh] md:pb-[40vh] relative z-30">
             
             {/* Coincidencias */}
             {coincidences.length > 0 && (
                 <div className="flex flex-col gap-8 lg:pr-12">
                    <div className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-emerald-500/80">
                       <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full mr-3 animate-pulse"></span>
                       Puntos de Consenso
                    </div>
                    <div className="space-y-6">
                       {coincidences.slice(0,2).map((item, idx) => (
                           <div key={`coin-${idx}`} className="border-l-[3px] border-emerald-500/30 pl-6 py-1">
                              <div className="text-white font-black text-xl md:text-3xl leading-none tracking-tight mb-4">{item.entityName}</div>
                              {/* Reusing MomentumBar but it needs to be transparent - it usually adapts to parent container */}
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
                 <div className="flex flex-col gap-8 lg:pl-12 lg:mt-32">
                    <div className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-amber-500/80">
                       <span className="inline-block w-2 h-2 bg-amber-500 rounded-full mr-3 animate-pulse"></span>
                       Zonas de Fricción
                    </div>
                    <div className="space-y-6">
                       {discrepancies.slice(0,2).map((item, idx) => (
                           <div key={`disc-${idx}`} className="border-l-[3px] border-amber-500/30 pl-6 py-1">
                              <div className="text-white font-black text-xl md:text-3xl leading-none tracking-tight mb-4">{item.entityName}</div>
                              <div className="opacity-90">
                                <MomentumBar entityAName={item.entityName} entityBName="Resto" scoreA={item.preferenceShare} scoreB={100-item.preferenceShare} trendA="down" />
                              </div>
                           </div>
                       ))}
                    </div>
                 </div>
             )}
          </div>

          {/* The Massive Bottom Arc */}
          <div className="absolute -bottom-[60vw] md:-bottom-[45vw] lg:-bottom-[35vw] left-1/2 -translate-x-1/2 w-[150vw] md:w-[120vw] lg:w-[100vw] xl:w-[80vw] aspect-square rounded-full border-[1px] border-slate-800/80 flex items-start justify-center pt-[15vw] md:pt-[10vw]">
              <div className="absolute inset-8 md:inset-16 rounded-full border-[1px] border-slate-800/40"></div>
              <div className={`absolute inset-16 md:inset-32 rounded-full border-t-[3px] ${borderOrbitClass} [box-shadow:inset_0_40px_100px_rgba(255,255,255,0.02)]`}></div>
              
              <div className="flex flex-col items-center relative z-20 mt-8 md:mt-24 lg:mt-32">
                 <div className={`text-[130px] md:text-[220px] lg:text-[300px] font-black ${textScoreClass} leading-none tracking-tighter`} style={{ textShadow: `0 0 120px var(--tw-shadow-color)` }}>
                    {alignmentScore}%
                 </div>
                 <div className="text-[10px] md:text-xs font-bold uppercase tracking-[0.8em] text-slate-500 mt-4 md:mt-8 ml-4">
                    Alineación
                 </div>
              </div>
          </div>
       </div>
    </div>
  );
}
