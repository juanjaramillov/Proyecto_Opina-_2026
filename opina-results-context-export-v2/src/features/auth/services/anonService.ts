import { supabase } from '../../../supabase/client';
import { logger } from '../../../lib/logger';

/**
 * Servicio para gestionar la identidad anónima del usuario.
 * Permite desacoplar el user_id real de las acciones públicas.
 */
export async function getAnonId(): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.rpc as any)('get_or_create_anon_id');
    if (error) {
        logger.error('[AnonService] Failed to get anon id:', error);
        throw error;
    }
    return data as string;
}
