import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabase/client";
import { BrandLogo } from '../../../components/ui/BrandLogo';

import { AdvancedResult } from "../services/analyticsService";

type MyRecentVersusSignal = {
  created_at: string;
  battle_id: string;
  battle_title: string | null;
  option_id: string;
  option_label: string | null;
  entity_id: string | null;
  entity_name: string | null;
  image_url: string | null;
  signal_weight?: number | null;
};
import { analyticsService } from "../services/analyticsService";
import { profileService } from "../../profile/services/profileService";
import { logger } from "../../../lib/logger";
import { SkeletonRankingRow } from "../../../components/ui/Skeleton";
import { EmptyState } from "../../../components/ui/EmptyState";
import { SEG_AGE_BUCKETS, SEG_GENDERS, SEG_REGIONS, normalizeAllToNull } from "../../../lib/segmentation";
import { labelAgeBucket, labelGender, labelRegion } from "../../../lib/filterChips";
import { trackPage } from "../../telemetry/track";
import { useAuth } from "../../auth";
import { useSignalStore } from "../../../store/signalStore";
import { NextActionRecommendation, ActionType } from "../../../components/ui/NextActionRecommendation";

// --- Chip removible (simple) ---
function FilterChip({
  label,
  onRemove
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-stroke bg-white text-ink font-bold text-xs shadow-sm">
      <span>{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="w-5 h-5 rounded-full border border-stroke flex items-center justify-center text-text-muted hover:text-ink hover:bg-surface2 transition-colors"
        aria-label={`Quitar filtro ${label}`}
      >
        ×
      </button>
    </div>
  );
}

// --- Componente de Fila Expandible para la lista del Ranking ---
function RankingResultRow({ result, index }: { result: AdvancedResult, index: number }) {
  const [expanded, setExpanded] = useState(false);

  interface InsightData {
    q_position: number;
    question_text: string;
    question_type: string;
    avg_score: number;
    distribution?: Record<string, number>;
    total_answers: number;
  }
  const [insights, setInsights] = useState<InsightData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchInsights = async () => {
    if (insights.length > 0) return; // Ya cargado
    setLoading(true);
    setError(false);
    try {
      const data = await analyticsService.getEntityDepthInsights(result.entity_id!);
      setInsights(data);
    } catch (err: unknown) {
      if (err) setError(true);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = () => {
    if (!expanded) {
      fetchInsights();
    }
    setExpanded(!expanded);
  };

  return (
    <div className="card overflow-hidden group hover:border-primary/20 transition-all p-0">
      {/* Botón Cabecera */}
      <button
        onClick={toggleExpand}
        className="w-full flex items-center justify-between p-4 md:p-5 bg-white text-left transition-colors hover:bg-surface2/50"
      >
        <div className="flex items-center gap-4">
          <div className="w-8 flex items-center justify-center font-black text-text-muted text-lg group-hover:text-primary transition-colors">
            {index + 1}
          </div>
          <div>
            <p className="font-black text-ink text-lg">{result.entity_name ?? "—"}</p>
            <p className="text-xs text-text-muted font-bold mt-1">Señales Totales: {result.total_signals ?? 0}</p>
          </div>
        </div>
        <div className="text-right flex items-center gap-4">
          <div>
            <p className="text-ink font-black text-xl text-right">
              {Math.min(100, Math.max(0, Math.round(result.preference_rate ?? 0)))}%
            </p>
            <p className="text-[10px] text-text-muted font-black uppercase tracking-widest text-right">Preferencia</p>
          </div>
          <span className={`material-symbols-outlined text-text-muted transition-transform ${expanded ? 'rotate-180 text-primary' : 'group-hover:text-ink'}`}>
            expand_more
          </span>
        </div>
      </button>

      {/* Contenido Expandido */}
      {expanded && (
        <div className="border-t border-stroke bg-surface2 p-6 animate-in slide-in-from-top-2 duration-300">
          <h4 className="text-sm font-black text-ink uppercase tracking-widest mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">analytics</span>
            Radiografía de Preferencias
          </h4>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 text-text-muted">
              <span className="material-symbols-outlined animate-[spin_2s_linear_infinite] text-3xl mb-2 text-primary">sync</span>
              <p className="text-sm font-bold">Analizando patrones del algoritmo...</p>
            </div>
          ) : error ? (
            <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl text-center font-bold text-sm">
              Error al cargar los insights. Intenta abrir nuevamente.
            </div>
          ) : insights.length === 0 ? (
            <div className="text-center py-6 text-text-muted text-sm font-medium">
              No hay respuestas en profundidad para esta entidad aún en el segmento seleccionado.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {insights.map((insight, idx) => (
                <div key={idx} className="bg-white border text-sm border-stroke rounded-xl p-4 shadow-sm hover:border-primary/20 transition-all">
                  <p className="text-text-muted text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary-muted)]"></span>
                    Pregunta {insight.q_position}
                  </p>
                  <p className="font-bold text-ink text-xs mb-4 leading-snug min-h-[34px]">
                    {insight.question_text}
                  </p>

                  {/* Renderizado especial según el tipo */}
                  {insight.question_type.startsWith('scale') ? (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-surface2 h-2 rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-secondary rounded-full"
                          style={{ width: `${(insight.avg_score / (insight.question_type === 'scale_0_10' ? 10 : 5)) * 100}%` }}
                        />
                      </div>
                      <span className="font-black text-lg text-ink w-8 text-right">
                        {Number(insight.avg_score).toFixed(1)}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3 mt-2">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {insight.distribution && Object.entries(insight.distribution).map(([answer, count]: [string, any]) => {
                        const total = insight.total_answers;
                        const pct = total > 0 ? (Number(count) / total) * 100 : 0;
                        return (
                          <div key={answer} className="flex flex-col gap-1.5">
                            <div className="flex justify-between text-[11px] font-bold text-text-secondary">
                              <span className="truncate pr-2">{answer}</span>
                              <span className="text-text-muted">{Math.round(pct)}%</span>
                            </div>
                            <div className="w-full bg-surface2 h-1.5 rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <p className="text-right text-[10px] text-text-muted font-bold mt-5 uppercase tracking-widest">
                    {insight.total_answers} señales base
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Componente de Gráfico de Tendencia (Simulado) ---
function TrendChart({ data, colorVariant }: { data: number[], colorVariant: 'primary' | 'secondary' }) {
  const max = Math.max(...data) * 1.1; // 10% de margen superior
  const min = Math.min(...data) * 0.9;
  const range = max - min || 1;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  const strokeColor = colorVariant === 'primary' ? 'var(--color-primary)' : 'var(--color-secondary)';
  const fillColor = colorVariant === 'primary' ? 'var(--color-primary-muted)' : 'var(--color-surface2)';

  return (
    <div className="relative w-full h-16 mt-4">
      <svg viewBox="0 -10 100 120" className="w-full h-full preserve-3d overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${colorVariant}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={fillColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Fill */}
        <polyline
          fill={`url(#grad-${colorVariant})`}
          points={`0,100 ${pts} 100,100`}
        />
        {/* Line */}
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={pts}
          className="drop-shadow-sm"
        />
        {/* Ultimo punto destacado */}
        <circle
          cx="100"
          cy={100 - ((data[data.length - 1] - min) / range) * 100}
          r="4"
          fill={strokeColor}
          className="animate-pulse"
        />
      </svg>
    </div>
  );
}

export default function ResultsPage() {
  const nav = useNavigate();
  const { profile } = useAuth();
  const { signals } = useSignalStore();
  const initialQS = useMemo(() => new URLSearchParams(window.location.search), []);
  const [category, setCategory] = useState<string>(() => initialQS.get("category") || "supermercados");
  const [categories, setCategories] = useState<{ slug: string; name: string }[]>([]);
  const [gender, setGender] = useState<string | undefined>(() => initialQS.get("gender") || undefined);
  const [region, setRegion] = useState<string | undefined>(() => initialQS.get("region") || undefined);
  const [ageBucket, setAgeBucket] = useState<string | undefined>(() => initialQS.get("age") || undefined);

  // estados
  const [loading, setLoading] = useState(true);
  const [locked] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // data
  const [results, setResults] = useState<AdvancedResult[]>([]);

  const [mySignals, setMySignals] = useState<MyRecentVersusSignal[]>([]);
  const [mySignalsLoading, setMySignalsLoading] = useState(false);
  const [mySignalsError, setMySignalsError] = useState<string | null>(null);

  async function loadMySignals() {
    try {
      setMySignalsLoading(true);
      setMySignalsError(null);

      const { data, error } = await supabase.rpc("get_my_recent_versus_signals", {
        p_limit: 20,
      });

      if (error) throw error;

      setMySignals((data ?? []) as MyRecentVersusSignal[]);
    } catch (e: unknown) {
      const err = e as Error;
      logger.error('Failed to load my signals', err);
      setMySignalsError("No se pudieron cargar tus señales.");
    } finally {
      setMySignalsLoading(false);
    }
  }

  const activeChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; remove: () => void }> = [];

    // Categoría (solo si no es default)
    if (category && category !== "supermercados") {
      const catLabel = categories.find(c => c.slug === category)?.name ?? category;
      chips.push({ key: "category", label: `Categoría: ${catLabel}`, remove: () => setCategory("supermercados") });
    }

    if (gender) chips.push({ key: "gender", label: `Género: ${labelGender(gender) ?? gender}`, remove: () => setGender(undefined) });
    if (region) chips.push({ key: "region", label: `Región: ${labelRegion(region) ?? region}`, remove: () => setRegion(undefined) });
    if (ageBucket) chips.push({ key: "age", label: `Edad: ${labelAgeBucket(ageBucket) ?? ageBucket}`, remove: () => setAgeBucket(undefined) });

    return chips;
  }, [category, categories, gender, region, ageBucket]);

  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    qs.set("category", category);
    if (gender) qs.set("gender", gender); else qs.delete("gender");
    if (region) qs.set("region", region); else qs.delete("region");
    if (ageBucket) qs.set("age", ageBucket); else qs.delete("age");
    window.history.replaceState({}, "", `${window.location.pathname}?${qs.toString()}`);
  }, [category, gender, region, ageBucket]);

  useEffect(() => {
    trackPage("results", { category, gender, region, age_bucket: ageBucket });
  }, [category, gender, region, ageBucket]);

  const clearAll = () => {
    setCategory("supermercados");
    setGender(undefined);
    setRegion(undefined);
    setAgeBucket(undefined);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);

    try {
      await profileService.getUserStats();
      const data = await analyticsService.getAdvancedResults(category, {
        gender,
        region,
        age_bucket: ageBucket
      });
      setResults(data || []);
    } catch (e: unknown) {
      const error = e as Error;
      logger.error(error);
      setErr(error?.message ?? "No pudimos cargar resultados");
    } finally {
      setLoading(false);
    }
  }, [category, gender, region, ageBucket]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('slug, name')
          .order('name');
        if (error) throw error;
        setCategories(data || []);
        if (data && data.length > 0 && !data.find(c => c.slug === category)) {
          setCategory(data[0].slug);
        }
      } catch (e) {
        logger.error('Failed to fetch categories', e);
      }
    };
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
    loadMySignals();
  }, [load]);

  useEffect(() => {
    const handler = () => {
      load();
      loadMySignals();
    };

    window.addEventListener('opina:signal_emitted', handler as EventListener);

    return () => {
      window.removeEventListener('opina:signal_emitted', handler as EventListener);
    };
  }, [load]);

  return (
    <div className="min-h-screen bg-transparent relative z-10 w-full mb-12">
      <div className="max-w-6xl mx-auto px-4 py-8 relative text-ink">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-ink tracking-tight">Resultados y <span className="text-gradient-brand">Rankings</span></h1>
            <p className="text-sm text-text-secondary font-medium mt-1 max-w-xl">
              Esto es tendencia agregada. No es una opinión: es un patrón de comportamiento en tiempo real.
            </p>
            <div className="hidden md:flex items-center gap-1.5 text-xs font-bold text-text-muted mt-2">
              <span className="material-symbols-outlined text-[14px]">update</span>
              Última actualización: Hoy
            </div>
          </div>

          <button
            type="button"
            onClick={() => nav("/experience")}
            className="btn-primary shrink-0 shadow-md text-sm px-6"
          >
            Seguir señalando →
          </button>
        </div>

        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-2">
            {activeChips.map((c) => (
              <FilterChip key={c.key} label={c.label} onRemove={c.remove} />
            ))}

            {activeChips.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-xs font-black text-text-muted hover:text-ink px-3 py-1.5 rounded-lg hover:bg-surface2 transition-all border border-transparent hover:border-stroke flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">device_reset</span>
                Limpiar filtros
              </button>
            )}
          </div>

          {/* Controles de Filtros */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <select
                value={category || ""}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-stroke rounded-xl px-4 py-3.5 text-sm font-bold text-ink focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none shadow-sm"
              >
                <option value="" disabled>Seleccionar Categoría</option>
                <option value="all">Todas las Categorías</option>
                {categories.map(c => (
                  <option key={c.slug} value={c.slug}>{c.name || c.slug}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">expand_more</span>
            </div>

            <div className="relative">
              <select
                value={gender ?? "all"}
                onChange={(e) => setGender(normalizeAllToNull(e.target.value) ?? undefined)}
                className="w-full bg-white border border-stroke rounded-xl px-4 py-3.5 text-sm font-bold text-ink focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none shadow-sm"
              >
                <option value="all">Todos los Géneros</option>
                {SEG_GENDERS.filter(o => o.value !== "all").map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">expand_more</span>
            </div>

            <div className="relative">
              <select
                value={region ?? "all"}
                onChange={(e) => setRegion(normalizeAllToNull(e.target.value) ?? undefined)}
                className="w-full bg-white border border-stroke rounded-xl px-4 py-3.5 text-sm font-bold text-ink focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none shadow-sm"
              >
                <option value="all">Toda la RM</option>
                {SEG_REGIONS.filter(o => o.value !== "all").map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">expand_more</span>
            </div>

            <div className="relative">
              <select
                value={ageBucket ?? "all"}
                onChange={(e) => setAgeBucket(normalizeAllToNull(e.target.value) ?? undefined)}
                className="w-full bg-white border border-stroke rounded-xl px-4 py-3.5 text-sm font-bold text-ink focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none shadow-sm"
              >
                <option value="all">Todas las edades</option>
                {SEG_AGE_BUCKETS.filter(o => o.value !== "all").map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">expand_more</span>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="mt-8 relative">
          <div className={locked ? "pointer-events-none select-none blur-sm opacity-60 transition-all duration-500 relative" : "relative transition-all duration-500"}>

            {/* Nueva Sección: Evolución de KPIs (Time-Series Simuladas) */}
            {!loading && !err && results.length > 0 && (
              <div className="mb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* KPI 1: Evolución de Preferencia Top */}
                  <div className="card p-6 border border-stroke bg-white shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="material-symbols-outlined text-primary text-[18px]">trending_up</span>
                          <h3 className="text-sm font-black uppercase tracking-widest text-text-muted">Desempeño del Líder</h3>
                        </div>
                        <p className="font-black text-2xl text-ink">
                          {results[0]?.entity_name || "N/A"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black text-primary">
                          {Math.round(results[0]?.preference_rate ?? 0)}%
                        </p>
                        <p className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-md inline-block mt-1">
                          +2.4% vs semana previa
                        </p>
                      </div>
                    </div>

                    {/* Generar datos simulados que convergen al valor real */}
                    {(() => {
                      const finalVal = Math.round(results[0]?.preference_rate ?? 50);
                      const baseData = [finalVal - 8, finalVal - 5, finalVal - 7, finalVal - 2, finalVal - 4, finalVal - 1, finalVal];
                      return <TrendChart data={baseData} colorVariant="primary" />;
                    })()}
                  </div>

                  {/* KPI 2: Volumen de Señales */}
                  {(() => {
                    const maxSignals = [...results].sort((a, b) => (b.total_signals ?? 0) - (a.total_signals ?? 0))[0];
                    if (!maxSignals) return null;
                    const targetVol = maxSignals.total_signals ?? 10;
                    const volData = [
                      Math.max(1, targetVol - 15),
                      Math.max(2, targetVol - 10),
                      Math.max(5, targetVol - 5),
                      Math.max(7, targetVol - 8),
                      Math.max(9, targetVol - 2),
                      Math.max(10, targetVol - 1),
                      targetVol
                    ];

                    return (
                      <div className="card p-6 border border-stroke bg-white shadow-sm hover:shadow-md transition-all group delay-100">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="material-symbols-outlined text-secondary text-[18px]">cell_tower</span>
                              <h3 className="text-sm font-black uppercase tracking-widest text-text-muted">Pico de Atención</h3>
                            </div>
                            <p className="font-black text-2xl text-ink line-clamp-1" title={maxSignals.entity_name}>
                              {maxSignals.entity_name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-black text-secondary">
                              {targetVol}
                            </p>
                            <p className="text-[10px] font-bold text-text-secondary bg-surface2 px-2 py-0.5 rounded-md inline-block mt-1 uppercase tracking-widest">
                              Señales Hoy
                            </p>
                          </div>
                        </div>
                        <TrendChart data={volData} colorVariant="secondary" />
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Nueva Sección: AI Insights Humorístico/Visual */}
            {!loading && !err && results.length > 0 && (
              <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-brand shadow-md flex items-center justify-center text-white relative overflow-hidden">
                    <span className="material-symbols-outlined text-[20px] animate-[bounce_2s_ease-in-out_infinite] z-10">smart_toy</span>
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight leading-snug text-gradient-brand">Opina+ AI Roast & Insights</h2>
                    <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-0.5">La verdad duele (a veces)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {/* Insight 1: Líder Actual (Estadística Visual) */}
                  <div className="card p-6 border-t-4 border-t-primary shadow-sm hover:shadow-md transition-all bg-gradient-to-br from-white to-surface2/40 relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col justify-between h-full">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-1.5 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary-muted)]" />
                            Rey Supremo
                          </p>
                          <p className="font-black text-2xl text-ink mb-1.5 line-clamp-2" title={results[0]?.entity_name || "N/A"}>
                            {results[0]?.entity_name || "N/A"}
                          </p>
                        </div>

                        {/* Gráfico Circular CSS */}
                        <div className="relative w-14 h-14 rounded-full flex justify-center items-center shrink-0 shadow-sm"
                          style={{ background: `conic-gradient(var(--color-primary) ${Math.round(results[0]?.preference_rate ?? 0)}%, var(--color-stroke) 0)` }}>
                          <div className="absolute inset-1.5 bg-white rounded-full flex items-center justify-center shadow-inner">
                            <span className="text-sm font-black text-ink">{Math.round(results[0]?.preference_rate ?? 0)}%</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs font-medium text-text-secondary mt-4">
                        Domina el segmento como si no hubiera competencia.
                      </p>
                    </div>
                  </div>

                  {/* Insight 2: Mayor Participación (Gráfico de barras apiladas pequeño) */}
                  {(() => {
                    const top3 = [...results].sort((a, b) => (b.total_signals ?? 0) - (a.total_signals ?? 0)).slice(0, 3);
                    const totalSignalsTop3 = top3.reduce((acc, curr) => acc + (curr.total_signals ?? 0), 0);
                    const main = top3[0];
                    if (!main) return null;

                    return (
                      <div className="card p-6 border-t-4 border-t-secondary shadow-sm hover:shadow-md transition-all bg-gradient-to-br from-white to-surface2/40 relative overflow-hidden group" style={{ transitionDelay: '100ms' }}>
                        <div className="relative z-10 flex flex-col justify-between h-full">
                          <div>
                            <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-1.5 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_var(--color-secondary)]" />
                              Hype y Ruido
                            </p>
                            <p className="font-black text-2xl text-ink mb-1.5 line-clamp-2" title={main.entity_name || "N/A"}>
                              {main.entity_name || "N/A"}
                            </p>
                          </div>

                          <div className="mt-auto pt-4">
                            {/* Mini gráfico apilado */}
                            <div className="flex w-full h-3 rounded-full overflow-hidden shadow-inner gap-0.5 bg-surface2 mb-3" title={`${totalSignalsTop3} señales en el Top 3`}>
                              {top3.map((r, i) => (
                                <div key={i}
                                  className={`${i === 0 ? 'bg-secondary' : i === 1 ? 'bg-secondary/60' : 'bg-secondary/30'}`}
                                  style={{ width: `${((r.total_signals ?? 0) / totalSignalsTop3) * 100}%` }}
                                />
                              ))}
                            </div>

                            <p className="text-xs font-medium text-text-secondary">
                              Captura <strong className="text-ink font-black">{main.total_signals}</strong> señales de toda la atención.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Insight 3: Roast Personalizado (Humor) */}
                  {(() => {
                    const roast = (function () {
                      if (!results.length) return null;
                      const winner = results[0];
                      const votedForWinner = mySignals.some(s => s.option_id === winner.entity_id || s.entity_name === winner.entity_name || s.option_label === winner.entity_name);

                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const genderStr = (profile as any)?.gender === 'female' ? 'mujer' : (profile as any)?.gender === 'male' ? 'hombre' : 'persona';

                      if (votedForWinner) {
                        return { title: "Cero Riesgos", text: `Como buen${genderStr === 'mujer' ? 'a' : ' buen'} ${genderStr}, decidiste seguir al rebaño y apoyar a ${winner.entity_name}. Sigue así, librepensador.` };
                      }

                      const loser = results[results.length - 1];
                      const votedForLoser = loser ? mySignals.some(s => s.option_id === loser.entity_id || s.entity_name === loser.entity_name || s.option_label === loser.entity_name) : false;

                      if (votedForLoser) {
                        return { title: "Alma Rebelde", text: `Tu elegido (${loser.entity_name}) sacó apenas un ${Math.round(loser.preference_rate ?? 0)}%. Básicamente tú y tu abuela. A defender los nichos se ha dicho.` };
                      }

                      if (mySignals.length === 0) {
                        return { title: "Modo Fantasma", text: `Mucho mirar los ${Math.round(winner.preference_rate ?? 0)}% de ${winner.entity_name} pero cero señales tuyas. ¡Sal de tu cueva y vota en un Versus!` };
                      }

                      return { title: "Fuera de Sintonía", text: `La masa aclama a ${winner.entity_name}, pero tú andas en tu propio mundo votando otras opciones. Nos parece fascinante tu desconexión.` };
                    })();

                    return roast ? (
                      <div className="card p-6 border-t-4 border-t-ink shadow-sm hover:shadow-md transition-all bg-ink relative overflow-hidden group" style={{ transitionDelay: '200ms' }}>
                        <div className="absolute -top-4 -right-4 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500 group-hover:rotate-12">
                          <span className="material-symbols-outlined text-[100px] text-white">psychiatry</span>
                        </div>
                        <div className="relative z-10 text-white flex flex-col justify-between h-full">
                          <div>
                            <p className="text-[10px] text-surface2 font-black uppercase tracking-widest mb-1.5 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">vital_signs</span>
                              Tu Perfil vs Realidad
                            </p>
                            <p className="font-black text-xl mb-2 text-white">
                              {roast.title}
                            </p>
                          </div>
                          <p className="text-xs font-medium text-white/80 leading-relaxed mt-2">
                            {roast.text}
                          </p>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Panel 1: Resultados */}
              <div className="lg:col-span-2 card p-8 h-full shadow-md min-h-[500px]">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stroke">
                  <div className="w-10 h-10 rounded-xl bg-surface2 border border-stroke flex items-center justify-center text-ink">
                    <span className="material-symbols-outlined text-[20px]">sort</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-ink tracking-tight leading-snug">Ranking Agregado</h2>
                    <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-0.5">Ordenado por Preferencia Neta</p>
                  </div>
                </div>

                {loading ? (
                  <div className="space-y-3">
                    <SkeletonRankingRow />
                    <SkeletonRankingRow />
                    <SkeletonRankingRow />
                  </div>
                ) : err ? (
                  <div className="mt-6 bg-danger/5 border border-danger/20 p-6 rounded-2xl text-center">
                    <span className="material-symbols-outlined text-4xl text-danger mb-2">warning</span>
                    <div className="text-danger font-bold text-lg mb-1">Error al procesar data</div>
                    <div className="text-sm font-medium text-danger/80 mb-4">{err}</div>
                    <button onClick={load} className="btn-secondary text-sm">
                      Reintentar conexión
                    </button>
                  </div>
                ) : results.length === 0 ? (
                  <div className="mt-12">
                    <EmptyState
                      title="Data insuficiente"
                      description="Aún no hay suficientes señales para este corte. Intenta con un segmento más amplio."
                      icon="data_alert"
                      actionLabel="Resetear filtros"
                      onAction={clearAll}
                    />
                  </div>
                ) : (
                  <div className="mt-2 flex flex-col gap-4">
                    {results.slice(0, 10).map((r: AdvancedResult, idx: number) => (
                      <RankingResultRow key={r.entity_id ?? idx} result={r} index={idx} />
                    ))}
                  </div>
                )}
              </div>

              {/* Panel 2: Mis señales previas */}
              <div className="card p-8 shadow-sm flex flex-col h-full bg-surface2/30">
                <div className="mb-6 pb-4 border-b border-stroke flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-stroke shadow-sm flex items-center justify-center text-text-muted">
                      <span className="material-symbols-outlined text-[20px]">history</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-ink tracking-tight leading-snug">Mis Señales</h2>
                      <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-0.5">Tu influencia directa</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={loadMySignals}
                    className="shrink-0 flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-text-muted hover:text-ink transition-colors bg-white hover:bg-surface2 border border-stroke px-3 py-1.5 rounded-lg shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[14px]">sync</span>
                    Sync
                  </button>
                </div>

                {mySignalsLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-text-muted">
                    <span className="material-symbols-outlined animate-spin text-3xl text-primary mb-3">cycle</span>
                    <span className="text-sm font-bold animate-pulse">Recopilando historial...</span>
                  </div>
                ) : mySignalsError ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-danger font-bold">
                    <span className="material-symbols-outlined text-3xl mb-2">sentiment_dissatisfied</span>
                    <p>{mySignalsError}</p>
                  </div>
                ) : mySignals.length === 0 ? (
                  <div className="mt-8">
                    <EmptyState
                      title="Aún no tienes señales"
                      description="Participa en un versus para dejar tu marca."
                      icon="history"
                      actionLabel="Seguir señalando →"
                      onAction={() => nav("/experience")}
                    />
                  </div>
                ) : (
                  <div className="mt-2 space-y-4 flex-1 overflow-y-auto pr-2 stylish-scrollbar max-h-[600px]">
                    {mySignals.map((s) => (
                      <div key={`${s.created_at}-${s.option_id}`} className="rounded-2xl border border-stroke bg-white p-4 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group">
                        <div className="flex items-start gap-4">
                          <div className="h-14 w-14 shrink-0 flex items-center justify-center overflow-hidden rounded-xl border border-stroke bg-surface2 p-[2px] transition-transform group-hover:scale-105">
                            <BrandLogo
                              name={s.entity_name ?? s.option_label ?? "Señal"}
                              imageUrl={s.image_url}
                              className="h-full w-full object-contain"
                              fallbackClassName="h-full w-full flex items-center justify-center text-[10px] font-black text-text-muted uppercase text-center bg-white"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-black text-ink leading-tight mb-2">
                              {s.battle_title ?? "Versus"}
                            </div>

                            <div className="text-[12px] font-medium text-text-secondary bg-surface2 inline-block px-2.5 py-1 rounded-md border border-stroke">
                              Elección: <span className="font-black text-primary ml-1">{s.option_label ?? s.entity_name ?? "Opción"}</span>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest">
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                                {new Date(s.created_at).toLocaleDateString()}
                              </span>
                              {typeof s.signal_weight === "number" && (
                                <span className="flex items-center gap-1 text-secondary">
                                  <span className="material-symbols-outlined text-[12px]">weight</span>
                                  Peso: x{s.signal_weight.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-12 mb-8">
              <NextActionRecommendation
                totalSignals={signals}
                profileCompleteness={(profile as { profileCompleteness?: number })?.profileCompleteness || 0}
                onAction={(action: ActionType) => {
                  if (action === 'profile') nav('/complete-profile');
                  if (action === 'versus') nav('/experience');
                  if (action === 'results') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                customTitle="¿Terminaste de explorar?"
                showSecondaryOption={false}
              />
            </div>

          </div>

          {/* Overlay lock premium */}
          {locked && !loading && (
            <div className="absolute inset-0 flex items-center justify-center p-4 z-20 bg-white/60 backdrop-blur-sm rounded-3xl">
              <div className="w-full max-w-md bg-white border border-stroke rounded-[2rem] p-10 shadow-2xl text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 rounded-full blur-[40px] translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10">
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-surface2 border border-stroke text-ink flex items-center justify-center font-black text-4xl mb-6 relative">
                    🔒
                  </div>
                  <h3 className="text-2xl font-black text-ink mb-3">Resultados Ocultos</h3>
                  <p className="text-text-secondary font-medium text-sm leading-relaxed max-w-xs mx-auto mb-8">
                    La inteligencia colectiva está reservada para quienes aportan al sistema.
                  </p>
                  <button
                    type="button"
                    onClick={() => nav("/experience")}
                    className="btn-primary w-full shadow-md text-base py-4 group flex items-center justify-center gap-2"
                  >
                    Desbloquear ahora
                    <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
