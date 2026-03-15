import { supabase as sb } from "../../../supabase/client";
import { logger } from "../../../lib/logger";

export interface DepthInsight {
    question_id: string;
    total_responses: number;
    average_score: number;
}

export interface TemporalComparison {
    option_id: string;
    current_score: number;
    past_score: number;
    variation: number;
    variation_percent: number;
}

export interface B2BBattleAnalytics {
    battle_id: string;
    stats_version: string;
    total_effective_weight: number;
    n_eff: number;
    options_count: number;
    analytics_payload: Record<string, any>[];
    global_entropy_normalized: number;
    global_fragmentation_label: string;
}

export interface B2BEligibility {
    entity_id: string;
    opinascore_value: number;
    opinascore_base: number;
    integrity_multiplier: number;
    opinascore_version: string;
    opinascore_context: string;
    eligibility_status: 'PUBLISHABLE' | 'EXPLORATORY' | 'INTERNAL_ONLY';
    eligibility_reasons: string[];
    integrity_score: number;
    integrity_flags: string[];
    n_eff: number;
    technical_tie_flag: boolean;
    stability_label: string;
    entropy_normalized: number;
    decay_applied: boolean;
    stats_version: string;
}

export interface IntegrityFlags {
    integrity_score: number;
    flag_device_concentration: boolean;
    flag_velocity_burst: boolean;
    flag_repetitive_pattern: boolean;
    analysis_warning_label: string;
}

export interface VolatilityData {
    volatility_score: number;
    volatility_index: number;
    classification: 'stable' | 'moderate' | 'volatile';
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

export const insightsService = {
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
            logger.error('[InsightsService] Error generating executive report:', error);
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
            logger.error('[InsightsService] Error fetching latest executive report:', error);
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
            logger.error('[InsightsService] Error generating benchmark report:', error);
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
            logger.error('[InsightsService] Error fetching latest benchmark report:', error);
            return null;
        }

        return data;
    },

    getB2BDashboardStatus: async (): Promise<Record<string, unknown> | null> => {
        const { data, error } = await (sb.rpc as unknown as (fn: string) => Promise<{ data: Record<string, unknown> | null, error: unknown }>)('get_b2b_dashboard_data');

        if (error) {
            logger.error('[InsightsService] Error fetching B2B dashboard status:', error);
            return null;
        }

        return data;
    },

    listExecutiveReports: async (): Promise<Record<string, unknown>[]> => {
        const { data, error } = await sb
            .from('executive_reports')
            .select('id, report_type, battle_slug, report_period_days, generated_at')
            .order('generated_at', { ascending: false });

        if (error) {
            logger.error('[InsightsService] Error listing executive reports:', error);
            return [];
        }

        return data || [];
    },

    getBattleAiSummary: async (battleSlug: string): Promise<string | null> => {
        const { data, error } = await sb
            .from('battles')
            .select('ai_summary')
            .eq('slug', battleSlug)
            .single();
            
        if (error) {
            logger.error('[InsightsService] Error fetching AI summary:', error);
            return null;
        }
        return data?.ai_summary || null;
    },

    generateAiSummary: async (battleSlug: string): Promise<string | null> => {
        const { data: { session } } = await sb.auth.getSession();
        const token = session?.access_token;
        if (!token) return null;

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://neltawfiwpvunkwyvfse.supabase.co';

        const response = await fetch(`${supabaseUrl}/functions/v1/insights-generator`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ battle_slug: battleSlug })
        });
        
        if (!response.ok) {
            logger.error('[InsightsService] Error generating AI summary:', await response.text());
            return null;
        }
        
        const result = await response.json();
        return result.ai_summary || null;
    }
} as const;
