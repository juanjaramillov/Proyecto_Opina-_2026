import { useEffect, useState, useCallback } from "react";
import { analyticsReadService } from "../../../services/analytics/analyticsReadService";
import { LeaderboardEntry } from "../../metrics/services/metricsService";
import { logger } from "../../../lib/logger";
import { mapSnapshotToLeaderboard, filterLeaderboardByName } from "../utils/benchmarkHelpers";
import type { IntelligenceBenchmarkEntry } from "../../../read-models/b2b/intelligenceAnalyticsTypes";
// DEBT-003 cierre (Fase 4.4) + Fase 5.1: narrativa ejecutiva la resuelve el
// provider activo (rule-based por default; LLM cuando se inyecte).
import { getNarrativeProvider } from "../engine/narrativeProvider";

export interface BenchmarkSystemNarrative {
    intelligenceText: string;
    confidence: string;
    category: string;
    backingMetrics?: {
        deltaPercentage?: number;
    };
}

/**
 * Hook que encapsula todo el estado y efectos que antes vivían dentro del componente
 * de página `BenchmarkB2B`. Lo extrajimos como parte de DEBT-004 (partición) para:
 *   1. Que la página sea solo un composer declarativo (<70 líneas).
 *   2. Facilitar escribir tests unitarios del flujo de carga y selección.
 *
 * Desde Fase 4.4 la narrativa por entidad se resuelve vía
 * `narrativeEngine.generateEntityNarrative`: clasificación determinística
 * (8 categorías) + confianza sobre Wilson CI + nEff. Ver
 * `src/features/b2b/engine/narrativeEngine.ts` para el contrato.
 */
export function useBenchmarkB2BState() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    // Guardamos las entries canónicas del snapshot: necesitamos los campos
    // ricos (leaderRank, marginVsSecond, stabilityLabel, Wilson CI, nEff) que
    // LeaderboardEntry no expone, y son los insumos del motor narrativo.
    const [benchmarkEntries, setBenchmarkEntries] = useState<IntelligenceBenchmarkEntry[]>([]);
    const [selectedEntity, setSelectedEntity] = useState<LeaderboardEntry | null>(null);
    const [entityNarrative, setEntityNarrative] = useState<BenchmarkSystemNarrative | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const snapshot = await analyticsReadService.getIntelligenceAnalyticsSnapshot({
                period: "30D",
                module: "ALL"
            });
            setLeaderboard(mapSnapshotToLeaderboard(snapshot));
            setBenchmarkEntries(snapshot?.benchmark?.entries ?? []);
        } catch (err) {
            logger.error("[BenchmarkB2B] Error loading canonical data:", err);
            setLeaderboard([]);
            setBenchmarkEntries([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSelectEntity = useCallback(async (entity: LeaderboardEntry) => {
        setSelectedEntity(entity);
        setLoadingDetails(true);
        setEntityNarrative(null);

        try {
            const benchmarkEntry = benchmarkEntries.find(b => b.entityId === entity.entity_id);
            if (!benchmarkEntry) {
                // Sin entry canónica no podemos clasificar — dejamos narrativa
                // nula y el consumidor muestra una card "datos insuficientes"
                // sin inventar métricas.
                setEntityNarrative(null);
                return;
            }
            // Async para dejar el camino listo a un LLMNarrativeProvider; el
            // rule-based default resuelve inmediatamente.
            const narrative = await getNarrativeProvider().generateEntityNarrative(benchmarkEntry);
            setEntityNarrative(narrative);
        } catch (error) {
            logger.error("[BenchmarkB2B] Error generating narrative:", error);
            setEntityNarrative(null);
        } finally {
            setLoadingDetails(false);
        }
    }, [benchmarkEntries]);

    const filteredRankings = filterLeaderboardByName(leaderboard, searchTerm);

    return {
        loading,
        leaderboard,
        filteredRankings,
        searchTerm,
        setSearchTerm,
        selectedEntity,
        setSelectedEntity,
        entityNarrative,
        loadingDetails,
        loadData,
        handleSelectEntity
    };
}
