-- =========================================================
-- State Engine: Depth Trend (Bloque 2B)
-- Objetivo: Ver la evolución temporal de respuestas de profundidad
-- =========================================================

create or replace function public.get_depth_trend(
  p_option_id uuid,
  p_question_key text,
  p_bucket text default 'day', -- 'hour', 'day', 'week'
  p_gender text default null,
  p_age_bucket text default null,
  p_region text default null
)
returns table (
  time_bucket timestamp with time zone,
  avg_value numeric,
  total_responses bigint
)
language plpgsql
security definer
stable
as $$
begin
  return query
  select
    date_trunc(p_bucket, created_at) as time_bucket,
    avg(case 
      when answer_value ~ '^[0-9]+(\.[0-9]+)?$' then answer_value::numeric 
      else null 
    end)::numeric(10,2) as avg_value,
    count(*)::bigint as total_responses
  from public.depth_answers_structured
  where option_id = p_option_id
    and question_key = p_question_key
    and (p_gender is null or gender = p_gender)
    and (p_age_bucket is null or age_bucket = p_age_bucket)
    and (p_region is null or region = p_region)
  group by 1
  order by 1 asc;
end;
$$;

grant execute on function public.get_depth_trend(uuid, text, text, text, text, text) to authenticated;
