import { LeaderboardEntry } from "../../metrics/services/metricsService";
import type { IntelligenceAnalyticsSnapshot } from "../../../read-models/b2b/intelligenceAnalyticsTypes";

/**
 * Mapea el snapshot canónico de inteligencia al shape histórico de `LeaderboardEntry`
 * que consumen la tabla y el panel Deep Dive de Benchmark. Aislado aquí para que el
 * componente de página no tenga lógica fuera de composición, y para poder testear
 * este mapeo puro más adelante (DEBT-005 futura).
 */
export function mapSnapshotToLeaderboard(snapshot: IntelligenceAnalyticsSnapshot | null | undefined): LeaderboardEntry[] {
    if (!snapshot?.benchmark?.entries) return [];
    return snapshot.benchmark.entries.map((b) => ({
        entity_id: b.entityId,
        entity_name: b.entityName,
        wins_count: 0,
        losses_count: 0,
        total_comparisons: b.nEff,
        preference_share: b.weightedPreferenceShare,
        win_rate: b.weightedWinRate,
        score: b.wilsonLowerBound
    }));
}

/**
 * Filtro case-insensitive por nombre — sirve tanto al input de búsqueda del ranking
 * como a tests unitarios futuros del comportamiento de la barra de filtro.
 */
export function filterLeaderboardByName(rows: LeaderboardEntry[], term: string): LeaderboardEntry[] {
    const q = term.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter(item => item.entity_name.toLowerCase().includes(q));
}
