import { useEffect, useState, useCallback } from "react";
import { platformOverviewReadModel } from "../../../read-models/b2b/platformOverviewReadModel";
import { PlatformOverviewSnapshot, LeaderboardEntry } from "../../../read-models/types";
import { logger } from "../../../lib/logger";
import { useAuthContext } from "../../../features/auth/context/AuthContext";

export interface SystemAlert {
    id: string;
    entityName: string;
    severity: string;
    category: string;
    message: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
}

export interface SystemNarrative {
    intelligenceText: string;
    confidence: string;
    category: string;
    backingMetrics?: {
        deltaPercentage?: number;
    }
}

export function useOverviewB2BState() {
    const { accessState } = useAuthContext();
    const role = accessState.role;
    const isB2B = role === 'b2b' || role === 'admin'; 
    
    const [snapshot, setSnapshot] = useState<PlatformOverviewSnapshot | null>(null);
    const [alerts, setAlerts] = useState<SystemAlert[]>([]);
    
    const [selectedEntity, setSelectedEntity] = useState<LeaderboardEntry | null>(null);
    const [entityNarrative, setEntityNarrative] = useState<SystemNarrative | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await platformOverviewReadModel.getOverviewSnapshot();
            
            const activeAlerts: SystemAlert[] = [];
            
            if (data.trendSummary && data.trendSummary.trendingDown.length > 0) {
                 const worst = [...data.trendSummary.trendingDown].sort((a,b) => b.signalCount - a.signalCount)[0];
                 if (worst) {
                     activeAlerts.push({
                         id: `alert-down-${worst.entityId}`,
                         entityName: worst.entityName,
                         severity: 'WARNING',
                         category: 'Pérdida de Momentum',
                         message: `La entidad ${worst.entityName} registra caída sostenida en preferencia comparativa.`,
                         createdAt: new Date().toISOString()
                     });
                 }
            }
            if (data.trendSummary && data.trendSummary.trendingUp.length > 0) {
                 const best = [...data.trendSummary.trendingUp].sort((a,b) => b.signalCount - a.signalCount)[0];
                 if (best) {
                     activeAlerts.push({
                         id: `alert-up-${best.entityId}`,
                         entityName: best.entityName,
                         severity: 'INFO',
                         category: 'Aceleración Positiva',
                         message: `La entidad ${best.entityName} lidera las tendencias positivas en atención B2C.`,
                         createdAt: new Date().toISOString()
                     });
                 }
            }

            setSnapshot(data);
            setAlerts(activeAlerts);
        } catch (err) {
            logger.error("[OverviewB2B] Error loading data:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isB2B) {
            loadData();
        }
    }, [isB2B, loadData]);

    const handleSelectEntity = async (entity: LeaderboardEntry) => {
        setSelectedEntity(entity);
        setLoadingDetails(true);
        setEntityNarrative(null);
        
        try {
            // const narrative = await narrativeEngine.generateEntityNarrative(entity.entity_id);
            setEntityNarrative(null);
        } catch (error) {
            logger.error("[OverviewB2B] Error fetching narrative:", error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const leaderboard = snapshot?.leaderboardTop10 || [];
    const filteredRankings = leaderboard.filter(item => 
        item.entityName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return {
        isB2B,
        loading,
        snapshot,
        alerts,
        searchTerm,
        setSearchTerm,
        filteredRankings,
        leaderboard,
        selectedEntity,
        setSelectedEntity,
        entityNarrative,
        loadingDetails,
        handleSelectEntity,
        loadData
    };
}
