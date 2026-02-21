create table if not exists public.anonymous_identities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  anon_id text unique not null,
  created_at timestamp with time zone default now()
);

create index if not exists idx_anonymous_anon_id 
on public.anonymous_identities(anon_id);
