-- Seguridad para logs de estado personal
alter table public.user_state_logs enable row level security;

create policy "User reads own state"
on public.user_state_logs
for select
using (
  anon_id = public.get_or_create_anon_id()
);

-- Vista agregada pública (Nunca expone anon_id)
create or replace view public.v_public_state_summary as
select
  avg(mood_score) as avg_mood,
  avg(economic_score) as avg_economic,
  avg(job_score) as avg_job,
  avg(happiness_score) as avg_happiness,
  count(*) as total_responses
from public.user_state_logs;

grant select on public.v_public_state_summary to authenticated, anon;
