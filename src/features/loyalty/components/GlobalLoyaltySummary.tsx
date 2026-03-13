import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLoyalty } from "../hooks/useLoyalty";
import { useAuth } from "../../auth";
import { useSignalStore } from "../../../store/signalStore";

export function GlobalLoyaltySummary() {
  const { profile } = useAuth();
  const { stats, missions, isLoading, refreshLoyaltyData } = useLoyalty();
  const location = useLocation();
  const navigate = useNavigate();

  // Escuchar votos en tiempo real del store global
  const sessionSignals = useSignalStore(s => s.signals);
  const prevSessionSignals = useRef(sessionSignals);

  // Auto-actualizar cuando el usuario emite una señal nueva
  useEffect(() => {
    if (sessionSignals > prevSessionSignals.current) {
      refreshLoyaltyData();
      prevSessionSignals.current = sessionSignals;
    }
  }, [sessionSignals, refreshLoyaltyData]);

  // Hide on Home ("/") and Login/Auth pages
  if (location.pathname === '/' || location.pathname.startsWith('/login') || location.pathname.startsWith('/admin')) {
    return null;
  }

  // Only show for authenticated users who are not guests
  if (!profile || profile.tier === 'guest') {
    return null;
  }

  // Handle loading state gracefully
  if (isLoading && !stats) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 xl:px-12 my-4">
        <div className="w-full h-24 bg-slate-50 border border-slate-100 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  // Cálculo de Progreso de Nivel
  const currentLevelName = stats?.loyalty_levels?.level_name || 'Observador';
  const currentSignals = stats?.total_historical_signals || 0;
  const nextMilestone = Math.max(10, Math.ceil((currentSignals + 1) / 10) * 10);
  const signalsToNext = nextMilestone - currentSignals;
  const levelProgressPercent = Math.min(100, ((currentSignals % 10) / 10) * 100);

  // Cálculo de Misiones
  const activeMissions = missions || [];
  const totalMissions = activeMissions.length;
  const completedMissions = activeMissions.filter(m => m.completed).length;
  const missionsProgressPercent = totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0;
  const isMissionStreakSecured = totalMissions > 0 && completedMissions === totalMissions;

  return (
    <div className="w-full bg-transparent pt-4 pb-2 px-4 sm:px-8 xl:px-12 z-10 transition-all cursor-pointer" onClick={() => navigate('/profile#missions')}>
      <div className="w-full max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(23,37,84,0.04)] p-1.5 flex flex-col sm:flex-row gap-1.5">
          
          {/* BLOQUE 1: PROGRESO DE NIVEL */}
          <div className="flex-1 bg-slate-50/50 hover:bg-slate-50 rounded-xl p-3 sm:p-4 flex flex-col justify-center transition-colors group relative overflow-hidden">
            {/* Animación sutil de fondo en hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-3 relative z-10">
               <div className="flex items-center gap-2.5">
                 <div className="w-9 h-9 rounded-xl bg-primary-50/80 text-primary-600 flex items-center justify-center border border-primary-100 shadow-sm group-hover:scale-105 transition-transform duration-300">
                   <span className="material-symbols-outlined text-[20px]">workspace_premium</span>
                 </div>
                 <div className="flex flex-col">
                   <h4 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wide leading-none">{currentLevelName}</h4>
                   <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{currentSignals.toLocaleString()} SEÑALES HISTÓRICAS</p>
                 </div>
               </div>
               <div className="text-right flex flex-col items-end">
                 <div className="bg-primary-50 text-primary-600 px-2.5 py-0.5 rounded-full font-black text-xs border border-primary-100 shadow-sm">
                   {signalsToNext.toLocaleString()} restantes
                 </div>
                 <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Para subir de nivel</span>
               </div>
            </div>

            {/* Barra Numérica y Progreso */}
            <div className="relative z-10">
              <div className="w-full h-2.5 bg-slate-200/60 rounded-full overflow-hidden shadow-inner border border-slate-200/50">
                <div 
                  className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full relative transition-all duration-700 ease-out" 
                  style={{ width: `${levelProgressPercent}%` }}
                >
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/30 to-transparent"></div>
                  <div className="absolute -inset-x-full top-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2.5s_infinite]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* BLOQUE 2: PROGRESO DE MISIONES */}
          <div className="flex-1 bg-slate-50/50 hover:bg-slate-50 rounded-xl p-3 sm:p-4 flex flex-col justify-center transition-colors group relative overflow-hidden">
            {/* Animación sutil de fondo en hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            <div className="flex items-center justify-between mb-3 relative z-10">
               <div className="flex items-center gap-2.5">
                 <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-sm group-hover:scale-105 transition-all duration-300 relative ${isMissionStreakSecured ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 text-white border-emerald-400' : 'bg-emerald-50/80 text-emerald-600 border-emerald-100'}`}>
                   <span className="material-symbols-outlined text-[20px]">
                     {isMissionStreakSecured ? 'verified' : 'explore'}
                   </span>
                   {isMissionStreakSecured && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-white border-2 border-emerald-500"></span>
                      </span>
                   )}
                 </div>
                 <div className="flex flex-col">
                   <h4 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wide leading-none">Misiones Semanales</h4>
                   <p className="text-[10px] text-slate-500 font-semibold mt-0.5">ESTA SEMANA</p>
                 </div>
               </div>
               <div className="text-right flex flex-col items-end">
                 <div className={`px-2.5 py-0.5 rounded-full font-black text-xs shadow-sm border ${isMissionStreakSecured ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                   {completedMissions} / {totalMissions}
                 </div>
                 <span className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${isMissionStreakSecured ? 'text-emerald-500' : 'text-slate-400'}`}>
                   {isMissionStreakSecured ? 'RACHA ASEGURADA' : 'COMPLETADAS'}
                 </span>
               </div>
            </div>

            {/* Barra Numérica y Progreso */}
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-full h-2.5 bg-slate-200/60 rounded-full overflow-hidden shadow-inner border border-slate-200/50 flex-1">
                <div 
                  className={`h-full rounded-full relative transition-all duration-700 ease-out ${isMissionStreakSecured ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-emerald-400 to-emerald-500'}`}
                  style={{ width: `${missionsProgressPercent}%` }}
                >
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/30 to-transparent"></div>
                  {isMissionStreakSecured && <div className="absolute -inset-x-full top-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite]"></div>}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
