import { logger } from "../../../lib/logger";
import { typedRpc } from "../../../supabase/typedRpc";

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

export interface TemporalMovieRow {
    time_bucket: string;
    option_id: string;
    option_label: string;
    n_eff: number;
    share_pct: number;
    tendencia: number;
    aceleracion: number;
    volatilidad: number;
    persistencia: number;
}

export const kpiService = {
    getKPIActivity: async (): Promise<ActivityKPIs> => {
        const { data, error } = await typedRpc<ActivityKPIs[]>('get_kpi_activity');
        if (error) {
            logger.error('[KPIService] Error fetching KPI activity:', undefined, error);
            return { dau: 0, wau: 0, mau: 0 };
        }
        return data?.[0] || { dau: 0, wau: 0, mau: 0 };
    },

    getRetentionMetrics: async (): Promise<RetentionMetrics> => {
        const { data, error } = await typedRpc<RetentionMetrics[]>('get_retention_metrics');
        if (error) {
            logger.error('[KPIService] Error fetching retention metrics:', undefined, error);
            return { retention_day_1: 0, retention_day_7: 0 };
        }
        return data?.[0] || { retention_day_1: 0, retention_day_7: 0 };
    },

    getShareOfPreference: async (
        battleId: string,
        startDate?: string,
        endDate?: string
    ): Promise<ShareOfPreferenceRow[]> => {
        const { data, error } = await typedRpc<ShareOfPreferenceRow[]>('kpi_share_of_preference', {
            p_battle_id: battleId,
            p_start_date: startDate || undefined,
            p_end_date: endDate || undefined,
        });

        if (error) {
            logger.error('[KPI Share] Error:', undefined, error);
            return [];
        }
        return data ?? [];
    },

    getTrendVelocity: async (
        battleId: string,
        bucket: 'hour' | 'day' | 'week' = 'day',
        startDate?: string,
        endDate?: string
    ): Promise<TrendVelocityRow[]> => {
        const { data, error } = await typedRpc<TrendVelocityRow[]>('kpi_trend_velocity', {
            p_battle_id: battleId,
            p_bucket: bucket,
            p_start_date: startDate || undefined,
            p_end_date: endDate || undefined,
        });

        if (error) {
            logger.error('[KPI Trend] Error:', undefined, error);
            return [];
        }
        return data ?? [];
    },

    async getEngagementQuality(
        battleId: string,
        startDate?: string,
        endDate?: string
    ): Promise<EngagementQualityRow[]> {
        const { data, error } = await typedRpc<EngagementQualityRow[]>('kpi_engagement_quality', {
            p_battle_id: battleId,
            p_start_date: startDate || undefined,
            p_end_date: endDate || undefined,
        });

        if (error) {
            logger.error('[KPI Quality] Error:', undefined, error);
            return [];
        }
        return data ?? [];
    },

    getTemporalMovieKPIs: async (
        battleId: string,
        bucketType: 'day' | 'week' | 'month' = 'day'
    ): Promise<TemporalMovieRow[]> => {
        const { data, error } = await typedRpc<TemporalMovieRow[]>('calculate_temporal_movie', {
            p_battle_id: battleId,
            p_bucket_type: bucketType,
        });

        if (error) {
            logger.error('[KPI Temporal Movie] Error:', undefined, error);
            return [];
        }
        return data ?? [];
    }
} as const;
