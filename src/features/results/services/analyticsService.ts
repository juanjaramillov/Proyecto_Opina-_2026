import { supabase } from '../../../supabase/client';
import { logger } from '../../../lib/logger';
import { cached } from "../../../lib/requestCache";

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
    async getAdvancedResults(categorySlug: string, filters: AnalyticsFilters = {}): Promise<AdvancedResult[]> {
        const key = `analytics:getAdvancedResults:${categorySlug}:${filters.gender ?? ""}:${filters.age_bucket ?? ""}:${filters.region ?? ""}`;
        return cached(key, 20_000, async () => {
            const { data, error } = await supabase.rpc('get_advanced_results', {
                p_category_slug: categorySlug,
                p_gender: filters.gender || undefined,
                p_age_bucket: filters.age_bucket || undefined,
                p_region: filters.region || undefined
            });

            if (error) {
                logger.error('Error fetching advanced results:', error);
                throw error;
            }

            return (data as unknown as AdvancedResult[]) || [];
        });
    },

    /**
     * (Deprecated) Fetches depth distribution values for a specific question/mark.
     * Mantenido por retrocompatibilidad por ahora.
     */
    async getDepthDistribution(optionId: string, questionKey: string = 'nota_general') {
        const { data, error } = await (supabase as any).rpc('get_depth_distribution_values', {
            p_option_id: optionId,
            p_context_id: questionKey
        });

        if (error) throw error;
        return data;
    },

    /**
     * Extrae todos los Insights y Distribuciones de TODAS las preguntas de Profundidad de una Entidad.
     */
    async getEntityDepthInsights(entityId: string): Promise<any[]> {
        const key = `analytics:getEntityDepthInsights:${entityId}`;
        return cached(key, 5 * 60_000, async () => {
            const { data, error } = await (supabase as any).rpc('get_depth_insights', {
                p_entity_id: entityId
            });

            if (error) {
                logger.error(`Error fetching depth insights for entity ${entityId}:`, error);
                throw error;
            }

            return data || [];
        });
    }
};
