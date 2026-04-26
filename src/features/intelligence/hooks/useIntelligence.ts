import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    platformService,
    PlatformStats,
    RecentActivity
} from "../../signals/services/platformService";
import { SystemHealth, SuspiciousUser, PlatformAlert, healthService } from "../../signals/services/healthService";
import { DepthInsight, TemporalComparison, VolatilityData, PolarizationData, SegmentInfluence, EarlySignal, B2BBattleAnalytics, B2BEligibility, IntegrityFlags, insightsService } from "../../signals/services/insightsService";
import { ActivityKPIs, RetentionMetrics, kpiService } from "../../signals/services/kpiService";
import { TrendingItem } from "../../../types/trending";
import { logger } from "../../../lib/logger";
import { useAuthContext } from "../../../features/auth/context/AuthContext";

/**
 * FASE 3C React Query (2026-04-26): el hook estrella del Drimo. Antes era un
 * `Promise.all` + 2 fetches secuenciales que rompía el hub si una sola fetch
 * fallaba ("spinner eterno parcial"). Ahora son 8 useQuery independientes
 * para los datos del listado y 10 useQuery independientes con `enabled` para
 * el detalle por battle. Cada uno cachea por queryKey, así navegar entre
 * battles vistas o tabs no refetcha.
 *
 * Beneficios:
 *  1. Si una query falla, las otras renderean su data.
 *  2. Cambio de filtros (ageRange/gender/commune) → solo refetcha la queryKey
 *     `rankings`, no las 8 fetches.
 *  3. Detalle por battle se cachea por slug/id → volver a una battle es
 *     instantáneo si está fresca (<5min, default global).
 *
 * Firma pública intacta — los consumidores (AdminSystemOverview, AdminInvites)
 * no requieren cambios.
 */
export function useIntelligence() {
    const qc = useQueryClient();
    const { accessState } = useAuthContext();
    const role = accessState.role;
    const orgName = role === 'b2b' ? 'B2B Partner' : null;
    const orgRole = role === 'admin' ? 'Admin' : (role === 'b2b' ? 'Analyst' : null);

    // ---- Filtros (UI state) ----
    const [searchTerm, setSearchTerm] = useState("");
    const [ageRange, setAgeRange] = useState("all");
    const [gender, setGender] = useState("all");
    const [commune, setCommune] = useState("all");

    // ---- Selección y depth data trigger ----
    const [selectedBattle, setSelectedBattle] = useState<TrendingItem | null>(null);
    const [daysBack, setDaysBack] = useState(7);
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);

    // ============= QUERIES PRINCIPALES (loadData) =============
    // platformService.getLiveStats / getRecentActivity pueden devolver `null`
    // (ej. si la sesión no tiene permisos o la tabla está vacía). Tipamos el
    // generic como `T | null` para que tsc no se queje y los consumidores
    // sigan haciendo el guardrail de null como antes.
    const statsQuery = useQuery<PlatformStats | null, Error>({
        queryKey: ['intelligence', 'stats'],
        queryFn: () => platformService.getLiveStats(),
    });

    const activityQuery = useQuery<RecentActivity | null, Error>({
        queryKey: ['intelligence', 'activity'],
        queryFn: () => platformService.getRecentActivity(),
    });

    const hasFilters = ageRange !== 'all' || gender !== 'all' || commune !== 'all';
    const rankingsQuery = useQuery<TrendingItem[], Error>({
        // Filtros forman parte de la key → cambiar filtros refetchea automático.
        queryKey: ['intelligence', 'rankings', ageRange, gender, commune],
        queryFn: () => hasFilters
            ? platformService.getSegmentedTrending(ageRange, gender, commune)
            : platformService.getTrending(),
    });

    const healthQuery = useQuery<SystemHealth, Error>({
        queryKey: ['intelligence', 'health'],
        queryFn: () => healthService.getSystemHealthMetrics(),
    });

    const kpisQuery = useQuery<ActivityKPIs, Error>({
        queryKey: ['intelligence', 'kpis'],
        queryFn: () => kpiService.getKPIActivity(),
    });

    const retentionQuery = useQuery<RetentionMetrics, Error>({
        queryKey: ['intelligence', 'retention'],
        queryFn: () => kpiService.getRetentionMetrics(),
    });

    const suspiciousQuery = useQuery<SuspiciousUser[], Error>({
        queryKey: ['intelligence', 'suspicious-users'],
        queryFn: () => healthService.getSuspiciousUsers(),
    });

    const alertsQuery = useQuery<PlatformAlert[], Error>({
        queryKey: ['intelligence', 'alerts'],
        queryFn: () => healthService.getPlatformAlerts(5),
    });

    // Loading agregado del hub: si CUALQUIERA está cargando inicial, mostrar
    // spinner global. Cada componente puede chequear su propia query si
    // necesita granularidad (futuro refactor).
    const loading = statsQuery.isLoading || activityQuery.isLoading ||
        rankingsQuery.isLoading || healthQuery.isLoading ||
        kpisQuery.isLoading || retentionQuery.isLoading ||
        suspiciousQuery.isLoading || alertsQuery.isLoading;

    // Errores logueados (mantenemos el log que existía antes).
    const queryErrors = [
        statsQuery.error, activityQuery.error, rankingsQuery.error,
        healthQuery.error, kpisQuery.error, retentionQuery.error,
        suspiciousQuery.error, alertsQuery.error
    ].filter(Boolean);
    if (queryErrors.length > 0) {
        // Solo logueamos UNA vez por render con errores nuevos — useEffect
        // no aporta acá porque queryErrors se recalcula igualmente.
        queryErrors.forEach(err => logger.error("[IntelligencePage] Error loading data:", err as Error));
    }

    // ============= QUERIES DE DETALLE (loadDepthData) =============
    // 10 queries paralelos disparados por `enabled: !!selectedBattle`.
    // Cachean por slug/id, así volver a una battle vista no refetcha.
    const depthEnabled = !!selectedBattle;
    const slug = selectedBattle?.slug ?? '';
    const battleId = selectedBattle?.id ?? '';

    const depthInsightsQuery = useQuery<DepthInsight[], Error>({
        queryKey: ['intelligence', 'depth', 'insights', slug, ageRange, gender, commune],
        queryFn: () => insightsService.getDepthInsights(slug, '00000000-0000-0000-0000-000000000000', ageRange, gender, commune),
        enabled: depthEnabled,
    });

    const volatilityQuery = useQuery<VolatilityData | null, Error>({
        queryKey: ['intelligence', 'depth', 'volatility', slug],
        queryFn: () => insightsService.getBattleVolatility(slug, 30), // 30 días estándar
        enabled: depthEnabled,
    });

    const temporalQuery = useQuery<TemporalComparison[], Error>({
        queryKey: ['intelligence', 'depth', 'temporal', slug, daysBack],
        queryFn: () => insightsService.getTemporalComparison(slug, daysBack),
        enabled: depthEnabled,
    });

    const polarizationQuery = useQuery<PolarizationData | null, Error>({
        queryKey: ['intelligence', 'depth', 'polarization', slug],
        queryFn: () => insightsService.getBattlePolarization(slug),
        enabled: depthEnabled,
    });

    const segmentInfluenceQuery = useQuery<SegmentInfluence[], Error>({
        queryKey: ['intelligence', 'depth', 'segment-influence', slug, daysBack],
        queryFn: () => insightsService.getSegmentInfluence(slug, daysBack),
        enabled: depthEnabled,
    });

    const earlySignalsQuery = useQuery<EarlySignal[], Error>({
        queryKey: ['intelligence', 'depth', 'early-signals', slug],
        queryFn: () => insightsService.getEarlySignals(slug, 6), // 6h ventana
        enabled: depthEnabled,
    });

    const aiSummaryQuery = useQuery<string | null, Error>({
        queryKey: ['intelligence', 'depth', 'ai-summary', slug],
        queryFn: () => insightsService.getBattleAiSummary(slug),
        enabled: depthEnabled,
    });

    const b2bAnalyticsQuery = useQuery<B2BBattleAnalytics | null, Error>({
        queryKey: ['intelligence', 'depth', 'b2b-analytics', battleId],
        queryFn: () => insightsService.getB2BBattleAnalytics(battleId),
        enabled: depthEnabled,
    });

    const eligibilityQuery = useQuery<B2BEligibility | null, Error>({
        queryKey: ['intelligence', 'depth', 'eligibility', battleId],
        queryFn: () => insightsService.getPremiumEligibility(battleId, 'versus'),
        enabled: depthEnabled,
    });

    const integrityQuery = useQuery<IntegrityFlags | null, Error>({
        queryKey: ['intelligence', 'depth', 'integrity', battleId],
        queryFn: () => insightsService.getAnalyticalIntegrity(battleId),
        enabled: depthEnabled,
    });

    const loadingDetails = depthEnabled && (
        depthInsightsQuery.isLoading || volatilityQuery.isLoading ||
        temporalQuery.isLoading || polarizationQuery.isLoading ||
        segmentInfluenceQuery.isLoading || earlySignalsQuery.isLoading ||
        aiSummaryQuery.isLoading || b2bAnalyticsQuery.isLoading ||
        eligibilityQuery.isLoading || integrityQuery.isLoading
    );

    // ============= MUTATIONS / TRIGGERS =============

    // `loadData` antes recargaba todo manualmente. Ahora invalida el namespace
    // `['intelligence']` exceptuando 'depth' — eso refetchea las 8 principales.
    const loadData = useCallback(async () => {
        // Invalidar todo intelligence menos depth (ése solo cuando hay battle).
        await Promise.all([
            qc.invalidateQueries({ queryKey: ['intelligence', 'stats'] }),
            qc.invalidateQueries({ queryKey: ['intelligence', 'activity'] }),
            qc.invalidateQueries({ queryKey: ['intelligence', 'rankings'] }),
            qc.invalidateQueries({ queryKey: ['intelligence', 'health'] }),
            qc.invalidateQueries({ queryKey: ['intelligence', 'kpis'] }),
            qc.invalidateQueries({ queryKey: ['intelligence', 'retention'] }),
            qc.invalidateQueries({ queryKey: ['intelligence', 'suspicious-users'] }),
            qc.invalidateQueries({ queryKey: ['intelligence', 'alerts'] }),
        ]);
    }, [qc]);

    // `loadDepthData` ahora es trivial — solo setea estado, las 10 queries
    // se disparan automáticamente por `enabled: !!selectedBattle`.
    const loadDepthData = useCallback((item: TrendingItem, days?: number) => {
        setSelectedBattle(item);
        if (typeof days === 'number') setDaysBack(days);
    }, []);

    const handleGenerateAiSummary = async () => {
        if (!selectedBattle) return;
        setIsGeneratingAi(true);
        try {
            const newSummary = await insightsService.generateAiSummary(selectedBattle.slug);
            if (newSummary) {
                // Cache directo con el nuevo valor — evita refetch innecesario.
                qc.setQueryData(['intelligence', 'depth', 'ai-summary', selectedBattle.slug], newSummary);
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
            // Optimistic update vía setQueryData — UX inmediata sin esperar refetch.
            qc.setQueryData<PlatformAlert[]>(['intelligence', 'alerts'], (prev) =>
                prev ? prev.map(a => a.id === alertId ? { ...a, is_read: true } : a) : prev
            );
        }
    };

    // ============= DATA EXTRAÍDA =============
    const stats = statsQuery.data ?? null;
    const activity = activityQuery.data ?? null;
    const health = healthQuery.data ?? null;
    const kpis = kpisQuery.data ?? null;
    const retention = retentionQuery.data ?? null;
    const rankings = rankingsQuery.data ?? [];
    const suspiciousUsers = suspiciousQuery.data ?? [];
    const alerts = alertsQuery.data ?? [];

    const depthInsights = depthInsightsQuery.data ?? [];
    const volatility = volatilityQuery.data ?? null;
    const temporalComparison = temporalQuery.data ?? [];
    const polarization = polarizationQuery.data ?? null;
    const segmentInfluence = segmentInfluenceQuery.data ?? [];
    const earlySignals = earlySignalsQuery.data ?? [];
    const aiSummary = aiSummaryQuery.data ?? null;
    const b2bAnalytics = b2bAnalyticsQuery.data ?? null;
    const b2bEligibility = eligibilityQuery.data ?? null;
    const integrityFlags = integrityQuery.data ?? null;

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
        depthInsights, temporalComparison, volatility, polarization, segmentInfluence, earlySignals, b2bAnalytics, b2bEligibility, integrityFlags,
        daysBack, setDaysBack,
        loadingDetails, aiSummary, isGeneratingAi,
        loadData, loadDepthData,
        handleGenerateAiSummary, handleMarkAlertAsRead,
        filteredRankings
    };
}
