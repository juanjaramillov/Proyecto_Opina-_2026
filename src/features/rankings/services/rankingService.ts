import { supabase } from '../../../supabase/client';
import { Json } from '../../../types/database.types';

export interface RankingFilter {
    gender?: string;
    age_bracket?: string;
    health_system?: string;
    attention_12m?: boolean;
    [key: string]: Json | undefined;
}

export interface RankingItem {
    option_id: string;
    score: number;
    signals: number;
    position: number;
    trend: 'up' | 'down' | 'stable';
}

export interface RankSnapshot {
    attribute_id: string;
    segment_hash: string;
    ranking: RankingItem[];
    total_signals: number;
    created_at: string;
}

export interface Attribute {
    id: string;
    slug: string;
    name: string;
}

export const rankingService = {
    /**
     * Genera un hash consistente para una combinación de filtros.
     * Esto permite cachear snapshots por segmento.
     */
    generateSegmentHash: (attributeId: string, filters: RankingFilter): string => {
        // Ordenar llaves para consistencia
        const sortedFilters = Object.keys(filters)
            .sort()
            .reduce((acc: Record<string, Json | undefined>, key: string) => {
                acc[key] = filters[key];
                return acc;
            }, {});

        return `${attributeId}:${JSON.stringify(sortedFilters)}`;
    },

    /**
     * Obtiene el ranking actual para un atributo y segmento.
     * Prioriza leer del último snapshot de 3 horas.
     */
    getRanking: async (attributeId: string, filters: RankingFilter = {}): Promise<{
        ranking: RankingItem[];
        totalSignals: number;
        updatedAt: string;
        thresholdMet: boolean;
    }> => {
        try {
            // 1. Buscar el snapshot más reciente
            const { data: snapshot, error } = await supabase
                .from('public_rank_snapshots')
                .select('*')
                .eq('attribute_id', attributeId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) throw error;

            // 2. Si no hay snapshot, o queremos forzar uno (fallback)
            if (!snapshot) {
                const { data: newRanking, error: rpcError } = await supabase.rpc('calculate_rank_snapshot', {
                    p_attribute_id: attributeId,
                    p_filters: filters
                });

                if (rpcError) throw rpcError;

                const rankingData = (newRanking as unknown as RankingItem[]) || [];
                const total = rankingData.reduce((acc, curr) => acc + (curr.signals || 0), 0);

                return {
                    ranking: rankingData as RankingItem[],
                    totalSignals: total,
                    updatedAt: new Date().toISOString(),
                    thresholdMet: total >= 80
                };
            }

            return {
                ranking: (snapshot.ranking as unknown as RankingItem[]),
                totalSignals: snapshot.total_signals,
                updatedAt: snapshot.snapshot_at,
                thresholdMet: (snapshot.total_signals || 0) >= 80
            };
        } catch (err) {
            console.error('Error fetching ranking:', err);
            return { ranking: [], totalSignals: 0, updatedAt: '', thresholdMet: false };
        }
    },

    getAttributeBySlug: async (slug: string): Promise<Attribute | null> => {
        const { data, error } = await supabase
            .from('attributes')
            .select('*')
            .eq('slug', slug)
            .maybeSingle();

        if (error) return null;
        return data as Attribute;
    },

    getPublicRanking: async (attributeId: string, segmentHash: string = ''): Promise<{
        ranking: RankingItem[];
        totalSignals: number;
        updatedAt: string;
    } | null> => {
        try {
            const query = supabase
                .from('public_rank_snapshots')
                .select('*')
                .eq('attribute_id', attributeId);

            if (segmentHash) {
                query.eq('segment_hash', segmentHash);
            }

            const { data: snapshot, error } = await query
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error || !snapshot) return null;

            return {
                ranking: (snapshot.ranking as unknown as RankingItem[]),
                totalSignals: snapshot.total_signals,
                updatedAt: snapshot.snapshot_at
            };
        } catch (err) {
            console.error('Error fetching public ranking:', err);
            return null;
        }
    }
};
