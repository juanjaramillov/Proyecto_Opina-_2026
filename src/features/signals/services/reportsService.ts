import { supabase as sb } from "../../../supabase/client";
import { logger } from "../../../lib/logger";

export const reportsService = {
    generateExecutiveReport: async (
        apiKey: string,
        battleSlug: string,
        daysBack: number = 30
    ): Promise<Record<string, unknown> | null> => {
        const { data, error } = await sb.rpc('generate_executive_report', {
            p_api_key: apiKey,
            p_battle_slug: battleSlug,
            p_days_back: daysBack
        });

        if (error) {
            logger.error('[InsightsService] Error generating executive report:', error);
            return null;
        }

        return (data as Record<string, unknown>) || null;
    },

    getLatestExecutiveReport: async (
        apiKey: string,
        battleSlug: string
    ): Promise<Record<string, unknown> | null> => {
        const { data, error } = await sb.rpc('get_latest_executive_report', {
            p_api_key: apiKey,
            p_battle_slug: battleSlug
        });

        if (error) {
            logger.error('[InsightsService] Error fetching latest executive report:', error);
            return null;
        }

        return (data as Record<string, unknown>) || null;
    },

    generateBenchmarkReport: async (
        apiKey: string,
        daysBack: number = 30
    ): Promise<Record<string, unknown> | null> => {
        const { data, error } = await sb.rpc('generate_benchmark_report', {
            p_api_key: apiKey,
            p_days_back: daysBack
        });

        if (error) {
            logger.error('[InsightsService] Error generating benchmark report:', error);
            return null;
        }

        return (data as Record<string, unknown>) || null;
    },

    getLatestBenchmarkReport: async (
        apiKey: string
    ): Promise<Record<string, unknown> | null> => {
        const { data, error } = await sb.rpc('get_latest_benchmark_report', {
            p_api_key: apiKey
        });

        if (error) {
            logger.error('[InsightsService] Error fetching latest benchmark report:', error);
            return null;
        }

        return (data as Record<string, unknown>) || null;
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

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        if (!supabaseUrl) {
            logger.error('[InsightsService] VITE_SUPABASE_URL is not defined in environment variables');
            return null;
        }

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
};
