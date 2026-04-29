import { BaseAnalyticsQuery, PublicationMode } from "../analytics/analyticsTypes";
import { TemporalMovieRow } from "../../features/signals/services/kpiService";

/** Re-export para que el componente B2CTrendCard pueda importarlo desde el read-model. */
export type { TemporalMovieRow };

/** Calidad estadística mínima para contextualizar al usuario un KPI agregado. */
export interface SampleQualityMeta {
  nEff: number | null;
  freshnessHours: number | null;
  qualityLabel: string | null;
}

export interface ResultsCommunityQuery extends BaseAnalyticsQuery {
  generation?: "ALL" | "BOOMERS" | "GEN_X" | "MILLENNIALS" | "GEN_Z";
  categorySlug?: string;
}

export interface ResultsEditorialHighlight {
  id: string;
  type: "versus" | "tournament" | "depth" | "news" | "places";
  title: string;
  description: string;
  featuredImageUrl?: string;
  isFeatured: boolean;
  metricValue?: number | string;
  metricLabel?: string;
}

export type MetricAvailabilityState = "success" | "insufficient_data" | "degraded" | "blocked" | "error" | "disabled" | "pending";

export interface ResultsCommunityGuardrails {
  minimumCohortSize: number;
  microdetailLocked: boolean;
}

export interface ResultsCommunitySnapshot {
  calculatedAt: string; // ISO Date
  mode: PublicationMode;
  query: ResultsCommunityQuery;
  guardrails: ResultsCommunityGuardrails;
  technicalMeta: Record<string, unknown>;
  
  hero: {
    title: string;
    subtitle: string;
    description: string;
    metrics: {
      activeSignals: number | null;
      freshnessHours: number | null;
      mainInsightHeadline: string | null;
      sampleQualityLabel: string | null;
      /** Capa universal: integridad agregada de las señales (0-100). null si no se puede inferir. */
      integrityScore: number | null;
      /** Etiqueta humana derivada del integrity_score (Alta / Media / Aún preliminar). */
      integrityLabel: string | null;
      /** Cuántos duelos efectivos tendrían que cambiar para revertir el liderazgo actual. */
      massToRevert: number | null;
      /** Etiqueta humana del mass_to_revert ("~120 duelos para revertir" / "Liderazgo blando"). */
      massToRevertLabel: string | null;
    };
    availability: MetricAvailabilityState;
  };
  
  pulse: {
    metrics: {
      fastestRiserEntity: string | null;
      fastestFallerEntity: string | null;
      communityActivityLabel: string | null;
      hotTopicTitle: string | null;
      fragmentationLabel: string | null;
      generationGapLabel: string | null;
      /** Cambio % semana vs semana del fastest riser (si > 0). */
      fastestRiserDeltaPct: number | null;
      /** Cambio % semana vs semana del fastest faller (si < 0). */
      fastestFallerDeltaPct: number | null;
      /** Serie 7 días de signals del fastest riser para sparkline. */
      fastestRiserSparkline: number[] | null;
      /** Serie 7 días de signals del fastest faller para sparkline. */
      fastestFallerSparkline: number[] | null;
    };
    availability: MetricAvailabilityState;
  };

  /**
   * Película temporal del líder agregado (B2C "Tu Tendencia"):
   * tendencia, aceleración, volatilidad, persistencia + sparkline 7-14 d.
   * null si aún no hay suficientes días de rollup para construir la película.
   */
  temporalTrend: {
    movie: TemporalMovieRow[] | null;
    sampleQuality: SampleQualityMeta;
    availability: MetricAvailabilityState;
  };

  /** F9 — Capa predictiva: hacia dónde va el agregado. */
  predictive: {
    /** Share del líder proyectado a 7 días (0-100). null si no hay regresión válida. */
    forecastedLeaderShare7d: number | null;
    /** Días estimados hasta tipping point (segundo supera al líder). null si no se cierra. */
    tippingPointDays: number | null;
    /** Etiqueta humana del cambio de régimen de volatilidad. */
    volatilityRegimeChangeLabel: string | null;
    availability: MetricAvailabilityState;
  };

  /** F10 — Capa explicativa: por qué se mueve. */
  explanatory: {
    /** Lag promedio (horas) entre publish_at de un current_topic y movimiento del rollup. */
    newsImpactLagHours: number | null;
    /** Cohorte que más cambió de opinión semana vs. semana anterior (label). */
    cohortDefectionSignal: string | null;
    /** Top 3 pares de topics correlacionados (label). */
    topicCorrelationTop3: string | null;
    /** F17 — Top topic con etiqueta de persistencia (estructural/sostenido/flash). */
    topicPersistenceTopLabel: string | null;
    availability: MetricAvailabilityState;
  };

  /** F11 — Salud del producto. */
  productHealth: {
    /** % de usuarios que han probado al menos 2 módulos. */
    moduleDiscoveryRate: number | null;
    /** % de sesiones que terminan a mitad de un módulo (status incompleto). */
    moduleFrictionScore: number | null;
    /** Días promedio que un usuario nuevo permanece activo (proxy half-life). */
    cohortHalfLifeDays: number | null;
    /** p50 del reputation score por usuario activo (0-100). */
    userReputationP50: number | null;
    /** F17 — p50 del response_time_ms agregado de los últimos 30 días. */
    avgResponseMsP50: number | null;
    availability: MetricAvailabilityState;
  };

  /** F12 — Integridad / antifraude. */
  integrity: {
    /** Índice de clustering sospechoso (0-100). > 70 → alerta. */
    suspiciousClusterIndex: number | null;
    /** Score de sospecha de bot agregado (0-100). */
    botSuspicionScore: number | null;
    /** Etiqueta de brigading detectado (null si no hay anomalía). */
    brigadingAlertLabel: string | null;
    /** F17 — Top entidad con riesgo reputacional alto (nombre + score). */
    reputationRiskTopEntity: string | null;
    /** F17 — Top entidad con régimen de volatilidad cross-módulo desigual. */
    crossModuleVolatilityLabel: string | null;
    availability: MetricAvailabilityState;
  };

  /** F13 — KPIs comerciales B2B. */
  commercial: {
    /** Estimador de impacto: si X subiera atributo Y en %, su OpinaScore subiría a Z. */
    conversionImpactEstimatorLabel: string | null;
    /** Ventana de vulnerabilidad competitiva del líder (label). */
    competitiveVulnerabilityWindowLabel: string | null;
    /** Categoría con white space (nadie lidera con OpinaScore alto). */
    whiteSpaceCategoryLabel: string | null;
    /** F17 — Top entidad con gap trust vs choice (lovemark subexpuesta o elegida por inercia). */
    trustVsChoiceTopGapLabel: string | null;
    availability: MetricAvailabilityState;
  };

  editorialHighlights: ResultsEditorialHighlight[];

  blocks: {
    versus: {
      visible: boolean;
      metrics: {
        leaderEntityName: string | null;
        preferenceShareLeader: string | null;
        leaderMarginVsSecond: string | null;
        mostContestedCategory: string | null;
        fragmentationLabel: string | null;
        dominantChoiceLabel: string | null;
        /** Calidad estadística del líder (n_eff + freshness + label). */
        sampleQuality: SampleQualityMeta;
      };
      availability: MetricAvailabilityState;
    };
    tournament: { 
      visible: boolean; 
      metrics: {
        currentChampionEntity: string | null;
        championStabilityLabel: string | null;
        upsetRateLabel: string | null;
        mostDifficultPathEntity: string | null;
      };
      availability: MetricAvailabilityState;
    };
    depth: { 
      visible: boolean;
      metrics: {
        topStrengthAttribute: string | null;
        topPainAttribute: string | null;
        npsLeaderEntity: string | null;
        qualityPerceptionLabel: string | null;
        bestRatedEntity: string | null;
        worstRatedEntity: string | null;
      }; 
      availability: MetricAvailabilityState;
    };
    news: { 
      visible: boolean;
      metrics: {
        hotTopicTitle: string | null;
        hotTopicHeatIndex: string | null;
        hotTopicPolarizationLabel: string | null;
        topicWithMostConsensus: string | null;
        topicWithMostDivision: string | null;
        fastestReactionTopic: string | null;
      }; 
      availability: MetricAvailabilityState;
    };
    places: { visible: boolean; availability: MetricAvailabilityState };
    futureModules: { visible: boolean };
  };

  footerNarrative: {
    title: string;
    description: string;
    metrics: {
      generationGapLabel: string | null;
      territoryGapLabel: string | null;
      communityActivityLabel: string | null;
      sampleQualityLabel: string | null;
      /** Cross-módulo: si el campeón de torneo coincide con el líder de versus, etc. */
      crossModuleCoherenceLabel: string | null;
    };
  };
}
