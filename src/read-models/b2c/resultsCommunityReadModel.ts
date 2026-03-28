import { ResultsCommunityQuery, ResultsCommunitySnapshot, ResultsEditorialHighlight } from "./resultsCommunityTypes";
import { ANALYTICS_MINIMUM_COHORT, RESULTS_MICRODETAIL_LOCKED } from "../analytics/metricPolicies";
import { supabase } from "../../supabase/client";

/**
 * Read Model B2C Principal.
 * Conectado a la vista canónica de configuración y publicación editorial.
 */
export async function getResultsCommunityReadModel(query: ResultsCommunityQuery): Promise<ResultsCommunitySnapshot> {
  // 1. Obtener la última configuración de publicación
  const { data, error } = await supabase
    .from('results_publication_state' as never)
    .select('*')
    .order('published_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Error fetching results_publication_state:", error);
  }

  type PublicationData = {
    mode?: "synthetic" | "real" | "hybrid";
    hero_payload?: Record<string, string>;
    blocks_visibility_payload?: Record<string, boolean>;
    highlights_payload?: ResultsEditorialHighlight[];
  };

  const pubState = data as PublicationData | null;

  // 2. Extracción segura de Payloads con tipado dinámico JSONB a interfaces
  const mode = pubState?.mode;
  
  const heroData = pubState?.hero_payload as Record<string, string> | null;
  const blocksData = pubState?.blocks_visibility_payload as Record<string, boolean> | null;
  const highlightsData = pubState?.highlights_payload as ResultsEditorialHighlight[] | null;

  return {
    calculatedAt: new Date().toISOString(),
    mode: mode || "real",
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
    hero: {
      title: heroData?.title || "Radiografía de la Opinión",
      subtitle: heroData?.subtitle || "Lo que la comunidad está decidiendo esta semana",
      description: heroData?.description || "Cargando volumen interactivo..."
    },
    pulse: {
      // TODO: Conectar contadores de "analytics_daily_entity_rollup" en futura iteración
      activeSignals: 0,
      trendingTopics: []
    },
    editorialHighlights: highlightsData || [],
    blocks: {
      versus: { visible: blocksData?.versus ?? true, totalBattles: 0 },
      tournament: { visible: blocksData?.tournament ?? true, activeCategories: 0 },
      depth: { visible: blocksData?.depth ?? true, topInsights: 0 },
      news: { visible: blocksData?.news ?? true, activeNews: 0 },
      places: { visible: blocksData?.places ?? false, activePlaces: 0 },
      futureModules: { visible: true }
    },
    footerNarrative: {
      title: "La voz de todos cuenta",
      description: "Únete a la conversación aportando tus señales diariamente."
    }
  };
}
