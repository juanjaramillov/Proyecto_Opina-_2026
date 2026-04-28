# Runbook — Edge Functions LLM (`llm-narrative` + `insights-generator`)

> Última actualización: 2026-04-27 (Fase A+B+C tras review de ChatGPT, ronda 1).

Este runbook cubre las dos edge functions de Opina+ que llaman a OpenAI:

- `supabase/functions/llm-narrative/` — narrativas ejecutivas para entity / market (rol admin / b2b_pro).
- `supabase/functions/insights-generator/` — `ai_summary` por batalla (rol admin).

## 1. Variables de entorno

Configurar en Supabase Dashboard → Project Settings → Edge Functions → Secrets.

| Variable | Default | Descripción |
| --- | --- | --- |
| `OPENAI_API_KEY` | — (requerido) | Secret de OpenAI. Sin esto la función responde 500. |
| `OPENAI_MODEL_NARRATIVE` | `gpt-4o` | Modelo usado por `llm-narrative`. |
| `OPENAI_TEMPERATURE_NARRATIVE` | `0.2` | Temperature para narrativa B2B. Subir solo si querés más variabilidad. |
| `OPENAI_MAX_TOKENS_NARRATIVE` | `700` | Cap de tokens de salida. |
| `OPENAI_MODEL_INSIGHTS` | `gpt-4o-mini` | Modelo usado por `insights-generator`. |
| `OPENAI_TEMPERATURE_INSIGHTS` | `0.3` | Temperature para resumen de batalla. |
| `OPENAI_MAX_TOKENS_INSIGHTS` | `400` | Cap de tokens. |
| `OPENAI_TIMEOUT_MS` | `12000` | Timeout duro para llamadas a OpenAI (ambas). |
| `INSIGHTS_CACHE_TTL_HOURS` | `24` | TTL del `ai_summary` cacheado en `battles`. Pasar `force: true` en el body lo ignora. |

> **Cómo cambiar el modelo:** actualizar la variable en Supabase Secrets y redeployar la función. No hace falta migración SQL ni cambio de código.

## 2. Schemas de respuesta

Ambas funciones devuelven JSON estructurado vía OpenAI Structured Outputs (`strict: true`, `additionalProperties: false`).

### `llm-narrative` — entity (`schema_version: "entity_narrative_v2"`)

```json
{
  "schema_version": "entity_narrative_v2",
  "intelligenceText": "...",
  "confidence": "Alta | Media | Baja",
  "category": "Liderazgo claro | Ventaja moderada | Señal insuficiente | ...",
  "signal_quality": "solida | preliminar | insuficiente",
  "executive_summary": "...",
  "methodological_warning": "...",
  "risk_level": "bajo | medio | alto"
}
```

`intelligenceText` y `confidence` (capitalizado: `Alta`/`Media`/`Baja`) se mantienen exactamente con el contrato legacy que valida el frontend `LLMNarrativeProvider.ts` (Zod estricto). La idea de "insuficiente" pasa al campo nuevo `signal_quality`, que el frontend puede ignorar sin romperse.

### `llm-narrative` — market (`schema_version: "market_narrative_v2"`)

```json
{
  "schema_version": "market_narrative_v2",
  "summary": "...",
  "findings": ["...", "..."],
  "criticalAlert": "",
  "strategicRecommendation": "...",
  "market_structure": "liderazgo_claro | ventaja_moderada | empate_tecnico | mercado_fragmentado | senal_insuficiente",
  "confidence": "alta | media | baja | insuficiente",
  "methodological_warning": "..."
}
```

### `insights-generator` (`schema_version: "battle_insight_v1"`)

```json
{
  "success": true,
  "ai_summary": "Resumen ejecutivo de 1-3 líneas...",
  "payload": {
    "schema_version": "battle_insight_v1",
    "executive_summary": "...",
    "competitive_state": "dominio_claro | ventaja_moderada | empate_tecnico | mercado_fragmentado",
    "leader_label": "Nombre opción ganadora o cadena vacía si empate",
    "confidence_label": "alta | media | baja"
  },
  "cached": false
}
```

`battles.ai_summary` (TEXT) sigue almacenando solo `executive_summary` para no romper consumidores. El JSON estructurado completo queda en la respuesta de la función y en telemetría.

## 3. Telemetría

Cada llamada exitosa, en error, en fallback o cache hit deja un registro en `public.admin_audit_log` con:

- `action = 'llm.llm-narrative'` o `'llm.insights-generator'`
- `actor_user_id` = quien invocó (admin o b2b_pro)
- `target_type` / `target_id` = `entity_name` / `battle_slug` / `market`
- `payload` jsonb con: `sub_action`, `model`, `schema_version`, `input_hash`, `latency_ms`, `input_tokens`, `output_tokens`, `finish_reason`, `status`, `error_code`, `error_message`

### Consultas útiles (pegar en SQL Editor de Supabase)

Errores LLM últimas 24h:

```sql
SELECT created_at, action, target_id, payload->>'error_code' AS code, payload->>'error_message' AS msg, payload->>'latency_ms' AS latency_ms
FROM public.admin_audit_log
WHERE action LIKE 'llm.%'
  AND payload->>'status' = 'error'
  AND created_at > now() - interval '24 hours'
ORDER BY created_at DESC;
```

Costo aproximado por modelo (usando `input_tokens` + `output_tokens`):

```sql
SELECT
  payload->>'model' AS model,
  count(*) AS calls,
  sum((payload->>'input_tokens')::int) AS in_tokens,
  sum((payload->>'output_tokens')::int) AS out_tokens
FROM public.admin_audit_log
WHERE action LIKE 'llm.%'
  AND payload->>'status' = 'success'
  AND created_at > now() - interval '7 days'
GROUP BY payload->>'model'
ORDER BY calls DESC;
```

Latencia p50/p95 últimas 24h:

```sql
SELECT
  action,
  percentile_cont(0.5) WITHIN GROUP (ORDER BY (payload->>'latency_ms')::int) AS p50_ms,
  percentile_cont(0.95) WITHIN GROUP (ORDER BY (payload->>'latency_ms')::int) AS p95_ms,
  count(*) AS calls
FROM public.admin_audit_log
WHERE action LIKE 'llm.%'
  AND payload->>'status' IN ('success', 'cache_hit')
  AND created_at > now() - interval '24 hours'
GROUP BY action;
```

## 4. Fallback determinístico

`llm-narrative` saltea OpenAI y devuelve respuesta canned cuando:

- `nEff < 30`, **o**
- `stabilityLabel === "Insuficiente"`

Razón: cualquier narrativa LLM con esos inputs sería ruido. El fallback queda registrado en audit log con `status = 'fallback'`.

**Cómo desactivar el fallback** (no recomendado): editar `shouldUseFallbackEntity` en `supabase/functions/llm-narrative/index.ts` y redeployar. No hay flag por env porque no quieres apagar esta protección por accidente desde el dashboard.

## 5. Cache TTL en `insights-generator`

El `ai_summary` cacheado se reutiliza si `ai_summary_generated_at` es menor a `INSIGHTS_CACHE_TTL_HOURS` (24h por defecto). Para forzar regeneración, pasar `{ "battle_slug": "...", "force": true }`.

## 6. Eval set (regresión cualitativa)

Antes de cambiar prompt o modelo, correr el eval:

```bash
# Desde la raíz del repo
export OPINA_FUNCTIONS_URL="https://<project>.supabase.co/functions/v1"
export OPINA_ADMIN_JWT="<jwt-de-un-admin-vivo>"
deno run --allow-net --allow-env scripts/evals/llm-narrative.ts
```

Cubre 8 casos (muestra insuficiente, empate técnico, líder dominante, volátil, mercado fragmentado, prompt injection, sin histórico, control). Exit code 1 si algún caso falla.

## 7. Despliegue

```bash
# Desplegar las dos funciones
supabase functions deploy llm-narrative
supabase functions deploy insights-generator
```

> **No hay migración SQL nueva en este sprint.** Las funciones reutilizan `admin_audit_log` y `get_segmented_ranking` ya existentes.

## 8. Troubleshooting rápido

| Síntoma | Probable causa | Acción |
| --- | --- | --- |
| `502 Respuesta LLM no utilizable` | OpenAI cortó por content filter | Revisar `error_code` en audit. Si es `LLM_CONTENT_FILTER`, sanear input. |
| `502 Respuesta LLM inválida` | El JSON del modelo no pasó `validateXNarrative` | Revisar `payload->>'error_message'` en audit. Probable: `intelligenceText` vacío. |
| Latencia > 12s | Timeout duro | El `withTimeout` aborta. Revisar logs OpenAI; quizá hace falta subir `OPENAI_TIMEOUT_MS`. |
| 429 frecuentes | Rate limit OpenAI | El `withRetry` ya hace 3 intentos con backoff 500ms→2s. Si persiste, subir tier en OpenAI o agregar rate limit propio. |
| Respuesta cacheada que ya no aplica | Cache TTL aún vigente | Mandar `{ force: true }` o esperar TTL. |
| Fallback inesperado en entity | `nEff < 30` o `stabilityLabel = Insuficiente` | Es by design. Verificar upstream que entrega esos valores. |
