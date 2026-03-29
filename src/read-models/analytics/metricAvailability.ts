import { MetricRegistryEntry } from "./analyticsTypes";
import { ResolvedMetricValue } from "./metricResolvers";

export type MetricAvailabilityState = 
  | "live" 
  | "degraded" 
  | "insufficient_sample" 
  | "stale" 
  | "pending_instrumentation" 
  | "disabled";

export interface MetricAvailabilityResult {
  state: MetricAvailabilityState;
  reason?: string;
  metricDefinition: MetricRegistryEntry;
  resolvedValue: ResolvedMetricValue | null;
}

export function evaluateMetricAvailability(
  catalogEntry: MetricRegistryEntry,
  resolvedData: ResolvedMetricValue | null,
  isAdminForced: boolean = false
): MetricAvailabilityResult {
  
  // 1. Validar Status Canónico
  if (catalogEntry.status === "disabled") {
    return { state: "disabled", reason: "Métrica deshabilitada administrativamente", metricDefinition: catalogEntry, resolvedValue: null };
  }
  
  if (catalogEntry.status === "pending_instrumentation" && !resolvedData) {
    return { state: "pending_instrumentation", reason: "No implementado en resolutores backend", metricDefinition: catalogEntry, resolvedValue: null };
  }

  // Si no hay datos, está desconectada o vacía
  if (!resolvedData) {
    return { 
      state: "pending_instrumentation", 
      reason: "Sin datos recibidos del ledger o RPC",
      metricDefinition: catalogEntry, 
      resolvedValue: null 
    };
  }

  // 2. Evaluaciones de Guardrails
  if (catalogEntry.requiresGuardrail) {
    const minSampleSize = catalogEntry.minSample;
    const maxFreshnessHours = catalogEntry.maxFreshnessHours;

    if (minSampleSize && resolvedData.sampleSize < minSampleSize) {
      if (!isAdminForced) {
        return { 
          state: "insufficient_sample", 
          reason: `Requiere N=${minSampleSize}, actual N=${resolvedData.sampleSize}`,
          metricDefinition: catalogEntry, 
          resolvedValue: resolvedData 
        };
      }
    }

    if (maxFreshnessHours) {
      const dataDate = new Date(resolvedData.dataUpdatedAsOf).getTime();
      const cutoff = Date.now() - (maxFreshnessHours * 3600000);
      if (dataDate < cutoff) {
        if (!isAdminForced) {
           return { 
            state: "stale", 
            reason: `Data expirada. Max ${maxFreshnessHours}h.`,
            metricDefinition: catalogEntry, 
            resolvedValue: resolvedData 
          };
        }
      }
    }
  }

  // 3. Fallbacks
  // Si llegamos aquí, la métrica es segura de mostrar, aunque podría estar en beta "experimental" -> "degraded"
  if (catalogEntry.status === "experimental") {
     return { 
      state: "degraded", 
      reason: "Métrica experimental (Beta).",
      metricDefinition: catalogEntry, 
      resolvedValue: resolvedData 
    };
  }

  return {
    state: "live",
    metricDefinition: catalogEntry,
    resolvedValue: resolvedData
  };
}
