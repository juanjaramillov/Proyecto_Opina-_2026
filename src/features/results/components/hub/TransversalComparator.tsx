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
    <div className="card border border-stroke bg-white shadow-sm flex flex-col rounded-3xl overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
        <Network className="w-64 h-64 text-primary -mt-20 -mr-20" />
      </div>

      {/* 1. Selector de Lentes en el Header del Componente */}
      <div className="px-5 pt-5 pb-5 border-b border-stroke bg-surface2/30 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-ink flex items-center justify-center border border-stroke shadow-sm flex-shrink-0">
                 <ArrowRightLeft className="w-5 h-5 text-white" />
               </div>
               <div>
                 <h2 className="text-lg font-black tracking-tight text-ink flex items-center gap-2">
                     Brújula de Similitud <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[9px] uppercase tracking-widest font-bold">Beta</span>
                 </h2>
                 <p className="text-xs text-text-secondary mt-0.5 font-medium">Contraste analítico transversal.</p>
               </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 bg-surface p-1 rounded-2xl border border-stroke shadow-inner">
              {lenses.map(lens => (
                <button
                  key={lens.id}
                  onClick={() => lens.isAvailable && setActiveLensId(lens.id)}
                  disabled={!lens.isAvailable}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 transition-all ${
                    activeLensId === lens.id 
                      ? 'bg-white text-ink shadow-sm border border-stroke/50' 
                      : lens.isAvailable 
                          ? 'bg-transparent text-text-muted hover:text-ink'
                          : 'bg-transparent text-slate-300 cursor-not-allowed'
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
      <div className="p-6 md:p-8 relative z-10 flex flex-col gap-8 md:gap-10">
         
         {/* Frase Editorial */}
         <div className="flex items-start gap-4">
            <div className="mt-1 flex-shrink-0">
                <span className="flex w-2 h-2 rounded-full bg-primary ring-4 ring-primary/10"></span>
            </div>
            <div>
               <h3 className="text-xl md:text-2xl font-black text-ink tracking-tight mb-2 text-balance leading-snug">
                   "{editorialQuote}"
               </h3>
               {activeLensId === 'similar' && (
                  <p className="text-xs font-medium text-text-secondary w-full md:max-w-xl">
                    Este grupo combina <span className="font-bold text-ink">edad, actividad y un patrón de señal</span> parecidos a los tuyos.
                  </p>
               )}
            </div>
         </div>

         {/* Contenedor de Barras Divergentes */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 w-full">
            
            {/* Columna: Zonas de Consenso */}
            {hasCoincidences && (
            <div className="flex flex-col gap-6 w-full">
               <div className="flex items-center gap-2 border-b border-stroke pb-3">
                  <div className="w-6 h-6 rounded-full bg-surface2 flex items-center justify-center border border-stroke">
                      <Users className="w-3.5 h-3.5 text-ink" />
                  </div>
                  <h4 className="text-sm font-black text-ink uppercase tracking-widest">Alineado al Consenso</h4>
               </div>

               <div className="space-y-6">
                 {coincidences.slice(0, 3).map((item: UserComparisonInsight, idx: number) => (
                     <div key={`coin-${idx}`} className="flex flex-col mb-4">
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
               <div className="flex items-center gap-2 border-b border-stroke pb-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                      <UserRound className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <h4 className="text-sm font-black text-ink uppercase tracking-widest">Marcada Disidencia</h4>
               </div>

               <div className="space-y-6">
                 {discrepancies.slice(0, 3).map((item: UserComparisonInsight, idx: number) => (
                     <div key={`disc-${idx}`} className="flex flex-col mb-4">
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
                 <div className="flex flex-col justify-center items-center text-center p-8 border border-dashed border-stroke rounded-2xl bg-surface2/30">
                    <UserRound className="w-8 h-8 text-slate-300 mb-3" />
                    <p className="text-sm font-medium text-text-secondary">Tu perfil actual no presenta disidencias marcadas frente al lente activo. Eres un reflejo exacto del consenso.</p>
                 </div>
            )}

         </div>

         {/* 3. Hallazgos Rápidos (Takeaways) */}
         {(hasCoincidences || hasDiscrepancies) && (
            <div className="mt-2 md:mt-4 pt-6 md:pt-8 border-t border-stroke grid grid-cols-1 sm:grid-cols-3 gap-6">
               <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-1.5">
                     <Users className="w-3 h-3" /> Mayor Coincidencia
                  </span>
                  <span className="text-sm font-bold text-ink leading-tight">
                     {coincidences[0]?.entityName || 'Alineación general estable.'}
                  </span>
               </div>
               <div className="flex flex-col gap-1.5 border-l-0 sm:border-l border-stroke sm:pl-6 border-dashed">
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-1.5">
                     <UserRound className="w-3 h-3" /> Mayor Diferencia
                  </span>
                  <span className="text-sm font-bold text-ink leading-tight">
                     {discrepancies[0]?.entityName || 'Poca disidencia detectada.'}
                  </span>
               </div>
               <div className="flex flex-col gap-1.5 border-l-0 sm:border-l border-stroke sm:pl-6 border-dashed">
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-1.5">
                     <Network className="w-3 h-3" /> Estado de Alineación
                  </span>
                  <span className="text-sm font-bold text-ink leading-tight">
                     {activeLensId === 'similar' ? 'Calculado contra pares demográficos.' : 'Basado en todo el espectro.'}
                  </span>
               </div>
            </div>
         )}

      </div>
    </div>
  );
}
