import { supabase } from '../../supabase/client';
import { logger } from '../logger';
import { resolveMasterEntity } from './resolveMasterEntity';
import { resolveSignalContext } from './resolveSignalContext';
import { PulseCategory } from '../../features/signals/services/pulseService';

/**
 * Mapping de identifiers técnicos a Entidades Maestras Nominales.
 * Usado para que resolveMasterEntity empareje la dimensión evaluada.
 * Todo lo que falte debería agregarse a la tabla `signal_entities`.
 */
const PULSE_DIMENSION_MAP: Record<string, string> = {
    // Sobre Mí
    'q_mood_week': 'Estado de Ánimo',
    'q_sleep': 'Calidad de Sueño',
    'q_happy': 'Momentos de Felicidad',
    'q_energy': 'Nivel de Energía',
    'q_overwhelmed': 'Sobrecarga',
    // Mi Semana
    'q_heavy': 'Carga Laboral/Estudio',
    'q_progress': 'Logro de Metas',
    'q_disconnect': 'Capacidad de Desconexión',
    'q_stress': 'Nivel de Estrés',
    // Mi Entorno
    'q_insecurity': 'Percepción de Inseguridad',
    'q_economy': 'Percepción Económica',
    'q_optimism': 'Optimismo en el Entorno',
    'q_country': 'Percepción del País'
};

/**
 * Genera el string ISO temporal de semana ej: "2026-w11"
 */
function getWeeklyPeriodString(): string {
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    const pastDaysOfYear = (today.getTime() - firstDayOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    return `${today.getFullYear()}-w${weekNumber.toString().padStart(2, '0')}`;
}

/**
 * Normaliza las respuestas string crudas que entran desde PulseHubManager.
 */
function normalizePulseAnswer(valueStr: string) {
    let value_numeric: number | null = null;
    let value_boolean: boolean | null = null;
    let value_text: string | null = null;
    let response_format: 'boolean' | 'scale' | 'single_choice' = 'single_choice';

    // Booleans puros
    if (valueStr === 'si') {
        value_boolean = true;
        response_format = 'boolean';
    } else if (valueStr === 'no') {
        value_boolean = false;
        response_format = 'boolean';
    } 
    // Escalas (vienen como "1", "2", "3", "4", "5")
    else if (!isNaN(Number(valueStr))) {
        value_numeric = Number(valueStr);
        response_format = 'scale';
    }
    // Textos / Ternarios (mejor, igual, peor, mas, menos, optimista, pesimista)
    else {
        value_text = valueStr;
        response_format = 'single_choice';
    }

    return { response_format, value_numeric, value_boolean, value_text };
}

/**
 * Intercepta un checkout completo de Tu Pulso, resolviendo dimensiones como entidades y despachando NxPERSONAL_PULSE_SIGNAL.
 */
export async function recordPulseSignalsFromLegacy(answers: Record<string, string>, category: PulseCategory): Promise<void> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;

        if (!userId) {
            logger.warn(`[pulse->signal] Ignorando doble escritura Pulse: Usuario no autenticado.`);
            return;
        }

        const periodString = getWeeklyPeriodString();
        
        // Context_id : período/formulario estricto de la semana
        const contextKey = `pulse-${category.replace('_', '-')}-${periodString}`;
        const contextLabel = `Tu Pulso: ${category.replace('_', ' ')} (${periodString})`;
        const contextId = await resolveSignalContext('pulse', contextKey, contextLabel);

        const promises = Object.entries(answers).map(async ([questionId, answerValue]) => {
            const mappedName = PULSE_DIMENSION_MAP[questionId] || questionId;
            const entityId = await resolveMasterEntity(mappedName);

            if (!entityId) {
                logger.warn(`[pulse->signal] Omitiendo insert. Dimensión conceptual [${mappedName}] no mapeada en signal_entities.`);
                return;
            }

            const normal = normalizePulseAnswer(answerValue);

            const valueJson = {
                dimension: mappedName,
                question_code: questionId,
                response_format: normal.response_format,
                response_value: answerValue, // crudo
                period_type: 'weekly',
                period_reference: periodString,
                legacy_module: 'pulse',
                category: category
            };

            const rpcPayload = {
                p_user_id: userId,
                p_context_id: contextId || null,
                p_entity_id: entityId,
                p_value_json: valueJson as any,
                p_value_numeric: normal.value_numeric,
                p_value_boolean: normal.value_boolean,
                p_value_text: normal.value_text,
                p_source_module: 'pulse'
            };

            // Insertamos la señal especializada por respuesta
            const { error } = await (supabase.rpc as any)('record_personal_pulse_signal', rpcPayload);

            // Supabase RPCs devuelven error si el Unique (user_id, context_id, entity_id, period) colisiona
            if (error && error.code !== '23505') { 
                 logger.warn(`[pulse->signal] RPC record_personal_pulse_signal fallback: ${error.message} (Q: ${questionId})`);
            }
        });

        await Promise.allSettled(promises);

    } catch (err) {
        logger.error('[pulse->signal] Excepción fatal normalizando doble escritura Pulse', err);
    }
}
