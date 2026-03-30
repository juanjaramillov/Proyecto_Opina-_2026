export interface CanonicalEntity {
  id: string; // Puede ser un entity UUID o slug de categoria
  name: string;
}

export interface BaseAnalyticsQuery {
  period?: "7D" | "30D" | "90D" | "ALL_TIME";
  module?: "VERSUS" | "TOURNAMENT" | "PROFUNDIDAD" | "ACTUALIDAD" | "LUGARES" | "ALL";
}

export type PublicationMode = "real" | "curated" | "hybrid";

export interface GranularAnalyticsQuery extends BaseAnalyticsQuery {
  generation?: string;
  categorySlug?: string;
  entityIds?: string[];
  segments?: string[];
  territory?: string;
  granularity?: "DAY" | "WEEK" | "MONTH";
}

// --- GOBERNANZA CANÓNICA (BLOQUE 1) ---

export type MetricStatus = "live" | "pending_instrumentation" | "experimental" | "disabled";

export type MetricAudience = "results" | "intelligence" | "admin" | "internal";

export type MetricFamily = 
  | "market" 
  | "rigor" 
  | "depth" 
  | "actualidad" 
  | "segments" 
  | "behavior" 
  | "integrity" 
  | "publication";

export type MetricOrigin = "versus" | "tournament" | "depth" | "news" | "places" | "cross_module" | "system";

export type MetricOutputType = "number" | "interval" | "label" | "score" | "series" | "entity_ref" | "topic_ref" | "mixed";

export type MetricLevel = "base" | "advanced" | "premium";

export type MetricSurface = 
  | "results_hero"
  | "results_pulse"
  | "results_versus"
  | "results_tournament"
  | "results_depth"
  | "results_news"
  | "results_footer"
  | "b2b_overview_top"
  | "b2b_overview_trends"
  | "b2b_benchmark_table"
  | "b2b_alerts_feed"
  | "b2b_deep_dive_header"
  | "b2b_deep_dive_body"
  | "b2b_reports_export"
  | "admin_registry"
  | "admin_results_publication"
  | "admin_math_engine"
  | "admin_actualidad_editor";

export type MetricUiVariant = 
  | "hero" 
  | "kpi_card" 
  | "trend_line" 
  | "editorial_chip" 
  | "table_column" 
  | "alert" 
  | "drawer_metric" 
  | "hidden_admin_only";

export type MetricStaticOrTrend = "static" | "trend" | "hybrid";

// Configuración persistible en Supabase
export interface MetricOverride {
  metric_id: string;
  is_enabled: boolean;
  forced_status?: MetricStatus | null;
  visible_by_default_override?: boolean | null;
  min_sample_override?: number | null;
  min_n_eff_override?: number | null;
  max_freshness_hours_override?: number | null;
  exportable_override?: boolean | null;
  notes?: string | null;
}

export interface SurfaceMetricConfig {
  surface_id: MetricSurface;
  metric_id: string;
  is_visible: boolean;
  slot_key: string;
  sort_order: number;
  is_pinned: boolean;
}

export interface SurfacePreset {
  surface_id: MetricSurface;
  preset_name: string;
  is_active: boolean;
  description: string | null;
}

export interface MetricGuardrailPolicy {
  minimumSample?: number;
  minimumNEff?: number;
  maximumFreshnessHours?: number;
  requiresAnonymization?: boolean;
}

export interface MetricAvailabilityState {
  isSupported: boolean;
  isVisible: boolean;
  isConstrainedByGuardrail: boolean;
  violatingGuardrails: string[];
}

export interface MetricRegistryEntry {
  // Configuración en Código (Catálogo)
  id: string;
  name: string;
  shortDescription: string;
  origin: MetricOrigin;
  allowedAudience: MetricAudience[];
  level: MetricLevel;
  outputType: MetricOutputType;
  family: MetricFamily;
  surfaces: MetricSurface[];
  status: MetricStatus; // Default hardcodeado
  staticOrTrend: MetricStaticOrTrend;
  visibleByDefault: boolean;
  requiresGuardrail: boolean;
  minSample: number;
  minNEff: number;
  maxFreshnessHours: number;
  requiresAnonymityGuardrail: boolean;
  exportable: boolean;
  uiVariant: MetricUiVariant;
  defaultSlot: string;
  defaultSortOrder: number;
  
  // Estado de Integración Estricto
  isWiredToReadModel: boolean;
  isWiredToUI: boolean;
  
  // Overrides Combinados desde BD (Opcionales en cliente)
  overrides?: Partial<MetricOverride>; 
}
