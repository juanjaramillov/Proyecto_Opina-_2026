import type { IntelligenceAnalyticsSnapshot } from "../../../read-models/b2b/intelligenceAnalyticsTypes";

export type FindingTrend = 'positive' | 'negative' | 'neutral';

export interface ExecutiveFinding {
    title: string;
    description: string;
    trend: FindingTrend;
    icon: string;
}

/**
 * Builds the narrative paragraph shown at the top of the B2B executive summary.
 * Pure function — no UI concerns, trivially testable.
 */
export function buildExecutiveSummaryText(snapshot: IntelligenceAnalyticsSnapshot): string {
    const { overview } = snapshot;
    return (
        `Durante este período, la plataforma registra un ${overview.primaryMetricLabel.toLowerCase()} de ${overview.primaryMetricValue}. `
        + (overview.leaderEntityName
            ? `El liderazgo está marcado por ${overview.leaderEntityName}, `
            : `No hay un líder claro, `)
        + (overview.topRisingEntityName
            ? `con un crecimiento notable de ${overview.topRisingEntityName}. `
            : 'sin variaciones destacadas al alza. ')
        + (overview.activeRiskAreas > 0
            ? `Se detectan ${overview.activeRiskAreas} áreas de atención operativa.`
            : 'El estado del ecosistema es estable.')
    );
}

/**
 * Produces the three "key findings" cards shown next to the narrative.
 * Pure function — decouples copy/logic from rendering.
 */
export function buildDynamicFindings(snapshot: IntelligenceAnalyticsSnapshot): ExecutiveFinding[] {
    const { overview } = snapshot;
    return [
        {
            title: "Entidad Líder",
            description: overview.leaderEntityName
                ? `${overview.leaderEntityName} presenta la posición más fuerte del mercado actual.`
                : "Aún sin datos suficientes para declarar líder concluyente.",
            trend: "positive",
            icon: "sparkles"
        },
        {
            title: "Mayor Crecimiento",
            description: overview.topRisingEntityName
                ? `${overview.topRisingEntityName} aceleró en sus métricas recientes.`
                : "Sin entidades con aceleración significativa detectada.",
            trend: "positive",
            icon: "trending-up"
        },
        {
            title: "Áreas de Riesgo",
            description: overview.activeRiskAreas > 0
                ? `${overview.activeRiskAreas} puntos operativos detectados con bajo performance.`
                : "No se registran señales de alerta significativas hoy.",
            trend: overview.activeRiskAreas > 0 ? "negative" : "neutral",
            icon: overview.activeRiskAreas > 0 ? "trending-down" : "zap"
        }
    ];
}
