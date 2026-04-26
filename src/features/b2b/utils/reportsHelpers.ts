import type { IntelligenceAnalyticsSnapshot } from "../../../read-models/b2b/intelligenceAnalyticsTypes";
import { getNarrativeProvider } from "../engine/narrativeProvider";

export interface ReportContent {
    title: string;
    dateRange: string;
    universe: string;
    summary: string;
    findings: string[];
    criticalAlert: string;
    strategicRecommendation: string;
}

/**
 * Construye el contenido del "Brief Ejecutivo" a partir del snapshot.
 *
 * Desde Fase 4.4 delega la parte narrativa al engine; desde Fase 5.1 pasa por
 * `getNarrativeProvider()` — el default sigue siendo rule-based (síncrono bajo
 * el capó), pero si algún día se inyecta un `LLMNarrativeProvider`, esta
 * función ya lo consume sin cambios. Por eso es async aunque hoy el provider
 * default resuelva inmediatamente.
 *
 * Lo que queda en esta función es sólo shaping del shell del documento (título,
 * ventana de fechas, tamaño del universo) — todo lo que sea opinión sobre los
 * números pasa por el provider.
 */
export async function buildReportContent(snapshot: IntelligenceAnalyticsSnapshot): Promise<ReportContent> {
    const universeCount = snapshot.overview.secondaryMetrics["Total Señales Evaluadas"] || 0;
    const highAlert = snapshot.alerts.find(a => a.severity === 'high');

    const narrative = await getNarrativeProvider().generateMarketNarrative({
        entries: snapshot.benchmark.entries,
        highAlertMessage: highAlert?.message ?? null,
    });

    return {
        title: "Brief Ejecutivo: Dinámica Competitiva B2B",
        dateRange: "Actualización Continua",
        universe: `${universeCount} señales validadas (Mercado Nacional)`,
        summary: narrative.summary,
        findings: narrative.findings,
        criticalAlert: narrative.criticalAlert,
        strategicRecommendation: narrative.strategicRecommendation,
    };
}

/**
 * Determina si el reporte está listo para exportarse. Una página debe mostrar el
 * `MetricAvailabilityCard` insufficient_data cuando esto devuelva false.
 *
 * Deliberadamente NO declaramos un type guard (`snapshot is Snapshot`): el test
 * rechaza `snapshot` válidos con `availability === 'insufficient_data'`, así que
 * el negative branch seguiría teniendo un snapshot real y TS lo narrowearía mal.
 * Con un boolean simple el caller puede seguir consumiendo snapshot normalmente.
 */
export function isReportAvailable(snapshot: IntelligenceAnalyticsSnapshot | null | undefined): boolean {
    if (!snapshot) return false;
    if (snapshot.availability === 'insufficient_data') return false;
    if (snapshot.reports.exportStatus === 'blocked') return false;
    return true;
}
