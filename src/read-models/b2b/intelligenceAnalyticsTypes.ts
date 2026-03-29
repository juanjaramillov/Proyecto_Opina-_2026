import { GranularAnalyticsQuery } from "../analytics/analyticsTypes";

export interface IntelligenceTimeSeriesPoint {
  date: string;
  value: number;
}

export interface IntelligenceSegmentBreakdown {
  segmentName: string;
  metricValue: number;
  sampleSize: number;
}

export interface IntelligenceAlert {
  id: string;
  severity: "high" | "medium" | "low";
  category: string;
  headline: string;
  message: string;
  entityId?: string;
  entityName?: string;
  topicId?: string;
  metricId: string;
  timestamp: string;
  backingMetrics?: Record<string, number>;
}

export interface IntelligenceBenchmarkEntry {
  entityId: string;
  leaderRank: number;
  entityName: string;
  weightedPreferenceShare: number;
  weightedWinRate: number;
  marginVsSecond: number;
  nEff: number;
  wilsonLowerBound: number;
  wilsonUpperBound: number;
  entropyNormalized: number;
  stabilityLabel: "estable" | "volátil" | "en_aceleración" | "en_caída" | "insuficiente";
  commercialEligibilityLabel: "premium_export_ready" | "standard_ready" | "internal_only" | "insufficient_data";
}

export interface IntelligenceTechnicalMeta {
  freshnessDate: string;
  confidenceInterval?: [number, number];
  minimumCohortApplied: boolean;
  sourceMode: "real" | "synthetic" | "hybrid";
}

export interface IntelligenceAnalyticsSnapshot {
  generatedAt: string;
  query: GranularAnalyticsQuery;
  availability: "healthy" | "degraded_sample" | "insufficient_data";
  
  overview: {
    primaryMetricValue: number;
    primaryMetricLabel: string;
    secondaryMetrics: Record<string, number>;
    
    leaderEntityId?: string;
    leaderEntityName?: string;
    topRisingEntityId?: string;
    topRisingEntityName?: string;
    topFallingEntityId?: string;
    topFallingEntityName?: string;
    activeRiskAreas: number;
    hottestTopicTitle?: string;
  };
  
  benchmark: {
    entries: IntelligenceBenchmarkEntry[];
  };

  alerts: IntelligenceAlert[];

  deepDive: {
     [entityId: string]: {
        position: number;
        momentum: number;
        stability: string;
        marginVsCompetitors: number;
        drivers: Record<string, number>;
        npsOrMeanScore: number;
        sensitivityToNews: number;
        segmentGaps: Record<string, number>;
        alertsAssociated: string[];
        integrityScore: number;
     }
  };

  reports: {
     exportStatus: "ready" | "partial" | "blocked";
     eligibleMetrics: string[];
  };

  timeSeries: IntelligenceTimeSeriesPoint[];
  segmentBreakdown: IntelligenceSegmentBreakdown[];
  territoryBreakdown?: IntelligenceSegmentBreakdown[];
  drivers: Record<string, number>; 
  crossModuleInsights: string[];
  technicalMeta: IntelligenceTechnicalMeta;
}
