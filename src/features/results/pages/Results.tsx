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
import { useAuth } from "../../auth";
import { useSignalStore } from "../../../store/signalStore";
import RequestLoginModal from "../../auth/components/RequestLoginModal";
import { motion } from "framer-motion";
import { MIN_SIGNALS_THRESHOLD, SIGNALS_PER_BATCH } from "../../../config/constants";
import { analyticsService, AdvancedResult, AnalyticsFilters } from "../services/analyticsService";
import { logger } from "../../../lib/logger";

const Results: React.FC = () => {
  const [filters, setFilters] = useState<AnalyticsFilters & { category: string }>({
    region: undefined,
    gender: undefined,
    age_bucket: undefined,
    category: "streaming", // Default category
  });

  const navigate = useNavigate();
  const { profile } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // REAL DATA STATE
  const [loading, setLoading] = useState(true);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [results, setResults] = useState<AdvancedResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch Data on Filter Change
  React.useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const data = await analyticsService.getAdvancedResults(filters.category, {
          region: filters.region,
          gender: filters.gender,
          age_bucket: filters.age_bucket
        });

        if (mounted) {
          setResults(data);
          if (data.length > 0 && !selectedEntityId) {
            setSelectedEntityId(data[0].entity_id);
          }
        }
      } catch (err) {
        logger.error("Failed to load advanced results:", err);
        if (mounted) setError("No se pudieron cargar los datos de análisis.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();
    return () => { mounted = false; };
  }, [filters, selectedEntityId]);

  // LOGIC: Use store only for summary progress
  const signals = useSignalStore(s => s.signals);

  // Threshold Logic
  const completedSignals = signals;
  const isLocked = completedSignals < MIN_SIGNALS_THRESHOLD;
  const progressPercent = Math.min((completedSignals / MIN_SIGNALS_THRESHOLD) * 100, 100);

  const handleContinue = () => {
    const nextBatchIndex = Math.floor(signals / SIGNALS_PER_BATCH);
    navigate('/experience', { state: { nextBatch: nextBatchIndex } });
  };

  // KPI Calculations
  const kpis = React.useMemo(() => {
    const totalVolume = results.reduce((acc, r) => acc + Number(r.total_signals), 0);
    const maxPreference = results.length > 0 ? Math.max(...results.map(r => r.preference_rate)) : 0;

    return {
      sampleN: totalVolume,
      consensus: maxPreference.toFixed(1),
      avgQuality: results.length > 0 ? (results.reduce((acc, r) => acc + Number(r.avg_quality), 0) / results.length).toFixed(1) : 0,
      volatility: "Media" as const,
      drivers: ["Calidad", "Frecuencia"] as [string, string],
      deltaPts: 2.1
    };
  }, [results]);

  const chartData = React.useMemo(() => {
    if (results.length === 0) return null;

    return {
      labels: results.map(r => r.entity_name),
      datasets: [
        {
          data: results.map(r => r.preference_rate),
          backgroundColor: [
            "#6366F1",
            "#8B5CF6",
            "#EC4899",
            "#14B8A6",
            "#F59E0B"
          ],
          borderWidth: 0
        }
      ]
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
          font: {
            family: "'Inter', sans-serif",
            weight: 700
          }
        }
      }
    }
  }), []);

  const lastUpdate = React.useMemo(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }, []);


  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans text-ink relative">
      <div className="max-w-6xl mx-auto space-y-6 pb-32">

        {/* HEADER & FILTERS - Always Visible */}
        <header className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative z-20">
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-muted">
              <span className={`w-1.5 h-1.5 rounded-full ${isLocked ? 'bg-amber-400' : 'bg-emerald-500 animate-pulse'}`} />
              Opina+ Intell
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-ink">
              {isLocked ? "Calibrando Sistema" : "Dashboard de Señales"}
              <span className="text-muted font-medium text-lg ml-2">v0.9</span>
            </h1>
            <p className="text-sm text-muted font-medium mt-1">
              Última sincronización: <span className="font-mono text-ink">{lastUpdate}</span>
            </p>
          </div>

          <div className={`flex flex-wrap gap-3 items-end transition-opacity duration-500 ${(isLocked || !profile?.canSeeInsights) ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
            <Select
              label="Región"
              value={filters.region}
              onChange={(e) => setFilters((p) => ({ ...p, region: e.target.value }))}
            >
              <option value="">Todas</option>
              <option value="RM">RM</option>
              <option value="Valparaíso">Valparaíso</option>
              <option value="Biobío">Biobío</option>
            </Select>

            <Select
              label="Género"
              value={filters.gender}
              onChange={(e) => setFilters((p) => ({ ...p, gender: e.target.value }))}
            >
              <option value="">Todos</option>
              <option value="male">Hombre</option>
              <option value="female">Mujer</option>
              <option value="other">Otro</option>
            </Select>

            <Select
              label="Categoría"
              value={filters.category}
              onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value }))}
            >
              <option value="streaming">Streaming</option>
              <option value="bebidas">Bebidas</option>
              <option value="vacaciones">Vacaciones</option>
              <option value="smartphones">Smartphones</option>
              <option value="retail">Retail</option>
            </Select>

            <button className="h-[42px] px-4 rounded-xl bg-ink text-white text-[11px] font-black hover:opacity-90 transition-all shadow-lg uppercase tracking-[0.14em] flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">filter_list</span>
              Filtrar
            </button>
            {isLocked ? (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-lg border border-amber-100 mt-1">
                <span className="material-symbols-outlined text-[14px] text-amber-600">lock</span>
                <p className="text-[10px] text-amber-700 font-black uppercase tracking-wider">
                  Desbloquea con {MIN_SIGNALS_THRESHOLD} señales
                </p>
              </div>
            ) : !profile?.canSeeInsights && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 rounded-lg border border-indigo-100 mt-1">
                <span className="material-symbols-outlined text-[14px] text-indigo-600">vif</span>
                <p className="text-[10px] text-indigo-700 font-black uppercase tracking-wider">
                  Verifícate para segmentar
                </p>
              </div>
            )}
          </div>
        </header>

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
                  <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[14px]">trending_up</span>
                    +12% vs ayer
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
                  <div className="text-3xl font-black text-ink">{kpis.consensus}%</div>
                  <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    Alta Fiabilidad
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
                    <span className="material-symbols-outlined text-[14px]">remove</span>
                    Estable
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
                      <h3 className="font-black text-ink text-lg tracking-tight">Distribución de Preferencias</h3>
                      <p className="text-xs text-muted font-medium">Desglose porcentual por entidad</p>
                    </div>
                    <button className="text-muted hover:text-ink transition">
                      <span className="material-symbols-outlined">more_horiz</span>
                    </button>
                  </div>

                  {/* Chart Container */}
                  <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl flex justify-center">
                    {(() => {
                      if (loading && results.length === 0) return <div className="text-sm text-slate-400 py-10">Cargando datos...</div>;
                      if (error && results.length === 0) return <div className="text-sm text-red-100 py-10 bg-red-400/10 rounded-xl">{error}</div>;
                      if (!chartData) return <div className="text-sm text-slate-400 py-10">No hay datos suficientes aún.</div>;

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
                          <option key={r.entity_id} value={r.entity_id}>{r.entity_name}</option>
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

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-3xl text-slate-300">query_stats</span>
                  </div>
                  <h3 className="font-black text-ink mb-2">Construyendo Base Comparativa</h3>
                  <p className="text-xs text-muted font-medium max-w-[220px] mb-6 leading-relaxed">
                    Estamos integrando más señales para generar comparativas históricas. Sigue participando para acelerar el análisis.
                  </p>
                  <button
                    onClick={handleContinue}
                    className="px-6 py-3 bg-white border-2 border-slate-100 text-ink rounded-xl text-xs font-black uppercase tracking-wider hover:border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                    Sumar más señales
                  </button>
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
                    <div className="text-center text-slate-400 text-xs py-4">
                      Historial de señales detallado próximamente.
                    </div>
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
      </div >
    </div >
  );
};

export default Results;
