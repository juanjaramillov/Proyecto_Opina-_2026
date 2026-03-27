import { useEffect, useState } from "react";
import { trackEvent } from "../../../services/analytics/trackEvent";
import { useResultsExperience, ResultsGeneration } from "../hooks/useResultsExperience";
import { ResultsGenerationSelector } from "../components/v5/ResultsGenerationSelector";
import { ResultsEditorialHero } from "../components/v5/ResultsEditorialHero";
import { ResultsLivePulse } from "../components/v5/ResultsLivePulse";
import { ResultsVersusBlock } from "../components/v5/ResultsVersusBlock";
import { ResultsTournamentBlock } from "../components/v5/ResultsTournamentBlock";
import { ResultsDepthBlock } from "../components/v5/ResultsDepthBlock";
import { ResultsNewsBlock } from "../components/v5/ResultsNewsBlock";
import { ResultsPlacesBlock } from "../components/v5/ResultsPlacesBlock";
import { ResultsFutureModules } from "../components/v5/ResultsFutureModules";

// Importaremos los modulos futuros aqui
import { ResultsWowClosing } from "../components/v5/ResultsWowClosing";

export default function ResultsPage() {
  const { snapshot } = useResultsExperience();
  const [activeGeneration, setActiveGeneration] = useState<ResultsGeneration>("ALL");

  useEffect(() => {
    trackEvent("user_opened_results");
    window.scrollTo(0, 0);
  }, []);

  if (!snapshot) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-ink relative w-full overflow-x-hidden font-sans selection:bg-brand-opina-blue/20">
      
      {/* 1. Selector de Generaciones (Lente principal) */}
      <ResultsGenerationSelector 
        activeGeneration={activeGeneration} 
        onGenerationChange={setActiveGeneration} 
      />

      {/* 2. Main Content Flow Vertical */}
      <main className="w-full flex flex-col relative z-10 pb-20">
        
        {/* Hero Editorial General */}
        <ResultsEditorialHero snapshot={snapshot} />
        
        {/* Franja de Pulso Vivo */}
        <ResultsLivePulse />

        {/* Bloques Editoriales Modulares (Cada uno controla su propio ancho y background) */}
        <div className="w-full flex flex-col pt-8">
           <ResultsVersusBlock />
           <ResultsTournamentBlock />
           <ResultsDepthBlock />
           <ResultsNewsBlock />
           <ResultsPlacesBlock />
           <ResultsFutureModules />
        </div>

        {/* Cierre Continuidad */}
        <ResultsWowClosing />

      </main>
    </div>
  );
}
