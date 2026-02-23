-- FIX: Drop the legacy overloaded version of insert_signal_event to resolve PGRST203 ambiguity
-- The new version is public.insert_signal_event(uuid, uuid, text, uuid)

DROP FUNCTION IF EXISTS public.insert_signal_event(uuid, uuid, uuid, uuid);
