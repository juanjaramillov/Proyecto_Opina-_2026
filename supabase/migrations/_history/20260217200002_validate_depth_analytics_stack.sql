-- ==========================================
-- VALIDACIÓN COMPLETA DEPTH ANALYTICS STACK
-- ==========================================

-- 1. Verificar existencia del RPC
select
    routine_name,
    data_type
from information_schema.routines
where routine_schema = 'public'
  and routine_name = 'get_depth_analytics';


-- 2. Verificar columnas de profiles (segmentación)
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'profiles'
order by ordinal_position;


-- 3. Verificar que depth tenga datos
select count(*) as total_depth_rows
from public.depth_answers_structured;


-- 4. Ver muestra de depth
select *
from public.depth_answers_structured
limit 5;


-- 5. Ejecutar RPC sin filtros
select *
from public.get_depth_analytics(
  '51126794-4f3c-479c-9efb-617c311f770e'::uuid,
  null,
  null,
  null
);
