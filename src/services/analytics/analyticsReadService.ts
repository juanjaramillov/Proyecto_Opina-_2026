import { ResultsCommunityQuery, ResultsCommunitySnapshot } from "../../read-models/b2c/resultsCommunityTypes";
import { GranularAnalyticsQuery, MetricOverride, SurfaceMetricConfig, SurfacePreset } from "../../read-models/analytics/analyticsTypes";
import { IntelligenceAnalyticsSnapshot } from "../../read-models/b2b/intelligenceAnalyticsTypes";
import { resultsCommunityService } from "../../features/results/services/resultsCommunityService";
import { intelligenceAnalyticsService } from "../../features/b2b/services/intelligenceAnalyticsService";
import { supabase } from "../../supabase/client";
import { PublicationMode } from "../../read-models/analytics/analyticsTypes";

export interface AdminAnalyticsSnapshot {
  lastRollupDate: string;
  freshnessStatus: "ok" | "stale" | "error";
  totalSignalsProcessed: number;
  activeEntities: number;
  activeSegments: number;
  currentMode: PublicationMode;
  activeMetrics: string[];
  recentErrors: string[];
}

export interface AdminResultsConfiguration {
  heroTitle: string;
  blocksVisibility: Record<string, boolean>;
  mode: PublicationMode;
  surfaceConfigs: SurfaceMetricConfig[];
  presets: SurfacePreset[];
}

/**
 * Fachada única para todo el sistema de lectura analítica y dashboard state.
 */
export const analyticsReadService = {
  getResultsCommunitySnapshot: (query: ResultsCommunityQuery): Promise<ResultsCommunitySnapshot> => {
    return resultsCommunityService.getResultsCommunitySnapshot(query);
  },
  
  getIntelligenceAnalyticsSnapshot: (query: GranularAnalyticsQuery): Promise<IntelligenceAnalyticsSnapshot> => {
    return intelligenceAnalyticsService.getIntelligenceAnalyticsSnapshot(query);
  },

  getAdminAnalyticsSnapshot: async (): Promise<AdminAnalyticsSnapshot> => {
    // Reemplazo de mocks por consultas reales a la base de datos
    const [signalsCount, entitiesCount, reportsData] = await Promise.all([
      supabase.from('signal_events').select('*', { count: 'estimated', head: true }),
      supabase.from('entities').select('*', { count: 'exact', head: true }),
      supabase.from('executive_reports').select('generated_at').order('generated_at', { ascending: false }).limit(1).maybeSingle()
    ]);

    return {
      lastRollupDate: reportsData.data?.generated_at || new Date().toISOString(),
      freshnessStatus: reportsData.data ? "ok" : "stale",
      totalSignalsProcessed: signalsCount.count || 0,
      activeEntities: entitiesCount.count || 0,
      activeSegments: 0,
      currentMode: "real",
      activeMetrics: ["preference_share", "momentum", "volatility"],
      recentErrors: []
    };
  },

  getAllMetricOverrides: async (): Promise<MetricOverride[]> => {
    const { data } = await supabase.from('analytics_metric_overrides').select('*');
    return (data as MetricOverride[]) || [];
  },

  saveMetricOverride: async (override: MetricOverride): Promise<boolean> => {
    const { error } = await supabase.from('analytics_metric_overrides').upsert(override);
    if (error) console.error("Error saving override:", error);
    return !error;
  },

  getAdminResultsPublisherSnapshot: async (): Promise<AdminResultsConfiguration> => {
    // Carga la configuración de la verdadera fuente de verdad
    const [pubStateRes, configsRes, presetsRes] = await Promise.all([
      supabase.from('results_publication_state').select('*').order('published_at', { ascending: false }).order('publication_seq', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('analytics_surface_metric_config').select('*').in('surface_id', ['results_hero', 'results_news', 'results_pulse', 'results_depth', 'results_tournament', 'results_versus']),
      supabase.from('analytics_surface_presets').select('*').in('surface_id', ['results_hero', 'results_news', 'results_pulse', 'results_depth', 'results_tournament', 'results_versus'])
    ]);

    const pubState = pubStateRes.data;
    const heroPayload = pubState?.hero_payload as Record<string, string> | null;
    const blocksPayload = pubState?.blocks_visibility_payload as Record<string, boolean> | null;

    return {
      heroTitle: heroPayload?.title || "Radiografía de la Opinión", 
      blocksVisibility: blocksPayload || { versus: true, tournament: true, depth: true, news: true, places: true },
      mode: (pubState?.mode as PublicationMode) || "curated",
      surfaceConfigs: (configsRes.data as SurfaceMetricConfig[]) || [],
      presets: (presetsRes.data as SurfacePreset[]) || []
    };
  },

  publishResultsConfiguration: async (payload: Partial<AdminResultsConfiguration>): Promise<boolean> => {
    
    // 1. Guardar la configuración general (Mode y Flags) como una nueva iteración de publicación
    const { mode, heroTitle, blocksVisibility } = payload;
    
    const { error: stateError } = await supabase.from('results_publication_state').insert({
      mode: mode || "curated",
      hero_payload: {
        title: heroTitle || "Radiografía de la Opinión",
        subtitle: "Lo que la comunidad está decidiendo esta semana", // Preservando base
        description: "Los resultados listados dependen exclusivamente de la participación de usuarios reales."
      },
      blocks_visibility_payload: blocksVisibility || { versus: true, tournament: true, depth: true, news: true, places: true },
      published_by: "system_admin"
    });

    if (stateError) {
      console.error("Error publishing results_publication_state:", stateError);
    }

    // 2. Si se enviaron surface configs nuevos/actualizados (visibilidad activada o desactivada por slot)
    if (payload.surfaceConfigs && payload.surfaceConfigs.length > 0) {
      const { error } = await supabase.from('analytics_surface_metric_config').upsert(payload.surfaceConfigs);
      if (error) {
        console.error("Error publishing configs:", error);
        return false;
      }
    }

    return true; 
  },

  refreshAnalyticsRollups: async (): Promise<boolean> => {
    return true; // Mock refresh explícitamente marcado
  }
};
