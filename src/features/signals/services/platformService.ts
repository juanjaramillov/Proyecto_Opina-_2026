import { supabase as sb } from "../../../supabase/client";
import { TrendingItem } from "../../../types/trending";
import { logger } from "../../../lib/logger";

export interface PlatformStats {
    signals_24h: number;
    trending_title: string;
    active_region: string;
    active_users: number;
    captured_at: string;
}

export interface RecentActivity {
    signals_last_3h: number;
    verified_signals_last_3h: number;
    unique_users_last_3h: number;
    total_signals?: number;
    active_users_24h?: number;
}

export interface SystemHealth {
    data_quality_score: number;
    profile_completeness_avg: number;
    signal_integrity_pct: number;
}

export interface ActivityKPIs {
    dau: number;
    wau: number;
    mau: number;
}

export interface RetentionMetrics {
    retention_day_1: number;
    retention_day_7: number;
}

export interface DepthInsight {
    question_id: string;
    total_responses: number;
    average_score: number;
}

export interface SuspiciousUser {
    user_id: string;
    trust_score: number;
    suspicious_flag: boolean;
    last_signal_at?: string;
}

export interface TemporalComparison {
    option_id: string;
    current_score: number;
    past_score: number;
    variation: number;
    variation_percent: number;
}

export interface VolatilityData {
    volatility_score: number;
    volatility_index: number;
    classification: 'stable' | 'moderate' | 'volatile';
}

export interface PlatformAlert {
    id: string;
    type: 'volatility' | 'fraud' | 'system' | 'momentum';
    severity: 'info' | 'warning' | 'critical' | 'medium';
    title: string;
    message: string;
    metadata: Record<string, unknown>;
    is_read: boolean;
    created_at: string;
}

export interface PolarizationData {
    top_share: number;
    second_share: number;
    polarization_index: number;
    classification: string;
}

export interface SegmentInfluence {
    age_range: string;
    gender: string;
    commune: string;
    segment_variation: number;
    contribution_percent: number;
}

export interface EarlySignal {
    option_id: string;
    option_label: string;
    recent_score: number;
    historical_avg: number;
    momentum_ratio: number;
    classification: 'emerging' | 'cooling' | 'stable';
}

// Internal interfaces for raw RPC data
interface RawTrendingRanking {
    battle_id: string;
    battle_title: string;
    battle_slug: string;
    option_label: string;
    total_weight: number | string;
    snapshot_at: string;
    variation: number | string;
    variation_percent: number | string;
    direction: string;
}

export interface EnterpriseRanking {
    option_id: string;
    option_label: string;
    total_weight: number;
    rank_position: number;
    snapshot_at: string;
}

export interface ClientPlanStatus {
    plan_name: string;
    monthly_price: number;
    request_limit: number;
    requests_used: number;
    features: {
        segment_access: boolean;
        depth_access: boolean;
        [key: string]: unknown;
    };
}

export const platformService = {
    getLiveStats: async (): Promise<PlatformStats | null> => {
        const { data, error } = await (sb.rpc as any)('get_live_platform_stats');

        if (error) {
            logger.error('[PlatformService] Error fetching live stats:', error);
            return null;
        }

        return ((data as any)?.[0] as PlatformStats) || null;
    },

    getRecentActivity: async (): Promise<RecentActivity | null> => {
        const { data, error } = await (sb.rpc as any)('get_recent_signal_activity');

        if (error) {
            logger.error('[PlatformService] Error fetching recent activity:', error);
            return null;
        }

        return ((data as any)?.[0] as RecentActivity) || null;
    },

    getTrendingFeedGrouped: async (): Promise<unknown[]> => {
        const { data, error } = await (sb.rpc as unknown as (fn: string) => Promise<{ data: unknown[] | null, error: unknown }>)('get_trending_feed_grouped');

        if (error) {
            logger.error('[PlatformService] Error fetching trending feed:', error);
            return [];
        }

        return data || [];
    },

    getTrending: async (): Promise<TrendingItem[]> => {
        const { data, error } = await (sb.rpc as unknown as (fn: string) => Promise<{ data: RawTrendingRanking[] | null, error: unknown }>)('get_ranking_with_variation');

        if (error) {
            logger.error('[PlatformService] Error fetching latest rankings (snapshots):', error);
            return [];
        }

        const rawData = data || [];
        return rawData.map(item => ({
            id: item.battle_id,
            title: item.battle_title,
            slug: item.battle_slug,
            total_signals: Math.round(Number(item.total_weight)),
            trend_score: parseFloat(String(item.total_weight)),
            snapshot_at: item.snapshot_at,
            variation: parseFloat(String(item.variation)),
            variation_percent: parseFloat(String(item.variation_percent)),
            direction: item.direction as 'up' | 'down' | 'stable'
        }));
    },

    getSegmentedRanking: async (
        battleSlug: string,
        ageRange: string = 'all',
        gender: string = 'all',
        commune: string = 'all'
    ): Promise<TrendingItem[]> => {
        const { data, error } = await (sb.rpc as unknown as (fn: string, p: object) => Promise<{ data: RawTrendingRanking[] | null, error: unknown }>)('get_segmented_ranking', {
            p_battle_slug: battleSlug,
            p_age_range: ageRange,
            p_gender: gender,
            p_commune: commune
        });

        if (error) {
            logger.error('[PlatformService] Error fetching segmented ranking:', error);
            return [];
        }

        const rawData = data || [];
        return rawData.map(item => ({
            id: item.battle_id,
            title: item.battle_title,
            slug: item.battle_slug,
            total_signals: Math.round(Number(item.total_weight)),
            trend_score: parseFloat(String(item.total_weight)),
            snapshot_at: item.snapshot_at,
            variation: 0,
            variation_percent: 0,
            direction: 'stable'
        }));
    },

    getSegmentedTrending: async (
        ageRange: string = 'all',
        gender: string = 'all',
        commune: string = 'all'
    ): Promise<TrendingItem[]> => {
        const { data, error } = await (sb.rpc as unknown as (fn: string, p: object) => Promise<{ data: RawTrendingRanking[] | null, error: unknown }>)('get_segmented_trending', {
            p_age_range: ageRange,
            p_gender: gender,
            p_commune: commune
        });

        if (error) {
            logger.error('[PlatformService] Error fetching segmented trending:', error);
            return [];
        }

        const rawData = data || [];
        return rawData.map(item => ({
            id: item.battle_id,
            title: item.battle_title,
            slug: item.battle_slug,
            total_signals: Math.round(Number(item.total_weight)),
            trend_score: parseFloat(String(item.total_weight)),
            snapshot_at: item.snapshot_at,
            variation: 0,
            variation_percent: 0,
            direction: 'stable'
        }));
    },

    getDepthInsights: async (
        battleSlug: string,
        optionId: string,
        ageRange: string = 'all',
        gender: string = 'all',
        commune: string = 'all'
    ): Promise<DepthInsight[]> => {
        const { data, error } = await (sb.rpc as unknown as (fn: string, p: object) => Promise<{ data: DepthInsight[] | null, error: unknown }>)('get_depth_insights', {
            p_battle_slug: battleSlug,
            p_option_id: optionId,
            p_age_range: ageRange,
            p_gender: gender,
            p_commune: commune
        });

        if (error) {
            logger.error('[PlatformService] Error fetching depth insights:', error);
            return [];
        }

        return data || [];
    },

    getSystemHealthMetrics: async (): Promise<SystemHealth> => {
        const { data, error } = await (sb.rpc as unknown as (fn: string) => Promise<{ data: SystemHealth | null, error: unknown }>)('get_system_health_metrics');
        if (error) {
            logger.error('[PlatformService] Error fetching health metrics:', error);
            return { data_quality_score: 0, profile_completeness_avg: 0, signal_integrity_pct: 0 };
        }
        return data || { data_quality_score: 0, profile_completeness_avg: 0, signal_integrity_pct: 0 };
    },

    getKPIActivity: async (): Promise<ActivityKPIs> => {
        const { data, error } = await (sb.rpc as unknown as (fn: string) => Promise<{ data: ActivityKPIs[] | null, error: unknown }>)('get_kpi_activity');
        if (error) {
            logger.error('[PlatformService] Error fetching KPI activity:', error);
            return { dau: 0, wau: 0, mau: 0 };
        }
        return data?.[0] || { dau: 0, wau: 0, mau: 0 };
    },

    getRetentionMetrics: async (): Promise<RetentionMetrics> => {
        const { data, error } = await (sb.rpc as unknown as (fn: string) => Promise<{ data: RetentionMetrics[] | null, error: unknown }>)('get_retention_metrics');
        if (error) {
            logger.error('[PlatformService] Error fetching retention metrics:', error);
            return { retention_day_1: 0, retention_day_7: 0 };
        }
        return data?.[0] || { retention_day_1: 0, retention_day_7: 0 };
    },

    getSuspiciousUsers: async (): Promise<SuspiciousUser[]> => {
        const { data, error } = await sb
            .from("user_stats")
            .select("user_id, trust_score, suspicious_flag, last_signal_at")
            .eq("suspicious_flag", true)
            .order("last_signal_at", { ascending: false });

        if (error) {
            logger.error('[PlatformService] Error fetching suspicious users:', error);
            return [];
        }

        // Use a less restrictive cast to handle schema sync issues
        return (data as unknown) as SuspiciousUser[];
    },

    getTemporalComparison: async (
        battleSlug: string,
        daysBack: number = 7
    ): Promise<TemporalComparison[]> => {
        const { data, error } = await (sb.rpc as unknown as (fn: string, p: object) => Promise<{ data: TemporalComparison[] | null, error: unknown }>)('get_temporal_comparison', {
            p_battle_slug: battleSlug,
            p_days_back: daysBack
        });

        if (error) {
            logger.error('[PlatformService] Error fetching temporal comparison:', error);
            return [];
        }

        return data || [];
    },

    getBattleVolatility: async (
        battleSlug: string,
        daysBack: number = 30
    ): Promise<VolatilityData | null> => {
        const { data, error } = await (sb.rpc as unknown as (fn: string, p: object) => Promise<{ data: VolatilityData[] | null, error: unknown }>)('get_battle_volatility', {
            p_battle_slug: battleSlug,
            p_days_back: daysBack
        });

        if (error) {
            logger.error('[PlatformService] Error fetching battle volatility:', error);
            return null;
        }

        return data?.[0] || null;
    },

    getBattlePolarization: async (battleSlug: string): Promise<PolarizationData | null> => {
        const { data, error } = await (sb.rpc as unknown as (fn: string, p: object) => Promise<{ data: PolarizationData[] | null, error: unknown }>)('get_polarization_index', {
            p_battle_slug: battleSlug
        });

        if (error) {
            logger.error('[PlatformService] Error fetching battle polarization:', error);
            return null;
        }

        return (data?.[0] as PolarizationData) || null;
    },

    getPlatformAlerts: async (limit: number = 10): Promise<PlatformAlert[]> => {
        const { data, error } = await (sb.rpc as unknown as (fn: string, p: object) => Promise<{ data: PlatformAlert[] | null, error: unknown }>)('get_platform_alerts', {
            p_limit: limit
        });

        if (error) {
            logger.error('[PlatformService] Error fetching platform alerts:', error);
            return [];
        }

        return (data as PlatformAlert[]) || [];
    },

    markPlatformAlertRead: async (alertId: string): Promise<boolean> => {
        const { error } = await (sb.rpc as unknown as (fn: string, p: object) => Promise<{ error: unknown }>)('mark_platform_alert_read', {
            p_alert_id: alertId
        });

        if (error) {
            logger.error('[PlatformService] Error marking alert as read:', alertId, error);
            return false;
        }

        return true;
    },

    getSegmentInfluence: async (
        battleSlug: string,
        daysBack: number = 7
    ): Promise<SegmentInfluence[]> => {
        const { data, error } = await (sb.rpc as unknown as (fn: string, p: object) => Promise<{ data: SegmentInfluence[] | null, error: unknown }>)('get_segment_influence', {
            p_battle_slug: battleSlug,
            p_days_back: daysBack
        });

        if (error) {
            logger.error('[PlatformService] Error fetching segment influence:', error);
            return [];
        }

        return data || [];
    },

    getEarlySignals: async (
        battleSlug: string,
        hoursWindow: number = 6
    ): Promise<EarlySignal[]> => {
        const { data, error } = await (sb.rpc as unknown as (fn: string, p: object) => Promise<{ data: EarlySignal[] | null, error: unknown }>)('detect_early_signal', {
            p_battle_slug: battleSlug,
            p_hours_window: hoursWindow
        });

        if (error) {
            logger.error('[PlatformService] Error fetching early signals:', error);
            return [];
        }

        return data || [];
    },

    apiGetRanking: async (
        apiKey: string,
        battleSlug: string
    ): Promise<EnterpriseRanking[]> => {
        const { data, error } = await (sb.rpc as unknown as (fn: string, p: object) => Promise<{ data: EnterpriseRanking[] | null, error: unknown }>)('api_get_ranking', {
            p_api_key: apiKey,
            p_battle_slug: battleSlug
        });

        if (error) {
            logger.error('[PlatformService] Error in API ranking call:', error);
            return [];
        }

        return data || [];
    },

    getClientPlan: async (apiKey: string): Promise<ClientPlanStatus | null> => {
        const { data, error } = await (sb.rpc as unknown as (fn: string, p: object) => Promise<{ data: ClientPlanStatus[] | null, error: unknown }>)('get_client_plan', {
            p_api_key: apiKey
        });

        if (error || !data || data.length === 0) {
            logger.error('[PlatformService] Error fetching client plan:', error);
            return null;
        }

        return data[0];
    },

    generateExecutiveReport: async (
        apiKey: string,
        battleSlug: string,
        daysBack: number = 30
    ): Promise<Record<string, unknown> | null> => {
        const { data, error } = await (sb.rpc as unknown as (fn: string, p: object) => Promise<{ data: Record<string, unknown> | null, error: unknown }>)('generate_executive_report', {
            p_api_key: apiKey,
            p_battle_slug: battleSlug,
            p_days_back: daysBack
        });

        if (error) {
            logger.error('[PlatformService] Error generating executive report:', error);
            return null;
        }

        return data;
    },

    getLatestExecutiveReport: async (
        apiKey: string,
        battleSlug: string
    ): Promise<Record<string, unknown> | null> => {
        const { data, error } = await (sb.rpc as unknown as (fn: string, p: object) => Promise<{ data: Record<string, unknown> | null, error: unknown }>)('get_latest_executive_report', {
            p_api_key: apiKey,
            p_battle_slug: battleSlug
        });

        if (error) {
            logger.error('[PlatformService] Error fetching latest executive report:', error);
            return null;
        }

        return data;
    },

    generateBenchmarkReport: async (
        apiKey: string,
        daysBack: number = 30
    ): Promise<Record<string, unknown> | null> => {
        const { data, error } = await (sb.rpc as unknown as (fn: string, p: object) => Promise<{ data: Record<string, unknown> | null, error: unknown }>)('generate_benchmark_report', {
            p_api_key: apiKey,
            p_days_back: daysBack
        });

        if (error) {
            logger.error('[PlatformService] Error generating benchmark report:', error);
            return null;
        }

        return data;
    },

    getLatestBenchmarkReport: async (
        apiKey: string
    ): Promise<Record<string, unknown> | null> => {
        const { data, error } = await (sb.rpc as unknown as (fn: string, p: object) => Promise<{ data: Record<string, unknown> | null, error: unknown }>)('get_latest_benchmark_report', {
            p_api_key: apiKey
        });

        if (error) {
            logger.error('[PlatformService] Error fetching latest benchmark report:', error);
            return null;
        }

        return data;
    },

    getB2BDashboardStatus: async (): Promise<Record<string, unknown> | null> => {
        const { data, error } = await (sb.rpc as unknown as (fn: string) => Promise<{ data: Record<string, unknown> | null, error: unknown }>)('get_b2b_dashboard_data');

        if (error) {
            logger.error('[PlatformService] Error fetching B2B dashboard status:', error);
            return null;
        }

        return data;
    },

    listExecutiveReports: async (): Promise<Record<string, unknown>[]> => {
        // En un caso real crearíamos un RPC, pero como habilitamos RLS en executive_reports
        // donde el client_id de generated_for sea del usuario, basta con consultar la tabla.
        const { data, error } = await (sb as any)
            .from('executive_reports')
            .select('id, report_type, battle_slug, report_period_days, generated_at')
            .order('generated_at', { ascending: false });

        if (error) {
            logger.error('[PlatformService] Error listing executive reports:', error);
            return [];
        }

        return data || [];
    }
} as const;
