import { supabase } from '../../supabase/client';
import { logger } from '../logger';
import { resolveMasterEntity } from './resolveMasterEntity';
import { resolveSignalContext } from './resolveSignalContext';

export interface LegacyVersusPayload {
    battle_id: string; // The active_battles id or slug
    battle_title: string;
    selected_option_id: string; // From the options JSON array
    rejected_option_id: string;
    selected_option_name: string;
    rejected_option_name: string;
    subcategory?: string;
    round_index?: number;
}

export interface LegacyProgressivePayload {
    instance_id: string; // The tournament or progression id
    title?: string;
    selected_option_id: string;
    rejected_option_id: string;
    selected_option_name: string;
    rejected_option_name: string;
    subcategory?: string;
    stage?: number;
    bracket_step?: string;
}

/**
 * Graba una señal de VERSUS en public.signal_events sin romper el flujo original.
 */
export async function recordVersusSignalFromLegacy(payload: LegacyVersusPayload): Promise<boolean> {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        
        // 1. Resolver contextos y entidades de manera silenciosa
        const contextId = await resolveSignalContext('versus', payload.battle_id, payload.battle_title);
        const selectedEntityId = await resolveMasterEntity(payload.selected_option_name);
        const rejectedEntityId = await resolveMasterEntity(payload.rejected_option_name);

        // Si no tenemos la entidad seleccionada resoluble, abortamos la escritura silenciosamente 
        // ya que no hay mapping duro en esta etapa de transición.
        if (!selectedEntityId) {
            logger.warn(`[legacy->signal] Versus skipped: Unresolved selected entity [${payload.selected_option_name}]`);
            return false;
        }

        const valueJson = {
            selected_option_id: payload.selected_option_id,
            rejected_option_id: payload.rejected_option_id,
            selected_option_name: payload.selected_option_name,
            rejected_option_name: payload.rejected_option_name,
            legacy_module: 'versus',
            round_index: payload.round_index || 1,
            subcategory: payload.subcategory || 'mix',
            rejected_entity_id: rejectedEntityId || null
        };

        const { error } = await (supabase.rpc as any)('record_versus_signal', {
            p_user_id: userId || null,
            p_context_id: contextId || null,
            p_entity_id: selectedEntityId, // El ganador de este matchup
            p_value_json: valueJson as any,
            p_source_module: 'versus',
            p_source_record_id: payload.battle_id
        });

        if (error) {
            logger.error(`[legacy->signal] record_versus_signal RPC failed: ${error.message}`);
            return false;
        }

        return true;
    } catch (err) {
        logger.error('[legacy->signal] Exception in recordVersusSignalFromLegacy', err);
        return false;
    }
}


/**
 * Graba una señal de PROGRESIVOS en public.signal_events sin romper el flujo original.
 */
export async function recordProgressiveSignalFromLegacy(payload: LegacyProgressivePayload): Promise<boolean> {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        
        // 1. Resolver contextos y entidades de manera silenciosa
        const contextId = await resolveSignalContext(
            'progressive', 
            payload.instance_id, 
            payload.title || `Progressive Tournament ${payload.instance_id}`
        );
        const selectedEntityId = await resolveMasterEntity(payload.selected_option_name);
        const rejectedEntityId = await resolveMasterEntity(payload.rejected_option_name);

        if (!selectedEntityId) {
            logger.warn(`[legacy->signal] Progressive skipped: Unresolved selected entity [${payload.selected_option_name}]`);
            return false;
        }

        const valueJson = {
            selected_option_id: payload.selected_option_id,
            rejected_option_id: payload.rejected_option_id,
            selected_option_name: payload.selected_option_name,
            rejected_option_name: payload.rejected_option_name,
            legacy_module: 'progressive',
            stage: payload.stage || 1,
            bracket_step: payload.bracket_step || 'unknown',
            subcategory: payload.subcategory || 'mix',
            rejected_entity_id: rejectedEntityId || null
        };

        const { error } = await (supabase.rpc as any)('record_progressive_signal', {
            p_user_id: userId || null,
            p_context_id: contextId || null,
            p_entity_id: selectedEntityId, // El ganador de esta etapa
            p_value_json: valueJson as any,
            p_source_module: 'progressive',
            p_source_record_id: payload.instance_id
        });

        if (error) {
            logger.error(`[legacy->signal] record_progressive_signal RPC failed: ${error.message}`);
            return false;
        }

        return true;
    } catch (err) {
        logger.error('[legacy->signal] Exception in recordProgressiveSignalFromLegacy', err);
        return false;
    }
}
