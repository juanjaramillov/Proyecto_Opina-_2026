-- Paso 1: Tabla de eventos de señal
create table if not exists signal_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  source_type text not null, -- 'versus', 'review', etc.
  source_id text not null,   -- versusId
  choice_label text,         -- opción elegida
  title text not null,       -- pregunta visible
  created_at timestamp with time zone default now()
);

create index if not exists idx_signal_events_user on signal_events(user_id);
create index if not exists idx_signal_events_source on signal_events(source_type, source_id);
create index if not exists idx_signal_events_time on signal_events(created_at);

-- Paso 5: Query base para evolución temporal (referencia)
-- select
--   date_trunc('day', created_at) as day,
--   choice_label,
--   count(*) as signals
-- from signal_events
-- where source_type = 'versus'
--   and source_id = :versus_id
-- group by day, choice_label
-- order by day asc;
