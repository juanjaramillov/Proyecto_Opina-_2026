import { ResultsCommunityQuery, ResultsCommunitySnapshot } from "../../read-models/b2c/resultsCommunityTypes";
import { GranularAnalyticsQuery } from "../../read-models/analytics/analyticsTypes";
import { IntelligenceAnalyticsSnapshot } from "../../read-models/b2b/intelligenceAnalyticsTypes";
import { resultsCommunityService } from "../../features/results/services/resultsCommunityService";
import { intelligenceAnalyticsService } from "../../features/b2b/services/intelligenceAnalyticsService";

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
    // Mock de Admin Analytics
    return {
      lastRollupDate: new Date().toISOString(),
      freshnessStatus: "ok",
      totalSignalsProcessed: 145020,
      activeEntities: 340,
      activeSegments: 15,
      currentMode: "synthetic",
      activeMetrics: ["preference_share", "momentum", "volatility"],
      recentErrors: []
    };
  },

  getAdminResultsPublisherSnapshot: async (): Promise<AdminResultsConfiguration> => {
    // Mock de configuración actual
    return {
      heroTitle: "Radiografía de la Opinión",
      blocksVisibility: { versus: true, tournament: true, depth: true, news: true, places: true },
      mode: "synthetic"
    };
  },

  publishResultsConfiguration: async (payload: Partial<AdminResultsConfiguration>): Promise<boolean> => {
    console.log("Published config payload", payload);
    return true; // Mock persist
  },

  refreshAnalyticsRollups: async (): Promise<boolean> => {
    console.log("Analytics Rollup refreshed.");
    return true; // Mock refesh
  }
};
