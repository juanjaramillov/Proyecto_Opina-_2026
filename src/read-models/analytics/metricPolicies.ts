import { MetricDefinition } from "./metricCatalog";

export const ANALYTICS_MINIMUM_COHORT = 30;
export const RESULTS_MICRODETAIL_LOCKED = true;

export function canViewMetric(audience: "results" | "intelligence" | "admin" | "internal", metric: MetricDefinition): boolean {
  if (audience === "admin" || audience === "internal") return true; 
  return metric.allowedAudience.includes(audience);
}

export function meetsMinimumCohort(n: number): boolean {
  return n >= ANALYTICS_MINIMUM_COHORT;
}
