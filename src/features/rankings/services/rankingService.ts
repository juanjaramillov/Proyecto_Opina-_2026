import { supabase } from '../../../supabase/client';
import { logger } from '../../../lib/logger';

export interface RankSnapshot {
    id: string;
    entity_id: string;
    category_slug: string;
    composite_index: number;
    preference_score: number;
    quality_score: number;
    snapshot_date: string;
    segment_id: string;
    trend?: 'up' | 'down' | 'stable';
    entity?: {
        name: string;
        image_url?: string;
    };
}

export interface Attribute {
    id: string;
    slug: string;
    name: string;
}

export interface RankingItem {
    option_id: string;
    position: number;
    trend: 'up' | 'down' | 'stable';
}

export interface PublicRankingResponse {
    ranking: RankingItem[];
    totalSignals: number;
    updatedAt: string;
}

type LatestRow = {
    id: string;
    entity_id: string;
    category_slug: string;
    composite_index: number;
    preference_score: number;
    quality_score: number;
    snapshot_date: string;
    segment_id: string;
    trend: 'up' | 'down' | 'stable';
    entity_name: string;
    image_url: string | null;
};

export const rankingService = {
    /**
     * Gets the latest rankings for a category and segment (already includes trend).
     * Uses RPC to avoid downloading the entire history.
     */
    async getLatestRankings(categorySlug: string, segmentId: string = 'global'): Promise<RankSnapshot[]> {
        const { data, error } = await (supabase.rpc as any)('get_entity_rankings_latest', {
            p_category_slug: categorySlug,
            p_segment_id: segmentId
        });

        if (error) {
            logger.error('Error fetching rankings (RPC):', error);
            throw error;
        }

        const rows = (data as unknown as LatestRow[]) || [];

        return rows.map(r => ({
            id: r.id,
            entity_id: r.entity_id,
            category_slug: r.category_slug,
            composite_index: Number(r.composite_index),
            preference_score: Number(r.preference_score),
            quality_score: Number(r.quality_score),
            snapshot_date: r.snapshot_date,
            segment_id: r.segment_id,
            trend: r.trend,
            entity: {
                name: r.entity_name,
                image_url: r.image_url || undefined
            }
        }));
    },

    /**
     * Compatibility: Gets an attribute (category) by slug.
     */
    async getAttributeBySlug(slug: string): Promise<Attribute | null> {
        const { data, error } = await supabase
            .from('categories')
            .select('id, slug, name')
            .eq('slug', slug)
            .maybeSingle();

        if (error || !data) return null;
        return data as Attribute;
    },

    /**
     * Legacy/Compatibility: Public ranking data.
     */
    async getPublicRanking(categoryId: string, _segmentHash: string): Promise<PublicRankingResponse | null> {
        const { data: cat } = await supabase.from('categories').select('slug').eq('id', categoryId).maybeSingle();
        if (!cat) return null;

        const rankings = await this.getLatestRankings(cat.slug);

        return {
            ranking: rankings.map((r, idx) => ({
                option_id: r.entity_id,
                position: idx + 1,
                trend: r.trend || 'stable'
            })),
            totalSignals: 0,
            updatedAt: rankings[0]?.snapshot_date || new Date().toISOString()
        };
    }
};
