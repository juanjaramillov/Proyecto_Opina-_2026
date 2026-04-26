import { logger } from "../../../lib/logger";
import { typedRpc } from "../../../supabase/typedRpc";
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
        const { data, error } = await typedRpc<DepthInsight[]>('get_depth_insights', {
            p_battle_slug: battleSlug,
            p_option_id: optionId,
            p_age_range: ageRange,
            p_gender: gender,
            p_commune: commune
        });

        if (error) {
            logger.error('[InsightsService] Error fetching depth insights:', undefined, error);
            return [];
        }

        return data || [];
    },

    getAnalyticalIntegrity: async (entityId: string): Promise<IntegrityFlags | null> => {
        const { data, error } = await typedRpc<IntegrityFlags[]>('get_analytical_integrity_flags', {
            p_entity_id: entityId
        });

        if (error) {
            logger.error('[InsightsService] Error fetching Analytical Integrity:', undefined, error);
            return null;
        }

        return data?.[0] || null;
    },

    getTemporalComparison: async (
        battleSlug: string,
        daysBack: number = 7
    ): Promise<TemporalComparison[]> => {
        const { data, error } = await typedRpc<TemporalComparison[]>('get_temporal_comparison', {
            p_battle_slug: battleSlug,
            p_days_back: daysBack
        });

        if (error) {
            logger.error('[InsightsService] Error fetching temporal comparison:', undefined, error);
            return [];
        }

        return data || [];
    },

    getBattleVolatility: async (
        battleSlug: string,
        daysBack: number = 30
    ): Promise<VolatilityData | null> => {
        const { data, error } = await typedRpc<VolatilityData[]>('get_battle_volatility', {
            p_battle_slug: battleSlug,
            p_days_back: daysBack
        });

        if (error) {
            logger.error('[InsightsService] Error fetching battle volatility:', undefined, error);
            return null;
        }

        return data?.[0] || null;
    },

    getBattlePolarization: async (battleSlug: string): Promise<PolarizationData | null> => {
        const { data, error } = await typedRpc<PolarizationData[]>('get_polarization_index', {
            p_battle_slug: battleSlug
        });

        if (error) {
            logger.error('[InsightsService] Error fetching battle polarization:', undefined, error);
            return null;
        }

        return data?.[0] || null;
    },

    getSegmentInfluence: async (
        battleSlug: string,
        daysBack: number = 7
    ): Promise<SegmentInfluence[]> => {
        const { data, error } = await typedRpc<SegmentInfluence[]>('get_segment_influence', {
            p_battle_slug: battleSlug,
            p_days_back: daysBack
        });

        if (error) {
            logger.error('[InsightsService] Error fetching segment influence:', undefined, error);
            return [];
        }

        return data || [];
    },

    getEarlySignals: async (
        battleSlug: string,
        hoursWindow: number = 6
    ): Promise<EarlySignal[]> => {
        const { data, error } = await typedRpc<EarlySignal[]>('detect_early_signal', {
            p_battle_slug: battleSlug,
            p_hours_window: hoursWindow
        });

        if (error) {
            logger.error('[InsightsService] Error fetching early signals:', undefined, error);
            return [];
        }

        return data || [];
    },

    apiGetRanking: async (
        apiKey: string,
        battleSlug: string
    ): Promise<EnterpriseRanking[]> => {
        const { data, error } = await typedRpc<EnterpriseRanking[]>('api_get_ranking', {
            p_api_key: apiKey,
            p_battle_slug: battleSlug
        });

        if (error) {
            logger.error('[InsightsService] Error in API ranking call:', undefined, error);
            return [];
        }

        return data || [];
    }
};
