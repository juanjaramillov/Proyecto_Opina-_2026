import { useEffect } from "react";
import { trackEvent } from "../../../services/analytics/trackEvent";
import { FilterBar } from "../components/hub/FilterBar";
import { TransversalComparator } from "../components/hub/TransversalComparator";
import { useResultsExperience } from "../hooks/useResultsExperience";
import { ResultsHeroFactual } from "../components/ResultsHeroFactual";
import { ResultsInsightWall } from "../components/ResultsInsightWall";
import { ResultsConsensusVsPolarization } from "../components/ResultsConsensusVsPolarization";
import { ResultsConsensusByDimension } from "../components/ResultsConsensusByDimension";
import { ResultsPulse } from "../components/ResultsPulse";
import { ResultsEcosystem } from "../components/ResultsEcosystem";
import { ResultsProgression } from "../components/ResultsProgression";

export default function ResultsPage() {
  useEffect(() => {
    trackEvent("user_opened_results");
  }, []);

  const { loading, snapshot, filters, setFilters } = useResultsExperience();

  if (!snapshot) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative w-full overflow-x-hidden">
      <ResultsHeroFactual snapshot={snapshot} />

      <ResultsInsightWall />

      <ResultsConsensusVsPolarization />

      <ResultsConsensusByDimension />

      <div className="w-full bg-slate-50/95 backdrop-blur border-y border-slate-200 sticky top-0 md:top-[68px] z-40 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-4">
          <FilterBar
            filters={filters}
            onChange={setFilters}
            isFiltered={snapshot.cohortState.isFiltered}
            cohortSize={snapshot.cohortState.cohortSize}
            privacyBlocked={
              snapshot.cohortState.privacyState === "insufficient_cohort"
            }
          />
        </div>
      </div>

      <section className="w-full py-10 md:py-14">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="mb-6 md:mb-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 text-indigo-700 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em]">
              Tu espejo social
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl font-black tracking-tight text-slate-950">
              Tú vs la comunidad
            </h2>
            <p className="mt-2 text-slate-600 max-w-2xl">
              Descubre en qué temas coincides con la mayoría y dónde tu postura
              se escapa del consenso.
            </p>
          </div>

          <TransversalComparator
            snapshot={snapshot}
            loading={loading}
          />
        </div>
      </section>

      <ResultsPulse />

      <ResultsEcosystem snapshot={snapshot} />

      <ResultsProgression snapshot={snapshot} />

      <div className="w-full bg-slate-50 py-8">
        <p className="max-w-[1400px] mx-auto px-6 md:px-12 text-center md:text-left text-[10px] text-slate-400 font-medium tracking-wide">
          Opina+ refleja las preferencias declaradas de sus usuarios activos y
          no constituye una muestra estadística representativa de la población
          general.
        </p>
      </div>
    </div>
  );
}
