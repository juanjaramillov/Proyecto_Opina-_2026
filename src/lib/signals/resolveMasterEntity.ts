import { supabase } from '../../supabase/client';
import { logger } from '../logger';

/**
 * Objetivo: resolver de forma segura el entity_id maestro desde datos legacy existentes.
 * 
 * Prioridad:
 * 1. Si el payload trae un entity_id (master) validado.
 * 2. Si existe mapping en entity_legacy_mappings (no implementado en runtime aún, pero se deja el stub).
 * 3. Si existe canonical_code confiable en payload (no aplica en V1 legacy, pero se previene).
 * 4. Por `slug` o `entity_slug` si hace match estricto con public.signal_entities.
 */
export async function resolveMasterEntity(payload: any): Promise<number | null> {
    if (!payload) return null;

    try {
        // 1. Si ya viene un entity_id numérico explícito que sepamos que es el maestro
        if (typeof payload.entity_id === 'number') {
            return payload.entity_id;
        }

        // 2 & 3 & 4. Buscar por slug / entity_slug contra signal_entities
        const slugToSearch = payload.entity_slug || payload.slug;
        
        if (slugToSearch && typeof slugToSearch === 'string') {
            const { data, error } = await (supabase as any)
                .from('signal_entities')
                .select('id')
                .eq('slug', slugToSearch)
                .single();

            if (!error && data?.id) {
                return data.id;
            }
        }

        // Si es un string directo (fallback defensivo)
        if (typeof payload === 'string') {
            const { data, error } = await (supabase as any)
                .from('signal_entities')
                .select('id')
                .eq('slug', payload)
                .single();

            if (!error && data?.id) {
                return data.id;
            }
        }

        // TODO: Implementar búsqueda por `entity_legacy_mappings` cuando el catálogo maestro esté poblado y linkeado en DB.
        
        return null;

    } catch (err) {
        logger.warn('[resolveMasterEntity] Failed to resolve entity safely', err);
        return null;
    }
}
