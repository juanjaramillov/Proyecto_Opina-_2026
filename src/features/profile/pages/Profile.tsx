import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../auth";
import { profileService, UserStats, ParticipationSummary, ActivityEvent, SegmentComparison, PersonalHistoryPoint } from "../services/profileService";
import { AccountProfile } from "../../auth/types";
import ProgressiveQuestion from "../components/ProgressiveQuestion";
import SimpleSignup from "../components/SimpleSignup";
import SegmentComparisonCard from "../components/SegmentComparisonCard";
import PersonalHistoryChart from "../components/PersonalHistoryChart";
import { UserLevelCard } from "../../../components/UserLevelCard";
import { VerifiedBadge } from "../../../components/auth/VerifiedBadge";
import { supabase } from "../../../supabase/client";
import { MIN_SIGNALS_THRESHOLD, SIGNALS_PER_BATCH } from "../../../config/constants";
import { AnimatePresence } from "framer-motion";
import { logger } from "../../../lib/logger";

export default function Profile() {
  const { profile, loading } = useAuth();

  if (loading) return null;

  return <ProfileContent profile={profile} />;
}

// Inner component to permit hook usage
function ProfileContent({ profile }: { profile: AccountProfile | null }) {
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [participation, setParticipation] = useState<ParticipationSummary>({ versus_count: 0, progressive_count: 0, depth_count: 0 });
  const [history, setHistory] = useState<ActivityEvent[]>([]);
  const [comparisons, setComparisons] = useState<SegmentComparison[]>([]);
  const [personalHistory, setPersonalHistory] = useState<PersonalHistoryPoint[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const loadAllProfileData = async () => {
      setLoadingData(true);
      try {
        const [stats, summary, activity, compData, histData] = await Promise.all([
          profileService.getUserStats(),
          profileService.getParticipationSummary(),
          profileService.getActivityHistory(5),
          profileService.getSegmentComparison(),
          profileService.getPersonalHistory()
        ]);

        setUserStats(stats);
        setParticipation(summary);
        setHistory(activity);
        setComparisons(compData);
        setPersonalHistory(histData);
      } catch (err) {
        logger.error("Failed to load profile data:", err);
      } finally {
        setLoadingData(false);
      }
    };
    loadAllProfileData();
  }, []);

  // Calculate Progress from userStats (from DB)
  const completedSignals = userStats?.total_signals || 0;
  const isLocked = completedSignals < MIN_SIGNALS_THRESHOLD;

  const handleContinue = () => {
    const nextBatchIndex = Math.floor(completedSignals / SIGNALS_PER_BATCH);
    navigate('/experience', { state: { nextBatch: nextBatchIndex } });
  };

  return (
    <div className="container-ws section-y min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* LEFT SIDEBAR: PROGRESSIVE PROFILING */}
        <div className="lg:col-span-4 order-2 lg:order-1 space-y-6">
          <ProgressiveQuestion currentData={profile?.demographics || {}} />

          {/* PARTICIPATION SUMMARY */}
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-sm font-black text-ink uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-500 text-lg">analytics</span>
              Actividad
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted font-medium">Versus ganados</span>
                <span className="font-mono font-black text-ink">{participation.versus_count}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted font-medium">Preguntas perfil</span>
                <span className="font-mono font-black text-ink">{participation.progressive_count}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted font-medium">Análisis profundo</span>
                <span className="font-mono font-black text-ink">{participation.depth_count}</span>
              </div>
            </div>
          </section>

          {/* ACTIVITY FEED (MINI) */}
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-sm font-black text-ink uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-500 text-lg">history</span>
              Reciente
            </h3>
            <div className="space-y-4">
              {history.length === 0 ? (
                <p className="text-xs text-muted italic">No hay actividad reciente.</p>
              ) : history.map((event) => (
                <div key={event.id} className="flex gap-3 items-start border-l-2 border-slate-100 pl-3 py-1">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-ink leading-tight">
                      {event.module_type === 'versus' ? 'Participaste en Versus' :
                        event.module_type === 'progressive' ? 'Actualizaste perfil' :
                          event.module_type === 'depth' ? 'Análisis de marca' : 'Actividad'}
                    </p>
                    <p className="text-[10px] text-muted">
                      {new Date(event.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* MAIN CONTENT: SYSTEM CORE */}
        <div className="lg:col-span-8 order-1 lg:order-2 space-y-6">
          <UserLevelCard totalSignals={userStats?.total_signals || 0} />

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
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-black text-ink">
                      {profile?.displayName ? `Hola, ${profile.displayName.split(' ')[0]}` : 'Centro de Sincronización'}
                    </h1>
                    <VerifiedBadge verified={!!(profile as any)?.identity_verified} />
                  </div>
                  <p className="text-xs text-muted font-bold uppercase tracking-wider">
                    {profile?.displayName ? 'Perfil de Inteligencia Activo' : 'Perfil de Inteligencia'}
                  </p>
                </div>
              </div>

              {/* GUEST SIGNUP PROMPT */}
              <AnimatePresence>
                {profile?.tier === 'guest' && !profile?.displayName && !loadingData && (
                  <div className="mb-8">
                    <SimpleSignup />
                  </div>
                )}
              </AnimatePresence>

              {/* ELIMINADO: PROGRESS SECTION REEMPLAZADO POR UserLevelCard */}

              {/* UNLOCK GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {/* RESULTADOS */}
                <button
                  onClick={() => !isLocked && navigate('/results')}
                  className={`p-4 rounded-2xl border text-left transition-all ${isLocked ? 'bg-slate-50 border-slate-100 cursor-not-allowed' : 'bg-emerald-50/50 border-emerald-100 hover:bg-emerald-100/50 active:scale-[0.98]'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sm text-ink">Tendencias</span>
                    {isLocked ? (
                      <span className="material-symbols-outlined text-slate-400">lock</span>
                    ) : (
                      <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-tight">
                    {isLocked ? `Responde ${MIN_SIGNALS_THRESHOLD} versus para ver tendencias.` : 'Acceso total a indicadores y tendencias.'}
                  </p>
                </button>

                {/* RANKINGS */}
                <button
                  onClick={() => navigate('/rankings')}
                  className="p-4 rounded-2xl border bg-indigo-50/50 border-indigo-100 hover:border-indigo-300 transition-all active:scale-[0.98] text-left"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sm text-ink">Rankings Globales</span>
                    <span className="material-symbols-outlined text-indigo-500">format_list_numbered</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-tight">
                    Explora las marcas líderes en cada categoría y su evolución.
                  </p>
                </button>

                {/* MI PULSO (MODULO PERSONAL) */}
                <button
                  onClick={() => navigate('/personal-state')}
                  className="p-4 rounded-2xl border bg-indigo-50/50 border-indigo-100 hover:border-indigo-300 transition-all active:scale-[0.98] text-left sm:col-span-2"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sm text-ink">Estado Personal & Bienestar</span>
                    <span className="material-symbols-outlined text-amber-500">favorite</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-tight">
                    Sincroniza tu estado de ánimo y bienestar para ayudar a calibrar el Pulso del País.
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
              </div>

              {/* DEMO VERIFICATION SIMULATOR */}
              {!(profile as any)?.identity_verified && (
                <div className="mt-8 pt-8 border-t border-slate-50">
                  <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                        <span className="material-symbols-outlined">verified_user</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-emerald-900 mb-1">Aumenta tu impacto (Demo)</h4>
                        <p className="text-xs text-emerald-700/80 leading-relaxed mb-4">
                          Al verificar tu identidad, el peso de tus señales aumentará de **1.0x** a **2.5x**, dándote más influencia en los rankings globales.
                        </p>
                        <button
                          onClick={async () => {
                            try {
                              const { error } = await (supabase as any)
                                .from("users")
                                .update({
                                  identity_verified: true,
                                  identity_verified_at: new Date().toISOString(),
                                })
                                .eq('id', (profile as any)?.id);

                              if (error) throw error;
                              window.location.reload();
                            } catch (err) {
                              logger.error("Error verifying identity:", err);
                            }
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-5 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-200"
                        >
                          Verificar identidad (Demo)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </section>

          {/* PERSONAL INTELLIGENCE: SEGMENT COMPARISON */}
          {!isLocked && comparisons.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-ink tracking-tight flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-600">psychology</span>
                    Tu posición en el segmento
                  </h3>
                  <p className="text-sm text-muted font-medium mt-1">
                    Comparamos tus valoraciones con el promedio de tu perfil (Edad, Sexo, Región).
                  </p>
                </div>
                <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-200">
                  Anonimato Estructural Activo
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {comparisons.map((comp) => (
                  <SegmentComparisonCard key={comp.entity_id} data={comp} />
                ))}
              </div>

              {/* COHERENCE HIGHLIGHT */}
              <div className="bg-indigo-600 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-indigo-100/50">
                <div className="absolute right-0 top-0 p-8 opacity-10">
                  <span className="material-symbols-outlined text-[100px]">verified_user</span>
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="max-w-md">
                    <h4 className="text-lg font-black mb-1">Tu Coherencia como Informante</h4>
                    <p className="text-indigo-100 text-xs font-medium leading-relaxed">
                      Analizamos la relación entre tus elecciones en Versus y tus valoraciones en Análisis Profundo. Una coherencia alta aumenta el peso de tus señales en el sistema.
                    </p>
                  </div>
                  <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-4 min-w-[140px] border border-white/20">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-80">Nivel Actual</p>
                    <div className="text-2xl font-black">
                      {comparisons.length > 0 ? (comparisons.find(c => c.coherence_level === 'Alta') ? 'Alta' : comparisons[0].coherence_level) : 'Incipiente'}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* PERSONAL HISTORY / EVOLUTION (Placeholder for Chart) */}
          {!isLocked && personalHistory.length > 0 && (
            <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h3 className="text-sm font-black text-ink uppercase tracking-wider mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-500 text-lg">stacked_line_chart</span>
                Evolución de tus Valoraciones
              </h3>
              <div className="h-64 w-full">
                <PersonalHistoryChart data={personalHistory} />
              </div>
            </section>
          )}

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
