alter table public.signal_events
add column if not exists anon_id text;

create index if not exists idx_signal_events_anon_id
on public.signal_events(anon_id);

-- PRECAUCIÓN: Eliminación de user_id para anonimato irreversible
alter table public.signal_events
drop column if exists user_id;
