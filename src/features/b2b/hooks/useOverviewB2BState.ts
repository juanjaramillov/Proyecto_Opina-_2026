import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import { intelligenceAnalyticsService } from "../services/intelligenceAnalyticsService";
import { IntelligenceAnalyticsSnapshot, IntelligenceBenchmarkEntry } from "../../../read-models/b2b/intelligenceAnalyticsTypes";
import { logger } from "../../../lib/logger";
import { useAuthContext } from "../../../features/auth/context/AuthContext";

export function useOverviewB2BState() {
    const { accessState } = useAuthContext();
    const role = accessState.role;
    const isB2B = role === 'b2b' || role === 'admin';

    // UI puro — no es data del server, queda como useState.
    const [selectedEntity, setSelectedEntity] = useState<IntelligenceBenchmarkEntry | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // FASE 3A React Query — el snapshot canónico B2B se cachea por queryKey.
    // Navegar entre tabs B2B no recarga si última fetch <5min.
    const { data: snapshot, isLoading, error, refetch } = useQuery<IntelligenceAnalyticsSnapshot, Error>({
        queryKey: ['b2b', 'overview', '30D'],
        queryFn: () => intelligenceAnalyticsService.getIntelligenceAnalyticsSnapshot({ period: "30D" }),
        enabled: isB2B,
    });

    useEffect(() => {
        if (error) {
            logger.error("[OverviewB2B] Error loading canonic data:", error);
        }
    }, [error]);

    const handleSelectEntity = async (entity: IntelligenceBenchmarkEntry) => {
        setSelectedEntity(entity);
        setLoadingDetails(true);
        try {
            // Futuro: Aquí se puede hacer drill-down fetch pidiendo deepDive de esa entity
            // intelligenceAnalyticsService.getDeepDiveForEntity(entity.entityId)
            // Por ahora, el snapshot canónico B2B de Bloque 4 asume que podemos mostrar los
            // stats básicos de Benchmark.
        } catch (error) {
            logger.error("[OverviewB2B] Error fetching deep dive constraints:", error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const leaderboard = snapshot?.benchmark?.entries || [];
    const filteredRankings = useMemo(
        () => leaderboard.filter(item =>
            item.entityName.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        [leaderboard, searchTerm]
    );

    // Mantenemos `loadData` como wrapper de refetch para no tocar consumidores.
    const loadData = useCallback(async () => {
        await refetch();
    }, [refetch]);

    return {
        isB2B,
        loading: isLoading,
        snapshot: snapshot ?? null,
        alerts: snapshot?.alerts || [],
        searchTerm,
        setSearchTerm,
        filteredRankings,
        leaderboard,
        selectedEntity,
        setSelectedEntity,
        loadingDetails,
        handleSelectEntity,
        loadData
    };
}
