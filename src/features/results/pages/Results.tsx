import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // useLocation removed
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

import InsightAuto from "../../feed/components/InsightAuto";
import DepthAnalyticsPanel from "../../signals/components/DepthAnalyticsPanel";
import Select from "../../../components/ui/Select";
import { InlineLoader } from '../../../components/ui/InlineLoader';
import { EmptyState } from '../../../components/ui/EmptyState';
import { notifyService } from "../../notifications/notifyService";
import { useAuth } from "../../auth";
import { useSignalStore } from "../../../store/signalStore";
import { adminConfigService } from "../../admin/services/adminConfigService";
import RequestLoginModal from "../../auth/components/RequestLoginModal";
import { motion } from "framer-motion";
import { MIN_SIGNALS_THRESHOLD, SIGNALS_PER_BATCH } from "../../../config/constants";
import { resultsService } from "../services/resultsService";
import { RankSnapshot } from "../../rankings/services/rankingService";
import { mySignalsService, MyRecentSignalRow } from "../services/mySignalsService";
import { getOutboxCount } from "../../signals/services/signalOutbox";
import PageHeader from "../../../components/ui/PageHeader";
import { CardState } from "../../../components/ui/StateBlocks";

export type SegmentFilters = {
  gender?: string | null
  age_bucket?: string | null
  region?: string | null
}

const DEFAULT_FILTERS: SegmentFilters & { category: string } = {
  region: undefined,
  gender: undefined,
  age_bucket: undefined,
  category: "streaming",
};

const labelGender = (v?: string | null) => {
  if (!v) return null;
  if (v === "male") return "Hombres";
  if (v === "female") return "Mujeres";
  if (v === "other") return "Otro";
  return v;
};

const labelRegion = (v?: string | null) => {
  if (!v) return null;
  if (v === "Metropolitana") return "RM";
  return v;
};

const labelAge = (v?: string | null) => {
  if (!v) return null;
  if (v === "18-24") return "18–24";
  if (v === "25-34") return "25–34";
  if (v === "35-44") return "35–44";
  if (v === "45-54") return "45–54";
  if (v === "55+") return "55+";
  return v;
};

const Results: React.FC = () => {
  const [filters, setFilters] = useState<SegmentFilters & { category: string }>(DEFAULT_FILTERS);

  const isDefaultFilters =
    (!filters.region || filters.region === null) &&
    (!filters.gender || filters.gender === null) &&
    filters.category === "streaming";

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const activeChips = [
    filters.gender ? `Género: ${labelGender(filters.gender)}` : null,
    filters.region ? `Región: ${labelRegion(filters.region)}` : null,
    filters.age_bucket ? `Edad: ${labelAge(filters.age_bucket)}` : null,
  ].filter(Boolean) as string[];

  const navigate = useNavigate();
  const { profile } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [results, setResults] = useState<RankSnapshot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mySignalsLoading, setMySignalsLoading] = useState(true);
  const [mySignals, setMySignals] = useState<MyRecentSignalRow[]>([]);

  const [mySignalsCount, setMySignalsCount] = useState<number | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const isAdmin = (profile as any)?.role === 'admin';
  const [analyticsMode, setAnalyticsMode] = useState<'all' | 'clean' | null>(null);

  React.useEffect(() => {
    const onEmit = () => setRefreshTick((t) => t + 1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.addEventListener('opina:signal_emitted', onEmit as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return () => window.removeEventListener('opina:signal_emitted', onEmit as any);
  }, []);

  React.useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setLoading(true);
      setMySignalsLoading(true);
      setError(null);

      // Calcular segmentHash P6.4
      let segmentHash = 'global';
      if (filters.gender && filters.region) {
        segmentHash = `gender:${filters.gender}|region:${filters.region}`;
      } else if (filters.gender) {
        segmentHash = `gender:${filters.gender}`;
      } else if (filters.region) {
        segmentHash = `region:${filters.region}`;
      }

      try {
        const [overviewRes, mySignalsRes, countRes] = await Promise.allSettled([
          resultsService.getLatestResults('versus', segmentHash, 10), // Limitamos a un top
          mySignalsService.getMyRecentVersusSignals(12),
          mySignalsService.getMyTotalVersusSignalsCount(),
        ]);

        if (!mounted) return;

        if (overviewRes.status === 'fulfilled') {
          const resRows = overviewRes.value.rows.filter(r => r.category_slug === filters.category);
          setResults(resRows);


          setSelectedEntityId((prev) => {
            if (resRows.length === 0) return null;
            if (prev && resRows.some(r => r.entity_id === prev)) return prev;
            return resRows[0].entity_id;
          });
        } else {
          setError("No se pudieron cargar los datos de análisis.");
          setResults([]);

        }

        if (mySignalsRes.status === 'fulfilled') {
          setMySignals(mySignalsRes.value);
        } else {
          setMySignals([]);
        }

        if (countRes.status === 'fulfilled') {
          setMySignalsCount(countRes.value);
        } else {
          setMySignalsCount(null);
        }
      } catch {
        if (mounted) {
          setError("No se pudieron cargar los datos de análisis.");
          notifyService.error("No se pudieron cargar los datos de análisis.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setMySignalsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [filters, refreshTick]);

  // Load Analytics Mode if admin
  React.useEffect(() => {
    if (!isAdmin) return;
    let mounted = true;
    const loadMode = async () => {
      try {
        const mode = await adminConfigService.getAnalyticsMode();
        if (mounted) setAnalyticsMode(mode);
      } catch (err) {
        // Fallo silencioso
      }
    };
    loadMode();
    return () => { mounted = false; };
  }, [isAdmin]);

  // LOGIC: Use store only as fallback
  const localSignals = useSignalStore(s => s.signals);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pendingCount = React.useMemo(() => getOutboxCount(), [refreshTick]);

  const completedSignals =
    mySignalsCount === null
      ? localSignals
      : (mySignalsCount + pendingCount);

  // Threshold Logic
  // Unlock if user is registered/verified, OR if they reached the local session threshold.
  const isLocked = completedSignals < MIN_SIGNALS_THRESHOLD && (!profile || profile.tier === 'guest');
  const progressPercent = Math.min((completedSignals / MIN_SIGNALS_THRESHOLD) * 100, 100);

  const handleContinue = () => {
    const nextBatchIndex = Math.floor(completedSignals / SIGNALS_PER_BATCH);
    navigate('/experience', { state: { nextBatch: nextBatchIndex } });
  };

  // KPI Calculations
  const kpis = React.useMemo(() => {
    const totalSignals = results.reduce((acc, r) => acc + Number(r.signals_count || 0), 0);

    const shares =
      totalSignals > 0
        ? results.map((r) => (Number(r.signals_count || 0) / totalSignals) * 100)
        : [];

    const sorted = [...shares].sort((a, b) => b - a);
    const topShare = sorted.length ? sorted[0] : 0;
    const deltaPts = sorted.length >= 2 ? sorted[0] - sorted[1] : 0;

    const mean = shares.length ? shares.reduce((a, b) => a + b, 0) / shares.length : 0;
    const variance = shares.length
      ? shares.reduce((acc, x) => acc + Math.pow(x - mean, 2), 0) / shares.length
      : 0;
    const stdev = Math.sqrt(variance);

    const volatility: "Baja" | "Media" | "Alta" =
      stdev < 6 ? "Baja" : stdev < 12 ? "Media" : "Alta";

    const consensusLabel =
      topShare >= 60 ? "Consenso alto" : topShare >= 45 ? "Consenso medio" : "Opinión dividida";

    const intensityLabel =
      deltaPts < 3 ? "Muy parejo" : deltaPts < 8 ? "Competido" : "Dominante";

    return {
      sampleN: totalSignals,
      consensusPct: Number(topShare.toFixed(1)),
      consensusLabel,
      deltaPts: Number(deltaPts.toFixed(1)),
      intensityLabel,
      volatility,
      drivers: ["Distribución", "Volumen"] as [string, string],
    };
  }, [results]);

  const chartData = React.useMemo(() => {
    const totalSignals = results.reduce((acc, r) => acc + Number(r.signals_count || 0), 0);
    if (results.length === 0 || totalSignals <= 0) return null;

    const values = results.map((r) => (Number(r.signals_count || 0) / totalSignals) * 100);

    return {
      labels: results.map((r) => r.entity?.name || "Desconocido"),
      datasets: [
        {
          data: values,
          backgroundColor: ["#6366F1", "#8B5CF6", "#EC4899", "#14B8A6", "#F59E0B"],
          borderWidth: 0,
        },
      ],
    };
  }, [results]);

  const chartOptions = React.useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: "#64748B",
          font: { family: "'Inter', sans-serif", weight: 700 }
        }
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const v = typeof ctx.parsed === "number" ? ctx.parsed : (ctx.parsed?.y ?? 0);
            return `${ctx.label}: ${Number(v).toFixed(1)}%`;
          }
        }
      }
    }
  }), []);

  const lastSnapshotAt = React.useMemo(() => {
    if (!results?.length) return null;
    let max = 0;

    for (const r of results as any[]) {
      const raw = r?.snapshot_at ?? r?.snapshotAt ?? r?.snapshotAtIso ?? r?.created_at ?? null;
      if (!raw) continue;
      const t = new Date(raw).getTime();
      if (!Number.isFinite(t)) continue;
      if (t > max) max = t;
    }

    return max ? new Date(max).toISOString() : null;
  }, [results]);

  const lastSnapshotLabel = React.useMemo(() => {
    if (!lastSnapshotAt) return "—";
    return new Date(lastSnapshotAt).toLocaleString("es-CL", {
      hour12: false,
      dateStyle: "short",
      timeStyle: "short",
    });
  }, [lastSnapshotAt]);

  return (
    <div className="container-ws section-y space-y-6 pb-32">

      <PageHeader
        eyebrow={
          <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
            <span className={`w-1.5 h-1.5 rounded-full ${isLocked ? "bg-amber-400" : "bg-emerald-500 animate-pulse"}`} />
            Opina+ Intell
          </div>
        }
        title={
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-ink">
            {isLocked ? "Calibrando Sistema" : "Dashboard de Señales"}
            <span className="text-muted font-medium text-sm md:text-base ml-2">v1.0</span>
          </h1>
        }
        subtitle={
          <div>
            <div className="mt-2 text-[11px] font-bold text-muted flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              Actualizado cada 3 horas
              <span className="opacity-60">·</span>
              Últ. snapshot: {lastSnapshotLabel}
            </div>

            {activeChips.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {activeChips.map((txt) => (
                  <span
                    key={txt}
                    className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-black tracking-wide"
                  >
                    {txt}
                  </span>
                ))}
              </div>
            )}

            {activeChips.length === 0 && (
              <div className="mt-3 text-[11px] font-bold text-muted">
                Sin filtros (Global)
              </div>
            )}
          </div>
        }
        meta={
          <>
            {isAdmin && analyticsMode && (
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded border text-[10px] font-black uppercase tracking-wider ${analyticsMode === "clean" ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                <span className="material-symbols-outlined text-[14px]">
                  {analyticsMode === "clean" ? "filter_alt" : "filter_alt_off"}
                </span>
                <span>Clean {analyticsMode === "clean" ? "ON" : "OFF"}</span>
              </div>
            )}
          </>
        }
        actions={
          <div className="flex flex-col gap-2">

            <div className={`flex flex-wrap gap-3 items-end ${(isLocked || !profile?.canSeeInsights) ? "opacity-50 pointer-events-none grayscale" : ""}`}>
              <Select
                label="Región"
                value={filters.region || ""}
                onChange={(e) => setFilters((p) => ({ ...p, region: e.target.value || null }))}
              >
                <option value="">Todas</option>
                <option value="Metropolitana">RM</option>
                <option value="Valparaíso">Valparaíso</option>
                <option value="Biobío">Biobío</option>
              </Select>

              <Select
                label="Género"
                value={filters.gender || ""}
                onChange={(e) => setFilters((p) => ({ ...p, gender: e.target.value || null }))}
              >
                <option value="">Todos</option>
                <option value="male">Hombre</option>
                <option value="female">Mujer</option>
                <option value="other">Otro</option>
              </Select>

              <Select
                label="Categoría"
                value={filters.category || ""}
                onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value || "streaming" }))}
              >
                <option value="streaming">Streaming</option>
                <option value="bebidas">Bebidas</option>
                <option value="vacaciones">Vacaciones</option>
                <option value="smartphones">Smartphones</option>
                <option value="retail">Retail</option>
              </Select>

              <button
                type="button"
                onClick={resetFilters}
                disabled={isDefaultFilters}
                className={`h-[42px] px-4 rounded-xl bg-ink text-white text-[11px] font-black hover:opacity-90 transition-all shadow-lg uppercase tracking-[0.14em] flex items-center gap-2 ${isDefaultFilters ? "opacity-40 cursor-not-allowed hover:opacity-40" : ""
                  }`}
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                Restablecer
              </button>
            </div>

            {isLocked ? (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-lg border border-amber-100 mt-1">
                <span className="material-symbols-outlined text-[14px] text-amber-600">lock</span>
                <p className="text-[10px] text-amber-700 font-black uppercase tracking-wider">
                  Desbloquea con {MIN_SIGNALS_THRESHOLD} señales
                </p>
              </div>
            ) : !profile?.canSeeInsights ? (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 rounded-lg border border-indigo-100 mt-1">
                <span className="material-symbols-outlined text-[14px] text-indigo-600">vif</span>
                <p className="text-[10px] text-indigo-700 font-black uppercase tracking-wider">
                  Verifícate para segmentar
                </p>
              </div>
            ) : null}
          </div>
        }
      />

      {/* LOCKED STATE JUMBOTRON (Restricts Content) */}
      {isLocked && (
        <div className="w-full flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-xl border border-slate-100 z-30 text-center px-6">
          <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-6 animate-pulse">
            <span className="material-symbols-outlined text-4xl text-slate-300">lock</span>
          </div>

          <h3 className="text-2xl font-black text-ink mb-2">Tendencias Bloqueadas</h3>
          <p className="text-slate-500 font-medium max-w-md mb-8">
            Necesitas responder {MIN_SIGNALS_THRESHOLD} versus para desbloquear resultados, gráficos y comparativas detalladas.
          </p>

          <button
            onClick={handleContinue}
            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all font-black text-lg flex items-center gap-3"
          >
            <span>Ir a responder versus</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>

          <div className="mt-8 flex flex-col items-center gap-2">
            <div className="text-xs font-black text-slate-300 uppercase tracking-widest">
              Progreso: {completedSignals} / {MIN_SIGNALS_THRESHOLD}
            </div>
            <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
            </div>
            {(!profile || profile.tier === 'guest' || (profile.demographics?.profileStage || 0) < 1) && (
              <p className="mt-4 text-[11px] text-slate-500 font-bold uppercase tracking-wider text-center px-4">
                Completa tu perfil para desbloquear resultados y segmentación.
              </p>
            )}
          </div>
        </div>
      )}

      {/* UNLOCKED CONTENT (KPIs, Charts, Lists) */}
      {!isLocked && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

          {/* TOP ROW: ACTIVITY CARDS (KPIs) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-5 relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-8xl text-indigo-600">groups</span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <span className="material-symbols-outlined text-3xl">groups</span>
              </div>
              <div>
                <p className="text-[10px] font-black text-muted uppercase tracking-[0.18em] mb-1">Volumen</p>
                <div className="text-3xl font-black text-ink">{kpis.sampleN.toLocaleString("es-CL")}</div>
                <div className="text-[11px] font-bold text-muted flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  Señales del snapshot
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-5 relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-8xl text-emerald-600">hub</span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <span className="material-symbols-outlined text-3xl">hub</span>
              </div>
              <div>
                <p className="text-[10px] font-black text-muted uppercase tracking-[0.18em] mb-1">Consenso</p>
                <div className="text-3xl font-black text-ink">{kpis.consensusPct}%</div>
                <div className="text-[11px] font-bold text-muted flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[14px]">hub</span>
                  {kpis.consensusLabel}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-5 relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-8xl text-amber-500">bolt</span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                <span className="material-symbols-outlined text-3xl">bolt</span>
              </div>
              <div>
                <p className="text-[10px] font-black text-muted uppercase tracking-[0.18em] mb-1">Intensidad</p>
                <div className="text-3xl font-black text-ink">+{kpis.deltaPts} pts</div>
                <div className="text-[11px] font-bold text-muted flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
                  {kpis.intensityLabel}
                </div>
              </div>
            </div>
          </div>

          {/* MAIN GRID CONTENT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-24">

            {/* LEFT COLUMN (Chart + Insights) */}
            <div className="lg:col-span-8 space-y-6">

              {/* Main Chart Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-black text-ink text-lg tracking-tight">Distribución de Señales</h3>
                    <p className="text-xs text-muted font-medium">Share (%) de señales en el snapshot</p>
                  </div>
                  <button className="text-muted hover:text-ink transition">
                    <span className="material-symbols-outlined">more_horiz</span>
                  </button>
                </div>

                {/* Chart Container */}
                <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl flex justify-center">
                  {(() => {
                    if (loading && results.length === 0) {
                      return <CardState type="loading" loadingLabel="Cargando distribución..." />;
                    }

                    if (error && results.length === 0) {
                      return (
                        <CardState
                          type="error"
                          title="No pudimos cargar el análisis"
                          description={error}
                          icon="cloud_off"
                        />
                      );
                    }

                    if (!chartData) {
                      return (
                        <CardState
                          type="empty"
                          title="Aún no hay datos suficientes"
                          description="Necesitamos más señales para dibujar este gráfico."
                          icon="query_stats"
                        />
                      );
                    }

                    return (
                      <div className="h-80 w-full relative">
                        <Doughnut data={chartData} options={chartOptions} />
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* AI Insight */}
              <InsightAuto
                tier={profile?.tier || 'guest'}
                region={filters.region || "Chile"}
                age={filters.age_bucket || "Todos"}
                category={filters.category}
                windowLabel="7 días"
                deltaPts={kpis.deltaPts}
                volatility={kpis.volatility}
                driversTop2={kpis.drivers}
                sampleN={kpis.sampleN}
              />

              {/* Depth Insights Panel (Visible for registered users with insight access) */}
              {profile?.canSeeInsights && results.length > 0 && selectedEntityId && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                      Analítica por Opción
                    </h3>
                    <select
                      value={selectedEntityId}
                      onChange={(e) => setSelectedEntityId(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-ink outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      {results.map(r => (
                        <option key={r.entity_id} value={r.entity_id}>{r.entity?.name || 'Unknown'}</option>
                      ))}
                    </select>
                  </div>
                  <DepthAnalyticsPanel optionId={selectedEntityId} />
                </div>
              )}

            </div>

            {/* RIGHT COLUMN (Radiography + Signals List) */}
            <div className="lg:col-span-4 space-y-6">

              {/* Profile Radiography (Gated by User Base) */}
              {/* Disabled temporarily until profile data endpoint is connected */}
              {/* <ProfileRadiography data={mockResults.profileSummary} /> */}

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                <EmptyState
                  title="Construyendo Base Comparativa"
                  description="Estamos integrando más señales para generar comparativas históricas. Sigue participando para acelerar el análisis."
                  actionLabel="Sumar más señales"
                  onAction={handleContinue}
                  icon="query_stats"
                />
              </div>

              {/* Recent Signals List */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-black text-ink text-sm uppercase tracking-wider mb-6 flex justify-between items-center">
                  <span>Tus Señales</span>
                  <span className="text-[10px] bg-slate-100 px-2 py-1 rounded-lg text-slate-500">{completedSignals} regs</span>
                </h3>

                <div className="space-y-6">
                  {/* Recent Signals List - DISABLED (No API) */}
                  {/*
                    {mockSessionBatch.map((result, idx) => ( ... ))}
                     */}
                  {mySignalsLoading ? (
                    <InlineLoader label="Recuperando señales registradas..." />
                  ) : mySignals.length === 0 ? (
                    <div className="p-2 border border-dashed border-slate-200 rounded-xl">
                      <EmptyState
                        title="Desbloquea resultados"
                        description="Completa tu perfil para ver resultados y segmentación."
                        actionLabel="Completar perfil"
                        onAction={() => window.location.href = '/complete-profile'}
                        icon="lock_open"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {mySignals.slice(0, 8).map((s) => {
                        const dt = new Date(s.created_at);
                        const stamp = dt.toLocaleString("es-CL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

                        return (
                          <div key={`${s.created_at}-${s.option_id}`} className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center">
                              {s.image_url ? (
                                <img src={s.image_url} alt={s.entity_name || s.option_label || "Señal"} className="w-full h-full object-contain p-1" />
                              ) : (
                                <span className="material-symbols-outlined text-slate-300">bolt</span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-black text-ink truncate">
                                  {s.entity_name || s.option_label || "Señal"}
                                </p>
                                <span className="text-[10px] font-bold text-muted whitespace-nowrap">
                                  {stamp}{s.pending ? " · Pendiente" : ""}
                                </span>
                              </div>

                              <p className="text-[11px] text-muted font-medium truncate">
                                {s.battle_title ? `${s.battle_title} · ${s.option_label || ""}` : (s.option_label || "")}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* FAB: Only show "Next Batch" since "Locked CTA" is in the Jumbotron */}
          <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-50 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-1000">
            {profile?.tier === 'guest' ? (
              <div className="flex flex-col gap-3 items-center">
                <button
                  onClick={handleContinue}
                  className="px-8 py-4 bg-ink text-white rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all font-black text-lg flex items-center gap-3"
                >
                  <span>Siguiente Bloque</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>

                <button
                  onClick={() => setShowLoginModal(true)}
                  className="text-xs font-bold text-slate-500 hover:text-indigo-600 underline decoration-2 underline-offset-4"
                >
                  Guardar mi progreso (Crear cuenta)
                </button>
              </div>
            ) : (
              <button
                onClick={handleContinue}
                className="px-8 py-4 bg-ink text-white rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all font-black text-lg flex items-center gap-3"
              >
                <span>Siguiente Bloque de Señales</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            )}
          </div>
        </motion.div>
      )}

      <RequestLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
        }}
      />
    </div>
  );
};

export default Results;
