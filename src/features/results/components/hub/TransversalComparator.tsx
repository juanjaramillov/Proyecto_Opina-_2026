import { useState } from 'react';
import { Network, Users, UserRound, ArrowRightLeft, LockKeyhole, FilterX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MasterHubSnapshot, VersusModuleResult } from '../../../../read-models/b2c/hub-types';
import { UserComparisonInsight } from '../../../../read-models/types';
import { MomentumBar } from '../MomentumBar';

interface ComparisonLens {
  id: 'total' | 'similar' | 'filtered';
  label: string;
  icon: React.ReactNode;
  isAvailable: boolean;
  unavailableReason?: string;
}

interface TransversalComparatorProps {
  snapshot: MasterHubSnapshot;
  loading: boolean;
  onClearFilter?: () => void;
}

export function TransversalComparator({ snapshot, loading, onClearFilter }: TransversalComparatorProps) {
  const nav = useNavigate();
  const isFiltered = snapshot.cohortState.isFiltered;
  const privacyState = snapshot.cohortState.privacyState;

  // Lógica de Lentes Disponibles
  const lenses: ComparisonLens[] = [
    { 
      id: 'total', 
      label: 'Total Plataforma', 
      icon: <Network className="w-3.5 h-3.5" />,
      isAvailable: true 
    },
    { 
      id: 'similar', 
      label: 'Personas Similares', 
      icon: <Users className="w-3.5 h-3.5" />,
      // Requerimos atributos demográficos y nivel de actividad adecuado.
      isAvailable: snapshot.user.profileCompleteness >= 30 && snapshot.overview.totalSignals >= 10,
      unavailableReason: 'Tu perfil necesita más atributos o mayor participación para encontrar un cohorte seguro.'
    },
    { 
      id: 'filtered', 
      label: 'Filtro Actual', 
      icon: <FilterX className="w-3.5 h-3.5" />,
      isAvailable: isFiltered,
      unavailableReason: 'Usa la barra de arriba para aislar un grupo demográfico específico.'
    }
  ];

  // Forzar lente inicial lógico
  const [activeLensId, setActiveLensId] = useState<'total' | 'similar' | 'filtered'>(
    isFiltered ? 'filtered' : (lenses[1].isAvailable ? 'similar' : 'total')
  );

  // Estados de carga
  if (loading) {
    return (
      <div className="card p-8 border border-stroke bg-white shadow-sm flex flex-col gap-6 rounded-3xl min-h-[400px]">
        <div className="h-8 w-1/3 bg-slate-200 animate-pulse rounded"></div>
        <div className="flex gap-2">
            <div className="h-10 w-32 bg-slate-100 animate-pulse rounded-full"></div>
            <div className="h-10 w-32 bg-slate-100 animate-pulse rounded-full"></div>
        </div>
        <div className="space-y-6 mt-4 flex-1">
          <div className="h-20 w-full bg-slate-100 animate-pulse rounded-xl"></div>
          <div className="h-20 w-full bg-slate-100 animate-pulse rounded-xl"></div>
        </div>
      </div>
    );
  }

  // Prevenir crashes o mostrar empty state
  const versusComparisons = (snapshot.modules.versus as VersusModuleResult)?.comparisons || [];
  const hasComparisons = versusComparisons.length > 0;

  if (!hasComparisons) {
    return (
      <div className="card border border-stroke bg-white shadow-sm flex flex-col rounded-3xl overflow-hidden relative min-h-[400px]">
        <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
          <Network className="w-64 h-64 text-primary -mt-20 -mr-20" />
        </div>
        
        {/* Header Block Disabled */}
        <div className="px-5 pt-5 pb-5 border-b border-stroke bg-surface2/30 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-surface2 flex items-center justify-center border border-stroke shadow-sm flex-shrink-0">
                   <ArrowRightLeft className="w-5 h-5 text-text-muted" />
                 </div>
                 <div>
                   <h2 className="text-lg font-black tracking-tight text-text-muted flex items-center gap-2">
                       Brújula de Similitud <span className="px-2 py-0.5 rounded bg-surface border border-stroke text-[9px] uppercase tracking-widest font-bold">Bloqueada</span>
                   </h2>
                   <p className="text-xs text-text-secondary mt-0.5 font-medium">Contraste analítico transversal.</p>
                 </div>
              </div>
          </div>
        </div>

        {/* Empty Body Premium */}
        <div className="p-12 flex-1 flex flex-col items-center justify-center text-center relative z-10 bg-surface2/10 group hover:bg-surface2/30 transition-colors">
            <div className="w-20 h-20 rounded-full bg-white border border-stroke flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
               <span className="material-symbols-outlined text-[32px] text-primary opacity-80">compare_arrows</span>
            </div>
            <h3 className="text-xl font-black text-ink mb-3 tracking-tight">Cruces de Opinión Inactivos</h3>
            <p className="text-sm font-medium text-text-secondary max-w-sm mb-8 leading-relaxed">
                Interactúa en Versus y Batallas para registrar tu postura. Solo al acumular masa crítica se encenderá el comparador transversal.
            </p>
            <button 
                onClick={() => nav('/experience')} 
                className="btn-secondary px-6 py-2 border-stroke bg-white hover:bg-surface2 transition-all shadow-sm flex items-center gap-2"
            >
                Responder para Desbloquear
            </button>
        </div>
      </div>
    );
  }

  // Manejo de Estado Degradado K-Anonymity
  if (activeLensId === 'filtered' && privacyState === 'insufficient_cohort') {
    return (
      <div className="card border border-stroke bg-white shadow-sm flex flex-col rounded-3xl overflow-hidden">
        {/* Lense Selector Area */}
        <div className="px-6 pt-6 border-b border-stroke pb-4 bg-surface2/30">
          <div className="flex flex-wrap items-center gap-2">
            {lenses.map(lens => (
              <button
                key={lens.id}
                onClick={() => lens.isAvailable && setActiveLensId(lens.id)}
                disabled={!lens.isAvailable}
                className={`px-4 py-2 rounded-full text-xs font-black tracking-widest uppercase flex items-center gap-2 transition-all ${
                  activeLensId === lens.id 
                    ? 'bg-ink text-white shadow-md' 
                    : lens.isAvailable 
                        ? 'bg-white border border-stroke text-text-muted hover:border-ink/50 hover:text-ink'
                        : 'bg-transparent text-slate-300 cursor-not-allowed'
                }`}
                title={!lens.isAvailable ? lens.unavailableReason : undefined}
              >
                {lens.icon}
                {lens.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Error State Body - Neutral Premium */}
        <div className="p-12 flex flex-col justify-center items-center text-center bg-surface2/30">
           <div className="w-16 h-16 rounded-full bg-surface border border-stroke flex items-center justify-center mb-6 shadow-sm relative overflow-hidden">
             <LockKeyhole className="w-6 h-6 text-text-muted relative z-10" />
           </div>
           <h3 className="text-xl font-black text-ink mb-3 tracking-tight">Privacidad Activa</h3>
           <p className="text-sm font-medium text-text-secondary max-w-sm leading-relaxed mb-6">
             El filtro demográfico seleccionado reduce la muestra a un nivel que no permite garantizar el anonimato del cohorte.
           </p>
           {onClearFilter && (
               <button onClick={onClearFilter} className="px-5 py-2.5 bg-white border border-stroke text-ink text-xs font-black uppercase tracking-widest rounded-xl hover:bg-surface2 transition-colors shadow-sm">
                   Volver al total de la plataforma
               </button>
           )}
        </div>
      </div>
    );
  }

  // Procesamiento de Datos para la Vista
  // Ordenar por diferencia para mostrar la mayor alineación primero (menor diferencia respecto a la mayoría),
  // y luego reordenaremos para mostrar polaridad.
  // 1. Mostrar dónde más coincido (> 50%) -> más cercano a 100% de coincidencia con la mayoría.
  // 2. Mostrar dónde más discrepo (< 50%) -> más lejano a 50%, cercano a 0% de la minoría disidente.

  // Filtramos las comparaciones que corresponden al lente actual.
  // La lógica visual consiste en mostrar el top 2 donde COINCIDE con la mayoría
  // y el top 2 donde DISCREPA de la mayoría.

  const coincidences = versusComparisons
    .filter((c: UserComparisonInsight) => c.majorityPrefers === true) // El usuario prefiere lo mismo que la mayoría 
    .sort((a: UserComparisonInsight, b: UserComparisonInsight) => b.preferenceShare - a.preferenceShare); // Más cercano a 100 primero

  const discrepancies = versusComparisons
    .filter((c: UserComparisonInsight) => c.majorityPrefers === false) // El usuario es disidente
    .sort((a: UserComparisonInsight, b: UserComparisonInsight) => b.preferenceShare - a.preferenceShare); // El usuario tiene alta preferencia en algo que la mayoría no

  const hasCoincidences = coincidences.length > 0;
  const hasDiscrepancies = discrepancies.length > 0;

  // Frase Editorial Dinámica: Lenguaje humano y con tensión
  let editorialQuote = "";
  if (activeLensId === 'total') {
      if (hasDiscrepancies && hasCoincidences) editorialQuote = "Frente al total de la plataforma, en consumo casi no te sales del consenso, pero rompes la norma en temas emergentes.";
      else if (hasCoincidences) editorialQuote = "Frente al total de la plataforma, tus decisiones son un calco del consenso general.";
      else editorialQuote = "Tus elecciones nadan contra la corriente del usuario promedio en la plataforma.";
  } else if (activeLensId === 'similar') {
      if (hasDiscrepancies) editorialQuote = "Incluso entre personas similares, tus diferencias estallan en temas públicos más que en lo cotidiano.";
      else editorialQuote = "Descubriste a tu tribu. Tu señal es idéntica a la de las personas sociodemográficamente iguales a ti.";
  } else {
      editorialQuote = `Dentro de este grupo filtrado, tu señal genera fricciones inesperadas.`;
  }

  return (
    <div className="card border border-slate-800 bg-slate-900 shadow-2xl flex flex-col rounded-[2.5rem] overflow-hidden relative isolation-auto text-white">
      {/* Background inmersivo animado */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.05),transparent_50%)] pointer-events-none" />
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
        <Network className="w-96 h-96 text-primary -mt-32 -mr-32 animate-[spin_60s_linear_infinite]" />
      </div>

      {/* 1. Selector de Lentes en el Header del Componente */}
      <div className="px-6 pt-6 pb-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md relative z-10">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center border border-primary/50 shadow-[0_0_20px_rgba(37,99,235,0.3)] flex-shrink-0 relative overflow-hidden group">
                 <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                 <ArrowRightLeft className="w-6 h-6 text-white relative z-10" />
               </div>
               <div>
                 <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                     Brújula de Similitud <span className="px-2.5 py-1 rounded bg-primary/20 text-primary border border-primary/30 text-[9px] uppercase tracking-widest font-black shadow-inner">Beta</span>
                 </h2>
                 <p className="text-sm text-slate-400 mt-1 font-medium">Contraste analítico transversal de tu huella digital.</p>
               </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 bg-slate-950/50 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
              {lenses.map(lens => (
                <button
                  key={lens.id}
                  onClick={() => lens.isAvailable && setActiveLensId(lens.id)}
                  disabled={!lens.isAvailable}
                  className={`px-4 py-2 rounded-xl text-[11px] font-black tracking-widest uppercase flex items-center gap-2 transition-all duration-300 ${
                    activeLensId === lens.id 
                      ? 'bg-gradient-to-r from-slate-800 to-slate-700 text-white shadow-lg border border-slate-600' 
                      : lens.isAvailable 
                          ? 'bg-transparent text-slate-500 hover:text-white hover:bg-slate-800/50'
                          : 'bg-transparent text-slate-700 cursor-not-allowed'
                  }`}
                  title={!lens.isAvailable ? lens.unavailableReason : undefined}
                >
                  {lens.icon}
                  <span className="hidden sm:inline">{lens.label}</span>
                </button>
              ))}
            </div>
        </div>
      </div>

      {/* 2. Cuerpo del Comparador */}
      <div className="p-8 md:p-10 relative z-10 flex flex-col gap-10 md:gap-14">
         
         {/* Frase Editorial Héroe (Radar Style) */}
         <div className="relative mb-4 pb-8 border-b border-slate-800">
            <span className="absolute -top-8 -left-6 text-[100px] text-primary/10 font-serif leading-none select-none pointer-events-none drop-shadow-md">"</span>
            <div className="relative z-10 pl-2">
               <h3 className="text-3xl md:text-5xl lg:text-[56px] font-black text-white tracking-tighter mb-6 text-balance leading-[1.05] drop-shadow-sm">
                   {editorialQuote}
               </h3>
               {activeLensId === 'similar' && (
                  <p className="text-sm font-medium text-slate-300 bg-slate-800/80 backdrop-blur-md inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-slate-700 shadow-lg">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/20 animate-pulse"></span>
                    Muestra calibrada por <span className="font-bold text-white">edad, actividad y patrón de señal.</span>
                  </p>
               )}
            </div>
         </div>

         {/* Contenedor de Barras Divergentes (Holographic Theme) */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 w-full">
            
            {/* Columna: Zonas de Consenso */}
            {hasCoincidences && (
            <div className="flex flex-col gap-6 w-full">
               <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                      <Users className="w-4 h-4 text-indigo-400" />
                  </div>
                  <h4 className="text-sm font-black text-slate-200 uppercase tracking-widest">Alineado al Consenso</h4>
               </div>

               <div className="space-y-6">
                 {coincidences.slice(0, 3).map((item: UserComparisonInsight, idx: number) => (
                     <div key={`coin-${idx}`} className="flex flex-col mb-4 transform hover:translate-x-1 transition-transform">
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
            </div>
            )}

            {/* Columna: Zonas de Tensión/Disidencia */}
            {hasDiscrepancies && (
            <div className="flex flex-col gap-6 w-full">
               <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                  <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                      <UserRound className="w-4 h-4 text-rose-400" />
                  </div>
                  <h4 className="text-sm font-black text-slate-200 uppercase tracking-widest">Marcada Disidencia</h4>
               </div>

               <div className="space-y-6">
                 {discrepancies.slice(0, 3).map((item: UserComparisonInsight, idx: number) => (
                     <div key={`disc-${idx}`} className="flex flex-col mb-4 transform hover:translate-x-1 transition-transform">
                         <MomentumBar 
                            entityAName={item.entityName}
                            entityBName="Minoría"
                            scoreA={item.preferenceShare}
                            scoreB={100 - item.preferenceShare}
                            trendA="down"
                         />
                     </div>
                 ))}
               </div>
            </div>
            )}
            
            {/* Si no hay disidencias, dar algo de aire */}
            {!hasDiscrepancies && hasCoincidences && (
                 <div className="flex flex-col justify-center items-center text-center p-10 border border-dashed border-slate-700 rounded-3xl bg-slate-800/30">
                    <UserRound className="w-10 h-10 text-slate-600 mb-4 animate-pulse" />
                    <p className="text-base font-medium text-slate-400 max-w-sm">Tu perfil actual no presenta disidencias marcadas frente al lente activo. Eres un reflejo exacto del consenso en la red.</p>
                 </div>
            )}

         </div>

         {/* 3. Hallazgos Rápidos (Takeaways) */}
         {(hasCoincidences || hasDiscrepancies) && (
            <div className="mt-4 p-6 rounded-2xl bg-slate-950/50 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-6 shadow-inner">
               <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                     <Users className="w-3.5 h-3.5" /> Mayor Coincidencia
                  </span>
                  <span className="text-sm font-bold text-slate-200 leading-tight">
                     {coincidences[0]?.entityName || 'Alineación general estable.'}
                  </span>
               </div>
               <div className="flex flex-col gap-2 border-l-0 sm:border-l border-slate-800 sm:pl-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                     <UserRound className="w-3.5 h-3.5" /> Mayor Diferencia
                  </span>
                  <span className="text-sm font-bold text-slate-200 leading-tight">
                     {discrepancies[0]?.entityName || 'Poca disidencia detectada.'}
                  </span>
               </div>
               <div className="flex flex-col gap-2 border-l-0 sm:border-l border-slate-800 sm:pl-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                     <Network className="w-3.5 h-3.5" /> Foco de Escaneo
                  </span>
                  <span className="text-sm font-bold text-slate-200 leading-tight">
                     {activeLensId === 'similar' ? 'Cohortes demográficos.' : 'Análisis transversal.'}
                  </span>
               </div>
            </div>
         )}
      </div>
    </div>
  );
}
