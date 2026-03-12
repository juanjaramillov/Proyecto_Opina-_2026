import { supabase } from '../../supabase/client';
import { logger } from '../logger';
import { resolveMasterEntity } from './resolveMasterEntity';
import { resolveSignalContext } from './resolveSignalContext';

export interface DepthAnswerPayload {
    question_key: string;
    question_label: string;
    response_type: string; // 'scale', 'boolean', 'choice', 'nps_0_10', 'scale_1_5', 'yes_no'
    response_value: string | number;
    scale_min?: number;
    scale_max?: number;
    order_index: number;
}

export interface LegacyDepthPayload {
    instance_id: string; // ID representativo del form/batalla
    instance_title: string;
    entity_name: string; // ej: opt.label
    subcategory?: string; // ej: categorySlug
    answers: DepthAnswerPayload[];
}

/**
 * Normaliza el payload de una respuesta para extraer los tipos concretos a grabar
 */
function normalizeDepthAnswer(answer: DepthAnswerPayload) {
    const isNps = answer.response_type === 'nps_0_10';
    const isScale = answer.response_type.includes('scale') || isNps;
    const isBoolean = answer.response_type === 'yes_no' || answer.response_type === 'boolean';
    
    // Extracción de datos en tipados limpios
    let value_numeric: number | null = null;
    let value_boolean: boolean | null = null;
    let value_text: string | null = null;

    if (isScale) {
        value_numeric = Number(answer.response_value);
    } else if (isBoolean) {
        if (typeof answer.response_value === 'boolean') {
            value_boolean = answer.response_value;
        } else {
            const str = String(answer.response_value).toLowerCase();
            value_boolean = (str === 'true' || str === 'yes' || str === 'sí' || str === 'si' || str === '1');
        }
    } else {
        value_text = String(answer.response_value);
    }

    // Default bounds (nps = 0..10, scale_1_5 = 1..5)
    let min = answer.scale_min ?? null;
    let max = answer.scale_max ?? null;
    
    if (isNps) { min = 0; max = 10; }
    else if (answer.response_type === 'scale_1_5') { min = 1; max = 5; }

    return {
        question_code: answer.question_key,
        question_label: answer.question_label,
        response_type: answer.response_type,
        response_value: String(answer.response_value), // Siempre serializado como string fallback
        value_numeric,
        value_boolean,
        value_text,
        scale_min: min,
        scale_max: max,
        order_index: answer.order_index
    };
}

/**
 * Recibe un payload de respuestas Depth legacy y las publica una por una a signal_events.
 * Falla silenciosamente si hay problemas para no impactar la UX.
 */
export async function recordDepthSignalsFromLegacy(payload: LegacyDepthPayload): Promise<void> {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        
        // 1. Resolver master entity_id
        const entityId = await resolveMasterEntity(payload.entity_name);
        
        if (!entityId) {
            logger.warn(`[legacy->signal] Depth skipped: Unresolved entity [${payload.entity_name}]`);
            return;
        }

        // 2. Resolver context_id (upsert)
        const contextId = await resolveSignalContext('depth', payload.instance_id, payload.instance_title);

        // 3. Iterar respuestas y grabar 1-a-1
        // Se paralelizan las promesas sin bloquear el retorno global a la UI.
        const promises = payload.answers.map(async (ans) => {
            const normalized = normalizeDepthAnswer(ans);

            const valueJson = {
                question_code: normalized.question_code,
                question_label: normalized.question_label,
                response_type: normalized.response_type,
                response_value: normalized.response_value,
                scale_min: normalized.scale_min,
                scale_max: normalized.scale_max,
                subcategory: payload.subcategory || 'mix',
                depth_instance_id: payload.instance_id,
                order_index: normalized.order_index,
                legacy_module: 'depth'
            };

            const rpcPayload = {
                p_user_id: userId || null,
                p_context_id: contextId || null,
                p_entity_id: entityId,
                p_value_json: valueJson as any,
                p_value_numeric: normalized.value_numeric,
                p_value_boolean: normalized.value_boolean,
                p_value_text: normalized.value_text,
                p_source_module: 'depth',
                p_source_record_id: payload.instance_id
            };

            const { error } = await (supabase.rpc as any)('record_depth_signal', rpcPayload);
            
            if (error) {
                logger.warn(`[legacy->signal] record_depth_signal RPC failed for question ${normalized.question_code}: ${error.message}`);
            }
        });

        // Esperar a que terminen en background o fire-and-forget
        await Promise.allSettled(promises);

    } catch (err) {
        logger.error('[legacy->signal] Exception in recordDepthSignalsFromLegacy', err);
    }
}
