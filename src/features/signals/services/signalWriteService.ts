import { supabase } from '../../../supabase/client';
import { Database } from '../../../supabase/database.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '../../../lib/logger';
import {
    enqueueInsertSignalEvent,
    flushSignalOutbox,
    isNonRetriableSignalErrorMessage,
    removeOutboxJob
} from './signalOutbox';
import { track } from "../../telemetry/track";
import { SignalEventPayload } from './signalTypes';

const sb = supabase as unknown as SupabaseClient<Database>;

export const signalWriteService = {
    saveSignalEvent: async (payload: SignalEventPayload): Promise<void> => {
        // 1. VALIDACIÓN ESTRICTA RELAJADA (Depende del módulo)
        const isBattleFlow = !payload.meta?.source || payload.meta?.source === 'versus' || payload.meta?.source === 'progressive';
        if (isBattleFlow && (!payload.battle_id || !payload.option_id)) {
            logger.error('[SignalService] INVALID SIGNAL PAYLOAD: Missing battle_id or option_id for battle flow', payload);
            throw new Error('Invalid signal payload: missing battle_id or option_id');
        }
        if (!isBattleFlow) {
            if (!payload.entity_id && !payload.battle_id) {
                logger.error('[SignalService] INVALID SIGNAL PAYLOAD: Missing entity_id for non-battle flow', payload);
                throw new Error('Invalid signal payload: missing entity_id');
            }
            if ((payload.meta?.source === 'depth' || payload.meta?.source === 'news' || payload.meta?.source === 'actualidad') && !payload.context_id) {
                logger.error('[SignalService] INVALID SIGNAL PAYLOAD: Missing context_id for multi-response non-battle flow', payload);
                throw new Error('Invalid signal payload: missing context_id for multi-response signal');
            }
        }

        // Lógica Device Hash
        let deviceHash = localStorage.getItem('opina_device_hash');
        if (!deviceHash) {
            deviceHash = crypto.randomUUID();
            localStorage.setItem('opina_device_hash', deviceHash);
        }

        let signalTypeCode = 'VERSUS_SIGNAL';
        let moduleType = 'versus';
        if (payload.meta?.source === 'progressive') {
            signalTypeCode = 'PROGRESSIVE_SIGNAL';
            moduleType = 'progressive';
        } else if (payload.meta?.source === 'depth') {
            signalTypeCode = 'DEPTH_SIGNAL';
            moduleType = 'depth';
        } else if (payload.meta?.source === 'actualidad' || payload.meta?.source === 'news') {
            signalTypeCode = 'CONTEXT_SIGNAL';
            moduleType = 'news';
        } else if (payload.meta?.source === 'pulse') {
            signalTypeCode = 'PERSONAL_PULSE_SIGNAL';
            moduleType = 'pulse';
        }

        const args = {
            p_battle_id: payload.battle_id || undefined,
            p_option_id: payload.option_id || undefined,
            p_session_id: payload.session_id || undefined,
            p_attribute_id: payload.attribute_id || undefined,
            p_entity_id: payload.entity_id || undefined,
            p_entity_type: payload.entity_type || undefined,
            p_context_id: payload.context_id || undefined,
            p_value_numeric: payload.value_numeric ?? undefined,
            p_value_text: payload.value_text || undefined,
            p_device_hash: deviceHash,
            p_value_json: (payload.meta as Database['public']['Tables']['signal_events']['Row']['value_json']) || {},
            p_signal_type_code: signalTypeCode,
            p_module_type: moduleType,
            
            // V14 NATIVE INJECTION
            p_event_status: payload.event_status || undefined,
            p_origin_module: payload.origin_module || undefined,
            p_origin_element: payload.origin_element || undefined,
            p_question_id: payload.question_id || undefined,
            p_question_version: payload.question_version || undefined,
            p_display_order: payload.display_order || undefined,
            p_response_time_ms: payload.response_time_ms || undefined,
            p_sequence_id: payload.sequence_id || undefined,
            p_sequence_order: payload.sequence_order || undefined,
            p_content_snapshot_id: payload.content_snapshot_id || undefined,
            p_left_entity_id: payload.left_entity_id || undefined,
            p_right_entity_id: payload.right_entity_id || undefined,
            p_selected_entity_id: payload.selected_entity_id || payload.option_id,
            p_interaction_outcome: payload.interaction_outcome || undefined
        };

        // 3. ENCOLAR SIEMPRE
        const { id } = enqueueInsertSignalEvent(args);

        // 4. UI REFRESH INMEDIATO (optimistic)
        try {
            window.dispatchEvent(new CustomEvent('opina:signal_emitted'));
        } catch {
            // noop
        }

        // 5. INTENTO INMEDIATO BEST-EFFORT
        try {
            let res = await sb.rpc('insert_signal_event', {
                ...args,
                p_client_event_id: id
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any);

            // Si falla por p_device_hash, reintento sin ese campo (fallback)
            if (res.error && String(res.error.message).includes('p_device_hash')) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { p_device_hash: _, ...fallbackArgs } = { ...args, p_client_event_id: id };
                res = await sb.rpc('insert_signal_event', (fallbackArgs as unknown) as Database['public']['Functions']['insert_signal_event']['Args']);
            }

            const { error } = res;

            if (error) {
                const eMsg = String((error as { message?: string })?.message || error);

                // DG-A01: Convertir gating en flujo guiado
                const msg = (error as { message?: string }).message?.toUpperCase() || '';
                const code = (error as { code?: string })?.code ? String((error as { code?: string }).code).toUpperCase() : '';

                const isInviteRequired =
                    msg.includes('INVITE_REQUIRED') || code.includes('INVITE_REQUIRED');

                const isProfileMissing =
                    msg.includes('PROFILE_MISSING') || code.includes('PROFILE_MISSING');

                const isProfileIncomplete =
                    msg.includes('PROFILE_INCOMPLETE') || code.includes('PROFILE_INCOMPLETE');

                if (isInviteRequired) {
                    track("signal_blocked_invite_required", "warn", { battle_id: payload.battle_id });
                    const next = encodeURIComponent(window.location.pathname + window.location.search);
                    window.dispatchEvent(
                        new CustomEvent('opina:navigate', { detail: { to: `/access?next=${next}` } })
                    );
                    throw error;
                }

                if (isProfileMissing || isProfileIncomplete) {
                    // Redirigir a ProfileWizard (mínimos)
                    track("signal_blocked_profile_required", "warn", { battle_id: payload.battle_id });
                    window.dispatchEvent(new CustomEvent('opina:navigate', { detail: { to: '/complete-profile' } }));
                    throw error;
                }

                if (isNonRetriableSignalErrorMessage(eMsg)) {
                    removeOutboxJob(id);
                    track("signal_emit_non_retriable_error", "error", { message: String(eMsg).slice(0, 160) }, id);
                    try {
                        window.dispatchEvent(new CustomEvent('opina:signal_emitted'));
                    } catch {
                        // noop
                    }
                    throw error;
                }

                logger.warn('[SignalService] RPC insert_signal_event failed (transient)', eMsg);
            } else {
                // V14 Enrichment: Native backend persistence handles all args. No subsequent async UPDATE requirement.
                removeOutboxJob(id);
                track("signal_saved", "info", { battle_id: payload.battle_id, option_id: payload.option_id }, id);
            }
        } catch (err: unknown) {
            // Re-throw if it was already explicitly thrown for business rules
            logger.warn('[SignalService] Submitting signal failed natively. Kept in Outbox', err);
            throw err; // ALWAYS THROW for temporary debugging
        }

        // 6. FIRE AND FORGET
        flushSignalOutbox(25).catch(err => {
            logger.warn('[SignalService] Async Background flush warning', err);
        });
    },

    saveVersusSignal: async (args: {
        battle_uuid: string; // The actual UUID for signal_events schema
        battle_id: string;   // the slug or id for legacy bridging
        battle_title: string;
        selected_option_id: string;
        loser_option_id: string;
        selected_option_name: string;
        loser_option_name: string;
        subcategory?: string;
        
        // V14 Attributes
        left_entity_id?: string;
        right_entity_id?: string;
        response_time_ms?: number;
    }): Promise<void> => {
        return signalWriteService.saveSignalEvent({
            battle_id: args.battle_uuid,
            option_id: args.selected_option_id,
            left_entity_id: args.left_entity_id,
            right_entity_id: args.right_entity_id,
            response_time_ms: args.response_time_ms,
            selected_entity_id: args.selected_option_id,
            event_status: 'completed',
            interaction_outcome: 'selected',
            meta: {
                source: 'versus',
                loser_option_id: args.loser_option_id,
                subcategory: args.subcategory
            }
        });
    },

    saveTorneoSignal: async (args: {
        battle_uuid: string; // UUID for signal_events
        battle_id: string;   // Context id / slug
        instance_id: string; // For progressive
        title: string;
        selected_option_id: string;
        loser_option_id: string;
        selected_option_name: string;
        loser_option_name: string;
        subcategory?: string;
        stage?: number;
        response_time_ms?: number;
        left_entity_id?: string;
        right_entity_id?: string;
        sequence_id?: string;
        sequence_order?: number;
    }): Promise<void> => {
        return signalWriteService.saveSignalEvent({
            battle_id: args.battle_uuid,
            option_id: args.selected_option_id,
            response_time_ms: args.response_time_ms,
            left_entity_id: args.left_entity_id,
            right_entity_id: args.right_entity_id,
            selected_entity_id: args.selected_option_id,
            sequence_id: args.sequence_id,
            sequence_order: args.sequence_order,
            origin_module: 'progressive',
            meta: {
                source: 'progressive',
                loser_option_id: args.loser_option_id,
                subcategory: args.subcategory,
                stage: args.stage
            }
        });
    },
};
