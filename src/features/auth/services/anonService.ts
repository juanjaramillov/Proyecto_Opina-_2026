import { supabase } from '../../../supabase/client';
import { logger } from '../../../lib/logger';

/**
 * Servicio para gestionar la identidad anónima del usuario.
 * Permite desacoplar el user_id real de las acciones públicas.
 */
export async function getAnonId(): Promise<string> {
    const { data, error } = await supabase.rpc('get_or_create_anon_id');
    if (error) {
        logger.error('[AnonService] Failed to get anon id:', error);
        throw error;
    }
    return data as string;
}
