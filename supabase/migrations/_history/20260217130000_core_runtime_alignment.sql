-- ==============================================================================
-- 20260217130000_core_runtime_alignment.sql
-- OBJETIVO: Consolidar infraestructura crítica, user_stats y RPC principal.
-- ==============================================================================

-- 1. TABLAS CORE (Si no existen)

-- Tabla de estadísticas acumuladas por usuario
create table if not exists public.user_stats (
    user_id uuid primary key references auth.users(id) on delete cascade,
    total_signals integer not null default 0,
    weighted_score numeric not null default 0,
    level integer not null default 1,
    signal_weight numeric not null default 1,
    last_signal_at timestamp with time zone,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

create index if not exists idx_user_stats_weighted_score on public.user_stats (weighted_score desc);

-- Tabla de instancias de batalla (si no fue creada en baselines previos)
-- Nota: battle_instances suele venir en 20260128_signals_schema.sql
create table if not exists public.battle_instances (
    id uuid primary key default gen_random_uuid(),
    battle_id uuid not null references public.battles(id) on delete cascade,
    version int not null default 1,
    starts_at timestamptz,
    ends_at timestamptz,
    context jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    unique (battle_id, version)
);

-- 2. RPC: insert_signal_event (VERSIÓN FINAL)
-- Esta función resuelve el contexto completo y actualiza stats en una sola transacción.

create or replace function public.insert_signal_event(
    p_battle_id uuid,
    p_option_id uuid
)
returns void
language plpgsql
security definer
as $$
declare
    v_user_id uuid;
    v_instance_id uuid;
    v_weight numeric;
    v_tier text := 'registered'; -- Default para usuarios auth
    v_completeness int := 0;
begin
    -- 1. Obtener identidad del usuario
    v_user_id := auth.uid();
    if v_user_id is null then
        raise exception 'User not authenticated';
    end if;

    -- 2. Resolver instancia activa para esta batalla
    -- Si no hay instancia con fechas, tomamos la de mayor versión o creada recientemente.
    select id into v_instance_id
    from public.battle_instances
    where battle_id = p_battle_id
      and (
        (starts_at is null and ends_at is null)
        or (now() between starts_at and ends_at)
      )
    order by version desc, created_at desc
    limit 1;

    -- 3. Obtener peso/contexto actual del usuario desde user_stats
    select signal_weight 
    into v_weight
    from public.user_stats
    where user_id = v_user_id;

    if v_weight is null then
        v_weight := 1.0;
    end if;

    -- 4. Opcional: Obtener datos de perfil para auditoría en el evento
    select tier, profile_completeness
    into v_tier, v_completeness
    from public.user_profiles
    where user_id = v_user_id;

    -- 5. Insertar el evento de señal
    insert into public.signal_events (
        user_id,
        battle_id,
        battle_instance_id,
        option_id,
        signal_weight,
        user_tier,
        profile_completeness,
        source_type,
        created_at
    )
    values (
        v_user_id,
        p_battle_id,
        v_instance_id,
        p_option_id,
        v_weight,
        coalesce(v_tier, 'registered'),
        coalesce(v_completeness, 0),
        'versus',
        now()
    );

    -- 6. Actualizar o Insertar en user_stats
    insert into public.user_stats (
        user_id,
        total_signals,
        weighted_score,
        last_signal_at
    )
    values (
        v_user_id,
        1,
        v_weight,
        now()
    )
    on conflict (user_id)
    do update set
        total_signals = user_stats.total_signals + 1,
        weighted_score = user_stats.weighted_score + v_weight,
        last_signal_at = now(),
        updated_at = now();

    -- 7. Recalcular nivel y peso basado en actividad
    -- Lógica simple: +0.1 de peso cada 10 señales, nivel sube cada 10.
    update public.user_stats
    set
        level = floor(total_signals / 10) + 1,
        signal_weight = 1 + (floor(total_signals / 10) * 0.1)
    where user_id = v_user_id;

end;
$$;

-- 3. PERMISOS Y RLS

-- Permisos de ejecución
grant execute on function public.insert_signal_event(uuid, uuid) to authenticated;

-- Asegurar RLS en signal_events (para que el usuario vea su impacto)
alter table public.signal_events enable row level security;

do $$
begin
    if not exists (
        select 1 from pg_policy where polname = 'signal_events_select_own'
    ) then
        create policy "signal_events_select_own"
        on public.signal_events for select
        to authenticated
        using (user_id = auth.uid());
    end if;
end $$;
