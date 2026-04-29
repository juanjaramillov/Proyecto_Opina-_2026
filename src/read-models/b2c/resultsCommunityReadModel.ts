import { ResultsCommunityQuery, ResultsCommunitySnapshot, ResultsEditorialHighlight, MetricAvailabilityState } from "./resultsCommunityTypes";
import { ANALYTICS_MINIMUM_COHORT, RESULTS_MICRODETAIL_LOCKED } from "../analytics/metricPolicies";
import { supabase } from "../../supabase/client";
import { assembleSurfaceMetrics } from "../analytics/surfaceAssemblers";
import { ResolutionContext } from "../analytics/metricResolvers";
import { MetricAvailabilityState as CoreAvailabilityState } from "../analytics/metricAvailability";
import { PublicationMode } from "../analytics/analyticsTypes";
import { TemporalMovieRow } from "../../features/signals/services/kpiService";

/**
 * Reconstruye la "película temporal" (Tendencia / Aceleración / Volatilidad / Persistencia)
 * de una entidad líder a partir de su rollup diario. Devuelve la serie ordenada del más
 * reciente al más antiguo, alineada con el shape que espera B2CTrendCard.
 */
async function buildLeaderTemporalMovie(
  entityId: string,
  entityName: string,
  windowDays = 14
): Promise<{ movie: TemporalMovieRow[] | null; nEff: number | null; freshnessHours: number | null }> {
  const { data, error } = await supabase
    .from("analytics_daily_entity_rollup")
    .select("summary_date, preference_share, total_battles, momentum")
    .eq("entity_id", entityId)
    .order("summary_date", { ascending: false })
    .limit(windowDays);

  if (error || !data || data.length < 3) {
    return { movie: null, nEff: null, freshnessHours: null };
  }

  // Orden ascendente para cálculos temporales (del más antiguo al más reciente)
  const asc = [...data].reverse();

  // Helpers
  const sharePctOf = (row: typeof asc[number]) => Math.round((row.preference_share || 0) * 100 * 10) / 10;
  const stdDev = (xs: number[]) => {
    if (xs.length < 2) return 0;
    const m = xs.reduce((a, b) => a + b, 0) / xs.length;
    const v = xs.reduce((a, b) => a + (b - m) ** 2, 0) / xs.length;
    return Math.sqrt(v);
  };

  // Persistencia: cuántos días consecutivos (desde el más reciente hacia atrás)
  // mantienen la misma dirección de cambio (sube o baja) sin invertirse.
  let persistencia = 0;
  for (let i = asc.length - 1; i > 0; i--) {
    const cur = sharePctOf(asc[i]);
    const prev = sharePctOf(asc[i - 1]);
    const dir = Math.sign(cur - prev);
    if (i === asc.length - 1) {
      persistencia = dir === 0 ? 0 : 1;
      continue;
    }
    const prevDir = Math.sign(sharePctOf(asc[i + 1]) - cur);
    if (dir !== 0 && dir === prevDir) persistencia++;
    else break;
  }

  const movie: TemporalMovieRow[] = asc.map((row, i) => {
    const sharePct = sharePctOf(row);
    const prev = asc[i - 1];
    const tendencia = prev ? Math.round((sharePct - sharePctOf(prev)) * 10) / 10 : 0;
    const prev2 = asc[i - 2];
    const aceleracion = prev && prev2
      ? Math.round((tendencia - (sharePctOf(prev) - sharePctOf(prev2))) * 10) / 10
      : 0;
    const window = asc.slice(Math.max(0, i - 6), i + 1).map(sharePctOf);
    const volatilidad = Math.round(stdDev(window) * 10) / 10;

    return {
      time_bucket: row.summary_date,
      option_id: entityId,
      option_label: entityName,
      n_eff: row.total_battles || 0,
      share_pct: sharePct,
      tendencia,
      aceleracion,
      volatilidad,
      persistencia,
    };
  });

  // El componente espera el orden DESC (más reciente primero, según código original)
  const desc = [...movie].reverse();
  const newest = desc[0];
  const lastDate = newest?.time_bucket ? new Date(newest.time_bucket).getTime() : null;
  const freshnessHours = lastDate ? Math.round((Date.now() - lastDate) / 36e5) : null;
  const nEff = asc.reduce((acc, r) => acc + (r.total_battles || 0), 0);

  return { movie: desc, nEff, freshnessHours };
}

/**
 * Devuelve los últimos 7 valores de total_battles para una entidad como sparkline.
 */
async function buildEntitySparkline(entityId: string, days = 7): Promise<number[] | null> {
  const { data } = await supabase
    .from("analytics_daily_entity_rollup")
    .select("summary_date, total_battles")
    .eq("entity_id", entityId)
    .order("summary_date", { ascending: false })
    .limit(days);
  if (!data || data.length === 0) return null;
  return [...data].reverse().map(r => r.total_battles || 0);
}

/**
 * Devuelve top fastest riser/faller con su delta% y sparkline.
 */
async function buildPulseTrendDetails() {
  const { data } = await supabase
    .from("v_trend_week_over_week")
    .select("entity_id, entity_name, delta_percentage, trend_status")
    .order("delta_percentage", { ascending: false });
  if (!data || data.length === 0) {
    return {
      riserDelta: null,
      fallerDelta: null,
      riserSpark: null,
      fallerSpark: null,
    };
  }
  const riser = data.find(r => (r.delta_percentage ?? 0) > 0);
  const faller = [...data].reverse().find(r => (r.delta_percentage ?? 0) < 0);
  const riserSpark = riser?.entity_id ? await buildEntitySparkline(riser.entity_id) : null;
  const fallerSpark = faller?.entity_id ? await buildEntitySparkline(faller.entity_id) : null;
  return {
    riserDelta: riser?.delta_percentage ?? null,
    fallerDelta: faller?.delta_percentage ?? null,
    riserSpark,
    fallerSpark,
  };
}

// ============================================================================
// F9 — PREDICTIVOS
// ============================================================================

/**
 * Regresión lineal simple sobre los últimos N días de preference_share.
 * Devuelve el share proyectado a 7 días (0-100).
 */
function linearForecast(values: number[], horizonDays: number): number | null {
  if (values.length < 5) return null;
  const n = values.length;
  const xs = values.map((_, i) => i);
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = values.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (values[i] - meanY);
    den += (xs[i] - meanX) ** 2;
  }
  if (den === 0) return null;
  const slope = num / den;
  const intercept = meanY - slope * meanX;
  const forecast = intercept + slope * (n - 1 + horizonDays);
  return Math.max(0, Math.min(100, Math.round(forecast * 10) / 10));
}

/**
 * Construye los 3 KPIs predictivos del marco extendido:
 *  - forecast_leader_share_7d (regresión sobre últimos 14d)
 *  - tipping_point_days (cuándo el segundo alcanza al líder)
 *  - volatility_regime_change_label (cambio de régimen 7d vs 7d previos)
 */
async function buildPredictiveLayer(): Promise<{
  forecastedLeaderShare7d: number | null;
  tippingPointDays: number | null;
  volatilityRegimeChangeLabel: string | null;
}> {
  // Pedimos top 2 entidades por win_rate
  const { data: topRows } = await supabase
    .from("v_comparative_preference_summary")
    .select("entity_id, entity_name, win_rate")
    .order("win_rate", { ascending: false })
    .limit(2);
  if (!topRows || topRows.length === 0) {
    return { forecastedLeaderShare7d: null, tippingPointDays: null, volatilityRegimeChangeLabel: null };
  }

  // Series del líder (14 días)
  const leader = topRows[0];
  const second = topRows[1];

  const fetchSeries = async (entityId: string) => {
    const { data } = await supabase
      .from("analytics_daily_entity_rollup")
      .select("summary_date, preference_share")
      .eq("entity_id", entityId)
      .order("summary_date", { ascending: false })
      .limit(14);
    if (!data || data.length === 0) return [];
    return [...data].reverse().map(r => Math.round((r.preference_share || 0) * 100 * 10) / 10);
  };

  if (!leader.entity_id) return { forecastedLeaderShare7d: null, tippingPointDays: null, volatilityRegimeChangeLabel: null };
  const leaderSeries = await fetchSeries(leader.entity_id);
  const secondSeries = second?.entity_id ? await fetchSeries(second.entity_id) : [];

  const forecastedLeaderShare7d = linearForecast(leaderSeries, 7);

  // Tipping point: si la pendiente del segundo > pendiente del líder y el segundo crece,
  // ¿en cuántos días iguala al líder?
  let tippingPointDays: number | null = null;
  if (leaderSeries.length >= 5 && secondSeries.length >= 5) {
    const leaderSlope = (linearForecast(leaderSeries, 1) ?? leaderSeries[leaderSeries.length - 1]) - leaderSeries[leaderSeries.length - 1];
    const secondSlope = (linearForecast(secondSeries, 1) ?? secondSeries[secondSeries.length - 1]) - secondSeries[secondSeries.length - 1];
    const gap = leaderSeries[leaderSeries.length - 1] - secondSeries[secondSeries.length - 1];
    const closingRate = secondSlope - leaderSlope;
    if (closingRate > 0.05 && gap > 0) {
      tippingPointDays = Math.min(365, Math.ceil(gap / closingRate));
    }
  }

  // Volatility regime change: stddev últimos 7d vs stddev 7d previos
  let volatilityRegimeChangeLabel: string | null = null;
  if (leaderSeries.length >= 14) {
    const stddev = (xs: number[]) => {
      if (xs.length < 2) return 0;
      const m = xs.reduce((a, b) => a + b, 0) / xs.length;
      return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / xs.length);
    };
    const prev7 = leaderSeries.slice(0, 7);
    const last7 = leaderSeries.slice(7, 14);
    const stdPrev = stddev(prev7);
    const stdLast = stddev(last7);
    if (stdPrev > 0) {
      const ratio = stdLast / stdPrev;
      if (ratio >= 2) volatilityRegimeChangeLabel = "Volatilidad subiendo (>2x última semana)";
      else if (ratio <= 0.5) volatilityRegimeChangeLabel = "Estabilización marcada";
      else volatilityRegimeChangeLabel = "Régimen estable";
    }
  }

  return { forecastedLeaderShare7d, tippingPointDays, volatilityRegimeChangeLabel };
}

// ============================================================================
// F10 — EXPLICATIVOS
// ============================================================================

/**
 * News impact lag: media de horas entre publish_at de current_topics activos
 * y la primera fluctuación significativa (>2pp) en analytics_daily_topic_rollup.
 */
async function buildNewsImpactLag(): Promise<number | null> {
  const { data: topics } = await supabase
    .from("current_topics")
    .select("id, published_at")
    .eq("is_active", true)
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .limit(10);
  if (!topics || topics.length === 0) return null;

  const lags: number[] = [];
  for (const t of topics) {
    if (!t.published_at) continue;
    const { data: rolls } = await supabase
      .from("analytics_daily_topic_rollup")
      .select("summary_date, dominant_answer_share")
      .eq("topic_id", t.id)
      .order("summary_date", { ascending: true });
    if (!rolls || rolls.length < 2) continue;
    const baseline = rolls[0].dominant_answer_share || 0;
    for (let i = 1; i < rolls.length; i++) {
      if (Math.abs((rolls[i].dominant_answer_share || 0) - baseline) > 0.02) {
        const lagH = (new Date(rolls[i].summary_date).getTime() - new Date(t.published_at).getTime()) / 36e5;
        if (lagH > 0 && lagH < 24 * 14) lags.push(lagH);
        break;
      }
    }
  }
  if (lags.length === 0) return null;
  return Math.round(lags.reduce((a, b) => a + b, 0) / lags.length);
}

/**
 * Cohort defection: detectar la cohorte (segment_value) cuya preference_share del líder
 * cambió más fuerte semana vs semana anterior.
 */
async function buildCohortDefection(): Promise<string | null> {
  const { data: leader } = await supabase
    .from("v_comparative_preference_summary")
    .select("entity_id, entity_name")
    .order("win_rate", { ascending: false })
    .limit(1)
    .single();
  if (!leader?.entity_id) return null;

  const { data: rows } = await supabase
    .from("analytics_daily_segment_rollup")
    .select("segment_type, segment_value, summary_date, preference_share")
    .eq("entity_id", leader.entity_id)
    .eq("segment_type", "generation")
    .order("summary_date", { ascending: false })
    .limit(60);
  if (!rows || rows.length === 0) return null;

  // Por cohorte, calcular avg semana actual vs semana previa
  const byCohort: Record<string, { current: number[]; previous: number[] }> = {};
  const now = Date.now();
  const dayMs = 86400000;
  for (const r of rows) {
    const ageDays = Math.floor((now - new Date(r.summary_date).getTime()) / dayMs);
    if (ageDays < 0) continue;
    const key = r.segment_value;
    if (!byCohort[key]) byCohort[key] = { current: [], previous: [] };
    if (ageDays < 7) byCohort[key].current.push(r.preference_share || 0);
    else if (ageDays < 14) byCohort[key].previous.push(r.preference_share || 0);
  }

  let topDelta = 0;
  let topCohort: string | null = null;
  for (const [cohort, ds] of Object.entries(byCohort)) {
    if (ds.current.length === 0 || ds.previous.length === 0) continue;
    const meanCur = ds.current.reduce((a, b) => a + b, 0) / ds.current.length;
    const meanPrev = ds.previous.reduce((a, b) => a + b, 0) / ds.previous.length;
    const delta = meanCur - meanPrev;
    if (Math.abs(delta) > Math.abs(topDelta)) {
      topDelta = delta;
      topCohort = cohort;
    }
  }
  if (!topCohort || Math.abs(topDelta) < 0.02) return null;
  const sign = topDelta > 0 ? "subió" : "bajó";
  return `${topCohort} ${sign} ${(Math.abs(topDelta) * 100).toFixed(1)}pp esta semana`;
}

/**
 * Topic correlation: top 3 pares de current_topics con correlación >0.7 en heat_index 14d.
 */
async function buildTopicCorrelation(): Promise<string | null> {
  const { data: rows } = await supabase
    .from("analytics_daily_topic_rollup")
    .select("topic_id, summary_date, heat_index")
    .order("summary_date", { ascending: false })
    .limit(500);
  if (!rows || rows.length < 30) return null;

  const byTopic: Record<string, number[]> = {};
  for (const r of rows) {
    if (!byTopic[r.topic_id]) byTopic[r.topic_id] = [];
    byTopic[r.topic_id].push(r.heat_index || 0);
  }
  const topics = Object.entries(byTopic).filter(([, v]) => v.length >= 5);
  if (topics.length < 2) return null;

  const pearson = (a: number[], b: number[]) => {
    const n = Math.min(a.length, b.length);
    if (n < 3) return 0;
    const ax = a.slice(0, n), bx = b.slice(0, n);
    const ma = ax.reduce((s, x) => s + x, 0) / n;
    const mb = bx.reduce((s, x) => s + x, 0) / n;
    let num = 0, da = 0, db = 0;
    for (let i = 0; i < n; i++) {
      num += (ax[i] - ma) * (bx[i] - mb);
      da += (ax[i] - ma) ** 2;
      db += (bx[i] - mb) ** 2;
    }
    return da > 0 && db > 0 ? num / Math.sqrt(da * db) : 0;
  };

  const pairs: { a: string; b: string; r: number }[] = [];
  for (let i = 0; i < topics.length; i++) {
    for (let j = i + 1; j < topics.length; j++) {
      const r = pearson(topics[i][1], topics[j][1]);
      if (Math.abs(r) > 0.7) pairs.push({ a: topics[i][0], b: topics[j][0], r });
    }
  }
  if (pairs.length === 0) return null;

  // Resolver títulos de los top 3
  pairs.sort((x, y) => Math.abs(y.r) - Math.abs(x.r));
  const top = pairs.slice(0, 3);
  const ids = Array.from(new Set(top.flatMap(p => [p.a, p.b])));
  const { data: titles } = await supabase
    .from("current_topics")
    .select("id, title")
    .in("id", ids);
  const titleMap = new Map((titles || []).map(t => [t.id, t.title]));
  const labels = top.map(p => `${titleMap.get(p.a) || "?"} ↔ ${titleMap.get(p.b) || "?"} (r=${p.r.toFixed(2)})`);
  return labels.join(" · ");
}

// ============================================================================
// F11 — SALUD DEL PRODUCTO
// ============================================================================

/**
 * Calcula 4 KPIs de salud:
 *  - module_discovery_rate
 *  - module_friction_score
 *  - cohort_half_life_days
 *  - user_reputation_p50
 */
async function buildProductHealth(): Promise<{
  moduleDiscoveryRate: number | null;
  moduleFrictionScore: number | null;
  cohortHalfLifeDays: number | null;
  userReputationP50: number | null;
}> {
  // Discovery: % usuarios con eventos en >=2 module_type
  const { data: behavior } = await supabase
    .from("behavior_events")
    .select("user_id, module_type, status, duration_ms")
    .not("user_id", "is", null)
    .not("module_type", "is", null);

  let moduleDiscoveryRate: number | null = null;
  let moduleFrictionScore: number | null = null;
  if (behavior && behavior.length > 0) {
    const userModules = new Map<string, Set<string>>();
    let totalAttempts = 0;
    let abandoned = 0;
    for (const ev of behavior) {
      if (!ev.user_id) continue;
      if (!userModules.has(ev.user_id)) userModules.set(ev.user_id, new Set());
      userModules.get(ev.user_id)!.add(ev.module_type || "unknown");
      if (ev.status === "started" || ev.status === "in_progress" || ev.status === "abandoned" || ev.status === "completed") {
        totalAttempts++;
        if (ev.status === "abandoned" || (ev.status === "in_progress" && (ev.duration_ms || 0) > 30000)) abandoned++;
      }
    }
    const totalUsers = userModules.size;
    const multiModule = Array.from(userModules.values()).filter(s => s.size >= 2).length;
    moduleDiscoveryRate = totalUsers > 0 ? Math.round((multiModule / totalUsers) * 100) : null;
    moduleFrictionScore = totalAttempts > 0 ? Math.round((abandoned / totalAttempts) * 100) : null;
  }

  // Half-life: media de días entre primera y última actividad por usuario
  const { data: metrics } = await supabase
    .from("user_daily_metrics")
    .select("user_id, metric_date, interactions");
  let cohortHalfLifeDays: number | null = null;
  if (metrics && metrics.length > 0) {
    const byUser = new Map<string, string[]>();
    for (const m of metrics) {
      if (!m.user_id || !m.metric_date) continue;
      if (!byUser.has(m.user_id)) byUser.set(m.user_id, []);
      byUser.get(m.user_id)!.push(m.metric_date);
    }
    const halfLives: number[] = [];
    for (const [, dates] of byUser) {
      if (dates.length < 2) continue;
      dates.sort();
      const first = new Date(dates[0]).getTime();
      const last = new Date(dates[dates.length - 1]).getTime();
      halfLives.push((last - first) / 86400000);
    }
    if (halfLives.length > 0) {
      cohortHalfLifeDays = Math.round(halfLives.reduce((a, b) => a + b, 0) / halfLives.length);
    }
  }

  // Reputation p50: media (proxy) de computed_weight de signal_events por usuario activo
  const { data: signals } = await supabase
    .from("signal_events")
    .select("user_id, computed_weight, response_time_ms")
    .not("user_id", "is", null)
    .gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString())
    .limit(2000);
  let userReputationP50: number | null = null;
  if (signals && signals.length > 0) {
    const byUser = new Map<string, { weights: number[]; rts: number[] }>();
    for (const s of signals) {
      if (!s.user_id) continue;
      if (!byUser.has(s.user_id)) byUser.set(s.user_id, { weights: [], rts: [] });
      byUser.get(s.user_id)!.weights.push(s.computed_weight || 0);
      if (s.response_time_ms) byUser.get(s.user_id)!.rts.push(s.response_time_ms);
    }
    const reputations: number[] = [];
    for (const [, d] of byUser) {
      const avgW = d.weights.reduce((a, b) => a + b, 0) / d.weights.length;
      // Penalizar response_time muy bajos (<200ms = clic compulsivo)
      const rtPenalty = d.rts.length > 0
        ? Math.min(1, d.rts.filter(r => r >= 800).length / d.rts.length)
        : 1;
      reputations.push(Math.min(100, Math.round(avgW * 100 * rtPenalty)));
    }
    if (reputations.length > 0) {
      reputations.sort((a, b) => a - b);
      userReputationP50 = reputations[Math.floor(reputations.length / 2)];
    }
  }

  return { moduleDiscoveryRate, moduleFrictionScore, cohortHalfLifeDays, userReputationP50 };
}

// ============================================================================
// F12 — INTEGRIDAD / FRAUDE
// ============================================================================

/**
 * Calcula:
 *  - suspicious_cluster_index: % de signals que vienen del mismo device_hash en ventana corta
 *  - bot_suspicion_score: % de signals con response_time_ms < 500ms
 *  - brigading_alert_label: si hay un entity_id que recibió >3x su rate normal en última hora
 */
async function buildIntegrityLayer(): Promise<{
  suspiciousClusterIndex: number | null;
  botSuspicionScore: number | null;
  brigadingAlertLabel: string | null;
}> {
  const since = new Date(Date.now() - 24 * 86400000).toISOString();
  const { data: signals } = await supabase
    .from("signal_events")
    .select("device_hash, response_time_ms, entity_id, created_at")
    .gte("created_at", since)
    .limit(5000);

  let suspiciousClusterIndex: number | null = null;
  let botSuspicionScore: number | null = null;
  let brigadingAlertLabel: string | null = null;

  if (signals && signals.length > 0) {
    // Cluster: top device_hash representa qué % de los signals
    const byDevice = new Map<string, number>();
    for (const s of signals) {
      const k = s.device_hash || "unknown";
      byDevice.set(k, (byDevice.get(k) || 0) + 1);
    }
    const counts = Array.from(byDevice.values()).sort((a, b) => b - a);
    const total = signals.length;
    const topShare = counts[0] / total;
    suspiciousClusterIndex = Math.min(100, Math.round(topShare * 100 * 1.5));

    // Bot suspicion: % con rt < 500ms
    const fastClicks = signals.filter(s => (s.response_time_ms || 99999) < 500).length;
    const withRt = signals.filter(s => s.response_time_ms != null).length;
    botSuspicionScore = withRt > 0 ? Math.round((fastClicks / withRt) * 100) : null;

    // Brigading: comparar última hora vs media de las 23 horas previas
    const lastHour = new Date(Date.now() - 3600000).getTime();
    const byEntityHour = new Map<string, { last: number; prev: number }>();
    for (const s of signals) {
      if (!s.entity_id) continue;
      if (!byEntityHour.has(s.entity_id)) byEntityHour.set(s.entity_id, { last: 0, prev: 0 });
      const t = new Date(s.created_at).getTime();
      if (t >= lastHour) byEntityHour.get(s.entity_id)!.last++;
      else byEntityHour.get(s.entity_id)!.prev++;
    }
    for (const [eid, c] of byEntityHour) {
      const avgPrev = c.prev / 23;
      if (avgPrev >= 1 && c.last > avgPrev * 3) {
        const { data: ent } = await supabase
          .from("entities")
          .select("name")
          .eq("id", eid)
          .single();
        brigadingAlertLabel = `Brigading sospechoso: ${ent?.name || "entidad"} +${Math.round(c.last / avgPrev)}x baseline`;
        break;
      }
    }
  }

  return { suspiciousClusterIndex, botSuspicionScore, brigadingAlertLabel };
}

// ============================================================================
// F13 — COMERCIALES B2B
// ============================================================================

/**
 * Calcula los 3 KPIs comerciales accionables.
 */
async function buildCommercialLayer(): Promise<{
  conversionImpactEstimatorLabel: string | null;
  competitiveVulnerabilityWindowLabel: string | null;
  whiteSpaceCategoryLabel: string | null;
}> {
  let conversionImpactEstimatorLabel: string | null = null;
  let competitiveVulnerabilityWindowLabel: string | null = null;
  let whiteSpaceCategoryLabel: string | null = null;

  // Conversion impact: tomar la entidad con MENOR depth_score y proyectar el lift en OpinaScore.
  const { data: depthRows } = await supabase
    .from("analytics_daily_depth_rollup")
    .select("entity_id, depth_score, attribute_category")
    .order("summary_date", { ascending: false })
    .limit(200);
  if (depthRows && depthRows.length > 0) {
    // Por entidad, sumar depth_score promedio
    const byEntity = new Map<string, { sum: number; n: number; weakAttr: string; weakScore: number }>();
    for (const r of depthRows) {
      if (!byEntity.has(r.entity_id)) byEntity.set(r.entity_id, { sum: 0, n: 0, weakAttr: "", weakScore: 999 });
      const e = byEntity.get(r.entity_id)!;
      e.sum += r.depth_score || 0;
      e.n++;
      if ((r.depth_score || 999) < e.weakScore) {
        e.weakScore = r.depth_score || 999;
        e.weakAttr = r.attribute_category;
      }
    }
    // Top entity con peor atributo
    let topImpact: { entity_id: string; weak: string; lift: number } | null = null;
    for (const [eid, d] of byEntity) {
      const avg = d.sum / d.n;
      const lift = (avg - d.weakScore) * 5; // ~5 pp de OpinaScore por punto de depth recuperado
      if (lift > 5 && (!topImpact || lift > topImpact.lift)) topImpact = { entity_id: eid, weak: d.weakAttr, lift };
    }
    if (topImpact) {
      const { data: ent } = await supabase
        .from("entities")
        .select("name")
        .eq("id", topImpact.entity_id)
        .single();
      conversionImpactEstimatorLabel = `Si ${ent?.name || "el líder"} mejora "${topImpact.weak}", su OpinaScore subiría ~${Math.round(topImpact.lift)} pts`;
    }
  }

  // Vulnerability window: hora del día con mayor volatilidad del líder
  // (proxy: como no tenemos rollup horario de líder, usamos `momentum` reciente)
  const { data: volRows } = await supabase
    .from("analytics_daily_entity_rollup")
    .select("entity_id, momentum, summary_date")
    .order("summary_date", { ascending: false })
    .limit(60);
  if (volRows && volRows.length > 5) {
    // Encontrar día de la semana con más swings
    const byDow = new Map<number, number[]>();
    for (const r of volRows) {
      const dow = new Date(r.summary_date).getDay();
      if (!byDow.has(dow)) byDow.set(dow, []);
      byDow.get(dow)!.push(Math.abs(r.momentum || 0));
    }
    let worstDow = -1;
    let worstAvg = 0;
    for (const [dow, ms] of byDow) {
      const avg = ms.reduce((a, b) => a + b, 0) / ms.length;
      if (avg > worstAvg) { worstAvg = avg; worstDow = dow; }
    }
    const dayNames = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    if (worstDow >= 0 && worstAvg > 0.05) {
      competitiveVulnerabilityWindowLabel = `Mayor vulnerabilidad: ${dayNames[worstDow]} (swings ${(worstAvg * 100).toFixed(1)}pp)`;
    }
  }

  // White space: categoría con menos de 3 entidades vinculadas (vía entity_category_links)
  const { data: linkRows } = await supabase
    .from("entity_category_links")
    .select("category_id, entity_id")
    .limit(500);
  if (linkRows && linkRows.length > 0) {
    const byCat = new Map<string, Set<string>>();
    for (const r of linkRows) {
      if (!r.category_id || !r.entity_id) continue;
      if (!byCat.has(r.category_id)) byCat.set(r.category_id, new Set());
      byCat.get(r.category_id)!.add(r.entity_id);
    }
    let thinnestCatId: string | null = null;
    let thinnestCount = Infinity;
    for (const [id, set] of byCat) {
      if (set.size < 3 && set.size < thinnestCount) { thinnestCatId = id; thinnestCount = set.size; }
    }
    if (thinnestCatId) {
      const { data: cat } = await supabase.from("categories").select("name").eq("id", thinnestCatId).single();
      whiteSpaceCategoryLabel = `White space en "${cat?.name || "categoría"}" (solo ${thinnestCount} marcas activas)`;
    }
  }

  return { conversionImpactEstimatorLabel, competitiveVulnerabilityWindowLabel, whiteSpaceCategoryLabel };
}

// ============================================================================
// F17 — KPIs cerrados con migración SQL (5 views nuevas)
// ============================================================================

/**
 * Reputation risk: top entidad con risk_index alto (de v_entity_reputation_risk).
 */
async function buildReputationRiskTop(): Promise<string | null> {
  const { data, error } = await (supabase.from as unknown as (t: string) => ReturnType<typeof supabase.from>)("v_entity_reputation_risk")
    .select("entity_name, risk_index")
    .order("risk_index", { ascending: false })
    .limit(1)
    .single();
  if (error || !data) return null;
  const row = data as unknown as { entity_name: string; risk_index: number };
  if (row.risk_index < 30) return null;
  return `${row.entity_name} con riesgo reputacional ${row.risk_index}/100`;
}

/**
 * Avg response_ms: p50 agregado de últimos 30 días.
 */
async function buildAvgResponseMs(): Promise<number | null> {
  const { data, error } = await (supabase.from as unknown as (t: string) => ReturnType<typeof supabase.from>)("v_avg_response_ms_daily")
    .select("p50_response_ms, total_signals");
  if (error || !data) return null;
  const rows = data as unknown as Array<{ p50_response_ms: number; total_signals: number }>;
  if (rows.length === 0) return null;
  const totalSignals = rows.reduce((s, r) => s + (r.total_signals || 0), 0);
  if (totalSignals === 0) return null;
  // Promedio ponderado por volumen
  const weightedSum = rows.reduce((s, r) => s + (r.p50_response_ms || 0) * (r.total_signals || 0), 0);
  return Math.round(weightedSum / totalSignals);
}

/**
 * Topic persistence: top topic estructural si existe, fallback a sostenido o flash.
 */
async function buildTopicPersistenceTop(): Promise<string | null> {
  const { data, error } = await (supabase.from as unknown as (t: string) => ReturnType<typeof supabase.from>)("v_topic_persistence")
    .select("topic_title, persistence_label, days_hot, avg_heat")
    .neq("persistence_label", "sin_calor")
    .order("days_hot", { ascending: false })
    .limit(1)
    .single();
  if (error || !data) return null;
  const row = data as unknown as { topic_title: string | null; persistence_label: string; days_hot: number; avg_heat: number };
  if (!row.topic_title) return null;
  const labelES: Record<string, string> = {
    estructural: "Estructural",
    sostenido: "Sostenido",
    flash: "Flash",
  };
  return `"${row.topic_title}" — ${labelES[row.persistence_label] || row.persistence_label} (${row.days_hot}d calientes)`;
}

/**
 * Cross-module volatility: top entidad con régimen desigual entre Versus y Depth.
 */
async function buildCrossModuleVolatility(): Promise<string | null> {
  const { data, error } = await (supabase.from as unknown as (t: string) => ReturnType<typeof supabase.from>)("v_entity_volatility_cross_modules")
    .select("entity_name, regime_label, cross_module_ratio")
    .neq("regime_label", "volatilidad_pareja")
    .order("cross_module_ratio", { ascending: false, nullsFirst: false })
    .limit(1)
    .single();
  if (error || !data) return null;
  const row = data as unknown as { entity_name: string; regime_label: string; cross_module_ratio: number | null };
  const labelES: Record<string, string> = {
    inestable_en_versus: "inestable en Versus pero sólida en Depth",
    inestable_en_depth: "inestable en Depth pero sólida en Versus",
  };
  return `${row.entity_name}: ${labelES[row.regime_label] || row.regime_label}`;
}

/**
 * Trust vs Choice gap: top entidad con gap > 15.
 */
async function buildTrustVsChoiceGap(): Promise<string | null> {
  const { data, error } = await (supabase.from as unknown as (t: string) => ReturnType<typeof supabase.from>)("v_trust_vs_choice_gap")
    .select("entity_name, gap_label, gap_signed")
    .neq("gap_label", "alineada")
    .order("gap_abs", { ascending: false, nullsFirst: false })
    .limit(1)
    .single();
  if (error || !data) return null;
  const row = data as unknown as { entity_name: string; gap_label: string; gap_signed: number };
  const labelES: Record<string, string> = {
    lovemark_subexpuesta: `Lovemark subexpuesta (más recomendada que elegida, gap +${Math.round(row.gap_signed)})`,
    elegida_por_inercia: `Elegida por inercia (más elegida que recomendada, gap ${Math.round(row.gap_signed)})`,
  };
  return `${row.entity_name}: ${labelES[row.gap_label] || row.gap_label}`;
}

/**
 * Adapter: Backend Core Availability -> Frontend B2C UI Availability
 */
function mapAvailability(coreState: CoreAvailabilityState): MetricAvailabilityState {
  switch (coreState) {
    case "live": return "success";
    case "degraded": return "degraded";
    case "stale": return "degraded"; // Considered degraded if stale
    case "insufficient_sample": return "insufficient_data";
    case "pending_instrumentation": return "pending";
    case "disabled": return "disabled";
    default: return "error";
  }
}

/**
 * Deriva de una lista de métricas el estado combinado (el más crítico define el estado del bloque).
 */
function aggregateAvailability(states: CoreAvailabilityState[]): MetricAvailabilityState {
  if (states.includes("disabled")) return "disabled";
  if (states.includes("pending_instrumentation")) return "pending";
  if (states.includes("insufficient_sample")) return "insufficient_data";
  if (states.includes("stale") || states.includes("degraded")) return "degraded";
  return "success";
}

/**
 * Read Model B2C Principal.
 * Conectado a la vista canónica de configuración y publicación editorial.
 */
export async function getResultsCommunityReadModel(query: ResultsCommunityQuery): Promise<ResultsCommunitySnapshot> {
  // 1. Obtener la última configuración de publicación
  const { data, error } = await supabase
    .from('results_publication_state')
    .select('*')
    .order('published_at', { ascending: false })
    .order('publication_seq', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Error fetching results_publication_state:", error);
  }

  const pubState = data;
  const mode = (pubState?.mode as PublicationMode) || "curated";
  
  const heroData = pubState?.hero_payload as Record<string, string> | null;
  const blocksData = pubState?.blocks_visibility_payload as Record<string, boolean> | null;
  const highlightsData = pubState?.highlights_payload as ResultsEditorialHighlight[] | null;

  // 2. Invocar Ensambladores de Motor para todos los bloques
  const ctx: ResolutionContext = {
     timeWindowDays: query.period === "30D" ? 30 : 7,
     segmentType: query.generation !== "ALL" ? "generation" : undefined,
     segmentValue: query.generation !== "ALL" ? query.generation : undefined,
  };

  // Traer los diccionarios por bloque
  const heroMetrics = await assembleSurfaceMetrics("results_hero", ctx);
  const pulseMetrics = await assembleSurfaceMetrics("results_pulse", ctx);
  const versusMetrics = await assembleSurfaceMetrics("results_versus", ctx);
  const tournamentMetrics = await assembleSurfaceMetrics("results_tournament", ctx);
  const depthMetrics = await assembleSurfaceMetrics("results_depth", ctx);
  const newsMetrics = await assembleSurfaceMetrics("results_news", ctx);
  const footerMetrics = await assembleSurfaceMetrics("results_footer", ctx);

  // Funciones de conveniencia
  const getNum = (dict: Record<string, import("../analytics/metricAvailability").MetricAvailabilityResult>, key: string) => dict[key]?.resolvedValue?.valueNumeric ?? null;
  const getStr = (dict: Record<string, import("../analytics/metricAvailability").MetricAvailabilityResult>, key: string) => dict[key]?.resolvedValue?.valueString ?? null;
  const getState = (dict: Record<string, import("../analytics/metricAvailability").MetricAvailabilityResult>, key: string) => dict[key]?.state || "pending_instrumentation";

  // 3. Tendencias de pulso vivo (sparklines de fastest riser/faller)
  let pulseTrendDetails: Awaited<ReturnType<typeof buildPulseTrendDetails>> = {
    riserDelta: null,
    fallerDelta: null,
    riserSpark: null,
    fallerSpark: null,
  };
  try {
    pulseTrendDetails = await buildPulseTrendDetails();
  } catch (err) {
    console.warn("[resultsCommunityReadModel] No se pudieron construir sparklines de pulso:", err);
  }

  // 4. Película temporal del líder (B2C "Tu Tendencia")
  let temporalTrend: ResultsCommunitySnapshot["temporalTrend"] = {
    movie: null,
    sampleQuality: { nEff: null, freshnessHours: null, qualityLabel: null },
    availability: "pending",
  };
  try {
    const { data: leaderRow } = await supabase
      .from("v_comparative_preference_summary")
      .select("entity_id, entity_name, total_comparisons")
      .order("win_rate", { ascending: false })
      .limit(1)
      .single();

    if (leaderRow?.entity_id && leaderRow?.entity_name) {
      const { movie, nEff, freshnessHours } = await buildLeaderTemporalMovie(
        leaderRow.entity_id,
        leaderRow.entity_name,
        14
      );
      const totalCmp = leaderRow.total_comparisons ?? 0;
      const qualityLabel = totalCmp >= 100
        ? "Robusto"
        : totalCmp >= 30
          ? "Suficiente"
          : "Aún preliminar";
      temporalTrend = {
        movie,
        sampleQuality: {
          nEff: nEff ?? totalCmp,
          freshnessHours,
          qualityLabel,
        },
        availability: movie ? "success" : "insufficient_data",
      };
    }
  } catch (err) {
    console.warn("[resultsCommunityReadModel] No se pudo construir película temporal del líder:", err);
    temporalTrend = {
      movie: null,
      sampleQuality: { nEff: null, freshnessHours: null, qualityLabel: null },
      availability: "error",
    };
  }

  // 5. Capa universal de calidad (integrity_score + mass_to_revert) — derivados del leader
  // ----------------------------------------------------------------------------------------
  // integrity_score (0-100): proxy combinado entre frescura, n_eff y consistencia temporal.
  //   • freshnessHours <= 24h y nEff >= 100 → 95
  //   • freshnessHours <= 72h y nEff >= 30  → 75
  //   • cualquier otro caso medible          → 55
  //   • sin nEff/freshness                    → null
  // mass_to_revert: cuántos duelos efectivos tendrían que voltearse para revertir el liderazgo.
  //   Aproximado por: ceil(margin_pct * nEff / 100)
  let integrityScore: number | null = null;
  let integrityLabel: string | null = null;
  let massToRevert: number | null = null;
  let massToRevertLabel: string | null = null;

  const universalNEff = temporalTrend.sampleQuality.nEff;
  const universalFresh = temporalTrend.sampleQuality.freshnessHours;
  if (universalNEff != null && universalFresh != null) {
    if (universalFresh <= 24 && universalNEff >= 100) {
      integrityScore = 95;
      integrityLabel = "Alta integridad";
    } else if (universalFresh <= 72 && universalNEff >= 30) {
      integrityScore = 75;
      integrityLabel = "Integridad media";
    } else if (universalNEff > 0) {
      integrityScore = 55;
      integrityLabel = "Aún preliminar";
    }
  }

  const leaderMarginRaw = getStr(versusMetrics, "leader_margin_vs_second");
  const leaderMarginPct = leaderMarginRaw ? parseFloat(leaderMarginRaw) : null;
  if (leaderMarginPct != null && universalNEff != null && universalNEff > 0) {
    massToRevert = Math.max(1, Math.ceil((Math.abs(leaderMarginPct) / 100) * universalNEff));
    if (massToRevert <= 10) {
      massToRevertLabel = `Liderazgo blando (~${massToRevert} duelos)`;
    } else if (massToRevert <= 50) {
      massToRevertLabel = `~${massToRevert} duelos para revertir`;
    } else {
      massToRevertLabel = `Liderazgo robusto (~${massToRevert} duelos)`;
    }
  }

  // F9-F13 — Capas extendidas. Si alguna falla, dejamos el bloque en pending sin romper la página.
  let predictive: ResultsCommunitySnapshot["predictive"] = {
    forecastedLeaderShare7d: null, tippingPointDays: null, volatilityRegimeChangeLabel: null, availability: "pending",
  };
  try {
    const r = await buildPredictiveLayer();
    predictive = { ...r, availability: r.forecastedLeaderShare7d != null ? "success" : "insufficient_data" };
  } catch (err) { console.warn("[predictive]", err); predictive.availability = "error"; }

  let explanatory: ResultsCommunitySnapshot["explanatory"] = {
    newsImpactLagHours: null, cohortDefectionSignal: null, topicCorrelationTop3: null, topicPersistenceTopLabel: null, availability: "pending",
  };
  try {
    const [lag, def, cor, persist] = await Promise.all([
      buildNewsImpactLag(), buildCohortDefection(), buildTopicCorrelation(), buildTopicPersistenceTop(),
    ]);
    explanatory = {
      newsImpactLagHours: lag,
      cohortDefectionSignal: def,
      topicCorrelationTop3: cor,
      topicPersistenceTopLabel: persist,
      availability: lag != null || def != null || cor != null || persist != null ? "success" : "insufficient_data",
    };
  } catch (err) { console.warn("[explanatory]", err); explanatory.availability = "error"; }

  let productHealth: ResultsCommunitySnapshot["productHealth"] = {
    moduleDiscoveryRate: null, moduleFrictionScore: null, cohortHalfLifeDays: null, userReputationP50: null, avgResponseMsP50: null, availability: "pending",
  };
  try {
    const [base, avgMs] = await Promise.all([buildProductHealth(), buildAvgResponseMs()]);
    productHealth = {
      ...base,
      avgResponseMsP50: avgMs,
      availability: base.moduleDiscoveryRate != null || base.userReputationP50 != null || avgMs != null ? "success" : "insufficient_data",
    };
  } catch (err) { console.warn("[productHealth]", err); productHealth.availability = "error"; }

  let integrity: ResultsCommunitySnapshot["integrity"] = {
    suspiciousClusterIndex: null, botSuspicionScore: null, brigadingAlertLabel: null, reputationRiskTopEntity: null, crossModuleVolatilityLabel: null, availability: "pending",
  };
  try {
    const [base, repRisk, crossVol] = await Promise.all([
      buildIntegrityLayer(), buildReputationRiskTop(), buildCrossModuleVolatility(),
    ]);
    integrity = {
      ...base,
      reputationRiskTopEntity: repRisk,
      crossModuleVolatilityLabel: crossVol,
      availability: base.suspiciousClusterIndex != null || base.botSuspicionScore != null || repRisk != null || crossVol != null ? "success" : "insufficient_data",
    };
  } catch (err) { console.warn("[integrity]", err); integrity.availability = "error"; }

  let commercial: ResultsCommunitySnapshot["commercial"] = {
    conversionImpactEstimatorLabel: null, competitiveVulnerabilityWindowLabel: null, whiteSpaceCategoryLabel: null, trustVsChoiceTopGapLabel: null, availability: "pending",
  };
  try {
    const [base, trustGap] = await Promise.all([buildCommercialLayer(), buildTrustVsChoiceGap()]);
    commercial = {
      ...base,
      trustVsChoiceTopGapLabel: trustGap,
      availability: base.conversionImpactEstimatorLabel != null || base.whiteSpaceCategoryLabel != null || trustGap != null ? "success" : "insufficient_data",
    };
  } catch (err) { console.warn("[commercial]", err); commercial.availability = "error"; }

  return {
    calculatedAt: new Date().toISOString(),
    mode: mode,
    query: {
      period: query.period || "30D",
      module: query.module || "ALL",
      generation: query.generation || "ALL",
      categorySlug: query.categorySlug
    },
    guardrails: {
      minimumCohortSize: ANALYTICS_MINIMUM_COHORT,
      microdetailLocked: RESULTS_MICRODETAIL_LOCKED
    },
    technicalMeta: {
      coreEvaluationSuccess: true
    },
    hero: {
      title: heroData?.title || "Radiografía de la Opinión",
      subtitle: heroData?.subtitle || "Lo que la comunidad está decidiendo esta semana",
      description: heroData?.description || "Los resultados listados dependen exclusivamente de la participación de usuarios reales.",
      metrics: {
         activeSignals: getNum(heroMetrics, "active_signals_24h"),
         freshnessHours: getNum(heroMetrics, "freshness_hours"),
         mainInsightHeadline: getStr(heroMetrics, "community_activity_label"), // Fallback if no specific insight
         sampleQualityLabel: getStr(heroMetrics, "quality_perception_label"),
         integrityScore,
         integrityLabel,
         massToRevert,
         massToRevertLabel,
      },
      availability: mapAvailability(getState(heroMetrics, "active_signals_24h"))
    },
    pulse: {
      metrics: {
        fastestRiserEntity: getStr(pulseMetrics, "fastest_riser_entity"),
        fastestFallerEntity: getStr(pulseMetrics, "fastest_faller_entity"),
        communityActivityLabel: getStr(pulseMetrics, "community_activity_label"),
        hotTopicTitle: getStr(pulseMetrics, "hot_topic_title"),
        fragmentationLabel: getStr(pulseMetrics, "fragmentation_label"),
        generationGapLabel: getStr(pulseMetrics, "generation_gap_label"),
        fastestRiserDeltaPct: pulseTrendDetails.riserDelta,
        fastestFallerDeltaPct: pulseTrendDetails.fallerDelta,
        fastestRiserSparkline: pulseTrendDetails.riserSpark,
        fastestFallerSparkline: pulseTrendDetails.fallerSpark,
      },
      availability: aggregateAvailability([getState(pulseMetrics, "fastest_riser_entity"), getState(pulseMetrics, "community_activity_label")])
    },
    temporalTrend,
    predictive,
    explanatory,
    productHealth,
    integrity,
    commercial,
    editorialHighlights: highlightsData || [],
    blocks: {
      versus: {
        visible: blocksData?.versus ?? true,
        metrics: {
          leaderEntityName: getStr(versusMetrics, "leader_entity_name"),
          preferenceShareLeader: getStr(versusMetrics, "preference_share_leader") ? `${getStr(versusMetrics, "preference_share_leader")}%` : null,
          leaderMarginVsSecond: getStr(versusMetrics, "leader_margin_vs_second") ? `${getStr(versusMetrics, "leader_margin_vs_second")}%` : null,
          mostContestedCategory: getStr(versusMetrics, "most_contested_category"),
          fragmentationLabel: getStr(versusMetrics, "fragmentation_label"),
          dominantChoiceLabel: getStr(versusMetrics, "dominant_choice_label"),
          sampleQuality: temporalTrend.sampleQuality,
        },
        availability: mapAvailability(getState(versusMetrics, "leader_entity_name"))
      },
      tournament: { 
        visible: blocksData?.tournament ?? true, 
        metrics: {
          currentChampionEntity: getStr(tournamentMetrics, "current_champion_entity"),
          championStabilityLabel: getStr(tournamentMetrics, "champion_stability_label"),
          upsetRateLabel: getStr(tournamentMetrics, "upset_rate_label"),
          mostDifficultPathEntity: getStr(tournamentMetrics, "most_difficult_path_entity")
        },
        availability: mapAvailability(getState(tournamentMetrics, "current_champion_entity")) 
      },
      depth: { 
        visible: blocksData?.depth ?? true, 
        metrics: {
          topStrengthAttribute: getStr(depthMetrics, "top_strength_attribute"),
          topPainAttribute: getStr(depthMetrics, "top_pain_attribute"),
          npsLeaderEntity: getStr(depthMetrics, "nps_leader_entity"),
          qualityPerceptionLabel: getStr(depthMetrics, "quality_perception_label"),
          bestRatedEntity: getStr(depthMetrics, "best_rated_entity"),
          worstRatedEntity: getStr(depthMetrics, "worst_rated_entity")
        },
        availability: mapAvailability(getState(depthMetrics, "top_strength_attribute")) 
      },
      news: { 
        visible: blocksData?.news ?? true, 
        metrics: {
          hotTopicTitle: getStr(newsMetrics, "hot_topic_title"),
          hotTopicHeatIndex: String(getNum(newsMetrics, "hot_topic_heat_index") || ""),
          hotTopicPolarizationLabel: getStr(newsMetrics, "hot_topic_polarization_label"),
          topicWithMostConsensus: getStr(newsMetrics, "topic_with_most_consensus"),
          topicWithMostDivision: getStr(newsMetrics, "topic_with_most_division"),
          fastestReactionTopic: getStr(newsMetrics, "fastest_reaction_topic")
        },
        availability: mapAvailability(getState(newsMetrics, "hot_topic_title")) 
      },
      places: { visible: blocksData?.places ?? false, availability: "pending" },
      futureModules: { visible: true }
    },
    footerNarrative: {
      title: "La voz de todos cuenta",
      description: "Únete a la conversación aportando tus señales diariamente.",
      metrics: {
        generationGapLabel: getStr(footerMetrics, "generation_gap_label"),
        territoryGapLabel: getStr(footerMetrics, "territory_gap_label"),
        communityActivityLabel: getStr(footerMetrics, "community_activity_label"),
        sampleQualityLabel: getStr(footerMetrics, "quality_perception_label"),
        crossModuleCoherenceLabel: (() => {
          const versusLeader = getStr(versusMetrics, "leader_entity_name");
          const tournamentChampion = getStr(tournamentMetrics, "current_champion_entity");
          if (!versusLeader || !tournamentChampion) return null;
          const same = versusLeader.trim().toLowerCase() === tournamentChampion.trim().toLowerCase();
          return same
            ? `Coherencia alta: ${versusLeader} lidera en ambos módulos`
            : `Discrepancia: torneo eligió ${tournamentChampion}, versus prefiere ${versusLeader}`;
        })(),
      }
    }
  };
}
