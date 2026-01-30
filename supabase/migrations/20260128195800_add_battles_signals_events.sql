-- Tabla de batallas
create table if not exists battles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  option_a text not null,
  option_b text not null,
  status text not null default 'active', -- active | closed
  created_at timestamp with time zone default now()
);

-- Tabla de eventos de señales
create table if not exists signals_events (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references battles(id) on delete cascade,
  user_id uuid,
  signal_value integer not null check (signal_value in (1, -1)),
  created_at timestamp with time zone default now()
);

-- Índices necesarios (performance)
create index if not exists idx_signals_battle_id on signals_events(battle_id);
create index if not exists idx_signals_created_at on signals_events(created_at);
