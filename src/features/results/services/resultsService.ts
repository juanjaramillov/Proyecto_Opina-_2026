import { supabase } from '../../../supabase/client';
import { logger } from '../../../lib/logger';
import { RankSnapshot } from '../../rankings/services/rankingService';

export const resultsService = {
    /**
     * Obtiene los resultados más recientes para un entity (batalla/opción), módulo y segmento específico.
     * Consulta public_rank_snapshots para evitar recalcular en vivo.
     */
    async getLatestResults(
        moduleType: 'versus' | 'progressive' = 'versus',
        segmentHash: string = 'global',
        limit: number = 50,
        battleId?: string
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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bData = bucketData as any;

        if (!bData?.snapshot_bucket) {
            return { snapshotBucket: null, rows: [] };
        }

        const latestBucket = bData.snapshot_bucket;

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

        if (battleId) {
            query = query.eq('battle_id', battleId);
        }

        const { data, error } = await query;

        if (error) {
            logger.error('Error fetching snapshot rows:', error);
            throw error;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rows = (data || []).map((r: any) => {
            const entityName = r.battle_options?.label || 'Desconocido';
            const catSlug = r.battle_options?.battles?.categories?.slug || 'unknown';
            return {
                id: r.id as string,
                entity_id: r.option_id as string,
                category_slug: catSlug,
                composite_index: Number(r.score || 0),
                preference_score: Number(r.score || 0),
                quality_score: 0,
                snapshot_date: r.snapshot_bucket,
                segment_id: r.segment_hash,
                trend: 'stable' as const,
                entity: {
                    name: entityName,
                    image_url: r.battle_options?.image_url
                },
                module_type: r.module_type,
                score: r.score,
                signals_count: r.signals_count
            } as RankSnapshot;
        });

        return { snapshotBucket: latestBucket, rows };
    }
};
