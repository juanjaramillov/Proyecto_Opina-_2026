import { useEffect } from "react";
import { trackEvent } from "../../../services/analytics/trackEvent";
import { useResultsExperience } from "../hooks/useResultsExperience";
import { ResultsHeroDynamic } from "../components/v4/ResultsHeroDynamic";
import { ResultsTransversalMetrics } from "../components/v4/ResultsTransversalMetrics";
import { ResultsContextualWall } from "../components/v4/ResultsContextualWall";
import { ResultsWowClosing } from "../components/v4/ResultsWowClosing";
import { FilterBar } from "../components/hub/FilterBar";
import { ResultsModuleComparator } from "../components/v4/ResultsModuleComparator";
import { VersusInsightBlock } from "../components/v4/modules/VersusInsightBlock";
import { TorneoInsightBlock } from "../components/v4/modules/TorneoInsightBlock";
import { ProfundidadInsightBlock } from "../components/v4/modules/ProfundidadInsightBlock";
import { ActualidadInsightBlock } from "../components/v4/modules/ActualidadInsightBlock";
import { LugaresInsightBlock } from "../components/v4/modules/LugaresInsightBlock";

export default function ResultsPage() {
  useEffect(() => {
    trackEvent("user_opened_results");
  }, []);

  const { 
    snapshot, 
    activeModule, setActiveModule, 
    activePeriod, setActivePeriod,
    activeView, setActiveView,
    activeGeneration, setActiveGeneration
  } = useResultsExperience();

  if (!snapshot) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const renderModuleSection = () => {
    switch(activeModule) {
      case "VERSUS": return <VersusInsightBlock generation={activeGeneration} snapshot={snapshot} />;
      case "TOURNAMENT": return <TorneoInsightBlock generation={activeGeneration} snapshot={snapshot} />;
      case "PROFUNDIDAD": return <ProfundidadInsightBlock generation={activeGeneration} snapshot={snapshot} />;
      case "ACTUALIDAD": return <ActualidadInsightBlock generation={activeGeneration} snapshot={snapshot} />;
      case "LUGARES": return <LugaresInsightBlock generation={activeGeneration} snapshot={snapshot} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-white text-ink relative w-full overflow-x-hidden font-sans selection:bg-brand-opina-blue/20">
      
      {/* 1. Immersive Animated Background Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vh] h-[50vh] rounded-full bg-[#10B981]/10 mix-blend-multiply filter blur-[100px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vh] h-[60vh] rounded-full bg-[#2563EB]/10 mix-blend-multiply filter blur-[120px] animate-blob animation-delay-2000"></div>
        <div className="absolute top-[30%] left-[30%] w-[40vh] h-[40vh] rounded-full bg-indigo-500/5 mix-blend-multiply filter blur-[80px] animate-blob animation-delay-3000"></div>
      </div>

      {/* 2. Sticky Top Filter Bar (Elevated z-index) */}
      <div className="sticky top-0 z-50 w-full px-4 py-3 pointer-events-none flex justify-center mt-4 md:mt-8 transition-all duration-500">
         <div className="pointer-events-auto w-full flex justify-center drop-shadow-sm">
           <FilterBar 
             activeModule={activeModule}
             onModuleChange={setActiveModule}
             activePeriod={activePeriod}
             onPeriodChange={setActivePeriod}
             activeView={activeView}
             onViewChange={setActiveView}
             activeGeneration={activeGeneration}
             onGenerationChange={setActiveGeneration}
           />
         </div>
      </div>

      {/* 3. Main Content Flow */}
      <main className="w-full flex flex-col relative z-10 pt-2 md:pt-4">
        
        {/* Massive Headline and Realtime Facts */}
        <ResultsHeroDynamic snapshot={snapshot} activeModule={activeModule} activePeriod={activePeriod} activeView={activeView} activeGeneration={activeGeneration} />
        
        {/* Ecosystem General Pulse */}
        <div className="mt-6 md:mt-10 container-ws">
          <ResultsTransversalMetrics snapshot={snapshot} activePeriod={activePeriod} activeGeneration={activeGeneration} />
        </div>

        {/* Composition / Module Comparator */}
        <ResultsModuleComparator activeModule={activeModule} activeGeneration={activeGeneration} />
        
        {/* Module Specific Logic */}
        <div className="container-ws py-8 md:py-16">
          {renderModuleSection()}
        </div>
        
        {/* Contextual Insights Wall - Reactiva a todos los controles */}
        <ResultsContextualWall activeModule={activeModule} activeGeneration={activeGeneration} />

        {/* Heroica final wow */}
        <ResultsWowClosing />

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
