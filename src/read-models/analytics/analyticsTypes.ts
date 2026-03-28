export interface CanonicalEntity {
  id: string; // Puede ser un entity UUID o slug de categoria
  name: string;
}

export interface BaseAnalyticsQuery {
  period?: "7D" | "30D" | "90D" | "ALL_TIME";
  module?: "VERSUS" | "TOURNAMENT" | "PROFUNDIDAD" | "ACTUALIDAD" | "LUGARES" | "ALL";
}

export interface GranularAnalyticsQuery extends BaseAnalyticsQuery {
  generation?: string;
  categorySlug?: string;
  entityIds?: string[];
  segments?: string[];
  territory?: string;
  granularity?: "DAY" | "WEEK" | "MONTH";
}
