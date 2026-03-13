import { useState, useCallback, useEffect } from "react";
import { 
    platformService, 
    PlatformStats, 
    RecentActivity
} from "../../signals/services/platformService";
import { SystemHealth, SuspiciousUser, PlatformAlert, healthService } from "../../signals/services/healthService";
import { DepthInsight, TemporalComparison, VolatilityData, PolarizationData, SegmentInfluence, EarlySignal, insightsService } from "../../signals/services/insightsService";
import { ActivityKPIs, RetentionMetrics, kpiService } from "../../signals/services/kpiService";
import { TrendingItem } from "../../../types/trending";
import { logger } from "../../../lib/logger";
import { useAuthContext } from "../../../features/auth/context/AuthContext";

export function useIntelligence() {
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [activity, setActivity] = useState<RecentActivity | null>(null);
    const [health, setHealth] = useState<SystemHealth | null>(null);
    const [kpis, setKpis] = useState<ActivityKPIs | null>(null);
    const [retention, setRetention] = useState<RetentionMetrics | null>(null);
    const [rankings, setRankings] = useState<TrendingItem[]>([]);
    const [suspiciousUsers, setSuspiciousUsers] = useState<SuspiciousUser[]>([]);
    const [alerts, setAlerts] = useState<PlatformAlert[]>([]);
    const [loading, setLoading] = useState(true);
    
    const { accessState } = useAuthContext();
    const role = accessState.role;
    const orgName = role === 'b2b' ? 'B2B Partner' : null;
    const orgRole = role === 'admin' ? 'Admin' : (role === 'b2b' ? 'Analyst' : null);
    
    const [searchTerm, setSearchTerm] = useState("");

    // Filtros de Segmentación
    const [ageRange, setAgeRange] = useState("all");
    const [gender, setGender] = useState("all");
    const [commune, setCommune] = useState("all");

    // Detalle de Profundidad
    const [selectedBattle, setSelectedBattle] = useState<TrendingItem | null>(null);
    const [depthInsights, setDepthInsights] = useState<DepthInsight[]>([]);
    const [temporalComparison, setTemporalComparison] = useState<TemporalComparison[]>([]);
    const [volatility, setVolatility] = useState<VolatilityData | null>(null);
    const [polarization, setPolarization] = useState<PolarizationData | null>(null);
    const [segmentInfluence, setSegmentInfluence] = useState<SegmentInfluence[]>([]);
    const [earlySignals, setEarlySignals] = useState<EarlySignal[]>([]);
    const [daysBack, setDaysBack] = useState(7);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // AI Summary
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const hasFilters = ageRange !== 'all' || gender !== 'all' || commune !== 'all';

            const [s, a, r, h, k, ret] = await Promise.all([
                platformService.getLiveStats(),
                platformService.getRecentActivity(),
                hasFilters
                    ? platformService.getSegmentedTrending(ageRange, gender, commune)
                    : platformService.getTrending(),
                healthService.getSystemHealthMetrics(),
                kpiService.getKPIActivity(),
                kpiService.getRetentionMetrics(),
            ]);

            const suspects = await healthService.getSuspiciousUsers();
            setSuspiciousUsers(suspects);

            const platformAlerts = await healthService.getPlatformAlerts(5);
            setAlerts(platformAlerts);

            setStats(s as PlatformStats);
            setActivity(a as RecentActivity);
            setRankings(r as TrendingItem[]);
            setHealth(h as SystemHealth);
            setKpis(k as ActivityKPIs);
            setRetention(ret as RetentionMetrics);
        } catch (err: unknown) {
            logger.error("[IntelligencePage] Error loading data:", err);
        } finally {
            setLoading(false);
        }
    }, [ageRange, gender, commune]);

    const loadDepthData = useCallback(async (item: TrendingItem, days: number = daysBack) => {
        setSelectedBattle(item);
        setLoadingDetails(true);
        try {
            const [insights, vData, tData, pData, iData, eData, summary] = await Promise.all([
                insightsService.getDepthInsights(item.slug, '00000000-0000-0000-0000-000000000000', ageRange, gender, commune),
                insightsService.getBattleVolatility(item.slug, 30), // Fijo 30 días para volatilidad por estándar
                insightsService.getTemporalComparison(item.slug, days),
                insightsService.getBattlePolarization(item.slug),
                insightsService.getSegmentInfluence(item.slug, days),
                insightsService.getEarlySignals(item.slug, 6), // Ventana de 6h para detección temprana
                insightsService.getBattleAiSummary(item.slug)
            ]);
            setDepthInsights(insights);
            setVolatility(vData);
            setTemporalComparison(tData);
            setPolarization(pData);
            setSegmentInfluence(iData);
            setEarlySignals(eData);
            setAiSummary(summary);
        } catch (error) {
            logger.error("[IntelligencePage] Error loading depth data:", error);
        } finally {
            setLoadingDetails(false);
        }
    }, [ageRange, gender, commune, daysBack]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleGenerateAiSummary = async () => {
        if (!selectedBattle) return;
        setIsGeneratingAi(true);
        try {
            const newSummary = await insightsService.generateAiSummary(selectedBattle.slug);
            if (newSummary) {
                setAiSummary(newSummary);
            }
        } catch (err) {
            logger.error('Error generating AI summary:', err);
        } finally {
            setIsGeneratingAi(false);
        }
    };

    const handleMarkAlertAsRead = async (alertId: string) => {
        const success = await healthService.markPlatformAlertRead(alertId);
        if (success) {
            setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, is_read: true } : a));
        }
    };

    const filteredRankings = rankings.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return {
        stats, activity, health, kpis, retention, rankings,
        suspiciousUsers, alerts, loading,
        role, orgName, orgRole,
        searchTerm, setSearchTerm,
        ageRange, setAgeRange,
        gender, setGender,
        commune, setCommune,
        selectedBattle, setSelectedBattle,
        depthInsights, temporalComparison, volatility, polarization, segmentInfluence, earlySignals,
        daysBack, setDaysBack,
        loadingDetails, aiSummary, isGeneratingAi,
        loadData, loadDepthData,
        handleGenerateAiSummary, handleMarkAlertAsRead,
        filteredRankings
    };
}
