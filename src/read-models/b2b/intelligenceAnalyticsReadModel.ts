import { GranularAnalyticsQuery } from "../analytics/analyticsTypes";
import { 
  IntelligenceAnalyticsSnapshot, 
  IntelligenceAlert,
  IntelligenceBenchmarkEntry
} from "./intelligenceAnalyticsTypes";
import { resolveMetric, ResolutionContext } from "../analytics/metricResolvers";
import { supabase } from "../../supabase/client";
import { metricsService } from "../../features/metrics/services/metricsService";
import { logger } from "../../lib/logger";

export async function getIntelligenceAnalyticsReadModel(
  query: GranularAnalyticsQuery
): Promise<IntelligenceAnalyticsSnapshot> {
  // Configuración de resolución de contexto inicial
  const ctx: ResolutionContext = {
     entityId: query.entityIds?.[0], 
     timeWindowDays: query.period === "30D" ? 30 : query.period === "7D" ? 7 : 90
  };

  // 1. Extraer Benchmark Canónico desde el Motor de Reportes (executive_reports)
  const { data: reportData, error: reportErr } = await supabase
    .from("executive_reports")
    .select("report_data")
    .eq("report_type", "benchmark")
    .order("generated_at", { ascending: false })
    .limit(1)
    .single();

  if (reportErr && reportErr.code !== 'PGRST116') {
    logger.error("[B2B Engine] Error resolving canonical benchmark snapshot", reportErr);
  }

  let benchmarkEntries: IntelligenceBenchmarkEntry[] = [];
  let totalMarketBattles = 0;
  let intelligenceAlerts: IntelligenceAlert[] = [];

  if (reportData?.report_data) {
     const snap = reportData.report_data as Record<string, unknown>;
     benchmarkEntries = (snap.entries as IntelligenceBenchmarkEntry[]) || [];
     totalMarketBattles = (snap.totalBattles as number) || benchmarkEntries.reduce((acc, curr) => acc + (curr.nEff || 0), 0);
     intelligenceAlerts = (snap.alerts as IntelligenceAlert[]) || [];
  } else {
     // FALLBACK DELEGADO: Si no hay snapshot canónico SQL en executive_reports, 
     // mantenemos el cálculo en base al servicio temporal (vista v_comparative_preference_summary)
     logger.warn("[B2B Engine] No canonical snapshot found. Falling back to real-time aggregations.");
     const board = await metricsService.getGlobalLeaderboard(50);
     benchmarkEntries = board.map((row, index) => ({
       entityId: row.entity_id,
       entityName: row.entity_name,
       leaderRank: index + 1,
       weightedPreferenceShare: row.preference_share,
       weightedWinRate: row.win_rate,
       marginVsSecond: index === 0 && board.length > 1 ? (row.win_rate - board[1].win_rate) : 0,
       nEff: row.total_comparisons,
       wilsonLowerBound: Math.max(0, row.win_rate - 0.05), // aproxima simple 
       wilsonUpperBound: Math.min(1, row.win_rate + 0.05),
       entropyNormalized: 0.5,
       stabilityLabel: "estable",
       commercialEligibilityLabel: row.total_comparisons > 30 ? "standard_ready" : "insufficient_data"
     }));
     totalMarketBattles = board.reduce((acc, curr) => acc + curr.total_comparisons, 0);
  }

  // Identificar líderes y movimientos
  const leader = benchmarkEntries.length > 0 ? benchmarkEntries[0] : null;
  const rising = [...benchmarkEntries].filter(e => e.stabilityLabel === "en_aceleración").sort((a,b) => b.nEff - a.nEff)[0];
  const falling = [...benchmarkEntries].filter(e => e.stabilityLabel === "en_caída").sort((a,b) => b.nEff - a.nEff)[0];

  // Generar alertas basales si el motor canónico aún no las provee directamente
  if (intelligenceAlerts.length === 0) {
    if (falling && falling.commercialEligibilityLabel !== "insufficient_data") {
      intelligenceAlerts.push({
        id: `fall-${falling.entityId}`,
        severity: "high",
        category: "Pérdida de Momentum",
        headline: "Desaceleración Crítica",
        message: `${falling.entityName} muestra caída continua en Win Rate competitivo.`,
        entityId: falling.entityId,
        entityName: falling.entityName,
        metricId: "momentum",
        timestamp: new Date().toISOString()
      });
    }
    if (rising) {
      intelligenceAlerts.push({
        id: `rise-${rising.entityId}`,
        severity: "medium",
        category: "Aceleración Positiva",
        headline: "Tracción Acelerada",
        message: `${rising.entityName} experimenta alta atracción volumétrica en el segmento B2C.`,
        entityId: rising.entityId,
        entityName: rising.entityName,
        metricId: "momentum",
        timestamp: new Date().toISOString()
      });
    }
  }

  // 3. Resolvemos métricas principales (como Active signals para UI global)
  await resolveMetric("active_signals_24h", ctx);

  // 5. Estado de Disponibilidad y Degradación Elegante
  const isMarketInsufficient = totalMarketBattles < 30; // Minimo global para habilitar B2B robusto
  const availabilityState: "healthy" | "degraded_sample" | "insufficient_data" = isMarketInsufficient ? "insufficient_data" : "healthy";

  return {
    generatedAt: new Date().toISOString(),
    query,
    availability: availabilityState,
    overview: {
      primaryMetricValue: leader ? leader.wilsonLowerBound : 0,
      primaryMetricLabel: "Wilson Score (Líder)",
      secondaryMetrics: {
        "Total Señales Evaluadas": totalMarketBattles,
        "Participantes del Mercado": benchmarkEntries.length
      },
      leaderEntityId: leader?.entityId,
      leaderEntityName: leader?.entityName,
      topRisingEntityId: rising?.entityId,
      topRisingEntityName: rising?.entityName,
      topFallingEntityId: falling?.entityId,
      topFallingEntityName: falling?.entityName,
      activeRiskAreas: intelligenceAlerts.filter(a => a.severity === "high").length,
    },
    benchmark: {
      entries: benchmarkEntries
    },
    alerts: intelligenceAlerts,
    timeSeries: [],
    segmentBreakdown: [],
    drivers: {},
    deepDive: {}, // Se expande post click
    reports: {
      exportStatus: isMarketInsufficient ? "blocked" : "ready",
      eligibleMetrics: ["weightedWinRate", "nEff", "leaderRank"]
    },
    crossModuleInsights: [
      isMarketInsufficient ? "Se requiere mayor flujo de batallas para abrir insights sectoriales." : "El mercado muestra consistencia competitiva."
    ],
    technicalMeta: {
      freshnessDate: new Date().toISOString(),
      minimumCohortApplied: !isMarketInsufficient,
      sourceMode: "real"
    }
  };
}
