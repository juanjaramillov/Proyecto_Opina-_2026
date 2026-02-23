import { supabase } from '../../../supabase/client';

export type SnapshotRow = {
    snapshot_bucket: string;
    module_type: 'versus' | 'progressive';
    battle_id: string;
    battle_title: string;
    option_id: string;
    option_label: string;
    score: number;
    signals_count: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    segment: any;
    segment_hash: string;
};

export const b2bAnalyticsService = {
    listRankings: async (params: {
        moduleType: 'versus' | 'progressive';
        segmentHash?: string;
        limit?: number;
    }): Promise<{ bucket: string | null; rows: SnapshotRow[] }> => {

        const limit = params.limit || 100;
        const segmentHash = params.segmentHash || 'global';

        // Llamamos al RPC pasándole los parámetros. 
        // Usamos 'as any' porque Supabase TS no detecta todavía esta función custom B2B.
        const { data, error } = await supabase.rpc('b2b_list_rankings' as any, {
            p_module_type: params.moduleType,
            p_segment_hash: segmentHash,
            p_limit: limit
        });

        if (error) {
            // Simplificamos el error en base a código o cadena para no filtrar SQL subyacente.
            if (error.message.includes('UNAUTHORIZED_B2B') || error.code === 'P0001') {
                throw new Error('No tienes acceso autorizado a los datos B2B.');
            }
            throw new Error('Error al consultar rankings. Verifica tu conexión.');
        }

        const rows = (data || []) as SnapshotRow[];
        // Todos devuelven el mismo bucket si hay data
        const bucket = rows.length > 0 ? rows[0].snapshot_bucket : null;

        return {
            bucket,
            rows
        };
    }
};
