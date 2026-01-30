import { useNavigate } from "react-router-dom";

import RightNowCarousel from "../components/RightNowCarousel";
import AbstractIllustration from "../../../components/ui/AbstractIllustration";
import HowItWorksSteps from "../components/HowItWorksSteps";
import VersusGame from "../../signals/components/VersusGame";
import RadiografiasPreview from "../components/RadiografiasPreview";
import { EXISTING_BATTLES } from "../../../data/battles";


export default function Home() {
  const navigate = useNavigate();

  // Simple Mock Vote Handler for Home Preview
  const handleVote = async (_battleId: string, optionId: string, opponentId: string) => {
    return new Promise<Record<string, number>>((resolve) => {
      setTimeout(() => {
        const pct = 50 + Math.floor(Math.random() * 20); // 50-70% win rate sim
        const result: Record<string, number> = {};
        result[optionId] = pct;
        if (opponentId) result[opponentId] = 100 - pct;
        resolve(result);
      }, 600);
    });
  };

  return (
    <div className="space-y-12 md:space-y-24 relative overflow-hidden pb-12 w-full bg-white">
      {/* Background Abstract Visual */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <AbstractIllustration type="lines" intensity={0.3} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[820px] h-[820px] bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-3xl opacity-30" />
      </div>

      {/* 1. HERO -- COMPACT & DIRECT */}
      <section className="relative z-10 pt-0 -mt-6 md:-mt-12 text-center flex flex-col items-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold tracking-widest uppercase mb-4 md:mb-6 border border-indigo-100/50">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            La Señal Colectiva
          </div>

          {/* Headline - MASSIVE & TIGHT */}
          <h1 className="font-marketing font-black text-ink tracking-tighter leading-[0.85] text-5xl sm:text-7xl md:text-8xl lg:text-9xl mb-4 md:mb-6 max-w-5xl">
            <span className="block">
              Opinar es emitir una{" "}
              <span className="text-gradient-brand">
                señal.
              </span>
            </span>
          </h1>

          {/* Subheadline - FOCUSED */}
          <div className="flex flex-col items-center gap-3 max-w-xl mx-auto mb-8 md:mb-10">
            <p className="text-lg md:text-xl text-slate-700 font-semibold leading-snug">
              Cuando se juntan, aparecen <span className="text-indigo-600">patrones.</span>
            </p>
          </div>

          {/* CTAs - HIERARCHY */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 w-full sm:w-auto">
            <button
              onClick={() => navigate("/senales")}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-black rounded-2xl shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 transition-all duration-300 w-full sm:w-auto min-w-[220px]"
            >
              Ir a Señales
            </button>

            <button
              onClick={() => navigate("/radiografias")}
              className="text-slate-500 hover:text-indigo-600 font-semibold text-sm tracking-wide border-b border-transparent hover:border-indigo-600 transition-all pb-0.5"
            >
              Ver Radiografías
            </button>
          </div>
        </div>
      </section>



      {/* 2. CÓMO FUNCIONA (Simplified) */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-4">
        <HowItWorksSteps />
      </section>

      {/* 3. BATTLE RUNNER - MAIN ACTION */}
      <section className="relative z-10 w-full max-w-6xl mx-auto px-4">

        {/* Battle Container with more presence */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-b from-indigo-50/0 via-indigo-50/50 to-indigo-50/0 rounded-[3rem] -z-10 blur-xl"></div>
          <VersusGame
            battles={EXISTING_BATTLES.filter(b => b.options && b.options.length >= 2)}
            onVote={handleVote}
            mode="classic"
            autoNextMs={1800}
          />
        </div>
      </section>

      {/* 4. SEÑAL / TENDENCIA (Agora) */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-2 mb-6 md:mb-8">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 rounded-full bg-accent animate-pulse shadow-glow" title="En vivo" />
            <h2 className="text-2xl md:text-4xl font-black text-ink tracking-tight uppercase">Tendencias</h2>
            <span className="flex h-3 w-3 rounded-full bg-accent animate-pulse shadow-glow" title="En vivo" />
          </div>
        </div>

        <RightNowCarousel />
      </section>

      {/* 5. RADIOGRAFÍAS PREVIEW (Premium) */}
      <RadiografiasPreview />

      {/* FOOTER TEASER */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 text-center pb-8 opacity-40">
        <p className="text-[10px] text-text-muted font-bold uppercase tracking-[0.2em]">Opina+ Beta v4.0</p>
      </section>
    </div>
  );
}
