-- ==============================================================================
-- Migration: Remove Duplicate RPC Overloads (Fix 400 Bad Request)
-- ==============================================================================
-- PostgREST was suffering from "Ambiguous Function Calls" because multiple
-- `insert_signal_event` signatures existed, leading to RPC clashes when payload matched both.

-- 1. Drop the specific short-signature function reported in the error:
DROP FUNCTION IF EXISTS "public"."insert_signal_event"(
    p_battle_id uuid, 
    p_option_id uuid, 
    p_session_id uuid, 
    p_attribute_id uuid, 
    p_client_event_id uuid, 
    p_device_hash text, 
    p_value_json jsonb, 
    p_signal_type_code text, 
    p_module_type text, 
    p_entity_id uuid, 
    p_entity_type text, 
    p_context_id text, 
    p_value_numeric numeric, 
    p_value_text text
);

-- 2. Drop legacy smaller overloads just in case
DROP FUNCTION IF EXISTS "public"."insert_signal_event"(
    p_battle_id uuid, 
    p_option_id uuid, 
    p_session_id uuid, 
    p_attribute_id uuid, 
    p_client_event_id uuid, 
    p_device_hash text
);

DROP FUNCTION IF EXISTS "public"."insert_signal_event"(
    p_battle_id uuid, 
    p_option_id uuid, 
    p_session_id uuid, 
    p_attribute_id uuid, 
    p_client_event_id uuid
);

-- We KEEP the massive V14 native overload since it's the single source of truth for telemetry.
