import { ResultsCommunityQuery, ResultsCommunitySnapshot } from "../../read-models/b2c/resultsCommunityTypes";
import { GranularAnalyticsQuery, MetricOverride, SurfaceMetricConfig, SurfacePreset } from "../../read-models/analytics/analyticsTypes";
import { IntelligenceAnalyticsSnapshot } from "../../read-models/b2b/intelligenceAnalyticsTypes";
import { resultsCommunityService } from "../../features/results/services/resultsCommunityService";
import { intelligenceAnalyticsService } from "../../features/b2b/services/intelligenceAnalyticsService";
import { supabase } from "../../supabase/client";

export interface AdminAnalyticsSnapshot {
  lastRollupDate: string;
  freshnessStatus: "ok" | "stale" | "error";
  totalSignalsProcessed: number;
  activeEntities: number;
  activeSegments: number;
  currentMode: "synthetic" | "real" | "hybrid";
  activeMetrics: string[];
  recentErrors: string[];
}

export interface AdminResultsConfiguration {
  heroTitle: string;
  blocksVisibility: Record<string, boolean>;
  mode: "synthetic" | "real" | "hybrid";
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
    // Mock de stats generales (el core del cálculo no entra en el scope de este bloque)
    return {
      lastRollupDate: new Date().toISOString(),
      freshnessStatus: "ok",
      totalSignalsProcessed: 145020,
      activeEntities: 340,
      activeSegments: 15,
      currentMode: "hybrid",
      activeMetrics: ["preference_share"],
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
    // Carga la configuración editorial y de base de datos
    const [configsRes, presetsRes] = await Promise.all([
      supabase.from('analytics_surface_metric_config').select('*').in('surface_id', ['results_hero', 'results_news', 'results_pulse', 'results_depth', 'results_tournament', 'results_versus']),
      supabase.from('analytics_surface_presets').select('*').in('surface_id', ['results_hero', 'results_news', 'results_pulse', 'results_depth', 'results_tournament', 'results_versus'])
    ]);

    return {
      heroTitle: "Radiografía de la Opinión", // Se conectará a app_config a futuro si es necesario
      blocksVisibility: { versus: true, tournament: true, depth: true, news: true, places: true },
      mode: "hybrid",
      surfaceConfigs: (configsRes.data as SurfaceMetricConfig[]) || [],
      presets: (presetsRes.data as SurfacePreset[]) || []
    };
  },

  publishResultsConfiguration: async (payload: Partial<AdminResultsConfiguration>): Promise<boolean> => {
    console.log("Published config payload", payload);
    
    // Si se enviaron surface configs nuevos/actualizados (visibilidad activada o desactivada por slot)
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
    console.log("Analytics Rollup refreshed.");
    return true; // Mock refesh
  }
};
