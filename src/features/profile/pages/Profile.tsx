import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth, authService } from "../../auth";
import { profileService, UserStats, ParticipationSummary, ActivityEvent, SegmentComparison, PersonalHistoryPoint, getNextDemographicsUpdateDate, UserRanking } from "../services/profileService";
import { AccountProfile } from "../../auth/types";
import ProgressiveQuestion from "../components/ProgressiveQuestion";
import SegmentComparisonCard from "../components/SegmentComparisonCard";
import PersonalHistoryChart from "../components/PersonalHistoryChart";
import RankingStatusPanel from "../components/RankingStatusPanel";
import SignalReputationPanel from "../components/SignalReputationPanel";
import { supabase } from "../../../supabase/client";
import { MIN_SIGNALS_THRESHOLD, SIGNALS_PER_BATCH } from "../../../config/constants";
import { logger } from "../../../lib/logger";

import { NextActionRecommendation, ActionType } from '../../../components/ui/NextActionRecommendation';
import { InlineLoader } from '../../../components/ui/InlineLoader';
import { EmptyState } from '../../../components/ui/EmptyState';
import { notifyService } from "../../notifications/notifyService";
import PageHeader from "../../../components/ui/PageHeader";
import LoyaltyPanel from "../components/LoyaltyPanel";
import MissionsPanel from "../components/MissionsPanel";

export default function Profile() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return <InlineLoader label="Cargando tu perfil..." />;

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

  const [ranking, setRanking] = useState<UserRanking | null>(null);

  useEffect(() => {
    const loadAllProfileData = async () => {
      try {
        const [stats, summary, activity, compData, histData, rankData] = await Promise.all([
          profileService.getUserStats(),
          profileService.getParticipationSummary(),
          profileService.getActivityHistory(5),
          profileService.getSegmentComparison(),
          profileService.getPersonalHistory(),
          profileService.getUserRanking()
        ]);

        setUserStats(stats);
        setParticipation(summary);
        setHistory(activity);
        setComparisons(compData);
        setPersonalHistory(histData);
        setRanking(rankData);
      } catch (err) {
        logger.error("Failed to load profile data:", err);
        notifyService.error("No pudimos cargar tu perfil. Intenta de nuevo.");
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

  const scrollToMissions = () => {
    const el = document.getElementById("missions");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="container-ws section-y min-h-screen space-y-6">

      <PageHeader
        variant="simple"
        eyebrow={<span className="badge badge-primary">Perfil</span>}
        title={<h1 className="text-2xl md:text-3xl font-black tracking-tight text-ink">Tu perfil</h1>}
        subtitle={<p className="text-sm text-muted font-medium">Más completo = más peso = mejor lectura.</p>}
      />

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
              <span className="material-symbols-outlined text-primary-500 text-lg">analytics</span>
              Actividad
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted font-medium">Versus respondidos</span>
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
              <span className="material-symbols-outlined text-primary-500 text-lg">history</span>
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

        {/* MAIN CONTENT: DASHBOARD CORE */}
        <div className="lg:col-span-8 order-1 lg:order-2 space-y-6">

          {/* ACTION COMMAND CENTER */}
          {userStats && profile && (
            <NextActionRecommendation
              totalSignals={userStats.total_signals}
              profileCompleteness={profile.profileCompleteness || 0}
              onAction={(action: ActionType) => {
                if (action === 'profile') {
                  const el = document.getElementById("profile-form");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                } else if (action === 'versus') {
                  navigate('/experience');
                } else if (action === 'results') {
                  navigate('/results');
                }
              }}
              customTitle="Tu siguiente paso en Opina+"
              showSecondaryOption={false}
            />
          )}

          {/* HERO IDENTITY & ACTION BOARD */}
          <section className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col sm:flex-row items-stretch gap-6">
            {/* Decorative backdrop */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-500/10 to-emerald-500/5 rounded-bl-[100px] pointer-events-none -z-0"></div>

            <div className="relative z-10 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-50 to-emerald-50 border border-primary-100 flex items-center justify-center shadow-inner">
                    <span className="material-symbols-outlined text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-emerald-500 text-3xl">psychology</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
                        {profile?.displayName ? `Hola, ${profile.displayName.split(' ')[0]}` : 'Perfil de Observador'}
                      </h1>
                      {(profile as any)?.identity_verified && (
                        <span className="material-symbols-outlined text-emerald-500 text-lg" title="Corroborado">verified</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        En Red
                      </div>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                        {profile?.displayName ? 'Sincronización Activa' : 'Calibración Requerida'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* HERO MAIN CTA */}
              <div className="mt-6">
                <button
                  onClick={handleContinue}
                  className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-white flex items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-md uppercase tracking-widest text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 ${isLocked ? 'bg-gradient-to-r from-primary-600 to-primary-500 hover:shadow-primary-500/30' : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:shadow-emerald-500/30'}`}
                >
                  {isLocked ? (
                    <>
                      <span className="material-symbols-outlined text-[20px]">bolt</span>
                      Continuar Calibración
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">add_circle</span>
                      Aportar Nuevas Señales
                    </>
                  )}
                </button>
                {isLocked && (
                  <p className="text-xs text-slate-500 font-medium mt-3 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                    Requiere {MIN_SIGNALS_THRESHOLD} versus contestados para desbloquear análisis.
                  </p>
                )}
              </div>
            </div>

            {/* HERO STATS (Right side on desktop) */}
            <div className="relative z-10 w-full sm:w-48 flex flex-col justify-end gap-3 shrink-0">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Señales Emitidas</span>
                <span className="text-4xl font-black text-slate-800 tracking-tighter">{completedSignals.toLocaleString()}</span>
              </div>
              {/* TOOL SHORTCUTS FOR OTHERS */}
              {!isLocked && (
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => navigate('/results')} className="bg-primary-50 hover:bg-primary-100 text-primary-700 p-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors group">
                    <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">monitoring</span>
                    <span className="text-[9px] font-black uppercase tracking-widest leading-none">Análisis</span>
                  </button>
                  <button onClick={() => navigate('/rankings')} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 p-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors group">
                    <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">format_list_numbered</span>
                    <span className="text-[9px] font-black uppercase tracking-widest leading-none">Ranking</span>
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* USER RANKING / REPUTATION DASHBOARD */}
          {!isLocked && (
            <RankingStatusPanel ranking={ranking} loading={ranking === null && history.length === 0} />
          )}

          {/* SIGNAL REPUTATION (QUALITY & WEIGHT) */}
          {!isLocked && profile && userStats && (
            <SignalReputationPanel
              signalWeight={userStats.signal_weight}
              profileCompleteness={profile.profileCompleteness}
              tier={profile.tier}
            />
          )}

          {/* LOYALTY PROGRESS DASHBOARD */}
          <LoyaltyPanel
            totalSignals={userStats?.total_signals || 0}
            profileCompleteness={(profile as any)?.profileCompleteness || 0}
            tier={(profile as any)?.tier}
            hasCI={(profile as any)?.hasCI}
            onGoMissions={scrollToMissions}
          />

          {/* DEMO VERIFICATION SIMULATOR (COMPACT BANNER) */}
          {!(profile as any)?.identity_verified && (
            <div className="bg-emerald-50 rounded-2xl p-4 sm:p-5 border border-emerald-100 flex flex-col sm:flex-row items-center gap-4 justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                  <span className="material-symbols-outlined text-xl">security</span>
                </div>
                <div>
                  <h4 className="text-sm font-black text-emerald-900 leading-none mb-1">Verifica tu Identidad (Demo)</h4>
                  <p className="text-xs text-emerald-700/80 font-medium leading-tight">
                    Incrementa al instante la confiabilidad y el peso de tus señales.
                  </p>
                </div>
              </div>
              <button
                onClick={async () => {
                  try {
                    const { error } = await (supabase as any)
                      .from("users")
                      .update({ is_identity_verified: true })
                      .eq('user_id', (profile as any)?.id);

                    if (error) throw error;
                    notifyService.success("Identidad verificada (Demo)");
                    setTimeout(() => window.location.reload(), 1500);
                  } catch (err) {
                    logger.error("Error verifying identity:", err);
                    notifyService.error("Error al verificar la identidad demo.");
                  }
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-5 py-2.5 rounded-xl transition-all shadow-sm w-full sm:w-auto"
              >
                Verificar Ahora
              </button>
            </div>
          )}

          <MissionsPanel
            totalSignals={userStats?.total_signals || 0}
            profileCompleteness={(profile as any)?.profileCompleteness || 0}
          />

          {/* PERSONAL INTELLIGENCE: SEGMENT COMPARISON */}
          {!isLocked && comparisons.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-ink tracking-tight flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-600">psychology</span>
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
              <div className="bg-primary-600 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-primary-100/50">
                <div className="absolute right-0 top-0 p-8 opacity-10">
                  <span className="material-symbols-outlined text-[100px]">verified_user</span>
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="max-w-md">
                    <h4 className="text-lg font-black mb-1">Tu Coherencia como Informante</h4>
                    <p className="text-primary-100 text-xs font-medium leading-relaxed">
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
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -z-0"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-400">stacked_line_chart</span>
                    Evolución del Estado Personal
                  </h3>
                  <div className="inline-flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  </div>
                </div>
                <div className="h-64 w-full bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 backdrop-blur-sm">
                  <PersonalHistoryChart data={personalHistory} />
                </div>
              </div>
            </section>
          )}

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
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-slate-500 hover:bg-slate-50 font-bold text-sm transition-colors border border-transparent hover:border-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500 hover:text-slate-700"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Salir
          </button>
        </div>

      </div>
    </div>
  );
}
