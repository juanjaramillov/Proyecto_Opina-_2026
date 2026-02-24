import { supabase } from '../../../supabase/client';
import { logger } from '../../../lib/logger';

export interface RankSnapshot {
    id: string;
    entity_id: string;
    category_slug: string; // compatibility
    composite_index: number; // compatibility
    preference_score: number; // compatibility
    quality_score: number; // compatibility
    snapshot_date: string;
    segment_id: string; // compatibility
    trend?: 'up' | 'down' | 'stable';
    entity?: {
        name: string;
        image_url?: string;
    };
    // Nuevas P6.4
    module_type?: 'versus' | 'progressive';
    score?: number;
    signals_count?: number;
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
     * P6.4: Lee directamente desde public_rank_snapshots filtrando por el bucket más reciente, 
     * el módulo especificado, y el hash del segmento.
     */
    async getLatestRankings(
        moduleType: 'versus' | 'progressive' = 'versus',
        segmentHash: string = 'global',
        limit: number = 50,
        categorySlug?: string
    ): Promise<{ snapshotBucket: string | null; rows: RankSnapshot[] }> {

        // 1. Obtener latest bucket
        const { data: bucketData, error: bucketError } = await supabase
            .from('public_rank_snapshots')
            .select('snapshot_bucket')
            .order('snapshot_bucket', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (bucketError) {
            logger.error('Error fetching latest snapshot bucket:', bucketError);
            throw bucketError;
        }

        if (!(bucketData as any)?.snapshot_bucket) {
            return { snapshotBucket: null, rows: [] };
        }

        const latestBucket = (bucketData as any).snapshot_bucket;

        // 2. Query rows
        let query = supabase
            .from('public_rank_snapshots')
            .select(`
                id, 
                snapshot_bucket, 
                module_type, 
                battle_id, 
                option_id, 
                score, 
                signals_count, 
                segment, 
                segment_hash,
                battle_options (
                   label, 
                   image_url,
                   battles (
                      categories ( slug )
                   )
                )
            `)
            .eq('snapshot_bucket', latestBucket)
            .eq('module_type', moduleType)
            .eq('segment_hash', segmentHash)
            .order('score', { ascending: false })
            .limit(limit);

        const { data, error } = await query;

        if (error) {
            logger.error('Error fetching snapshot rows:', error);
            throw error;
        }

        let rows = (data || []).map((r: any) => {
            // Mapeo adaptativo para mantener interfaz original
            const entityName = r.battle_options?.label || 'Desconocido';
            const catSlug = r.battle_options?.battles?.categories?.slug || 'unknown';
            return {
                id: r.id as string,
                entity_id: r.option_id as string, // Usamos la opción como entidad rankeada
                category_slug: catSlug,
                composite_index: Number(r.score || 0),
                preference_score: Number(r.score || 0),
                quality_score: 0,
                snapshot_date: r.snapshot_bucket,
                segment_id: r.segment_hash,
                trend: 'stable' as const, // temporal default
                entity: {
                    name: entityName,
                    image_url: r.battle_options?.image_url
                },
                module_type: r.module_type,
                score: r.score,
                signals_count: r.signals_count
            } as RankSnapshot;
        });

        // Filtrado por categoría en memoria (si se incluyó en la llamada)
        // en el futuro debería buscarse una forma más directa con JOIN a entities o agregando category_id en snapshots
        if (categorySlug) {
            rows = rows.filter(r => r.category_slug === categorySlug);
        }

        return { snapshotBucket: latestBucket, rows };
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
     * Compatibility: Gets public ranking
     */
    async getPublicRanking(
        _attributeId: string,
        segmentHash: string = 'global'
    ): Promise<PublicRankingResponse | null> {
        const res = await this.getLatestRankings('versus', segmentHash || 'global', 100);
        if (!res.rows.length) return null;

        const ranking: RankingItem[] = res.rows.map((row, idx) => ({
            option_id: row.entity_id,
            position: idx + 1,
            trend: row.trend || 'stable'
        }));

        return {
            ranking,
            totalSignals: res.rows.reduce((acc, row) => acc + (row.signals_count || 0), 0),
            updatedAt: res.snapshotBucket || new Date().toISOString()
        };
    }
};
