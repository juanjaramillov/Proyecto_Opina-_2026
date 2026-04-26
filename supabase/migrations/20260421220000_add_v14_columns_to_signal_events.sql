-- Agregar columnas faltantes para el enriquecimiento V14 (extend_insert_signal_event_v14)

ALTER TABLE "public"."signal_events"
  ADD COLUMN IF NOT EXISTS "event_status" text,
  ADD COLUMN IF NOT EXISTS "origin_module" text,
  ADD COLUMN IF NOT EXISTS "origin_element" text,
  ADD COLUMN IF NOT EXISTS "question_id" uuid,
  ADD COLUMN IF NOT EXISTS "question_version" int4,
  ADD COLUMN IF NOT EXISTS "display_order" int4,
  ADD COLUMN IF NOT EXISTS "response_time_ms" int4,
  ADD COLUMN IF NOT EXISTS "sequence_id" uuid,
  ADD COLUMN IF NOT EXISTS "sequence_order" int4,
  ADD COLUMN IF NOT EXISTS "content_snapshot_id" uuid,
  ADD COLUMN IF NOT EXISTS "left_entity_id" uuid,
  ADD COLUMN IF NOT EXISTS "right_entity_id" uuid,
  ADD COLUMN IF NOT EXISTS "selected_entity_id" uuid,
  ADD COLUMN IF NOT EXISTS "interaction_outcome" text;
