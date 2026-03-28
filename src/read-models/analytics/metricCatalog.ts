export interface MetricDefinition {
  id: string;
  name: string;
  shortDescription: string;
  origin: "versus" | "tournament" | "depth" | "news" | "places" | "cross_module";
  allowedAudience: Array<"results" | "intelligence" | "admin" | "internal">;
  level: "base" | "advanced" | "premium";
  outputType: "number" | "interval" | "label" | "score" | "series";
}

export const METRIC_CATALOG: Record<string, MetricDefinition> = {
  preference_share: {
    id: "preference_share",
    name: "Share de Preferencia",
    shortDescription: "Porcentaje de preferencia.",
    origin: "versus",
    allowedAudience: ["results", "intelligence", "admin", "internal"],
    level: "base",
    outputType: "number",
  }
};
