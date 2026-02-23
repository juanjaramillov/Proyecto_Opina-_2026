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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shouldFallbackToLegacy(error: any, fnName: string) {
    const msg = String(error?.message || '')
    return msg.includes(fnName) || msg.toLowerCase().includes('function') || msg.toLowerCase().includes('not found')
}

export const resultsAggService = {
    async getCategoryOverview(categorySlug: string, days: number = 14, filters: SegmentFilters = {}) {
        const { gender = null, age_bucket = null, region = null } = filters

        const args = {
            p_category_slug: categorySlug,
            p_days: days,
            p_gender: gender,
            p_age_bucket: age_bucket,
            p_region: region,
        }

        // LIVE first
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const live = await (supabase.rpc as any)('get_category_overview_live', args)

        if (!live.error) {
            return (live.data as unknown as CategoryOverviewRow[]) || []
        }

        // fallback legacy
        if (shouldFallbackToLegacy(live.error, 'get_category_overview_live')) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const legacy = await (supabase.rpc as any)('get_category_overview_agg', args)
            if (legacy.error) {
                logger.error('get_category_overview_agg error:', legacy.error)
                throw legacy.error
            }
            return (legacy.data as unknown as CategoryOverviewRow[]) || []
        }

        logger.error('get_category_overview_live error:', live.error)
        throw live.error
    },

    async getEntityTrend(entityId: string, days: number = 30, filters: SegmentFilters = {}) {
        const { gender = null, age_bucket = null, region = null } = filters

        const args = {
            p_entity_id: entityId,
            p_days: days,
            p_gender: gender,
            p_age_bucket: age_bucket,
            p_region: region,
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const live = await (supabase.rpc as any)('get_entity_trend_live', args)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!live.error) return (live.data as any[]) || []

        if (shouldFallbackToLegacy(live.error, 'get_entity_trend_live')) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const legacy = await (supabase.rpc as any)('get_entity_trend_agg', args)
            if (legacy.error) {
                logger.error('get_entity_trend_agg error:', legacy.error)
                throw legacy.error
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (legacy.data as any[]) || []
        }

        logger.error('get_entity_trend_live error:', live.error)
        throw live.error
    },
}
