import { supabase as sb } from "../../../supabase/client";
import { logger } from "../../../lib/logger";
import { B2BBattleAnalytics, B2BEligibility, ClientPlanStatus } from "./insightsTypes";

export const b2bAnalyticsService = {
    getB2BBattleAnalytics: async (battleId: string): Promise<B2BBattleAnalytics | null> => {
        const { data, error } = await (sb.rpc as unknown as (fn: string, p: object) => Promise<{ data: B2BBattleAnalytics[] | null, error: unknown }>)('get_b2b_battle_analytics', {
            p_battle_id: battleId
        });

        if (error) {
            logger.error('[InsightsService] Error fetching B2B Battle Analytics:', error);
            return null;
        }

        return data?.[0] || null;
    },

    getPremiumEligibility: async (entityId: string, moduleType: 'versus' | 'news' | 'depth'): Promise<B2BEligibility | null> => {
        const { data, error } = await (sb.rpc as unknown as (fn: string, p: object) => Promise<{ data: B2BEligibility[] | null, error: unknown }>)('get_premium_eligibility_v1_1', {
            p_entity_id: entityId,
            p_module_type: moduleType
        });

        if (error) {
            logger.error('[InsightsService] Error fetching Premium Eligibility:', error);
            return null;
        }

        return data?.[0] || null;
    },

    getB2BDashboardStatus: async (): Promise<Record<string, unknown> | null> => {
        const { data, error } = await (sb.rpc as unknown as (fn: string) => Promise<{ data: Record<string, unknown> | null, error: unknown }>)('get_b2b_dashboard_data');

        if (error) {
            logger.error('[InsightsService] Error fetching B2B dashboard status:', error);
            return null;
        }

        return data;
    },

    getClientPlan: async (apiKey: string): Promise<ClientPlanStatus | null> => {
        const { data, error } = await (sb.rpc as unknown as (fn: string, p: object) => Promise<{ data: ClientPlanStatus[] | null, error: unknown }>)('get_client_plan', {
            p_api_key: apiKey
        });

        if (error || !data || data.length === 0) {
            logger.error('[InsightsService] Error fetching client plan:', error);
            return null;
        }

        return data[0];
    }
};
