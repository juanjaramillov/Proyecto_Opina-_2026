import { supabase } from "../../../supabase/client";
import { logger } from "../../../lib/logger";

export interface ModulePriorityMetric {
    module_slug: string;
    score: number;
    clicks: number;
    views: number;
    ctr: number;
    insight: string;
    preview_type: string;
}

export interface SegmentedDemandMetric {
    module_slug: string;
    segment_value: string;
    views: number;
    clicks: number;
    ctr: number;
}

export const modulesPriorityService = {
    /**
     * Fetches demand data and calculates priority score.
     * Score formula: (clicks * 3) + (views * 1) + (ctr * 100 * 2)
     */
    async getModulesPriority(rangeDays: number = 30): Promise<ModulePriorityMetric[]> {
        const { data, error } = await (supabase.rpc as any)('admin_modules_demand_summary', {
            p_range_days: rangeDays
        });

        if (error) {
            logger.error('[modulesPriorityService] Error fetching demand for priority:', error);
            throw error;
        }

        const rawModules = (data || []) as any[];

        const rankedModules: ModulePriorityMetric[] = rawModules.map(m => {
            const clicks = Number(m.clicks || 0);
            const views = Number(m.views || 0);
            const ctrRaw = Number(m.ctr || 0); // This is already clicks/views * 100 from RPC

            // Formula: (clicks * 3) + (views * 1) + (ctr * 2)
            // Note: the prompt says (ctr * 100 * 2), but my RPC already returns ctr as percentage (0-100).
            const score = (clicks * 3) + (views * 1) + (ctrRaw * 2);

            let insight = "Interés estable";
            if (clicks > 20) insight = "Alta intención";
            else if (views > 100 && ctrRaw < 3) insight = "Curiosidad, falta gancho";
            else if (ctrRaw > 10 && views < 30) insight = "Nicho potente";
            else if (clicks > 5 && ctrRaw > 15) insight = "Muy prometedor";

            return {
                module_slug: m.module_slug,
                preview_type: m.preview_type,
                score: Number(score.toFixed(1)),
                clicks,
                views,
                ctr: ctrRaw,
                insight
            };
        });

        // Sort by score DESC
        return rankedModules.sort((a, b) => b.score - a.score);
    },

    async getModulesDemandSegmented(rangeDays: number, segmentDim: 'comuna' | 'gender' | 'age_range'): Promise<SegmentedDemandMetric[]> {
        const { data, error } = await (supabase.rpc as any)('admin_modules_demand_segmented', {
            p_range_days: rangeDays,
            p_segment_dim: segmentDim
        });

        if (error) {
            logger.error('Error fetching segmented module demand:', error);
            throw error;
        }

        return (data as any[]) || [];
    }
};
