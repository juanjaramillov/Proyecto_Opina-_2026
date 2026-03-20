import { useEffect } from "react";
import { trackEvent } from "../../../services/analytics/trackEvent";
import { useResultsExperience } from "../hooks/useResultsExperience";
import { ResultsHeroDynamic } from "../components/v4/ResultsHeroDynamic";
import { ResultsConsensusVsPolarization } from "../components/ResultsConsensusVsPolarization";
import { ResultsInsightWall } from "../components/ResultsInsightWall";
import { ResultsTrendsV2 } from "../components/ResultsTrendsV2";
import { ResultsWinningV2 } from "../components/ResultsWinningV2";
import { ResultsMapV2 } from "../components/ResultsMapV2";
import { ResultsCommunityV2 } from "../components/ResultsCommunityV2";
import { ResultsEcosystem } from "../components/ResultsEcosystem";
import { ResultsProgression } from "../components/ResultsProgression";
import { FilterBar } from "../components/hub/FilterBar";
import { TransversalComparator } from "../components/hub/TransversalComparator";
import { VersusHubSection } from "../components/hub/VersusHubSection";
import { TournamentHubSection } from "../components/hub/TournamentHubSection";
import { ProfundidadHubSection } from "../components/hub/ProfundidadHubSection";
import { ActualidadHubSection } from "../components/hub/ActualidadHubSection";
import { LugaresHubSection } from "../components/hub/LugaresHubSection";

export default function ResultsPage() {
  useEffect(() => {
    trackEvent("user_opened_results");
  }, []);

  const { 
    snapshot, 
    activeModule, setActiveModule, 
    activePeriod, setActivePeriod,
    activeView, setActiveView
  } = useResultsExperience();

  if (!snapshot) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const renderModuleSection = () => {
    switch (activeModule) {
      case "VERSUS": return <VersusHubSection />;
      case "TOURNAMENT": return <TournamentHubSection />;
      case "PROFUNDIDAD": return <ProfundidadHubSection />;
      case "ACTUALIDAD": return <ActualidadHubSection />;
      case "LUGARES": return <LugaresHubSection />;
      default: return (
        <>
          <ResultsTrendsV2 activeModule={activeModule} activePeriod={activePeriod} />
          <ResultsWinningV2 />
        </>
      );
    }
  }

  return (
    <div className="min-h-screen bg-white text-ink relative w-full overflow-x-hidden font-sans selection:bg-brand-opina-blue/20">
      
      {/* 1. Immersive Animated Background Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vh] h-[50vh] rounded-full bg-[#10B981]/10 mix-blend-multiply filter blur-[100px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vh] h-[60vh] rounded-full bg-[#2563EB]/10 mix-blend-multiply filter blur-[120px] animate-blob animation-delay-2000"></div>
        <div className="absolute top-[30%] left-[30%] w-[40vh] h-[40vh] rounded-full bg-indigo-500/5 mix-blend-multiply filter blur-[80px] animate-blob animation-delay-3000"></div>
      </div>

      {/* 2. Sticky Top Filter Bar (Elevated z-index) */}
      <div className="sticky top-0 z-50 w-full px-4 py-4 pointer-events-none flex justify-center mt-6 md:mt-12 transition-all duration-500">
         <div className="pointer-events-auto w-full flex justify-center drop-shadow-sm">
           <FilterBar 
             activeModule={activeModule}
             onModuleChange={setActiveModule}
             activePeriod={activePeriod}
             onPeriodChange={setActivePeriod}
             activeView={activeView}
             onViewChange={setActiveView}
           />
         </div>
      </div>

      {/* 3. Main Content Flow */}
      <main className="w-full flex flex-col relative z-10 pt-8">
        
        {/* Massive Headline and Realtime Facts */}
        <ResultsHeroDynamic snapshot={snapshot} activeModule={activeModule} activePeriod={activePeriod} activeView={activeView} />
        
        {/* Friction & Consensus List */}
        <div className="mt-16 md:mt-32">
          <ResultsConsensusVsPolarization activeModule={activeModule} activePeriod={activePeriod} />
        </div>

        {/* The Pulse (Newsfeed columns) */}
        <ResultsCommunityV2 />

        {/* Breaking News Dark Bento */}
        <ResultsInsightWall activeModule={activeModule} activePeriod={activePeriod} />
        
        <ResultsEcosystem snapshot={snapshot} />

        {/* Comparator (Tu vs Comunidad) */}
        <TransversalComparator activeModule={activeModule} activePeriod={activePeriod} />
        
        {/* Module Specific Logic */}
        <div className="container-ws py-24">
          {renderModuleSection()}
        </div>
        
        {/* Cartography Map (Only on ALL) */}
        {activeModule === "ALL" && (
          <ResultsMapV2 />
        )}

        {/* Reward Progression */}
        <ResultsProgression snapshot={snapshot} />

      </main>

      <div className="w-full py-12 bg-white relative z-10">
        <p className="container-ws text-center text-xs text-slate-400 font-medium tracking-wide">
          Opina+ refleja las preferencias declaradas de sus usuarios activos y
          no constituye una muestra estadística representativa de la población general.
        </p>
      </div>
    </div>
  );
}
