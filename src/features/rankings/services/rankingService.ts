import { supabase } from '../../../supabase/client';

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

export const rankingService = {
    /**
     * Gets the latest rankings for a category and calculates trends.
     */
    async getLatestRankings(categorySlug: string, segmentId: string = 'global'): Promise<RankSnapshot[]> {
        const { data, error } = await supabase
            // @ts-expect-error: entity_rank_snapshots is a new table not yet in Database types
            .from('entity_rank_snapshots')
            .select(`
                *,
                entity:entities(name, image_url)
            `)
            .eq('category_slug', categorySlug)
            .eq('segment_id', segmentId)
            .order('snapshot_date', { ascending: false });

        if (error) {
            console.error('Error fetching rankings:', error);
            throw error;
        }

        if (!data || data.length === 0) return [];

        interface RawRankRecord extends RankSnapshot {
            entity: { name: string; image_url?: string };
        }

        const rawData = data as unknown as RawRankRecord[];

        // Get unique entities from the latest snapshot batch
        const latestDate = rawData[0].snapshot_date;
        const currentRankings = rawData.filter(r => r.snapshot_date === latestDate);

        // Find previous snapshots to calculate trend
        const previousRankings = rawData.filter(r => r.snapshot_date !== latestDate);

        return currentRankings.map(curr => {
            const prev = previousRankings.find(p => p.entity_id === curr.entity_id);
            let trend: 'up' | 'down' | 'stable' = 'stable';

            if (prev) {
                if (curr.composite_index > prev.composite_index) trend = 'up';
                else if (curr.composite_index < prev.composite_index) trend = 'down';
            }

            return {
                ...curr,
                trend,
                entity: curr.entity
            };
        });
    },

    /**
     * Legacy/Compatibility: Gets an attribute by slug.
     * In V12 we use categories, but this keeps PublicRankingPage working.
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
     * Legacy/Compatibility: Gets public ranking data.
     */
    async getPublicRanking(categoryId: string, _segmentHash: string): Promise<PublicRankingResponse | null> {
        // We use the category slug if available, otherwise we map back
        const { data: cat } = await supabase.from('categories').select('slug').eq('id', categoryId).maybeSingle();
        if (!cat) return null;

        const rankings = await this.getLatestRankings(cat.slug);

        return {
            ranking: rankings.map((r, idx) => ({
                option_id: r.entity_id,
                position: idx + 1,
                trend: r.trend || 'stable'
            })),
            totalSignals: rankings.reduce((acc, r) => acc + (r.preference_score * 10 || 5), 0), // Mocked signals count
            updatedAt: rankings[0]?.snapshot_date || new Date().toISOString()
        };
    }
};
