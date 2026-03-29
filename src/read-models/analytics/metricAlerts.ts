import { ResolvedMetricValue } from "./metricResolvers";

export interface AnalyticAlert {
  id: string;
  type: "volatility" | "risk" | "opportunity" | "systemic";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  triggeredAt: string;
  relatedEntityId?: string;
  relatedTopicId?: string;
}

/**
 * Recibe un snapshot de métricas resueltas y evalúa reglas lógicas
 * para inyectar alertas accionables a B2B (o mailings a futuro).
 */
export function generateAlertsFromMetrics(
    metrics: Record<string, ResolvedMetricValue>
): AnalyticAlert[] {
    const alerts: AnalyticAlert[] = [];
    const now = new Date().toISOString();

    // 1. Integridad de Motor / Caída Transaccional
    if (metrics["freshness_hours"] && metrics["freshness_hours"].valueNumeric > 24) {
        alerts.push({
            id: `sys-freshness-${now}`,
            type: "systemic",
            severity: "critical",
            title: "Retraso en Motor Canónico",
            description: `El último procesamiento completo excedió las 24 horas (Actual: ${metrics["freshness_hours"].valueNumeric}h).`,
            triggeredAt: now
        });
    }

    // 2. Fragmentación y Cambio brusco
    if (metrics["fragmentation_label"] && metrics["fragmentation_label"].valueString === "highly_fragmented") {
         alerts.push({
            id: `mkt-frag-${now}`,
            type: "volatility",
            severity: "medium",
            title: "Alta Volatilidad Entrópica Disparada",
            description: "La distribución de preferencias se ha fragmentado consistentemente, no hay líder claro matemático.",
            triggeredAt: now
        });
    }

    // 3. Hot Topics Reputation Risk
    if (metrics["reputation_risk_index"] && metrics["reputation_risk_index"].valueNumeric > 80) {
          alerts.push({
            id: `risk-rep-${now}`,
            type: "risk",
            severity: "high",
            title: "Elevado Riesgo Reputacional Detectado",
            description: "La combinación de Heat y Polarization en eventos de actualidad sobrepasó el umbral crítico de 80.",
            triggeredAt: now
        });
    }

    // Nota: Esto es funcional transaccional para el front.
    // Un batch job asíncrono en DB calcularía caídas bruscas comparando ventanas de tiempo (e.j preference_share_shift_24h).

    return alerts;
}
