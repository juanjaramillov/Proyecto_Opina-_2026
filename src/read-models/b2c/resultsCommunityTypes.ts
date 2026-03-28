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

export interface ResultsCommunityGuardrails {
  minimumCohortSize: number;
  microdetailLocked: boolean;
}

export interface ResultsCommunitySnapshot {
  calculatedAt: string; // ISO Date
  mode: "synthetic" | "real" | "hybrid";
  query: ResultsCommunityQuery;
  guardrails: ResultsCommunityGuardrails;
  
  hero: {
    title: string;
    subtitle: string;
    description: string;
  };
  
  pulse: {
    activeSignals: number;
    trendingTopics: string[];
  };

  editorialHighlights: ResultsEditorialHighlight[];

  blocks: {
    versus: { visible: boolean; totalBattles: number };
    tournament: { visible: boolean; activeCategories: number };
    depth: { visible: boolean; topInsights: number };
    news: { visible: boolean; activeNews: number };
    places: { visible: boolean; activePlaces: number };
    futureModules: { visible: boolean };
  };

  footerNarrative: {
    title: string;
    description: string;
  };
}
