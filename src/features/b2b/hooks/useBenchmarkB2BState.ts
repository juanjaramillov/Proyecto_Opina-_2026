import { useEffect, useState, useCallback, useMemo } from "react";
import { useQuery } from '@tanstack/react-query';
import { analyticsReadService } from "../../../services/analytics/analyticsReadService";
import { LeaderboardEntry } from "../../metrics/services/metricsService";
import { logger } from "../../../lib/logger";
import { mapSnapshotToLeaderboard, filterLeaderboardByName } from "../utils/benchmarkHelpers";
import type { IntelligenceBenchmarkEntry, IntelligenceAnalyticsSnapshot } from "../../../read-models/b2b/intelligenceAnalyticsTypes";
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
 *
 * FASE 3A React Query (2026-04-26): el snapshot canónico se cachea por queryKey
 * para evitar refetches al navegar entre tabs. Mantengo firma pública intacta.
 */
export function useBenchmarkB2BState() {
    const [selectedEntity, setSelectedEntity] = useState<LeaderboardEntry | null>(null);
    const [entityNarrative, setEntityNarrative] = useState<BenchmarkSystemNarrative | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const { data: snapshot, isLoading, error, refetch } = useQuery<IntelligenceAnalyticsSnapshot, Error>({
        queryKey: ['b2b', 'benchmark', '30D', 'ALL'],
        queryFn: () => analyticsReadService.getIntelligenceAnalyticsSnapshot({
            period: "30D",
            module: "ALL"
        }),
    });

    useEffect(() => {
        if (error) {
            logger.error("[BenchmarkB2B] Error loading canonical data:", error);
        }
    }, [error]);

    // Derivamos las dos vistas del snapshot. `benchmarkEntries` mantiene
    // los campos ricos (leaderRank, marginVsSecond, stabilityLabel, Wilson
    // CI, nEff) que LeaderboardEntry no expone, y son los insumos del motor
    // narrativo.
    const leaderboard = useMemo<LeaderboardEntry[]>(
        () => (snapshot ? mapSnapshotToLeaderboard(snapshot) : []),
        [snapshot]
    );
    const benchmarkEntries = useMemo<IntelligenceBenchmarkEntry[]>(
        () => snapshot?.benchmark?.entries ?? [],
        [snapshot]
    );

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
        } catch (err) {
            logger.error("[BenchmarkB2B] Error generating narrative:", err);
            setEntityNarrative(null);
        } finally {
            setLoadingDetails(false);
        }
    }, [benchmarkEntries]);

    const filteredRankings = filterLeaderboardByName(leaderboard, searchTerm);

    const loadData = useCallback(async () => {
        await refetch();
    }, [refetch]);

    return {
        loading: isLoading,
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
