import { supabase } from '../../../supabase/client';
import { logger } from '../../../lib/logger';

export interface AdvancedResult {
    entity_id: string;
    entity_name: string;
    preference_rate: number;
    avg_quality: number;
    total_signals: number;
    gap_score: number;
}

export interface AnalyticsFilters {
    gender?: string;
    age_bucket?: string;
    region?: string;
}

export const analyticsService = {
    /**
     * Fetches advanced results for a category with optional demographic filters.
     */
    async getAdvancedResults(categorySlug: string, filters: AnalyticsFilters = {}): Promise<AdvancedResult[]> {
        // @ts-expect-error: RPC not yet in Database types
        const { data, error } = await supabase.rpc('get_advanced_results', {
            p_category_slug: categorySlug,
            p_gender: filters.gender || null,
            p_age_bucket: filters.age_bucket || null,
            p_region: filters.region || null
        });

        if (error) {
            logger.error('Error fetching advanced results:', error);
            throw error;
        }

        return (data as unknown as AdvancedResult[]) || [];
    },

    /**
     * Fetches depth distribution for a specific question/mark.
     */
    async getDepthDistribution(optionId: string, questionKey: string = 'nota_general') {
        const { data, error } = await supabase
            .from('signal_events')
            .select('value_numeric')
            .eq('option_id', optionId)
            .eq('context_id', questionKey)
            .eq('module_type', 'depth');

        if (error) throw error;
        return data;
    }
};
