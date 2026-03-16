-- Migración para corregir histórico de señales de "Actualidad" mal tipadas
-- e incluye tabla de auditoría para la trazabilidad estricta.

BEGIN;

-- 1. Crear tabla de auditoría
CREATE TABLE IF NOT EXISTS public.signal_migration_audit_log (
    id SERIAL PRIMARY KEY,
    migration_name TEXT,
    execution_time TIMESTAMPTZ DEFAULT NOW(),
    records_detected INT,
    records_affected INT,
    filter_criteria TEXT,
    affected_columns TEXT,
    notes TEXT
);

-- 2. Ejecutar la migración con trazabilidad
DO $$
DECLARE
    v_detected INT;
    v_affected INT;
    v_filter TEXT := 'module_type = ''versus'' AND value_json->>''source'' = ''actualidad''';
BEGIN
    -- Contar pre-migración (No detecta falsos positivos porque exige explicitamente source=actualidad)
    SELECT COUNT(*) INTO v_detected
    FROM public.signal_events
    WHERE module_type = 'versus' 
      AND value_json->>'source' = 'actualidad';

    -- Ejecutar parche
    UPDATE public.signal_events
    SET 
        module_type = 'news',
        signal_type_id = (SELECT id FROM public.signal_types WHERE code = 'CONTEXT_SIGNAL' LIMIT 1),
        value_json = jsonb_set(value_json, '{source}', '"news"')
    WHERE module_type = 'versus' 
      AND value_json->>'source' = 'actualidad';

    -- Obtener cuántos se afectaron
    GET DIAGNOSTICS v_affected = ROW_COUNT;

    -- Guardar evidencia imborrable
    INSERT INTO public.signal_migration_audit_log 
    (migration_name, records_detected, records_affected, filter_criteria, affected_columns, notes)
    VALUES 
    (
        'Actualidad_to_News_Source_Fix', 
        v_detected, 
        v_affected, 
        v_filter, 
        'module_type, signal_type_id, value_json.source',
        'Corrección histórica de Bloque 2. Solo apuntó a anomalías exactas de fuente: actualidad erróneamente en versus.'
    );
END $$;

COMMIT;
