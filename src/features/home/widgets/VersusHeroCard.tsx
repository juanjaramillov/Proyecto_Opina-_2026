import { useState, useEffect } from "react";
import { useActiveBattles } from "../../../hooks/useActiveBattles";
import BrandLogo from "../../../components/ui/BrandLogo";

export default function VersusHeroCard() {
  const { battles, loading } = useActiveBattles();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Filters battles to find those with exactly 2 options (Versus mode)
  const versusBattles = battles.filter((b) => b.options?.length === 2);
  const currentBattle = versusBattles[currentIndex];

  useEffect(() => {
    if (versusBattles.length > 1) {
      const interval = setInterval(() => {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % Math.min(versusBattles.length, 8)); // Rotate top 8
          setIsTransitioning(false);
        }, 300); // 300ms fade duration
      }, 4500); // Change every 4.5s
      return () => clearInterval(interval);
    }
  }, [versusBattles.length]);

  if (loading || !currentBattle) {
    return (
      <div className="relative rounded-[28px] border border-slate-200 bg-white p-5 lg:p-6 shadow-[0_18px_60px_rgba(15,23,42,0.10)] min-h-[340px] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-indigo-500 animate-spin"></div>
      </div>
    );
  }

  const optA = currentBattle.options[0];
  const optB = currentBattle.options[1];

  // Pseudo-randomizing stats for visual effect in the hero 
  // (In a real scenario, this would come from analytics/platformService for this specfic battle)
  const syntheticSignals = 12000 + (currentBattle.id.charCodeAt(0) * 100);
  const syntheticPercentA = 40 + (currentBattle.id.charCodeAt(1) % 20); // 40-60%

  return (
    <div className="relative rounded-[28px] border border-slate-200 bg-white p-5 lg:p-6 shadow-[0_18px_60px_rgba(15,23,42,0.10)] h-[340px] flex flex-col justify-between overflow-hidden">
      
      {/* Wrapper to handle crossfade manually */}
      <div className={`transition-opacity duration-300 w-full h-full flex flex-col justify-between ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <div>
          <div className="mb-4 flex items-center justify-between">
            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-indigo-500/10 to-emerald-400/10 px-3 py-1 text-xs font-semibold text-indigo-600">
              En vivo
            </span>

            <span className="text-sm font-medium text-slate-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {new Intl.NumberFormat('es-CL').format(syntheticSignals)} señales
            </span>
          </div>

          <h3 className="text-2xl font-bold tracking-tight text-slate-900 line-clamp-2">
            {currentBattle.title}
          </h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 hover:border-indigo-400 hover:bg-indigo-50 transition">
              <div className="flex flex-col items-center gap-4">
                  {optA.image_url ? (
                    <BrandLogo src={optA.image_url} alt={optA.label} variant="versus" className="shadow-sm border border-slate-200" />
                  ) : (
                    <div className="w-full h-full min-h-[140px] rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden p-2.5">
                      <span className="text-xl font-bold text-slate-700">{optA.label.substring(0,2).toUpperCase()}</span>
                    </div>
                  )}
                <span className="font-semibold text-slate-800 text-center line-clamp-1">{optA.label}</span>
              </div>
            </button>

            <button className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 hover:border-emerald-400 hover:bg-emerald-50 transition">
              <div className="flex flex-col items-center gap-4">
                  {optB.image_url ? (
                    <BrandLogo src={optB.image_url} alt={optB.label} variant="versus" className="shadow-sm border border-slate-200" />
                  ) : (
                    <div className="w-full h-full min-h-[140px] rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden p-2.5">
                      <span className="text-xl font-bold text-slate-700">{optB.label.substring(0,2).toUpperCase()}</span>
                    </div>
                  )}
                <span className="font-semibold text-slate-800 text-center line-clamp-1">{optB.label}</span>
              </div>
            </button>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex justify-between text-sm text-slate-500 transition-all">
              <span className="truncate pr-4">{optA.label}</span>
              <span className="font-semibold">{syntheticPercentA}%</span>
            </div>

            <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden relative">
              <div 
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-1000 ease-out"
                style={{ width: `${syntheticPercentA}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
