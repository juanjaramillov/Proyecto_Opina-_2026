import { useEffect } from "react";
import { trackEvent } from "../../../services/analytics/trackEvent";
import { useResultsExperience } from "../hooks/useResultsExperience";
import { ResultsHeroFactual } from "../components/ResultsHeroFactual";
import { ResultsConsensusVsPolarization } from "../components/ResultsConsensusVsPolarization";
import { ResultsInsightWall } from "../components/ResultsInsightWall";
import { ResultsTrendsV2 } from "../components/ResultsTrendsV2";
import { ResultsWinningV2 } from "../components/ResultsWinningV2";
import { ResultsMapV2 } from "../components/ResultsMapV2";

export default function ResultsPage() {
  useEffect(() => {
    trackEvent("user_opened_results");
  }, []);

  const { snapshot } = useResultsExperience();

  if (!snapshot) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 relative w-full overflow-x-hidden pb-12">
      <main className="container-ws pt-8">
        <ResultsHeroFactual snapshot={snapshot} />
        <ResultsConsensusVsPolarization />
        <ResultsInsightWall />
        <ResultsTrendsV2 />
        <ResultsWinningV2 />
      </main>
      <ResultsMapV2 />

      <div className="w-full py-8 mt-12 border-t border-slate-200">
        <p className="container-ws text-center md:text-left text-[10px] text-slate-400 font-medium tracking-wide">
          Opina+ refleja las preferencias declaradas de sus usuarios activos y
          no constituye una muestra estadística representativa de la población general.
        </p>
      </div>
    </div>
  );
}
