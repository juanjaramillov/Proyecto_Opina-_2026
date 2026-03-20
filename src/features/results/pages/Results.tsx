import { useEffect } from "react";
import { trackEvent } from "../../../services/analytics/trackEvent";
import { useResultsExperience } from "../hooks/useResultsExperience";
import { ResultsHeroB2C } from "../components/v3/ResultsHeroB2C";
import { ResultsProfileVsCommunityB2C } from "../components/v3/ResultsProfileVsCommunityB2C";
import { ResultsConsensusMapB2C } from "../components/v3/ResultsConsensusMapB2C";
import { ResultsTrendsB2C } from "../components/v3/ResultsTrendsB2C";

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
        <ResultsHeroB2C />
        <ResultsProfileVsCommunityB2C />
        <ResultsConsensusMapB2C />
        <ResultsTrendsB2C />
      </main>

      <div className="w-full py-8 mt-12 border-t border-slate-200">
        <p className="container-ws text-center md:text-left text-[10px] text-slate-400 font-medium tracking-wide">
          Opina+ refleja las preferencias declaradas de sus usuarios activos y
          no constituye una muestra estadística representativa de la población general.
        </p>
      </div>
    </div>
  );
}
