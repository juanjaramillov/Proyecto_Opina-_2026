create or replace function public.get_depth_comparison(
    p_option_a uuid,
    p_option_b uuid,
    p_gender text default null,
    p_age_bucket text default null,
    p_region text default null
)
returns table (
    option_id uuid,
    question_key text,
    avg_numeric_value numeric,
    total_responses bigint
)
language sql
stable
as $$
    select
        das.option_id,
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
    where das.option_id in (p_option_a, p_option_b)
      and (p_gender is null or p.gender = p_gender)
      and (p_age_bucket is null or p.age_bucket = p_age_bucket)
      and (p_region is null or p.region = p_region)
    group by das.option_id, das.question_key;
$$;

grant execute on function public.get_depth_comparison(uuid, uuid, text, text, text)
to authenticated;
