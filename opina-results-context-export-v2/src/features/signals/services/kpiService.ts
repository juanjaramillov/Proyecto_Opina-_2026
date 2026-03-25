import { supabase as sb } from "../../../supabase/client";
import { logger } from "../../../lib/logger";

export interface ActivityKPIs {
    dau: number;
    wau: number;
    mau: number;
}

export interface RetentionMetrics {
    retention_day_1: number;
    retention_day_7: number;
}

export type ShareOfPreferenceRow = {
    option_label: string;
    option_id: string;
    signals_count: number;
    weighted_signals: number;
    share_pct: number;
};

export type TrendVelocityRow = {
    option_id: string;
    delta_signals: number;
};

export type EngagementQualityRow = {
    total_signals: number;
    weighted_total: number;
    verified_share_pct: number;
    avg_profile_completeness: number;
};

export const kpiService = {
    getKPIActivity: async (): Promise<ActivityKPIs> => {
        const { data, error } = await (sb.rpc as unknown as (fn: string) => Promise<{ data: ActivityKPIs[] | null, error: unknown }>)('get_kpi_activity');
        if (error) {
            logger.error('[KPIService] Error fetching KPI activity:', error);
            return { dau: 0, wau: 0, mau: 0 };
        }
        return data?.[0] || { dau: 0, wau: 0, mau: 0 };
    },

    getRetentionMetrics: async (): Promise<RetentionMetrics> => {
        const { data, error } = await (sb.rpc as unknown as (fn: string) => Promise<{ data: RetentionMetrics[] | null, error: unknown }>)('get_retention_metrics');
        if (error) {
            logger.error('[KPIService] Error fetching retention metrics:', error);
            return { retention_day_1: 0, retention_day_7: 0 };
        }
        return data?.[0] || { retention_day_1: 0, retention_day_7: 0 };
    },

    getShareOfPreference: async (
        battleId: string,
        startDate?: string,
        endDate?: string
    ): Promise<ShareOfPreferenceRow[]> => {
        const { data, error } = await (sb.rpc as unknown as (fn: string, args?: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>)('kpi_share_of_preference', {
            p_battle_id: battleId,
            p_start_date: startDate || undefined,
            p_end_date: endDate || undefined,
        });

        if (error) {
            logger.error('[KPI Share] Error:', error);
            return [];
        }
        return (data ?? []) as unknown as ShareOfPreferenceRow[];
    },

    getTrendVelocity: async (
        battleId: string,
        bucket: 'hour' | 'day' | 'week' = 'day',
        startDate?: string,
        endDate?: string
    ): Promise<TrendVelocityRow[]> => {
        const { data, error } = await (sb.rpc as unknown as (fn: string, args?: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>)('kpi_trend_velocity', {
            p_battle_id: battleId,
            p_bucket: bucket,
            p_start_date: startDate || undefined,
            p_end_date: endDate || undefined,
        });

        if (error) {
            logger.error('[KPI Trend] Error:', error);
            return [];
        }
        return (data ?? []) as unknown as TrendVelocityRow[];
    },

    async getEngagementQuality(
        battleId: string,
        startDate?: string,
        endDate?: string
    ): Promise<EngagementQualityRow[]> {
        const { data, error } = await (sb.rpc as unknown as (fn: string, args?: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>)('kpi_engagement_quality', {
            p_battle_id: battleId,
            p_start_date: startDate || undefined,
            p_end_date: endDate || undefined,
        });

        if (error) {
            logger.error('[KPI Quality] Error:', error);
            return [];
        }
        return (data ?? []) as unknown as EngagementQualityRow[];
    }
} as const;
