import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useQuery } from '@tanstack/react-query';
import { useAuth, authService } from "../../auth";
import { profileService, UserStats, ParticipationSummary, ActivityEvent, SegmentComparison, PersonalHistoryPoint, getNextDemographicsUpdateDate, UserRanking } from "../services/profileService";
import { AccountProfile } from "../../auth/types";
import ProgressiveQuestion from "../components/ProgressiveQuestion";
import SegmentComparisonCard from "../components/SegmentComparisonCard";
import RankingStatusPanel from "../components/RankingStatusPanel";
import SignalReputationPanel from "../components/SignalReputationPanel";
import { supabase } from "../../../supabase/client";
import { MIN_SIGNALS_THRESHOLD, SIGNALS_PER_BATCH } from "../../../config/constants";
import { logger } from "../../../lib/logger";

const PersonalHistoryChart = lazy(() => import("../components/PersonalHistoryChart"));

import { NextActionRecommendation, ActionType } from '../../../components/ui/NextActionRecommendation';
import { InlineLoader } from '../../../components/ui/InlineLoader';
import { EmptyState } from '../../../components/ui/foundation/EmptyState';
import { GradientCTA } from '../../../components/ui/foundation';
import { notifyService } from "../../notifications/notifyService";
import PageHeader from "../../../components/ui/PageHeader";
import ProfileHeader from '../components/ProfileHeader';
import ProfileActivitySummary from '../components/ProfileActivitySummary';
import LoyaltyPanel from "../components/LoyaltyPanel";
import { MissionsPanel } from "../../loyalty/components/MissionsPanel";
import { WalletView } from "../../loyalty/components/WalletView";

import { useSignalStore } from "../../../store/signalStore";
import { useIdentityEngine } from "../../identity/hooks/useIdentityEngine";

export default function Profile() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return <InlineLoader label="Cargando tu perfil..." />;

  if (!profile) {
    return (
      <div className="container-ws section-y min-h-screen flex items-center justify-center">
        <EmptyState
          title="Completa tu perfil"
          description="Necesitamos algunos datos para habilitar tus señales."
          primaryAction={{ label: "Completar ahora", onClick: () => navigate('/complete-profile') }}
          icon="account_circle"
        />
      </div>
    );
  }

  return <ProfileContent profile={profile} />;
}

// Inner component to permit hook usage
function ProfileContent({ profile }: { profile: AccountProfile }) {
  const navigate = useNavigate();
  const { signals: localSignals } = useSignalStore();
  const { level, archetype, progressPercentage, powerStats } = useIdentityEngine();

  // FASE 2 React Query — 6 queries paralelas independientes. Cada una tiene
  // su propio cache y staleTime; volver al perfil dentro de 5min ya no
  // dispara fetch. Si una falla (ej. ranking), las otras 5 siguen pintando.
  const { data: userStats = null, error: statsError } = useQuery<UserStats | null, Error>({
    queryKey: ['profile', 'stats'],
    queryFn: () => profileService.getUserStats(),
  });
  const { data: participation = { versus_count: 0, progressive_count: 0, depth_count: 0 }, error: partError } = useQuery<ParticipationSummary, Error>({
    queryKey: ['profile', 'participation'],
    queryFn: () => profileService.getParticipationSummary(),
  });
  const { data: history = [], error: histError } = useQuery<ActivityEvent[], Error>({
    queryKey: ['profile', 'activity-history', 5],
    queryFn: () => profileService.getActivityHistory(5),
  });
  const { data: comparisons = [], error: compError } = useQuery<SegmentComparison[], Error>({
    queryKey: ['profile', 'segment-comparison'],
    queryFn: () => profileService.getSegmentComparison(),
  });
  const { data: personalHistory = [], error: phError } = useQuery<PersonalHistoryPoint[], Error>({
    queryKey: ['profile', 'personal-history'],
    queryFn: () => profileService.getPersonalHistory(),
  });
  const { data: ranking = null, error: rankError } = useQuery<UserRanking | null, Error>({
    queryKey: ['profile', 'ranking'],
    queryFn: () => profileService.getUserRanking(),
  });

  // Notificación equivalente a la del catch antiguo: si CUALQUIERA falla,
  // logueamos y mostramos toast una sola vez por error.
  const profileError = statsError || partError || histError || compError || phError || rankError;
  useEffect(() => {
    if (profileError) {
      logger.error("Failed to load profile data:", profileError);
      notifyService.error("No pudimos cargar tu perfil. Intenta de nuevo.");
    }
  }, [profileError]);

  const completedSignals = Math.max(userStats?.total_signals || 0, localSignals);
  const isLocked = completedSignals < MIN_SIGNALS_THRESHOLD;

  const lastUpdateISO = profile?.demographics?.profileStage ? profile.demographics.profileStage.toString() : undefined; // Fallback logic remains, but avoiding any
  const nextUpdateDate = getNextDemographicsUpdateDate(lastUpdateISO);

  const handleContinue = () => {
    const nextBatchIndex = Math.floor(completedSignals / SIGNALS_PER_BATCH);
    navigate('/signals', { state: { nextBatch: nextBatchIndex } });
  };

  const scrollToMissions = () => {
    const el = document.getElementById("missions");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="container-ws section-y min-h-screen space-y-8">

      <PageHeader
        variant="simple"
        eyebrow={<span className="badge badge-primary">Perfil</span>}
        title={<h1 className="text-3xl md:text-4xl font-black tracking-tight text-ink">Tu cuenta</h1>}
        subtitle={<p className="text-sm text-slate-600 font-medium">Completa tu perfil para que tus señales tengan más impacto.</p>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* LEFT SIDEBAR: PROGRESSIVE PROFILING */}
        <div className="lg:col-span-4 order-2 lg:order-1 space-y-6">
          <ProgressiveQuestion currentData={profile?.demographics || {}} />
          {nextUpdateDate && (
            <p className="text-[10px] font-bold text-slate-500 text-center uppercase tracking-widest mt-2">
              Próximo cambio disponible: {nextUpdateDate.toLocaleDateString()}
            </p>
          )}

          <ProfileActivitySummary participation={participation} history={history} />
        </div>

        {/* MAIN CONTENT: DASHBOARD CORE */}
        <div className="lg:col-span-8 order-1 lg:order-2 space-y-8">

          {/* IDENTITY VERIFICATION BANNER */}
          {!profile?.hasCI && (
            <div className="card p-4 sm:p-5 border border-accent/30 bg-accent/5 flex flex-col sm:flex-row items-center gap-4 justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-stroke flex items-center justify-center text-accent shadow-sm shrink-0">
                  <span className="material-symbols-outlined text-xl">security</span>
                </div>
                <div>
                  <h4 className="text-sm font-black text-ink leading-tight mb-1">Verifica tu Identidad</h4>
                  <p className="text-xs text-slate-600 font-medium leading-tight">
                    Incrementa al instante la confiabilidad y el peso de tus señales.
                  </p>
                </div>
              </div>
              <GradientCTA
                label="Verificar Ahora"
                icon="security"
                iconPosition="leading"
                size="sm"
                className="w-full sm:w-auto"
                onClick={async () => {
                  try {
                    const { error } = await supabase
                      .from("users")
                      .update({ is_identity_verified: true })
                      .eq('user_id', profile?.id || '');

                    if (error) throw error;
                    notifyService.success("Identidad verificada");
                    setTimeout(() => window.location.reload(), 1500);
                  } catch (err) {
                    logger.error("Error verifying identity:", err);
                    notifyService.error("Error al verificar la identidad.");
                  }
                }}
              />
            </div>
          )}

          {/* ACTION COMMAND CENTER */}
          {userStats && profile && (
            <div className="mb-2">
              <NextActionRecommendation
                totalSignals={userStats.total_signals}
                profileCompleteness={profile.profileCompleteness || 0}
                onAction={(action: ActionType) => {
                  if (action === 'profile') {
                    const el = document.getElementById("profile-form");
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  } else if (action === 'versus') {
                    navigate('/signals');
                  } else if (action === 'results') {
                    navigate('/results');
                  }
                }}
                customTitle="Tu siguiente paso en Opina+"
                showSecondaryOption={false}
              />
            </div>
          )}

          {/* HERO IDENTITY & ACTION BOARD (B2C IMPACT) */}
          <ProfileHeader
            archetype={archetype}
            level={level}
            progressPercentage={progressPercentage}
            completedSignals={completedSignals}
            powerStats={powerStats}
            isLocked={isLocked}
            onContinue={handleContinue}
            onViewResults={() => navigate('/results')}
          />


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
            profileCompleteness={profile.profileCompleteness || 0}
            tier={profile.tier}
            hasCI={profile.hasCI}
            onGoMissions={scrollToMissions}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <MissionsPanel />
            <WalletView />
          </div>

          {/* PERSONAL INTELLIGENCE: COHERENCE HIGHLIGHT */}
          {!isLocked && comparisons.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-ink tracking-tight flex items-center gap-2">
                    <span className="material-symbols-outlined text-brand">psychology</span>
                    Tu posición en el segmento
                  </h3>
                  <p className="text-sm text-slate-600 font-medium mt-1">
                    Comparamos tus valoraciones con el promedio de tu perfil (Edad, Sexo, Región).
                  </p>
                </div>
                <div className="badge border-none bg-surface2 text-slate-500 shadow-none">
                  Identidad Protegida Activa
                </div>
              </div>

              {/* COHERENCE HIGHLIGHT (Now Light themed) */}
              <div className="card p-6 md:p-8 bg-gradient-to-br from-white to-surface2/50 border-stroke shadow-sm relative overflow-hidden group hover:border-brand/20 transition-all">
                <div className="absolute right-0 top-0 p-8 opacity-[0.03] pointer-events-none">
                  <span className="material-symbols-outlined text-[120px] text-ink">verified_user</span>
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="max-w-md">
                    <h4 className="text-lg font-black text-ink mb-2">Tu Nivel de Coherencia</h4>
                    <p className="text-slate-600 text-sm font-medium leading-relaxed">
                      Analizamos la relación entre tus elecciones en Versus y tus valoraciones en Análisis Profundo. Una alta consistencia avala tu fiabilidad en el sistema.
                    </p>
                  </div>
                  <div className="text-center bg-white rounded-2xl p-5 min-w-[160px] border border-stroke shadow-sm group-hover:shadow-md transition-shadow">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Nivel Actual</p>
                    <div className="text-3xl font-black text-brand">
                      {comparisons.length > 0 ? (comparisons.find(c => c.coherence_level === 'Alta') ? 'Alta' : comparisons[0].coherence_level) : 'Incipiente'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {comparisons.map((comp) => (
                  <SegmentComparisonCard key={comp.entity_id} data={comp} />
                ))}
              </div>
            </section>
          )}

          {/* PERSONAL HISTORY / EVOLUTION */}
          {!isLocked && personalHistory.length > 0 && (
            <LazyChartSection data={personalHistory} />
          )}

        </div>

        {/* SIGN OUT */}
        <div className="lg:col-span-12 mt-12 pt-8 border-t border-stroke flex justify-center lg:justify-end w-full">
          <button
            onClick={async () => {
              try {
                await authService.signOut();
                window.location.href = '/login';
              } catch (err) {
                logger.error("Error signing out:", err);
                notifyService.error("No se pudo cerrar la sesión.");
              }
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-slate-500 hover:bg-surface2 hover:text-ink font-bold text-sm transition-colors border border-transparent hover:border-stroke"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Cerrar Sesión
          </button>
        </div>

      </div>
    </div>
  );
}

// Compuerta de Carga Tardía Real (Lazy Mount vía IntersectionObserver)
function LazyChartSection({ data }: { data: PersonalHistoryPoint[] }) {
  const [shouldMountChart, setShouldMountChart] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldMountChart(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="card p-8 bg-white border-stroke shadow-sm relative overflow-hidden group hover:border-brand/20 transition-all duration-500 min-h-[300px]">
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h3 className="text-sm font-black text-ink uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-brand">stacked_line_chart</span>
                    Evolución del Estado Personal
                </h3>
                <p className="text-xs text-slate-600 mt-1 font-medium">Revisa tu progreso de consistencia temporal.</p>
            </div>
            {shouldMountChart && (
                <div className="inline-flex gap-1.5 opacity-80 animate-in fade-in duration-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-accent"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-brand"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-danger"></span>
                </div>
            )}
        </div>
        
        {shouldMountChart && (
            <div className="h-64 w-full bg-surface2 rounded-2xl p-4 border border-stroke animate-in fade-in duration-700">
                <Suspense fallback={<div className="w-full h-full bg-surface2 animate-pulse rounded-lg flex items-center justify-center"><span className="text-xs text-slate-500 font-bold tracking-widest uppercase flex items-center gap-2"><span className="material-symbols-outlined animate-spin">sync</span>Cargando histórico...</span></div>}>
                <PersonalHistoryChart data={data} />
                </Suspense>
            </div>
        )}
      </div>
    </section>
  );
}
