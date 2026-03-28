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
  message: string;
  metricId: string;
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
  overview: {
    primaryMetricValue: number;
    primaryMetricLabel: string;
    secondaryMetrics: Record<string, number>;
  };
  timeSeries: IntelligenceTimeSeriesPoint[];
  segmentBreakdown: IntelligenceSegmentBreakdown[];
  territoryBreakdown?: IntelligenceSegmentBreakdown[];
  drivers: Record<string, number>; // e.g. attributes to scores
  crossModuleInsights: string[];
  alerts: IntelligenceAlert[];
  technicalMeta: IntelligenceTechnicalMeta;
}
