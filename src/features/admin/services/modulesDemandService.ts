import { supabase } from "../../../supabase/client";
import { logger } from "../../../lib/logger";

export interface ModuleDemandMetric {
    module_slug: string;
    preview_type: string;
    views: number;
    clicks: number;
    ctr: number;
}

export interface ModuleDemandSummary {
    total_views: number;
    total_clicks: number;
    global_ctr: number;
    modules_detail: ModuleDemandMetric[];
}

export interface TopFilterMetric {
    module_slug: string;
    filter_key: string;
    filter_value: string;
    usage_count: number;
}

export const modulesDemandService = {
    /**
     * Fetches aggregated module demand summary using RPC.
     */
    async getModulesDemandSummary(rangeDays: number = 30): Promise<ModuleDemandSummary> {
        const { data, error } = await (supabase.rpc as any)('admin_modules_demand_summary', {
            p_range_days: rangeDays
        });

        if (error) {
            logger.error('[modulesDemandService] Error calling admin_modules_demand_summary:', error);
            throw error;
        }

        const events = (data || []) as any[];

        // Totals from the returned detail
        const total_views = events.reduce((acc, curr) => acc + Number(curr.views || 0), 0);
        const total_clicks = events.reduce((acc, curr) => acc + Number(curr.clicks || 0), 0);
        const global_ctr = total_views > 0 ? (total_clicks / total_views) * 100 : 0;

        return {
            total_views,
            total_clicks,
            global_ctr: Number(global_ctr.toFixed(2)),
            modules_detail: events.map(m => ({
                module_slug: m.module_slug || 'unknown',
                preview_type: m.preview_type || 'unknown',
                views: Number(m.views || 0),
                clicks: Number(m.clicks || 0),
                ctr: Number(m.ctr || 0)
            }))
        };
    },

    /**
     * Fetches top filters used in module previews.
     */
    async getTopFilters(rangeDays: number = 30): Promise<TopFilterMetric[]> {
        const { data, error } = await (supabase.rpc as any)('admin_modules_top_filters', {
            p_range_days: rangeDays
        });

        if (error) {
            logger.error('[modulesDemandService] Error calling admin_modules_top_filters:', error);
            throw error;
        }

        const filters = (data || []) as any[];

        return filters.map(f => ({
            module_slug: f.module_slug || 'unknown',
            filter_key: f.filter_key || 'unknown',
            filter_value: f.filter_value || 'unknown',
            usage_count: Number(f.usage_count || 0)
        }));
    }
};
