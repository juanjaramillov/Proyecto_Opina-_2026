import { useState, useEffect } from "react";
import { useActiveBattles } from "../../../hooks/useActiveBattles";
import BrandLogo from "../../../components/ui/BrandLogo";

export default function InteractiveHeroSection() {
  const { battles, loading } = useActiveBattles();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [votedSide, setVotedSide] = useState<"left" | "right" | null>(null);

  // Filters battles to find those with exactly 2 options (Versus mode)
  const versusBattles = battles.filter((b) => b.options?.length === 2);
  const currentBattle = versusBattles[currentIndex];

  useEffect(() => {
    // Only auto-rotate if user hasn't voted
    if (versusBattles.length > 1 && !votedSide) {
      const interval = setInterval(() => {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % Math.min(versusBattles.length, 8)); // Rotate top 8
          setIsTransitioning(false);
        }, 500); // 500ms fade duration
      }, 7000); // Change every 7s
      return () => clearInterval(interval);
    }
  }, [versusBattles.length, votedSide]);

  const handleVote = (side: "left" | "right") => {
    setVotedSide(side);
  };

  // Reset voted state if the battle manually changes (shouldn't happen on auto since we stop it, but just in case)
  useEffect(() => {
    setVotedSide(null);
  }, [currentIndex]);

  const syntheticPercentA = currentBattle ? 40 + (currentBattle.id.charCodeAt(1) % 20) : 50; 
  const syntheticPercentB = 100 - syntheticPercentA;

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white">
      <style>{`
        @keyframes expand {
          0% { width: 0%; }
        }
      `}</style>
      
      {/* Intense but clean light background */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-0 -left-1/4 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-50/50 via-white to-white blur-3xl opacity-80" />
        <div className="absolute bottom-0 -right-1/4 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-50/50 via-white to-white blur-3xl opacity-80" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center text-center">
        {/* Minimalist Header */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-bold mb-10 transition-transform hover:scale-105 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Tendencias en vivo
        </div>

        <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight text-ink mb-6 leading-tight">
           Tu opinión no es un voto.<br />
           Es una <span className="text-gradient-brand drop-shadow-[0_0_15px_rgba(37,99,235,0.3)] animate-[pulse_3s_ease-in-out_infinite] font-extrabold pb-2">SEÑAL</span>.
        </h1>
        
        {/* Dynamic Question / Subtitle */}
        <div className={`transition-opacity duration-500 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          <h2 className="text-xl md:text-3xl font-display font-bold text-slate-600 mb-16 max-w-3xl leading-snug">
            {loading || !currentBattle 
              ? "Cargando batallas en vivo..." 
              : `"${currentBattle.title}"`}
          </h2>
        </div>

        {/* Giant Versus Play Area - The Playground */}
        <div className={`w-full max-w-4xl relative min-h-[300px] md:min-h-[400px] transition-opacity duration-500 ease-in-out ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
           
           {loading || !currentBattle ? (
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-primary animate-spin"></div>
             </div>
           ) : (
             <>
               {/* Center VS Badge */}
               <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 flex items-center justify-center shadow-xl shadow-primary/10">
                  <span className="font-black text-slate-400 text-xl md:text-2xl font-display italic tracking-tighter">VS</span>
               </div>

               <div className="absolute inset-0 flex flex-col md:flex-row gap-4 md:gap-8 p-4">
                  
                  {/* Left Card - Option A */}
                  <button 
                    onClick={() => handleVote("left")}
                    className={`
                      relative group flex-1 rounded-3xl overflow-hidden transition-all duration-700 ease-out border-2 
                      ${votedSide === 'left' ? 'border-primary border-4 shadow-[0_20px_50px_rgba(37,99,235,0.3)] scale-105 z-10' : 'border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] bg-white hover:border-primary/50'}
                      ${votedSide === 'right' ? 'opacity-30 grayscale-[80%] scale-[0.95]' : 'hover:-translate-y-4 hover:rotate-1 hover:shadow-2xl hover:scale-105 z-20'}
                      ${!votedSide && 'animate-[pulse_4s_ease-in-out_infinite]'}
                    `}
                    style={{ perspective: "1000px" }}
                  >
                    {/* Visual Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-white opacity-50" />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-t from-primary to-transparent" />
                    
                    <div className="relative h-full flex flex-col items-center justify-center text-center p-8 transition-transform duration-500 ease-out group-hover:translate-z-10" style={{ transformStyle: "preserve-3d" }}>
                      
                      <div className="w-24 h-24 md:w-32 md:h-32 mb-6 transform group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 ease-out drop-shadow-xl bg-white rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100">
                        {currentBattle.options[0].image_url ? (
                          <BrandLogo src={currentBattle.options[0].image_url} alt={currentBattle.options[0].label} variant="versus" className="w-full h-full object-contain p-4" />
                        ) : (
                          <span className="text-3xl font-black font-display text-slate-300">{currentBattle.options[0].label.substring(0,2).toUpperCase()}</span>
                        )}
                      </div>
                      
                      <span className="text-3xl md:text-4xl font-black font-display text-slate-800 tracking-tight group-hover:text-primary transition-colors line-clamp-2">
                        {currentBattle.options[0].label}
                      </span>
                      
                      {votedSide === 'left' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md animate-in fade-in zoom-in duration-500 rounded-3xl p-6">
                           <span className="text-6xl font-black font-display text-primary mb-2 drop-shadow-md">{syntheticPercentA}%</span>
                           <div className="w-3/4 h-3 bg-indigo-100 rounded-full overflow-hidden shadow-inner">
                              <div className="h-full bg-gradient-brand animate-[expand_1s_ease-out_forwards]" style={{ width: `${syntheticPercentA}%` }} />
                           </div>
                           <span className="mt-6 text-sm font-bold tracking-widest text-primary uppercase flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full border border-indigo-100">
                             <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                             ¡Tu señal se sumó!
                           </span>
                        </div>
                      )}
                      
                      {votedSide !== 'left' && <span className="text-primary/80 text-lg font-bold opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-2 uppercase tracking-widest mt-6">Elegir</span>}
                    </div>
                  </button>

                  {/* Right Card - Option B */}
                  <button 
                    onClick={() => handleVote("right")}
                    className={`
                      relative group flex-1 rounded-3xl overflow-hidden transition-all duration-700 ease-out border-2 
                      ${votedSide === 'right' ? 'border-emerald-400 border-4 shadow-[0_20px_50px_rgba(16,185,129,0.3)] scale-105 z-10' : 'border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] bg-white hover:border-emerald-400/50'}
                      ${votedSide === 'left' ? 'opacity-30 grayscale-[80%] scale-[0.95]' : 'hover:-translate-y-4 hover:-rotate-1 hover:shadow-2xl hover:scale-105 z-20'}
                      ${!votedSide && 'animate-[pulse_4.5s_ease-in-out_infinite] delay-500'}
                    `}
                    style={{ perspective: "1000px" }}
                  >
                    {/* Visual Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-white opacity-50" />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-t from-emerald-500 to-transparent" />
                    
                    <div className="relative h-full flex flex-col items-center justify-center text-center p-8 transition-transform duration-500 ease-out group-hover:translate-z-10" style={{ transformStyle: "preserve-3d" }}>
                      
                      <div className="w-24 h-24 md:w-32 md:h-32 mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ease-out drop-shadow-xl bg-white rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100">
                        {currentBattle.options[1].image_url ? (
                          <BrandLogo src={currentBattle.options[1].image_url} alt={currentBattle.options[1].label} variant="versus" className="w-full h-full object-contain p-4" />
                        ) : (
                          <span className="text-3xl font-black font-display text-slate-300">{currentBattle.options[1].label.substring(0,2).toUpperCase()}</span>
                        )}
                      </div>

                      <span className="text-3xl md:text-4xl font-black font-display text-slate-800 tracking-tight group-hover:text-emerald-600 transition-colors line-clamp-2">
                        {currentBattle.options[1].label}
                      </span>
                      
                      {votedSide === 'right' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md animate-in fade-in zoom-in duration-500 rounded-3xl p-6">
                           <span className="text-6xl font-black font-display text-emerald-600 mb-2 drop-shadow-md">{syntheticPercentB}%</span>
                           <div className="w-3/4 h-3 bg-emerald-100 rounded-full overflow-hidden shadow-inner">
                              <div className="h-full bg-emerald-500 animate-[expand_1s_ease-out_forwards]" style={{ width: `${syntheticPercentB}%` }} />
                           </div>
                           <span className="mt-6 text-sm font-bold tracking-widest text-emerald-600 uppercase flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
                             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                             ¡Tu señal se sumó!
                           </span>
                        </div>
                      )}
                      
                      {votedSide !== 'right' && <span className="text-emerald-600/80 text-lg font-bold opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-2 uppercase tracking-widest mt-6">Elegir</span>}
                    </div>
                  </button>

               </div>
             </>
           )}
        </div>
        
        {/* Subtle scroll hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce opacity-90 pointer-events-none mt-10">
           <span className="text-primary-600 text-xs font-black tracking-widest uppercase mb-2">Descubre tu impacto</span>
           <div className="w-0.5 h-6 rounded-full bg-gradient-to-b from-primary-300 to-transparent" />
        </div>

      </div>
    </section>
  );
}
