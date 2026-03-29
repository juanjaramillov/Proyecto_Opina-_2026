import { GranularAnalyticsQuery } from "../analytics/analyticsTypes";
import { 
  IntelligenceAnalyticsSnapshot, 
  IntelligenceAlert,
  IntelligenceBenchmarkEntry
} from "./intelligenceAnalyticsTypes";
import { resolveMetric, ResolutionContext } from "../analytics/metricResolvers";
import { supabase } from "../../supabase/client";
import { logger } from "../../lib/logger";

export async function getIntelligenceAnalyticsReadModel(
  query: GranularAnalyticsQuery
): Promise<IntelligenceAnalyticsSnapshot> {
  // Configuración de resolución de contexto inicial
  const ctx: ResolutionContext = {
     entityId: query.entityIds?.[0], 
     timeWindowDays: query.period === "30D" ? 30 : query.period === "7D" ? 7 : 90
  };

  // 1. Extraer Benchmark Crudo desde los rollups uniendo las entidades (join)
  const { data: rollupData, error: rollupErr } = await supabase
    .from("analytics_daily_entity_rollup")
    .select(`
      entity_id,
      preference_share,
      total_battles,
      wins,
      losses,
      momentum,
      entities (
        name
      )
    `)
    .order("preference_share", { ascending: false });

  if (rollupErr) {
    logger.error("[B2B Engine] Error resolving canonical rollups", rollupErr);
  }

  // 2. Procesamos el Benchmark
  // Idealmente, esto debería ser `sum(wins) / sum(total_battles)` por `entity_id` 
  // si el date_range no filtra a nivel base de datos (por simplificación agrupamos en memoria para la Mv1 
  // si hay múltiples rows de distintas fechas, pero como no pasamos date range, confiaremos en los latest rows)
  
  const entityMap = new Map<string, {
    totalWins: number, 
    totalBattles: number, 
    entityName: string, 
    preferenceShare: number,
    momentum: number
  }>();

  // Agrupación transaccional por id (asumimos multiples rows de fechas)
  (rollupData || []).forEach(row => {
    const existing = entityMap.get(row.entity_id) || {
      totalWins: 0, 
      totalBattles: 0, 
      entityName: (row.entities as { name?: string })?.name || "Entidad Desconocida",
      preferenceShare: 0,
      momentum: 0
    };
    existing.totalWins += row.wins || 0;
    existing.totalBattles += row.total_battles || 0;
    // Keep max preference_share for simplicity in fallback
    if ((row.preference_share || 0) > existing.preferenceShare) {
       existing.preferenceShare = row.preference_share || 0;
    }
    existing.momentum += row.momentum || 0;
    entityMap.set(row.entity_id, existing);
  });

  const benchmarkEntries: IntelligenceBenchmarkEntry[] = [];
  let totalMarketBattles = 0;

  for (const [entityId, stats] of entityMap.entries()) {
     totalMarketBattles += stats.totalBattles;
     
     const wr = stats.totalBattles > 0 ? (stats.totalWins / stats.totalBattles) : 0;
     // Hack: calculamos wilson score en JS de manera transaccional o simulada en base al win rate
     // En producción se trae del rpc opina_math_wilson_score si agrupamos directo en base.
     const n = stats.totalBattles;
     const z = 1.96; // 95% confidence
     const phat = wr;
     const wilsonLower = n > 0 ? (phat + z*z/(2*n) - z * Math.sqrt((phat*(1-phat)+z*z/(4*n))/n))/(1+z*z/n) : 0;
     const wilsonUpper = n > 0 ? (phat + z*z/(2*n) + z * Math.sqrt((phat*(1-phat)+z*z/(4*n))/n))/(1+z*z/n) : 0;

     // Guardrails
     const isInsufficient = stats.totalBattles < 10;
     
     benchmarkEntries.push({
        entityId,
        entityName: stats.entityName,
        leaderRank: 0, // Se llenará tras ordenar
        weightedPreferenceShare: stats.preferenceShare,
        weightedWinRate: wr,
        marginVsSecond: 0, // Calculado abajo
        nEff: stats.totalBattles,
        wilsonLowerBound: wilsonLower,
        wilsonUpperBound: wilsonUpper,
        entropyNormalized: 0, 
        stabilityLabel: isInsufficient ? "insuficiente" : (stats.momentum > 0.05 ? "en_aceleración" : (stats.momentum < -0.05 ? "en_caída" : "estable")),
        commercialEligibilityLabel: isInsufficient ? "insufficient_data" : "premium_export_ready"
     });
  }

  // Ordenar por el score estabilizado o preference_share
  benchmarkEntries.sort((a,b) => b.wilsonLowerBound - a.wilsonLowerBound);
  
  // Rellenar leaderRank y marginVsSecond
  benchmarkEntries.forEach((entry, idx) => {
     entry.leaderRank = idx + 1;
     const nextEntry = benchmarkEntries[idx + 1];
     if (nextEntry) {
       entry.marginVsSecond = entry.wilsonLowerBound - nextEntry.wilsonLowerBound;
     }
  });

  // Identificar líderes y movimientos
  const leader = benchmarkEntries.length > 0 ? benchmarkEntries[0] : null;
  const rising = [...benchmarkEntries].filter(e => e.stabilityLabel === "en_aceleración").sort((a,b) => b.nEff - a.nEff)[0];
  const falling = [...benchmarkEntries].filter(e => e.stabilityLabel === "en_caída").sort((a,b) => b.nEff - a.nEff)[0];


  // 3. Resolvemos métricas principales (como Active signals para UI global)
  await resolveMetric("active_signals_24h", ctx);

  // 4. Alert Engine base
  const intelligenceAlerts: IntelligenceAlert[] = [];
  
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
