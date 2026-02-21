create or replace view public.depth_option_summary as
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
group by das.option_id, das.question_key;
