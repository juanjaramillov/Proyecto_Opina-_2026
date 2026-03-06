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
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-700 font-bold text-xs">
      <span>{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition"
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
  const [insights, setInsights] = useState<any[]>([]);
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
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Botón Cabecera */}
      <button
        onClick={toggleExpand}
        className="w-full flex items-center justify-between p-4 bg-white text-left transition-colors hover:bg-slate-50"
      >
        <div className="flex items-center gap-4">
          <div className="w-8 flex items-center justify-center font-black text-slate-400 text-lg">
            {index + 1}
          </div>
          <div>
            <p className="font-black text-slate-900 text-lg">{result.entity_name ?? "—"}</p>
            <p className="text-xs text-slate-500 font-bold mt-1">Señales Totales: {result.total_signals ?? 0}</p>
          </div>
        </div>
        <div className="text-right flex items-center gap-4">
          <div>
            <p className="text-slate-900 font-black text-xl">{Math.round((result.preference_rate ?? 0) * 100)}%</p>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Preferencia</p>
          </div>
          <span className={`material-symbols-outlined text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </div>
      </button>

      {/* Contenido Expandido */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-6 animate-in slide-in-from-top-2 duration-300">
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-500">analytics</span>
            Radiografía de Preferencias
          </h4>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <span className="material-symbols-outlined animate-spin text-3xl mb-2 text-primary-500">sync</span>
              <p className="text-sm font-bold">Analizando patrones del algoritmo...</p>
            </div>
          ) : error ? (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-center font-bold text-sm">
              Error al cargar los insights. Intenta abrir nuevamente.
            </div>
          ) : insights.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-sm font-medium">
              No hay respuestas en profundidad para esta entidad aún en el segmento seleccionado.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {insights.map((insight, idx) => (
                <div key={idx} className="bg-white border text-sm border-slate-200 rounded-xl p-4 shadow-sm">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">
                    Pregunta {insight.q_position}
                  </p>
                  <p className="font-bold text-slate-800 text-xs mb-3 leading-tight min-h-[34px]">
                    {insight.question_text}
                  </p>

                  {/* Renderizado especial según el tipo */}
                  {insight.question_type.startsWith('scale') ? (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                        {/* NPS/Score width calculation */}
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-emerald-400 rounded-full"
                          style={{ width: `${(insight.avg_score / (insight.question_type === 'scale_0_10' ? 10 : 5)) * 100}%` }}
                        />
                      </div>
                      <span className="font-black text-lg text-slate-900 w-8 text-right">
                        {Number(insight.avg_score).toFixed(1)}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2 mt-2">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {insight.distribution && Object.entries(insight.distribution).map(([answer, count]: [string, any]) => {
                        const total = insight.total_answers;
                        const pct = total > 0 ? (Number(count) / total) * 100 : 0;
                        return (
                          <div key={answer} className="flex flex-col gap-1">
                            <div className="flex justify-between text-[11px] font-bold text-slate-600">
                              <span className="truncate pr-2">{answer}</span>
                              <span>{Math.round(pct)}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="h-full bg-primary-400 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <p className="text-right text-[10px] text-slate-400 font-bold mt-3">
                    {insight.total_answers} señales
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
        // Si la categoría actual no está en la lista (y la lista no está vacía), 
        // cambiamos a la primera disponible.
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

  // --- DG-B01: refresco post-señal (confianza) ---
  useEffect(() => {
    const handler = () => {
      // Recarga ranking + mis señales usando filtros actuales
      load();
      loadMySignals();
    };

    window.addEventListener('opina:signal_emitted', handler as EventListener);

    return () => {
      window.removeEventListener('opina:signal_emitted', handler as EventListener);
    };
  }, [load]);

  // --- UI ---
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Resultados</h1>
            <p className="text-slate-500 font-medium mt-1">
              Esto es tendencia agregada. No es una opinión: es un patrón.
            </p>
            <div className="mt-2 text-xs font-bold text-slate-400 bg-slate-50 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-100">
              <span className="material-symbols-outlined text-[14px]">update</span>
              Último snapshot: Se actualiza cada 3 horas.
            </div>
          </div>

          <button
            type="button"
            onClick={() => nav("/experience")}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-emerald-500 hover:opacity-95 text-white font-black transition-all shadow-md hover:shadow-lg active:scale-95"
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
                className="text-xs font-black text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg hover:bg-slate-50 transition"
              >
                Resetear filtros
              </button>
            )}
          </div>

          {/* Controles */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-primary-100 bg-primary-50/30 font-bold text-primary-900 outline-none focus:border-primary-600 focus:ring-4 focus:ring-primary-600/10 transition-all"
            >
              {categories.map(c => (
                <option key={c.slug} value={c.slug}>{c.name || c.slug}</option>
              ))}
            </select>

            <select
              value={gender ?? "all"}
              onChange={(e) => setGender(normalizeAllToNull(e.target.value) ?? undefined)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 bg-slate-50/50 font-bold text-slate-700 outline-none focus:border-primary-600 focus:ring-4 focus:ring-primary-600/10"
            >
              <option value="all">Todos los Géneros</option>
              {SEG_GENDERS.filter(o => o.value !== "all").map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
            </select>

            <select
              value={region ?? "all"}
              onChange={(e) => setRegion(normalizeAllToNull(e.target.value) ?? undefined)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 bg-slate-50/50 font-bold text-slate-700 outline-none focus:border-primary-600 focus:ring-4 focus:ring-primary-600/10"
            >
              <option value="all">Toda la RM</option>
              {SEG_REGIONS.filter(o => o.value !== "all").map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
            </select>

            <select
              value={ageBucket ?? "all"}
              onChange={(e) => setAgeBucket(normalizeAllToNull(e.target.value) ?? undefined)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 bg-slate-50/50 font-bold text-slate-700 outline-none focus:border-primary-600 focus:ring-4 focus:ring-primary-600/10"
            >
              <option value="all">Todas las edades</option>
              {SEG_AGE_BUCKETS.filter(o => o.value !== "all").map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
            </select>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="mt-8 relative">

          {/* Fondo difuminado cuando está locked */}
          <div className={locked ? "pointer-events-none select-none blur-[2px] opacity-40" : ""}>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Panel 1: Resultados */}
              <div className="lg:col-span-2 border border-slate-200 rounded-3xl p-6">
                <h2 className="text-lg font-black text-slate-900">Ranking agregado</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">Ordenado por preferencia.</p>

                {loading ? (
                  <div className="mt-6 bg-white rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
                    <SkeletonRankingRow />
                    <SkeletonRankingRow />
                    <SkeletonRankingRow />
                    <SkeletonRankingRow />
                    <SkeletonRankingRow />
                  </div>
                ) : err ? (
                  <div className="mt-6 text-rose-600 font-bold">
                    <div className="mb-2">No pudimos cargar resultados</div>
                    <div className="text-sm font-normal text-rose-500 mb-4">Refresca o vuelve más tarde.</div>
                    <button onClick={load} className="px-4 py-2 bg-rose-100 text-rose-700 rounded-lg text-sm font-black hover:bg-rose-200 transition">
                      Reintentar
                    </button>
                  </div>
                ) : results.length === 0 ? (
                  <div className="mt-6">
                    <EmptyState
                      title="No hay resultados con estos filtros"
                      description="Prueba ampliar el segmento. A veces la data no alcanza."
                      icon="analytics"
                      actionLabel="Resetear filtros"
                      onAction={clearAll}
                    />
                  </div>
                ) : (
                  <div className="mt-6 flex flex-col gap-3">
                    {results.slice(0, 10).map((r: AdvancedResult, idx: number) => (
                      <RankingResultRow key={r.entity_id ?? idx} result={r} index={idx} />
                    ))}
                  </div>
                )}
              </div>

              {/* Panel 2: Mis señales previas */}
              <div className="border border-slate-200 rounded-3xl p-6">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Listo. Tu señal ya cuenta.</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Ahora mira cómo se mueve el resultado por segmento.</p>
                  </div>
                  <button
                    type="button"
                    onClick={loadMySignals}
                    className="text-xs font-bold text-slate-700 hover:text-slate-900"
                  >
                    Actualizar
                  </button>
                </div>

                {mySignalsLoading ? (
                  <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
                    <span className="animate-pulse">Cargando...</span>
                  </div>
                ) : mySignalsError ? (
                  <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700 shadow-sm">
                    {mySignalsError}
                  </div>
                ) : mySignals.length === 0 ? (
                  <div className="mt-6">
                    <EmptyState
                      title="Aún no tienes señales"
                      description="Participa en un versus para dejar tu marca."
                      icon="history"
                      actionLabel="Seguir señalando →"
                      onAction={() => nav("/experience")}
                    />
                  </div>
                ) : (
                  <div className="mt-6 space-y-3">
                    {mySignals.map((s) => (
                      <div key={`${s.created_at}-${s.option_id}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                          <div className="h-14 w-14 shrink-0 flex items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50 shadow-inner p-[2px]">
                            <BrandLogo
                              name={s.entity_name ?? s.option_label ?? "Señal"}
                              imageUrl={s.image_url}
                              className="h-full w-full object-contain mix-blend-multiply"
                              fallbackClassName="h-full w-full flex items-center justify-center text-[10px] font-bold text-slate-300 text-center"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-black text-slate-900 leading-tight">
                              {s.battle_title ?? "Versus"}
                            </div>

                            <div className="mt-1 text-[13px] font-medium text-slate-600">
                              Elegiste: <span className="font-bold text-primary-600">{s.option_label ?? s.entity_name ?? "Opción"}</span>
                            </div>

                            <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              <span>{new Date(s.created_at).toLocaleDateString()}</span>
                              {typeof s.signal_weight === "number" && (
                                <>
                                  <span>•</span>
                                  <span className="text-emerald-500">Peso: {s.signal_weight.toFixed(2)}</span>
                                </>
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

            <div className="mt-8 mb-8">
              <NextActionRecommendation
                totalSignals={signals}
                profileCompleteness={(profile as any)?.profileCompleteness || 0}
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
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-8 shadow-sm text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-2xl">🔒</div>
                <h3 className="mt-4 text-xl font-black text-slate-900">Desbloquea Resultados</h3>
                Resultados disponibles para todos los usuarios.
                <button
                  type="button"
                  onClick={() => nav("/experience")}
                  className="mt-6 w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-emerald-500 hover:opacity-95 text-white font-black transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                  Seguir señalando →
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
