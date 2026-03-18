import { useEffect } from "react";
import { trackEvent } from "../../../services/analytics/trackEvent";
import { FilterBar } from "../components/hub/FilterBar";
import { TransversalComparator } from "../components/hub/TransversalComparator";
import { RealTimelineChart } from "../components/RealTimelineChart";

import { useResultsExperience } from "../hooks/useResultsExperience";
import { ResultsHeroFactual } from "../components/ResultsHeroFactual";
import { ResultsPulse } from "../components/ResultsPulse";
import { ResultsEcosystem } from "../components/ResultsEcosystem";
import { ResultsProgression } from "../components/ResultsProgression";

export default function ResultsPage() {

  useEffect(() => {
    trackEvent('user_opened_results');
  }, []);

  const {
    loading,
    snapshot,
    filters,
    setFilters
  } = useResultsExperience();

  if (!snapshot) {
     return (
        <div className="min-h-screen bg-transparent flex items-center justify-center">
           <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-transparent relative w-full mb-12">
      <div className="max-w-[1200px] mx-auto px-4 py-6 relative text-ink">
        
        {/* BLOQUE 1: HERO FACTUAL COMPACTO */}
        <ResultsHeroFactual snapshot={snapshot} />

        {/* BLOQUE 2: COMPARADOR "TÚ VS LA COMUNIDAD" (REY) */}
        <div className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
             <TransversalComparator 
                snapshot={snapshot} 
                loading={loading}
                onClearFilter={() => setFilters({})}
             />
        </div>

        {/* BLOQUE 3: PULSO DEL MOMENTO */}
        <ResultsPulse />

        {/* BLOQUE 4: ECOSISTEMA (MODULOS) */}
        <div className="mb-24 relative animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
           <ResultsEcosystem snapshot={snapshot} />
        </div>

        {/* BLOQUE 5: FILTROS (ESCONDIDO O REPOSICIONADO TEMPORALMENTE) */}
        {/* Según la nueva arquitectura, los filtros sirven para segmentar la vista. */}
        <div className="mb-16 sticky top-[68px] z-40">
               <FilterBar 
                 filters={filters} 
                 onChange={setFilters} 
                 isFiltered={snapshot.cohortState.isFiltered}
                 cohortSize={snapshot.cohortState.cohortSize}
                 privacyBlocked={snapshot.cohortState.privacyState === 'insufficient_cohort'}
               />
        </div>

        {/* BLOQUE 6: PROGRESIÓN Y CIERRE */}
        <div className="mb-8 bg-surface2/30 rounded-[2rem] p-8 border border-stroke/50 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 relative">
              {loading && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 rounded-3xl"></div>}
              <h2 className="text-xl font-black text-ink mb-6 px-2 tracking-tight">Tu Ruta de Enganche Activo</h2>
              <RealTimelineChart 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                snapshot={{ signals: snapshot.overview, sufficiency: snapshot.sufficiency } as any} 
                loading={loading} 
              />
        </div>

        {/* BLOQUE 6B: CTA FINAL CON PROGRESIÓN */}
        <ResultsProgression snapshot={snapshot} />

        <p className="text-center text-[10px] text-slate-400 mt-4 mb-8 font-medium px-4">
            Opina+ refleja las preferencias declaradas de sus usuarios activos y no constituye una muestra estadística representativa de la población general.
        </p>
      </div>
    </div>
  );
}
