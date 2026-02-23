import { supabase } from '../../../supabase/client'
import { logger } from '../../../lib/logger'

export type SegmentFilters = {
    gender?: string | null
    age_bucket?: string | null
    region?: string | null
}

export type CategoryOverviewRow = {
    entity_id: string
    entity_name: string
    image_url: string | null
    signals_count: number
    unique_users: number
    preference_score: number
    depth_nota_avg: number | null
}

export const resultsAggService = {
    async getCategoryOverview(categorySlug: string, days: number = 14, filters: SegmentFilters = {}) {
        const { gender = null, age_bucket = null, region = null } = filters

        const { data, error } = await (supabase.rpc as any)('get_category_overview_agg', {
            p_category_slug: categorySlug,
            p_days: days,
            p_gender: gender,
            p_age_bucket: age_bucket,
            p_region: region,
        })

        if (error) {
            logger.error('get_category_overview_agg error:', error)
            throw error
        }

        return (data as unknown as CategoryOverviewRow[]) || []
    },

    async getEntityTrend(entityId: string, days: number = 30, filters: SegmentFilters = {}) {
        const { gender = null, age_bucket = null, region = null } = filters

        const { data, error } = await (supabase.rpc as any)('get_entity_trend_agg', {
            p_entity_id: entityId,
            p_days: days,
            p_gender: gender,
            p_age_bucket: age_bucket,
            p_region: region,
        })

        if (error) {
            logger.error('get_entity_trend_agg error:', error)
            throw error
        }

        return (data as any[]) || []
    },
}
