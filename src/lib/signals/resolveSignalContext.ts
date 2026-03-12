import { supabase } from '../../supabase/client';
import { logger } from '../logger';

/**
 * Objetivo: obtener o construir de forma segura un signal_contexts.id reusable.
 * 
 * @param kind 'versus' | 'progressive' | 'depth' | 'news'
 * @param legacyId El ID del torneo, batalla, etc.
 * @param title Título legible para crear el contexto si no existe
 */
export async function resolveSignalContext(
    kind: string,
    legacyId: string,
    title: string | null = null
): Promise<number | null> {
    if (!legacyId) return null;

    try {
        // Buscar si ya existe
        const { data: existing, error: searchError } = await (supabase as any)
            .from('signal_contexts')
            .select('id')
            .eq('context_kind', kind)
            .eq('legacy_reference_id', legacyId)
            .maybeSingle();

        if (existing?.id) {
            return existing.id;
        }

        if (searchError && searchError.code !== 'PGRST116') {
            logger.warn(`[resolveSignalContext] Error searching context ${kind}:${legacyId}`, searchError);
        }

        // Si no existe, intentar crearlo (upsert defensivo por si hay carrera)
        const { data: inserted, error: insertError } = await (supabase as any)
            .from('signal_contexts')
            .upsert({
                context_kind: kind,
                name: title || `${kind} - ${legacyId}`,
                legacy_reference_id: legacyId,
                status: 'active'
            }, { onConflict: 'context_kind,legacy_reference_id' })
            .select('id')
            .single();

        if (inserted?.id) {
            return inserted.id;
        }

        if (insertError) {
            logger.warn(`[resolveSignalContext] Error inserting context ${kind}:${legacyId}`, insertError);
        }

        return null;

    } catch (err) {
        logger.warn(`[resolveSignalContext] Exception resolving context ${kind}:${legacyId}`, err);
        return null;
    }
}
