import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth, authService } from "../../auth";
import { profileService, UserStats, ParticipationSummary, ActivityEvent, SegmentComparison, PersonalHistoryPoint, getNextDemographicsUpdateDate } from "../services/profileService";
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

import { InlineLoader } from '../../../components/ui/InlineLoader';
import { EmptyState } from '../../../components/ui/EmptyState';
import { notifyService } from "../../notifications/notifyService";

export default function Profile() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return <InlineLoader label="Cargando perfil principal..." />;

  // Requirement 4: Si no hay profile cargado (null) y hay sesión (o no la hay pero llegamos aquí).
  if (!profile) {
    return (
      <div className="container-ws section-y min-h-screen flex items-center justify-center">
        <EmptyState
          title="Completa tu perfil"
          description="Necesitamos algunos datos para habilitar tus señales."
          actionLabel="Completar ahora"
          onAction={() => navigate('/complete-profile')}
          icon="account_circle"
        />
      </div>
    );
  }

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
        notifyService.error("No se pudo cargar la información del perfil.");
      } finally {
        setLoadingData(false);
      }
    };
    loadAllProfileData();
  }, []);

  // Calculate Progress from userStats (from DB)
  const completedSignals = userStats?.total_signals || 0;
  const isLocked = completedSignals < MIN_SIGNALS_THRESHOLD;

  // Calculo de expiracion del cooldown demográfico
  const lastUpdateISO = (profile?.demographics as any)?.last_demographics_update || (profile as any)?.updated_at;
  const nextUpdateDate = getNextDemographicsUpdateDate(lastUpdateISO as string | undefined);

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
          {nextUpdateDate && (
            <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest mt-2">
              Próximo cambio disponible: {nextUpdateDate.toLocaleDateString()}
            </p>
          )}

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
                <EmptyState
                  title="Sin señales previas"
                  description="No reportas actividad reciente."
                  icon="history_toggle_off"
                />
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
          <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transition-transform duration-700 hover:rotate-12 hover:scale-110">
              <span className="material-symbols-outlined text-[150px] text-indigo-600">hub</span>
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-inner">
                    <span className="material-symbols-outlined text-indigo-600 text-2xl">person_filled</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                        {profile?.displayName ? `Hola, ${profile.displayName.split(' ')[0]}` : 'Perfil de Observador'}
                      </h1>
                      <VerifiedBadge verified={!!(profile as unknown as { identity_verified: boolean })?.identity_verified} />
                    </div>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                      {profile?.displayName ? 'Sincronización Activa' : 'Calibración Requerida'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    En Red
                  </div>
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

              {/* UNLOCK GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {/* RESULTADOS */}
                <button
                  onClick={() => !isLocked && navigate('/results')}
                  className={`p-5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 ${isLocked ? 'bg-slate-50 border-slate-100 cursor-not-allowed' : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]'}`}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${isLocked ? 'from-slate-200/50' : 'from-indigo-500/10'} to-transparent rounded-bl-full -z-0 group-hover:scale-110 transition-transform`}></div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-black text-sm text-slate-800 uppercase tracking-wider">Análisis & Tendencias</span>
                      {isLocked ? (
                        <span className="material-symbols-outlined text-slate-300 bg-white p-1 rounded-full shadow-sm">lock</span>
                      ) : (
                        <span className="material-symbols-outlined text-white bg-indigo-500 p-1.5 rounded-xl shadow-md group-hover:rotate-12 transition-transform">monitoring</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      {isLocked ? `Requiere ${MIN_SIGNALS_THRESHOLD} versus contestados.` : 'Explora el desglose de métricas por segmento y evolución temporal.'}
                    </p>
                  </div>
                </button>

                {/* RANKINGS */}
                <button
                  onClick={() => navigate('/rankings')}
                  className="p-5 rounded-2xl border text-left bg-white border-slate-200 hover:border-emerald-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 active:scale-[0.98] relative overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full -z-0 group-hover:scale-110 transition-transform"></div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-black text-sm text-slate-800 uppercase tracking-wider">Rankings Globales</span>
                      <span className="material-symbols-outlined text-white bg-emerald-500 p-1.5 rounded-xl shadow-md group-hover:rotate-12 transition-transform">format_list_numbered</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      Descubre el posicionamiento general y por categorías de todas las opciones.
                    </p>
                  </div>
                </button>

              </div>

              {/* MAIN CTA */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleContinue}
                  className={`flex-1 px-6 py-5 rounded-2xl font-black text-white flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-xl uppercase tracking-widest text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 ${isLocked ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:shadow-indigo-500/30' : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:shadow-emerald-500/30'}`}
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
              {!(profile as unknown as { identity_verified: boolean })?.identity_verified && (
                <div className="mt-8 pt-8 border-t border-slate-50">
                  <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                        <span className="material-symbols-outlined">verified_user</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-emerald-900 mb-1">Aumenta tu impacto (Demo)</h4>
                        <p className="text-xs text-emerald-700/80 leading-relaxed mb-4">
                          Verificar tu identidad autentica tu participación y enriquece tu nivel de influencia en los rankings globales.
                        </p>
                        <button
                          onClick={async () => {
                            try {
                              const { error } = await (supabase as unknown as { from: (t: string) => { update: (data: unknown) => { eq: (col: string, val: unknown) => Promise<{ error: Error | null }> } } })
                                .from("users")
                                .update({
                                  is_identity_verified: true,
                                })
                                .eq('user_id', (profile as unknown as { id: string })?.id);

                              if (error) throw error;
                              notifyService.success("Identidad verificada (Demo)");
                              setTimeout(() => window.location.reload(), 1500);
                            } catch (err) {
                              logger.error("Error verifying identity:", err);
                              notifyService.error("Error al verificar la identidad demo.");
                            }
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-5 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500"
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
                      Analizamos la relación entre tus elecciones en Versus y tus valoraciones en Análisis Profundo. Una alta consistencia avala tu fiabilidad en el sistema.
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
            <section className="bg-slate-900 rounded-[2rem] p-8 shadow-xl border border-slate-800 relative overflow-hidden group hover:shadow-[0_20px_40px_rgba(30,41,59,0.5)] transition-all duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-0"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-400">stacked_line_chart</span>
                    Evolución del Estado Personal
                  </h3>
                  <div className="inline-flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  </div>
                </div>
                <div className="h-64 w-full bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 backdrop-blur-sm">
                  <PersonalHistoryChart data={personalHistory} />
                </div>
              </div>
            </section>
          )}

          {/* PROGRESSION BENEFITS CARD */}
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-indigo-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <span className="material-symbols-outlined text-[80px] text-indigo-500">military_tech</span>
            </div>
            <div className="relative z-10">
              <h3 className="text-sm font-black text-ink uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-500 text-lg">hotel_class</span>
                Tus beneficios
              </h3>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-emerald-500 text-base mt-0.5">check_circle</span>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">Más señales diarias mientras más completo tu perfil.</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-emerald-500 text-base mt-0.5">check_circle</span>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">Resultados y segmentación desbloqueados.</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-emerald-500 text-base mt-0.5">check_circle</span>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">Mayor peso de tu señal si verificas identidad (más adelante).</p>
                </li>
              </ul>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Estado</span>
                <span className="text-xs font-bold text-indigo-600 text-right">
                  {profile?.tier === 'guest' ? 'Invitado (0 señales)' :
                    (profile?.demographics?.profileStage || 0) < 1 ? 'Perfil incompleto (0 señales)' :
                      (profile?.demographics?.profileStage || 0) === 1 ? 'Básico (señales limitadas)' :
                        'Perfil completo (mejor acceso a resultados)'}
                  {(profile as any)?.is_identity_verified || (profile as any)?.identity_verified ? ' - Verificado (máximo peso)' : ''}
                </span>
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

        {/* SIGN OUT */}
        <div className="lg:col-span-12 mt-8 pt-6 border-t border-slate-100 flex justify-center lg:justify-end w-full">
          <button
            onClick={async () => {
              try {
                await authService.signOut();
                // The user session is cleared, route to login or home
                navigate('/login');
              } catch (err) {
                logger.error("Error signing out:", err);
                notifyService.error("No se pudo cerrar la sesión.");
              }
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-sm transition-colors border border-transparent hover:border-rose-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-rose-500"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Cerrar Sesión
          </button>
        </div>

      </div>
    </div>
  );
}
