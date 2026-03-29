import { BaseAnalyticsQuery } from "../analytics/analyticsTypes";

export interface ResultsCommunityQuery extends BaseAnalyticsQuery {
  generation?: "ALL" | "BOOMERS" | "GEN_X" | "MILLENNIALS" | "GEN_Z";
  categorySlug?: string;
}

export interface ResultsEditorialHighlight {
  id: string;
  type: "versus" | "tournament" | "depth" | "news" | "places";
  title: string;
  description: string;
  featuredImageUrl?: string;
  isFeatured: boolean;
  metricValue?: number | string;
  metricLabel?: string;
}

export type MetricAvailabilityState = "success" | "insufficient_data" | "degraded" | "blocked" | "error" | "disabled" | "pending";

export interface ResultsCommunityGuardrails {
  minimumCohortSize: number;
  microdetailLocked: boolean;
}

export interface ResultsCommunitySnapshot {
  calculatedAt: string; // ISO Date
  mode: "synthetic" | "real" | "hybrid";
  query: ResultsCommunityQuery;
  guardrails: ResultsCommunityGuardrails;
  technicalMeta: Record<string, unknown>;
  
  hero: {
    title: string;
    subtitle: string;
    description: string;
    metrics: {
      activeSignals: number | null;
      freshnessHours: number | null;
      mainInsightHeadline: string | null;
      sampleQualityLabel: string | null;
    };
    availability: MetricAvailabilityState;
  };
  
  pulse: {
    metrics: {
      fastestRiserEntity: string | null;
      fastestFallerEntity: string | null;
      communityActivityLabel: string | null;
      hotTopicTitle: string | null;
      fragmentationLabel: string | null;
      generationGapLabel: string | null;
    };
    availability: MetricAvailabilityState;
  };

  editorialHighlights: ResultsEditorialHighlight[];

  blocks: {
    versus: { 
      visible: boolean; 
      metrics: {
        leaderEntityName: string | null;
        preferenceShareLeader: string | null;
        leaderMarginVsSecond: string | null;
        mostContestedCategory: string | null;
        fragmentationLabel: string | null;
        dominantChoiceLabel: string | null;
      };
      availability: MetricAvailabilityState;
    };
    tournament: { 
      visible: boolean; 
      metrics: {
        currentChampionEntity: string | null;
        championStabilityLabel: string | null;
        upsetRateLabel: string | null;
        mostDifficultPathEntity: string | null;
      };
      availability: MetricAvailabilityState;
    };
    depth: { 
      visible: boolean;
      metrics: {
        topStrengthAttribute: string | null;
        topPainAttribute: string | null;
        npsLeaderEntity: string | null;
        qualityPerceptionLabel: string | null;
        bestRatedEntity: string | null;
        worstRatedEntity: string | null;
      }; 
      availability: MetricAvailabilityState;
    };
    news: { 
      visible: boolean;
      metrics: {
        hotTopicTitle: string | null;
        hotTopicHeatIndex: string | null;
        hotTopicPolarizationLabel: string | null;
        topicWithMostConsensus: string | null;
        topicWithMostDivision: string | null;
        fastestReactionTopic: string | null;
      }; 
      availability: MetricAvailabilityState;
    };
    places: { visible: boolean; availability: MetricAvailabilityState };
    futureModules: { visible: boolean };
  };

  footerNarrative: {
    title: string;
    description: string;
    metrics: {
      generationGapLabel: string | null;
      territoryGapLabel: string | null;
      communityActivityLabel: string | null;
      sampleQualityLabel: string | null;
    };
  };
}
