import { supabase as sb } from "../../../supabase/client";
import { logger } from "../../../lib/logger";
import {
    DepthInsight,
    IntegrityFlags,
    TemporalComparison,
    VolatilityData,
    PolarizationData,
    SegmentInfluence,
    EarlySignal,
    EnterpriseRanking
} from "./insightsTypes";

export const advancedInsightsService = {
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
            logger.error('[InsightsService] Error fetching depth insights:', error);
            return [];
        }

        return data || [];
    },

    getAnalyticalIntegrity: async (entityId: string): Promise<IntegrityFlags | null> => {
        const { data, error } = await (sb.rpc as unknown as (fn: string, p: object) => Promise<{ data: IntegrityFlags[] | null, error: unknown }>)('get_analytical_integrity_flags', {
            p_entity_id: entityId
        });

        if (error) {
            logger.error('[InsightsService] Error fetching Analytical Integrity:', error);
            return null;
        }

        return data?.[0] || null;
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
            logger.error('[InsightsService] Error fetching temporal comparison:', error);
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
            logger.error('[InsightsService] Error fetching battle volatility:', error);
            return null;
        }

        return data?.[0] || null;
    },

    getBattlePolarization: async (battleSlug: string): Promise<PolarizationData | null> => {
        const { data, error } = await (sb.rpc as unknown as (fn: string, p: object) => Promise<{ data: PolarizationData[] | null, error: unknown }>)('get_polarization_index', {
            p_battle_slug: battleSlug
        });

        if (error) {
            logger.error('[InsightsService] Error fetching battle polarization:', error);
            return null;
        }

        return (data?.[0] as PolarizationData) || null;
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
            logger.error('[InsightsService] Error fetching segment influence:', error);
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
            logger.error('[InsightsService] Error fetching early signals:', error);
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
            logger.error('[InsightsService] Error in API ranking call:', error);
            return [];
        }

        return data || [];
    }
};
