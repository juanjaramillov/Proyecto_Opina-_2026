# Firma del RPC `insert_signal_event` V14 (Nativo)

```sql
CREATE OR REPLACE FUNCTION "public"."insert_signal_event"(
  "p_battle_id" "uuid" DEFAULT NULL,
  "p_option_id" "uuid" DEFAULT NULL,
  "p_session_id" "uuid" DEFAULT NULL::"uuid",
  "p_attribute_id" "uuid" DEFAULT NULL::"uuid",
  "p_client_event_id" "uuid" DEFAULT NULL::"uuid",
  "p_device_hash" "text" DEFAULT NULL::"text",
  "p_value_json" "jsonb" DEFAULT '{}'::jsonb,
  "p_signal_type_code" "text" DEFAULT 'VERSUS_SIGNAL'::text,
  "p_module_type" "text" DEFAULT 'versus'::text,
  "p_entity_id" "uuid" DEFAULT NULL,
  "p_entity_type" "text" DEFAULT NULL,
  "p_context_id" "text" DEFAULT NULL,
  "p_value_numeric" numeric DEFAULT NULL,
  "p_value_text" "text" DEFAULT NULL,
  -- V14 NATIVE PARAMS --
  "p_event_status" "text" DEFAULT NULL,
  "p_origin_module" "text" DEFAULT NULL,
  "p_origin_element" "text" DEFAULT NULL,
  "p_question_id" "uuid" DEFAULT NULL,
  "p_question_version" "int4" DEFAULT NULL,
  "p_display_order" "int4" DEFAULT NULL,
  "p_response_time_ms" "int4" DEFAULT NULL,
  "p_sequence_id" "uuid" DEFAULT NULL,
  "p_sequence_order" "int4" DEFAULT NULL,
  "p_content_snapshot_id" "uuid" DEFAULT NULL,
  "p_left_entity_id" "uuid" DEFAULT NULL,
  "p_right_entity_id" "uuid" DEFAULT NULL,
  "p_selected_entity_id" "uuid" DEFAULT NULL,
  "p_interaction_outcome" "text" DEFAULT NULL
) RETURNS "void" ...
```

## Estado del "Update Posterior"
**ELIMINADO COMPLETAMENTE** en todos los flujos principales (Versus, Torneos, Actualidad, Profundidad). 
El `signalWriteService.ts` fue podado:
```typescript
// V14 Enrichment: Native backend persistence handles all args. No subsequent async UPDATE requirement.
removeOutboxJob(id);
```
El objeto entero se manda directo en `sb.rpc('insert_signal_event', args)`.
