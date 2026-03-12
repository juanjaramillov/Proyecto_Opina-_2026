import { supabase } from '../../supabase/client';
import { logger } from '../logger';
import { resolveMasterEntity } from './resolveMasterEntity';
import { resolveSignalContext } from './resolveSignalContext';
import { ActualidadTopicDetail } from '../../features/signals/services/actualidadService';

export interface NewsAnswerPayload {
    question_id: string;
    answer_value: string;
}

/**
 * Normaliza una respuesta editorial según los textos ingresados.
 */
function normalizeNewsAnswer(questionOption: any, answerStr: string, index: number) {
    const isScale = questionOption?.answer_type === 'scale_5' || questionOption?.answer_type === 'scale_0_10';
    const isBoolean = questionOption?.answer_type === 'yes_no';
    
    let value_numeric: number | null = null;
    let value_boolean: boolean | null = null;
    let value_text: string | null = null;

    if (isScale) {
        value_numeric = Number(answerStr);
    } else if (isBoolean) {
        const lower = answerStr.toLowerCase();
        value_boolean = (lower === 'sí' || lower === 'si' || lower === 'yes' || lower === 'true' || lower === '1');
    } else {
        value_text = String(answerStr);
    }

    // Default bounds para escalas
    let min = null;
    let max = null;
    
    if (questionOption?.answer_type === 'scale_0_10') { min = 0; max = 10; }
    else if (questionOption?.answer_type === 'scale_5') { min = 1; max = 5; }

    return {
        question_code: questionOption?.id || `q_${index}`,
        question_label: questionOption?.question_text || `Pregunta ${index}`,
        response_type: questionOption?.answer_type || 'choice',
        response_value: answerStr, // Valor crudo stringificado
        value_numeric,
        value_boolean,
        value_text,
        scale_min: min,
        scale_max: max,
        order_index: questionOption?.question_order || index + 1
    };
}

/**
 * Recibe un payload de respuestas News (Actualidad) legacy y las publica una por una a signal_events (1 = 1 CONTEXT_SIGNAL).
 * Mantiene resiliencia y separación Contexto/Tema.
 */
export async function recordNewsSignalsFromLegacy(topicDetail: ActualidadTopicDetail, answers: NewsAnswerPayload[]): Promise<void> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;
        
        // 1. Resolver master entity_id
        // El entity_id de News corresponde al tema transversal (ej "Elecciones", o "PresidenteX"). Usaremos title o category.
        const searchName = topicDetail.category && topicDetail.category !== 'General' 
                            ? topicDetail.category 
                            : topicDetail.title;

        let entityId = await resolveMasterEntity(searchName);
        
        // Si no resuelve por categoría exacta, intentar por título.
        if (!entityId && topicDetail.title !== searchName) {
           entityId = await resolveMasterEntity(topicDetail.title);
        }
        
        if (!entityId) {
            logger.warn(`[legacy->signal] News skipped: Unresolved entity. Topic: [${topicDetail.title}]`);
            return;
        }

        // 2. Resolver context_id (upsert). Representa el bloque noticioso / interactivo per se.
        const contextId = await resolveSignalContext('news', topicDetail.id, `Noticia: ${topicDetail.title || topicDetail.slug}`);

        // 3. Iterar respuestas editoriales estructuradas y grabar 1-a-1
        const promises = answers.map(async (ans, idx) => {
            const questionDef = topicDetail.questions?.find((q: any) => q.id === ans.question_id);
            const normalized = normalizeNewsAnswer(questionDef, ans.answer_value, idx);

            const valueJson = {
                topic: topicDetail.title,
                question_code: normalized.question_code,
                question_label: normalized.question_label,
                answer_format: normalized.response_type,
                answer_value: normalized.response_value,
                news_item_id: topicDetail.id,
                published_at: topicDetail.published_at,
                legacy_module: 'news',
                order_index: normalized.order_index
            };

            const rpcPayload = {
                p_user_id: userId || null,
                p_context_id: contextId || null,
                p_entity_id: entityId,
                p_value_json: valueJson as any,
                p_value_numeric: normalized.value_numeric,
                p_value_boolean: normalized.value_boolean,
                p_value_text: normalized.value_text,
                p_source_module: 'news',
                p_source_record_id: topicDetail.id
            };

            // Al ser originario de Editorial, lo catalogamos como un `record_context_signal`
            const { error } = await (supabase.rpc as any)('record_context_signal', rpcPayload);
            
            if (error) {
                logger.warn(`[legacy->signal] record_context_signal RPC failed for news [${topicDetail.id}] answer [${normalized.question_code}]: ${error.message}`);
            }
        });

        // Esperar la resolución de promesas (Fire-and-forget ya protegido)
        await Promise.allSettled(promises);

    } catch (err) {
        logger.error('[legacy->signal] Exception in recordNewsSignalsFromLegacy', err);
    }
}
