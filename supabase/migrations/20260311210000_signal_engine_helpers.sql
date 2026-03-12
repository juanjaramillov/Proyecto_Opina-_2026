-- =========================================================
-- OPINA+ | SIGNAL ENGINE HELPERS
-- additive only
-- =========================================================

create or replace function public.record_signal_event(
  p_user_id uuid,
  p_anon_id text,
  p_signal_type_code text,
  p_entity_id uuid,
  p_context_id uuid default null,
  p_verification_level_code text default null,
  p_value_numeric numeric default null,
  p_value_text text default null,
  p_value_boolean boolean default null,
  p_value_json jsonb default '{}'::jsonb,
  p_raw_weight numeric default 1.0,
  p_effective_weight numeric default null,
  p_source_module text default null,
  p_source_record_id text default null,
  p_occurred_at timestamptz default now(),
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
as $$
declare
  v_signal_type_id bigint;
  v_verification_level_id bigint;
  v_effective_weight numeric;
  v_id uuid;
  v_multiplier numeric := 1.0;
begin
  if p_user_id is null and p_anon_id is null then
    raise exception 'record_signal_event requires p_user_id or p_anon_id';
  end if;

  select id
    into v_signal_type_id
  from public.signal_types
  where code = p_signal_type_code
    and is_active = true
  limit 1;

  if v_signal_type_id is null then
    raise exception 'Unknown signal type code: %', p_signal_type_code;
  end if;

  if p_verification_level_code is not null then
    select id, weight_multiplier
      into v_verification_level_id, v_multiplier
    from public.verification_levels
    where code = p_verification_level_code
      and is_active = true
    limit 1;
  end if;

  v_effective_weight := coalesce(p_effective_weight, p_raw_weight * coalesce(v_multiplier, 1.0));

  insert into public.signal_events (
    user_id,
    anon_id,
    signal_type_id,
    entity_id,
    context_id,
    verification_level_id,
    value_numeric,
    value_text,
    value_boolean,
    value_json,
    raw_weight,
    effective_weight,
    source_module,
    source_record_id,
    occurred_at,
    metadata
  )
  values (
    p_user_id,
    p_anon_id,
    v_signal_type_id,
    p_entity_id,
    p_context_id,
    v_verification_level_id,
    p_value_numeric,
    p_value_text,
    p_value_boolean,
    coalesce(p_value_json, '{}'::jsonb),
    coalesce(p_raw_weight, 1.0),
    coalesce(v_effective_weight, 1.0),
    p_source_module,
    p_source_record_id,
    coalesce(p_occurred_at, now()),
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning id into v_id;

  return v_id;
end;
$$;

comment on function public.record_signal_event is 'Función base centralizada para registrar señales en signal_events';


create or replace function public.record_versus_signal(
  p_user_id uuid,
  p_anon_id text,
  p_entity_id uuid,
  p_context_id uuid default null,
  p_verification_level_code text default null,
  p_value_json jsonb default '{}'::jsonb,
  p_source_record_id text default null,
  p_occurred_at timestamptz default now()
)
returns uuid
language sql
as $$
  select public.record_signal_event(
    p_user_id,
    p_anon_id,
    'VERSUS_SIGNAL',
    p_entity_id,
    p_context_id,
    p_verification_level_code,
    null,
    null,
    null,
    coalesce(p_value_json, '{}'::jsonb),
    1.0,
    null,
    'versus',
    p_source_record_id,
    p_occurred_at,
    '{}'::jsonb
  );
$$;

create or replace function public.record_progressive_signal(
  p_user_id uuid,
  p_anon_id text,
  p_entity_id uuid,
  p_context_id uuid default null,
  p_verification_level_code text default null,
  p_value_json jsonb default '{}'::jsonb,
  p_source_record_id text default null,
  p_occurred_at timestamptz default now()
)
returns uuid
language sql
as $$
  select public.record_signal_event(
    p_user_id,
    p_anon_id,
    'PROGRESSIVE_SIGNAL',
    p_entity_id,
    p_context_id,
    p_verification_level_code,
    null,
    null,
    null,
    coalesce(p_value_json, '{}'::jsonb),
    1.0,
    null,
    'progressive',
    p_source_record_id,
    p_occurred_at,
    '{}'::jsonb
  );
$$;

create or replace function public.record_depth_signal(
  p_user_id uuid,
  p_anon_id text,
  p_entity_id uuid,
  p_context_id uuid default null,
  p_verification_level_code text default null,
  p_value_numeric numeric default null,
  p_value_text text default null,
  p_value_boolean boolean default null,
  p_value_json jsonb default '{}'::jsonb,
  p_source_record_id text default null,
  p_occurred_at timestamptz default now()
)
returns uuid
language sql
as $$
  select public.record_signal_event(
    p_user_id,
    p_anon_id,
    'DEPTH_SIGNAL',
    p_entity_id,
    p_context_id,
    p_verification_level_code,
    p_value_numeric,
    p_value_text,
    p_value_boolean,
    coalesce(p_value_json, '{}'::jsonb),
    1.0,
    null,
    'depth',
    p_source_record_id,
    p_occurred_at,
    '{}'::jsonb
  );
$$;

create or replace function public.record_context_signal(
  p_user_id uuid,
  p_anon_id text,
  p_entity_id uuid,
  p_context_id uuid default null,
  p_verification_level_code text default null,
  p_value_numeric numeric default null,
  p_value_text text default null,
  p_value_boolean boolean default null,
  p_value_json jsonb default '{}'::jsonb,
  p_source_record_id text default null,
  p_occurred_at timestamptz default now()
)
returns uuid
language sql
as $$
  select public.record_signal_event(
    p_user_id,
    p_anon_id,
    'CONTEXT_SIGNAL',
    p_entity_id,
    p_context_id,
    p_verification_level_code,
    p_value_numeric,
    p_value_text,
    p_value_boolean,
    coalesce(p_value_json, '{}'::jsonb),
    1.0,
    null,
    'news',
    p_source_record_id,
    p_occurred_at,
    '{}'::jsonb
  );
$$;

create or replace function public.record_personal_pulse_signal(
  p_user_id uuid,
  p_anon_id text,
  p_entity_id uuid,
  p_context_id uuid default null,
  p_verification_level_code text default null,
  p_value_numeric numeric default null,
  p_value_text text default null,
  p_value_boolean boolean default null,
  p_value_json jsonb default '{}'::jsonb,
  p_source_record_id text default null,
  p_occurred_at timestamptz default now()
)
returns uuid
language sql
as $$
  select public.record_signal_event(
    p_user_id,
    p_anon_id,
    'PERSONAL_PULSE_SIGNAL',
    p_entity_id,
    p_context_id,
    p_verification_level_code,
    p_value_numeric,
    p_value_text,
    p_value_boolean,
    coalesce(p_value_json, '{}'::jsonb),
    1.0,
    null,
    'pulse',
    p_source_record_id,
    p_occurred_at,
    '{}'::jsonb
  );
$$;
