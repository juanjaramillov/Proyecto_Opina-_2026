import { supabase } from '../../../supabase/client';

/**
 * Servicio para gestionar la identidad anónima del usuario.
 * Permite desacoplar el user_id real de las acciones públicas.
 */
export async function getAnonId(): Promise<string> {
    const { data, error } = await (supabase.rpc as any)('get_or_create_anon_id');
    if (error) {
        console.error('[AnonService] Failed to get anon id:', error);
        throw error;
    }
    return data as string;
}
