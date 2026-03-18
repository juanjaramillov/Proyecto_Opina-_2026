import { useEffect } from "react";
import { trackEvent } from "../../../services/analytics/trackEvent";
import { FilterBar } from "../components/hub/FilterBar";
import { TransversalComparator } from "../components/hub/TransversalComparator";

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
    <div className="min-h-screen bg-slate-50 relative w-full mb-0 overflow-x-hidden">
      
      {/* BLOQUE 1: HERO FACTUAL EXPANSIVO (FULL-BLEED) */}
      <ResultsHeroFactual snapshot={snapshot} />

      {/* BLOQUE 5: FILTROS ENCABEZANDO LOS RESULTADOS */}
      <div className="w-full bg-slate-50 border-b border-slate-200 sticky top-0 md:top-[68px] z-40 shadow-sm">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-4">
               <FilterBar 
                 filters={filters} 
                 onChange={setFilters} 
                 isFiltered={snapshot.cohortState.isFiltered}
                 cohortSize={snapshot.cohortState.cohortSize}
                 privacyBlocked={snapshot.cohortState.privacyState === 'insufficient_cohort'}
               />
          </div>
      </div>

      {/* BLOQUE 2: COMPARADOR "TÚ VS LA COMUNIDAD" (REY FULL-BLEED) */}
      <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
           <TransversalComparator 
              snapshot={snapshot} 
              loading={loading}
           />
      </div>

      {/* BLOQUE 3: PULSO DEL MOMENTO */}
      <ResultsPulse />

      {/* BLOQUE 4: ECOSISTEMA (MODULOS) */}
      <ResultsEcosystem snapshot={snapshot} />

      {/* BLOQUE 6: PROGRESIÓN Y CIERRE FULL-BLEED */}
      <ResultsProgression snapshot={snapshot} />

      <div className="w-full bg-slate-50 py-8">
        <p className="max-w-[1400px] mx-auto px-6 md:px-12 text-center md:text-left text-[10px] text-slate-400 font-medium tracking-wide">
            Opina+ refleja las preferencias declaradas de sus usuarios activos y no constituye una muestra estadística representativa de la población general.
        </p>
      </div>
    </div>
  );
}
