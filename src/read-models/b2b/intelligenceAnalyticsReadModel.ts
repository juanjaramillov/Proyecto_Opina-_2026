import { GranularAnalyticsQuery } from "../analytics/analyticsTypes";
import { IntelligenceAnalyticsSnapshot } from "./intelligenceAnalyticsTypes";
import { generateAnalyticGuardrails } from "../analytics/analyticsGuardrails";

export async function getIntelligenceAnalyticsReadModel(query: GranularAnalyticsQuery): Promise<IntelligenceAnalyticsSnapshot> {
  const guardrails = generateAnalyticGuardrails(150, new Date(), true); // Mock synthetic
  
  return Promise.resolve({
    generatedAt: new Date().toISOString(),
    query,
    overview: {
      primaryMetricValue: 85.4,
      primaryMetricLabel: "Share de Preferencia",
      secondaryMetrics: {
        momentum: 12.5,
        volatility: 3.2
      }
    },
    timeSeries: [
      { date: "2026-03-20", value: 80 },
      { date: "2026-03-21", value: 82 },
      { date: "2026-03-22", value: 85.4 }
    ],
    segmentBreakdown: [
      { segmentName: "Gen Z", metricValue: 88, sampleSize: 50 },
      { segmentName: "Millennials", metricValue: 84, sampleSize: 100 }
    ],
    drivers: {
      "Innovación": 90,
      "Confiabilidad": 75
    },
    crossModuleInsights: [
      "Fuerte presencia en torneos recientes.",
      "Caída leve post-noticia negativa."
    ],
    alerts: [
      { id: "a1", severity: "medium", message: "Aumento rápido de volatilidad", metricId: "volatility" }
    ],
    technicalMeta: {
      freshnessDate: new Date().toISOString(),
      minimumCohortApplied: guardrails.isSufficientCohort,
      sourceMode: guardrails.mode
    }
  });
}
