-- Migración para arreglar los contadores de actividad del usuario en el Perfil
-- El sistema original filtraba solo mediante user_id = auth.uid(), pero actualmente las señales
-- se persisten preferentemente con anon_id. Modificamos para usar un filtro inclusivo.

CREATE OR REPLACE FUNCTION "public"."get_my_activity_history"("p_limit" integer DEFAULT 20) RETURNS TABLE("id" "text", "created_at" timestamp with time zone, "module_type" "text", "option_id" "uuid", "battle_id" "uuid")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  with latest as (
    select distinct on (signal_id)
      signal_id::text as id,
      created_at,
      module_type,
      option_id,
      battle_id
    from public.signal_events
    where user_id = auth.uid() OR anon_id = public.get_or_create_anon_id()
    order by signal_id, created_at desc
  )
  select *
  from latest
  order by created_at desc
  limit greatest(1, least(coalesce(p_limit, 20), 100));
$$;

ALTER FUNCTION "public"."get_my_activity_history"("p_limit" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_my_participation_summary"() RETURNS TABLE("versus_count" integer, "progressive_count" integer, "depth_count" integer)
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select
    count(distinct signal_id) filter (where module_type = 'versus')::int      as versus_count,
    count(distinct signal_id) filter (where module_type = 'progressive')::int as progressive_count,
    count(distinct signal_id) filter (where module_type = 'depth')::int       as depth_count
  from public.signal_events
  where user_id = auth.uid() OR anon_id = public.get_or_create_anon_id();
$$;

ALTER FUNCTION "public"."get_my_participation_summary"() OWNER TO "postgres";
