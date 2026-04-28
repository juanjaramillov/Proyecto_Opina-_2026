// =========================================================================
// supabase/functions/_shared/llmAudit.ts
// =========================================================================
// Telemetría LLM unificada: cada llamada exitosa o fallida a OpenAI deja
// trazo en public.admin_audit_log con action='llm.<funcion>'.
//
// Por qué INSERT directo y no public.log_admin_action():
//   - log_admin_action usa auth.uid() como actor. Desde Edge Function con
//     service_role, auth.uid() retorna NULL → perdemos trazabilidad.
//   - El grant existente ya permite: GRANT INSERT ON admin_audit_log TO
//     service_role (ver migración 20260424000100_admin_audit_log).
//   - Pasamos actor_user_id explícito desde requireAuth/requireAdmin.
//
// La función NUNCA debe romper la edge function llamadora. Si el INSERT
// falla, loggea por consola y sigue.
// =========================================================================

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

export type LlmAuditStatus = "success" | "error" | "fallback" | "cache_hit";

export interface LlmAuditEntry {
    /** UUID del usuario que disparó la llamada (obtenido de requireAuth) */
    actorUserId: string;
    /** Email del usuario, opcional. Si no se pasa, queda NULL en la tabla */
    actorEmail?: string | null;
    /** Nombre de la edge function: 'llm-narrative' | 'insights-generator' */
    functionName: string;
    /** Sub-acción dentro de la función: 'entity' | 'market' | 'battle' */
    subAction?: string;
    /** Identificador externo del recurso afectado (battle_slug, entity name, etc.) */
    targetType?: string | null;
    targetId?: string | null;
    /** Modelo OpenAI usado en la llamada */
    model?: string;
    /** Versión del schema de salida (ej: 'entity_narrative_v2') */
    schemaVersion?: string;
    /** Hash corto del input normalizado, para detectar requests duplicados */
    inputHash?: string;
    /** Latencia total medida en la edge function (ms) */
    latencyMs?: number;
    /** Tokens consumidos según la respuesta de OpenAI */
    inputTokens?: number;
    outputTokens?: number;
    /** finish_reason de OpenAI: 'stop' | 'length' | 'content_filter' | 'tool_calls' */
    finishReason?: string;
    /** Estado del flujo: success / error / fallback / cache_hit */
    status: LlmAuditStatus;
    /** Código corto si hubo error: 'LLM_TIMEOUT' | 'LLM_429' | 'LLM_REFUSAL' | 'LLM_INVALID_JSON' | 'LLM_INCOMPLETE' | 'LLM_UNKNOWN' */
    errorCode?: string;
    /** Mensaje de error truncado, sin PII */
    errorMessage?: string;
    /** Datos extra que el llamador quiera dejar (sin PII ni secrets) */
    extra?: Record<string, unknown>;
}

export async function logLlmCall(
    supabaseAdmin: SupabaseClient,
    entry: LlmAuditEntry,
): Promise<void> {
    try {
        const action = `llm.${entry.functionName}`;
        const payload: Record<string, unknown> = {
            sub_action: entry.subAction ?? null,
            model: entry.model ?? null,
            schema_version: entry.schemaVersion ?? null,
            input_hash: entry.inputHash ?? null,
            latency_ms: entry.latencyMs ?? null,
            input_tokens: entry.inputTokens ?? null,
            output_tokens: entry.outputTokens ?? null,
            finish_reason: entry.finishReason ?? null,
            status: entry.status,
            error_code: entry.errorCode ?? null,
            error_message: entry.errorMessage ? entry.errorMessage.slice(0, 500) : null,
        };
        if (entry.extra && typeof entry.extra === "object") {
            payload.extra = entry.extra;
        }

        const { error } = await supabaseAdmin
            .from("admin_audit_log")
            .insert({
                actor_user_id: entry.actorUserId,
                actor_email: entry.actorEmail ?? null,
                action,
                target_type: entry.targetType ?? null,
                target_id: entry.targetId ?? null,
                payload,
            });

        if (error) {
            console.error(`[llmAudit] Failed to insert audit row for ${action}:`, error.message);
        }
    } catch (err) {
        // Defensa final: jamás romper la edge function por una falla de auditoría.
        console.error("[llmAudit] Unexpected error inserting audit:", err);
    }
}
