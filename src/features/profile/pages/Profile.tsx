import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../auth";
import { signalService } from "../../signals/services/signalService";
import ProgressiveQuestion from "../components/ProgressiveQuestion";
import SimpleSignup from "../components/SimpleSignup";
import { MIN_SIGNALS_THRESHOLD, SIGNALS_PER_BATCH } from "../../../config/constants";
import { motion, AnimatePresence } from "framer-motion";

export default function Profile() {
  const { profile, loading } = useAuth();

  if (loading) return null;

  return <ProfileContent profile={profile} />;
}

// Inner component to permit hook usage
function ProfileContent({ profile }: { profile: any }) {
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState<any>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await signalService.getUserStats();
        setUserStats(stats);
      } catch (err) {
        console.error("Failed to load user stats:", err);
      }
    };
    loadStats();
  }, []);

  // Calculate Progress from userStats (from DB)
  const completedSignals = userStats?.total_signals || 0;
  const currentLevel = userStats?.level || 1;
  const currentWeight = userStats?.signal_weight || 1;

  const isLocked = completedSignals < MIN_SIGNALS_THRESHOLD;
  const progressPercent = Math.min((completedSignals / MIN_SIGNALS_THRESHOLD) * 100, 100);
  const remaining = Math.max(0, MIN_SIGNALS_THRESHOLD - completedSignals);

  const handleContinue = () => {
    // nextBatch based on DB count
    const nextBatchIndex = Math.floor(completedSignals / SIGNALS_PER_BATCH);
    navigate('/experience', { state: { nextBatch: nextBatchIndex } });
  };

  return (
    <div className="container-ws section-y min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* LEFT SIDEBAR: PROGRESSIVE PROFILING */}
        <div className="lg:col-span-4 order-2 lg:order-1">
          <ProgressiveQuestion currentData={profile?.demographics || {}} />
        </div>

        {/* MAIN CONTENT: SYSTEM CORE */}
        <div className="lg:col-span-8 order-1 lg:order-2 space-y-6">

          {/* SYSTEM STATUS CARD */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined text-[150px] text-indigo-600">hub</span>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-indigo-600">person_filled</span>
                </div>
                <div>
                  <h1 className="text-xl font-black text-ink">
                    {profile?.displayName ? `Hola, ${profile.displayName.split(' ')[0]}` : 'Centro de Sincronización'}
                  </h1>
                  <p className="text-xs text-muted font-bold uppercase tracking-wider">
                    {profile?.displayName ? 'Perfil de Inteligencia Activo' : 'Perfil de Inteligencia'}
                  </p>
                </div>
              </div>

              {/* GUEST SIGNUP PROMPT */}
              <AnimatePresence>
                {profile?.tier === 'guest' && !profile?.displayName && (
                  <div className="mb-8">
                    <SimpleSignup />
                  </div>
                )}
              </AnimatePresence>

              {/* PROGRESS SECTION */}
              <div className="mb-8">
                <div className="flex justify-between items-end mb-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-500">Nivel de Calibración</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mt-1">
                      Nivel {currentLevel} • Peso {currentWeight}x
                    </span>
                  </div>
                  <span className="text-2xl font-black text-ink">{completedSignals} <span className="text-sm text-slate-400 font-medium">/ {MIN_SIGNALS_THRESHOLD} señales</span></span>
                </div>
                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full ${isLocked ? 'bg-amber-400' : 'bg-emerald-500'} relative`}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </motion.div>
                </div>
                {isLocked ? (
                  <p className="text-xs text-amber-600 font-bold mt-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">bolt</span>
                    Responde {remaining} versus más para activar el sistema.
                  </p>
                ) : (
                  <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Sistema calibrado y activo.
                  </p>
                )}
              </div>

              {/* UNLOCK GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {/* RESULTADOS */}
                <div className={`p-4 rounded-2xl border ${isLocked ? 'bg-slate-50 border-slate-100' : 'bg-emerald-50/50 border-emerald-100'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sm text-ink">Tendencias</span>
                    {isLocked ? (
                      <span className="material-symbols-outlined text-slate-400">lock</span>
                    ) : (
                      <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-tight">
                    {isLocked ? 'Responde 10 versus para ver tendencias.' : 'Acceso total a indicadores y tendencias.'}
                  </p>
                </div>

                {/* COMPARACIONES */}
                <div className={`p-4 rounded-2xl border ${isLocked ? 'bg-slate-50 border-slate-100' : 'bg-emerald-50/50 border-emerald-100'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sm text-ink">Comparaciones</span>
                    {isLocked ? (
                      <span className="material-symbols-outlined text-slate-400">lock</span>
                    ) : (
                      <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-tight">
                    {isLocked ? 'Desbloquea para ver tu posición vs el resto.' : 'Segmentación regional y etaria activada.'}
                  </p>
                </div>

                {/* MI PULSO (MODULO PERSONAL) */}
                <button
                  onClick={() => navigate('/personal-state')}
                  className="p-4 rounded-2xl border bg-indigo-50/50 border-indigo-100 hover:border-indigo-300 transition-all active:scale-[0.98] text-left"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sm text-ink">Mi Pulso Personal</span>
                    <span className="material-symbols-outlined text-indigo-500">analytics</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-tight">
                    Sincroniza tu estado de ánimo y bienestar de forma privada.
                  </p>
                </button>
              </div>

              {/* MAIN CTA */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleContinue}
                  className={`flex-1 px-6 py-4 rounded-xl font-black text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg ${isLocked ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-ink hover:bg-slate-800'}`}
                >
                  {isLocked ? (
                    <>
                      <span className="material-symbols-outlined">bolt</span>
                      Continuar Calibración
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">add_circle</span>
                      Aportar Nuevas Señales
                    </>
                  )}
                </button>
                {!isLocked && (
                  <button
                    onClick={() => navigate('/results')}
                    className="px-6 py-4 rounded-xl font-bold text-ink bg-white border-2 border-slate-100 hover:border-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    Ver Dashboard
                    <span className="material-symbols-outlined">bar_chart</span>
                  </button>
                )}
              </div>

            </div>
          </section>

          {/* LOWER SECTION: LEVEL INDICATOR (Simplified) */}
          <div className="grid grid-cols-3 gap-4">
            <div className={`text-center p-3 rounded-xl border ${profile?.tier === 'guest' ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-100' : 'bg-white border-slate-100 opacity-50'}`}>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Nivel 1</div>
              <div className="font-bold text-sm text-ink">Observador</div>
            </div>
            <div className={`text-center p-3 rounded-xl border ${profile?.tier === 'verified_basic' ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-100' : 'bg-white border-slate-100 opacity-50'}`}>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Nivel 2</div>
              <div className="font-bold text-sm text-ink">Validado</div>
            </div>
            <div className={`text-center p-3 rounded-xl border ${profile?.tier === 'verified_full_ci' ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-100' : 'bg-white border-slate-100 opacity-50'}`}>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Nivel 3</div>
              <div className="font-bold text-sm text-ink">Referente</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
