import { useEffect, useState } from "react";
import { analyticsService } from "../../analytics/services/analyticsService";
import { useResultsExperience, ResultsGeneration } from "../hooks/useResultsExperience";
import { Skeleton } from "../../../components/ui/Skeleton";
import { ResultsGenerationSelector } from "../components/ResultsGenerationSelector";
import { ResultsEditorialHero } from "../components/ResultsEditorialHero";
import { ResultsLivePulse } from "../components/ResultsLivePulse";
import { ResultsVersusBlock } from "../components/ResultsVersusBlock";
import { ResultsTournamentBlock } from "../components/ResultsTournamentBlock";
import { ResultsDepthBlock } from "../components/ResultsDepthBlock";
import { ResultsNewsBlock } from "../components/ResultsNewsBlock";
// Importaremos los modulos futuros aqui
import { ResultsWowClosing } from "../components/ResultsWowClosing";

export default function ResultsPage() {
  const { snapshot } = useResultsExperience();
  const [activeGeneration, setActiveGeneration] = useState<ResultsGeneration>("ALL");

  useEffect(() => {
    analyticsService.trackSystem("user_opened_results", "info");
    window.scrollTo(0, 0);
  }, []);

  if (!snapshot) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-start pt-24 px-4 sm:px-8 w-full">
        {/* Generacional Selector Skeleton */}
        <Skeleton variant="pill" className="w-[300px] h-12 mb-12 bg-white border border-slate-100 shadow-sm" />
        
        {/* Editorial Hero Skeleton */}
        <div className="w-full max-w-5xl bg-white p-8 sm:p-12 rounded-[40px] border border-slate-100 shadow-xl overflow-hidden relative">
             <div className="flex flex-col gap-6 w-full relative z-10">
                 <Skeleton variant="pill" className="w-32 h-6 bg-slate-100" />
                 <Skeleton variant="text" className="w-3/4 h-12 sm:h-16 bg-slate-200" />
                 <Skeleton variant="text" className="w-full h-6 bg-slate-100 mt-4" />
                 <Skeleton variant="text" className="w-5/6 h-6 bg-slate-100" />
                 
                 <div className="flex gap-4 mt-8">
                     <Skeleton variant="card" className="w-1/2 h-40 bg-slate-50 border border-slate-100" />
                     <Skeleton variant="card" className="w-1/2 h-40 bg-slate-50 border border-slate-100" />
                 </div>
             </div>
             {/* Shimmer Effect */}
             <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent z-20" />
        </div>
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
        
        {/* Editorials and Blocks */}
        <ResultsEditorialHero heroData={snapshot.hero} />
        
        {/* Franja de Pulso Vivo */}
        <ResultsLivePulse pulseData={snapshot.pulse} />

        {/* Bloques Editoriales Modulares (Cada uno controla su propio ancho y background) */}
        <div className="w-full flex flex-col pt-8">
           <ResultsVersusBlock versusData={snapshot.blocks.versus} />
           <ResultsTournamentBlock tournamentData={snapshot.blocks.tournament} />
           <ResultsDepthBlock depthData={snapshot.blocks.depth} />
           <ResultsNewsBlock newsData={snapshot.blocks.news} />
        </div>

        {/* Cierre Continuidad */}
        <ResultsWowClosing footerNarrative={snapshot.footerNarrative} />

      </main>
    </div>
  );
}
