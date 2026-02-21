create table if not exists public.depth_answers_structured (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null references auth.users(id) on delete cascade,
    option_id uuid not null references public.battle_options(id) on delete cascade,

    question_key text not null,
    answer_value text not null,

    created_at timestamptz not null default now()
);

-- Indexes for analytics
create index if not exists idx_depth_structured_option on public.depth_answers_structured(option_id);
create index if not exists idx_depth_structured_user on public.depth_answers_structured(user_id);
create index if not exists idx_depth_structured_question on public.depth_answers_structured(question_key);

-- Enable RLS
alter table public.depth_answers_structured enable row level security;

-- Policy: user can insert only their own answers
create policy "depth_structured_insert_own"
on public.depth_answers_structured
for insert
to authenticated
with check (auth.uid() = user_id);

-- Policy: public read aggregated only (optional, safe for MVP)
create policy "depth_structured_select_authenticated"
on public.depth_answers_structured
for select
to authenticated
using (true);
