import { supabase } from '../../../supabase/client';
import { logger } from '../../../lib/logger';

/**
 * Sintético: helpers para sembrar y borrar datos sintéticos de pruebas internas.
 *
 * IMPORTANTE: solo admin puede invocar estas RPCs (las RPCs validan por sí mismas
 * via is_admin_user(), pero el panel UI también debería estar gateado por la
 * ruta admin estándar).
 *
 * Marca trazable triple:
 *   - email pattern: synthetic+<batch>+NNNN@opina.test
 *   - raw_user_meta_data.synthetic = true (en auth.users)
 *   - is_synthetic = true + synthetic_batch_label (en public.users + user_profiles)
 *   - meta.synthetic = true (en public.signal_events)
 */

export interface SyntheticBatchSummary {
    id: string;
    label: string;
    notes: string | null;
    user_count_planned: number;
    user_count_alive: number;
    signal_count_recorded: number;
    signal_count_alive: number;
    created_at: string;
    created_by: string | null;
    deleted_at: string | null;
    deleted_by: string | null;
    is_deleted: boolean;
}

export interface SeedBatchResult {
    batch_id: string;
}

export interface DeleteBatchResult {
    batch_id: string;
    label: string;
    users_deleted: number;
    signals_deleted: number;
}

export interface DeleteAllResult {
    users_deleted: number;
    signals_deleted: number;
    batches_marked: number;
}

const DELETE_ALL_CONFIRM_TOKEN = 'YES_DELETE_ALL_SYNTHETIC';

export const adminSyntheticService = {
    /**
     * Lista todos los batches sintéticos (vivos y borrados) ordenados por created_at desc.
     * Lee de la vista public.synthetic_seed_summary, que está protegida por
     * is_admin_user() en su WHERE.
     */
    async listBatches(): Promise<SyntheticBatchSummary[]> {
        const { data, error } = await supabase
            .from('synthetic_seed_summary')
            .select('*');

        if (error) {
            logger.error(
                'Error listing synthetic batches',
                { domain: 'admin_actions', origin: 'adminSyntheticService', action: 'list_batches', state: 'failed' },
                error
            );
            throw error;
        }

        return (data as SyntheticBatchSummary[]) || [];
    },

    /**
     * Crea un batch sintético con N usuarios + sus señales versus.
     * @param label  Identificador único del batch (regex ^[a-zA-Z0-9_-]{2,40}$). Caracteres inválidos se reemplazan por _.
     * @param userCount  Cantidad de usuarios a generar (1..1000).
     * @param notes  Texto libre opcional (e.g., propósito del batch).
     */
    async createBatch(label: string, userCount: number, notes?: string | null): Promise<string> {
        const { data, error } = await supabase.rpc('seed_synthetic_batch', {
            p_label: label,
            p_user_count: userCount,
            p_notes: notes ?? undefined,
        });

        if (error) {
            logger.error(
                'Error in seed_synthetic_batch RPC',
                { domain: 'admin_actions', origin: 'adminSyntheticService', action: 'seed_batch', state: 'failed' },
                error
            );
            throw error;
        }

        return data as string;
    },

    /**
     * Borra todos los datos asociados a un batch (señales + usuarios).
     * Cascadea desde auth.users a public.users y public.user_profiles.
     */
    async deleteBatch(label: string): Promise<DeleteBatchResult> {
        const { data, error } = await supabase.rpc('delete_synthetic_batch', {
            p_label: label,
        });

        if (error) {
            logger.error(
                'Error in delete_synthetic_batch RPC',
                { domain: 'admin_actions', origin: 'adminSyntheticService', action: 'delete_batch', state: 'failed' },
                error
            );
            throw error;
        }

        return data as unknown as DeleteBatchResult;
    },

    /**
     * Limpieza total: borra TODO lo marcado como sintético. Pensado para uso
     * final antes de publicación pública. Requiere token de confirmación.
     */
    async deleteAllSynthetic(): Promise<DeleteAllResult> {
        const { data, error } = await supabase.rpc('delete_all_synthetic_data', {
            p_confirm: DELETE_ALL_CONFIRM_TOKEN,
        });

        if (error) {
            logger.error(
                'Error in delete_all_synthetic_data RPC',
                { domain: 'admin_actions', origin: 'adminSyntheticService', action: 'delete_all', state: 'failed' },
                error
            );
            throw error;
        }

        return data as unknown as DeleteAllResult;
    },
};
