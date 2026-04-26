import type { IntelligenceAnalyticsSnapshot, IntelligenceBenchmarkEntry } from "../../../read-models/b2b/intelligenceAnalyticsTypes";

export type DeepDiveContestant = IntelligenceBenchmarkEntry;

export interface DeepDivePair {
    leader: IntelligenceBenchmarkEntry;
    challenger: IntelligenceBenchmarkEntry;
    /** Brecha absoluta en share of preference (leader - challenger), entre -1 y 1. */
    leaderGap: number;
    /** Proyección tendencial. Hoy se usa el mismo valor que `leaderGap` — deja el hook
     *  preparado para cuando el backend exponga una proyección WoW real. */
    projectionGap: number;
}

/**
 * Toma el snapshot de inteligencia y devuelve los dos primeros competidores (líder y
 * retador) con la brecha de preferencia calculada. Devuelve `null` cuando no hay al
 * menos dos entidades o cuando el snapshot viene marcado `insufficient_data` —
 * la página de Deep Dive debe mostrar el `MetricAvailabilityCard` en ese caso.
 */
export function computeDeepDivePair(snapshot: IntelligenceAnalyticsSnapshot | null | undefined): DeepDivePair | null {
    if (!snapshot) return null;
    if (snapshot.availability === 'insufficient_data') return null;
    const entries = snapshot.benchmark?.entries || [];
    if (entries.length < 2) return null;
    const leader = entries[0];
    const challenger = entries[1];
    const leaderGap = leader.weightedPreferenceShare - challenger.weightedPreferenceShare;
    return {
        leader,
        challenger,
        leaderGap,
        projectionGap: leaderGap
    };
}
