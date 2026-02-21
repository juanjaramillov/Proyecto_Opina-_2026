-- ==========================================
-- Fix Depth Analytics RPC (Bloque 11)
-- Alinea el RPC con la tabla public.profiles
-- ==========================================

create or replace function public.get_depth_analytics(
    p_option_id uuid,
    p_gender text default null,
    p_age_bucket text default null,
    p_region text default null
)
returns table (
    question_key text,
    avg_numeric_value numeric,
    total_responses bigint
)
language sql
stable
as $$
    select
        das.question_key,
        avg(
            case 
                when das.answer_value ~ '^[0-9]+$'
                then das.answer_value::numeric
                else null
            end
        ) as avg_numeric_value,
        count(*) as total_responses
    from public.depth_answers_structured das
    join public.profiles p
        on p.id = das.user_id
    where das.option_id = p_option_id
      and (p_gender is null or p.gender = p_gender)
      and (p_age_bucket is null or p.age_bucket = p_age_bucket)
      and (p_region is null or p.region = p_region)
    group by das.question_key;
$$;

grant execute on function public.get_depth_analytics(uuid, text, text, text)
to authenticated;
