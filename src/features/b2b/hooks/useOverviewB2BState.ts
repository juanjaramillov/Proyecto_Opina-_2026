import { useEffect, useState, useCallback } from "react";
import { intelligenceAnalyticsService } from "../services/intelligenceAnalyticsService";
import { IntelligenceAnalyticsSnapshot, IntelligenceBenchmarkEntry } from "../../../read-models/b2b/intelligenceAnalyticsTypes";
import { logger } from "../../../lib/logger";
import { useAuthContext } from "../../../features/auth/context/AuthContext";

export function useOverviewB2BState() {
    const { accessState } = useAuthContext();
    const role = accessState.role;
    const isB2B = role === 'b2b' || role === 'admin'; 
    
    // El snapshot unificado que nutre Overview, Benchmark, Alerts, DeepDive
    const [snapshot, setSnapshot] = useState<IntelligenceAnalyticsSnapshot | null>(null);
    const [selectedEntity, setSelectedEntity] = useState<IntelligenceBenchmarkEntry | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            // Unificamos el fetch de query hacia todos los tabs B2B
            const data = await intelligenceAnalyticsService.getIntelligenceAnalyticsSnapshot({
                period: "30D" // default o configurable futuro
            });
            
            setSnapshot(data);
        } catch (err) {
            logger.error("[OverviewB2B] Error loading canonic data:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isB2B) {
            loadData();
        }
    }, [isB2B, loadData]);

    const handleSelectEntity = async (entity: IntelligenceBenchmarkEntry) => {
        setSelectedEntity(entity);
        setLoadingDetails(true);
        try {
            // Futuro: Aquí se puede hacer drill-down fetch pidiendo deepDive de esa entity
            // intelligenceAnalyticsService.getDeepDiveForEntity(entity.entityId)
            // Por ahora, el snapshot canónico B2B de Bloque 4 asume que podemos mostrar los
            // stats básicos de Bencharmark.
        } catch (error) {
            logger.error("[OverviewB2B] Error fetching deep dive constraints:", error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const leaderboard = snapshot?.benchmark?.entries || [];
    const filteredRankings = leaderboard.filter(item => 
        item.entityName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return {
        isB2B,
        loading,
        snapshot,
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
