export const METRIC_LABELS_ES: Record<string, string> = {
  preference_share: "Share de Preferencia",
  competitive_margin: "Margen",
  volume: "Muestra"
};

export function getMetricLabel(id: string): string {
  return METRIC_LABELS_ES[id] || id;
}
