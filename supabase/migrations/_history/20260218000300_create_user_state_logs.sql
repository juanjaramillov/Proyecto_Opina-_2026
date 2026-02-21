create table if not exists public.user_state_logs (
  id uuid primary key default gen_random_uuid(),
  anon_id text not null,
  mood_score int,
  economic_score int,
  job_score int,
  happiness_score int,
  created_at timestamp with time zone default now()
);

create index if not exists idx_user_state_anon
on public.user_state_logs(anon_id);
