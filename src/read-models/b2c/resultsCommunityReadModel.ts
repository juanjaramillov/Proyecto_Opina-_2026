import { ResultsCommunityQuery, ResultsCommunitySnapshot, ResultsEditorialHighlight, MetricAvailabilityState } from "./resultsCommunityTypes";
import { ANALYTICS_MINIMUM_COHORT, RESULTS_MICRODETAIL_LOCKED } from "../analytics/metricPolicies";
import { supabase } from "../../supabase/client";
import { assembleSurfaceMetrics } from "../analytics/surfaceAssemblers";
import { ResolutionContext } from "../analytics/metricResolvers";
import { MetricAvailabilityState as CoreAvailabilityState } from "../analytics/metricAvailability";

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
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Error fetching results_publication_state:", error);
  }

  const pubState = data;
  const mode = pubState?.mode || "real";
  
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
  // Esto asume que METRIC_CATALOG en un futuro asigne bien las `surfaces`. 
  // Por ahora "results_hero" contiene la mayoría en `metricCatalog.ts`.
  const heroMetrics = await assembleSurfaceMetrics("results_hero", ctx);
  const pulseMetrics = await assembleSurfaceMetrics("results_pulse", ctx);
  // (Si en un futuro segmentas las métricas de Versus, Depth, etc en "results_versus", lo cambiarías.)
  const versusMetrics = await assembleSurfaceMetrics("results_hero", ctx); // Using hero as unified for now as base metrics are mapped to hero
  const tournamentMetrics = await assembleSurfaceMetrics("results_hero", ctx);
  const depthMetrics = await assembleSurfaceMetrics("results_hero", ctx);
  const newsMetrics = await assembleSurfaceMetrics("results_hero", ctx);

  // Funciones de conveniencia
  const getNum = (dict: Record<string, import("../analytics/metricAvailability").MetricAvailabilityResult>, key: string) => dict[key]?.resolvedValue?.valueNumeric ?? null;
  const getStr = (dict: Record<string, import("../analytics/metricAvailability").MetricAvailabilityResult>, key: string) => dict[key]?.resolvedValue?.valueString ?? null;
  const getState = (dict: Record<string, import("../analytics/metricAvailability").MetricAvailabilityResult>, key: string) => dict[key]?.state || "pending_instrumentation";

  return {
    calculatedAt: new Date().toISOString(),
    mode: mode as "synthetic" | "real" | "hybrid",
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
         sampleQualityLabel: getStr(heroMetrics, "quality_perception_label")
      },
      availability: mapAvailability(getState(heroMetrics, "active_signals_24h"))
    },
    pulse: {
      metrics: {
        fastestRiserEntity: getStr(heroMetrics, "fastest_riser_entity") || getStr(pulseMetrics, "fastest_riser_entity"),
        fastestFallerEntity: getStr(heroMetrics, "fastest_faller_entity") || getStr(pulseMetrics, "fastest_faller_entity"),
        communityActivityLabel: getStr(heroMetrics, "community_activity_label") || getStr(pulseMetrics, "community_activity_label"),
        hotTopicTitle: getStr(heroMetrics, "hot_topic_title") || getStr(pulseMetrics, "hot_topic_title"),
        fragmentationLabel: getStr(heroMetrics, "fragmentation_label") || getStr(pulseMetrics, "fragmentation_label"),
        generationGapLabel: getStr(heroMetrics, "generation_gap_label") || getStr(pulseMetrics, "generation_gap_label"),
      },
      availability: aggregateAvailability([getState(heroMetrics, "fastest_riser_entity"), getState(heroMetrics, "community_activity_label")])
    },
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
          dominantChoiceLabel: getStr(versusMetrics, "dominant_choice_label")
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
        generationGapLabel: getStr(heroMetrics, "generation_gap_label"),
        territoryGapLabel: getStr(heroMetrics, "territory_gap_label"),
        communityActivityLabel: getStr(heroMetrics, "community_activity_label"),
        sampleQualityLabel: getStr(heroMetrics, "quality_perception_label")
      }
    }
  };
}
