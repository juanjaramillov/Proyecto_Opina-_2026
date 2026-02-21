-- ========================================================
-- 20260217160000_mvp_security_hardening.sql
-- Objetivo: Seguridad mínima MVP. Un voto por instancia, solo auth.
-- ========================================================

-- 1) LIMITAR 1 VOTO POR INSTANCIA POR USUARIO
-- Borramos duplicados si existieran antes de aplicar la constraint
-- (Solo en caso de que haya habido pruebas previas)
delete from public.signal_events a using (
      select min(id) as id, user_id, battle_instance_id
      from public.signal_events
      where user_id is not null and battle_instance_id is not null
      group by user_id, battle_instance_id
      having count(*) > 1
) b
where a.user_id = b.user_id 
  and a.battle_instance_id = b.battle_instance_id 
  and a.id <> b.id;

-- Agregar constraint única
alter table public.signal_events 
add constraint signal_events_one_vote_per_instance 
unique (user_id, battle_instance_id);


-- 2) ELIMINAR ACCESO ANÓNIMO A SEÑALES
-- Revocar permisos de inserción directa a anon
revoke insert on table public.signal_events from anon;
revoke insert on table public.signal_events from authenticated; -- Preferimos usar el RPC

-- Limpiar políticas RLS legacy
drop policy if exists "signal_events_insert_public" on public.signal_events;
drop policy if exists "signal_events_insert_authenticated" on public.signal_events;

-- Política estricta: Solo leer lo propio (ya existe, la reforzamos)
create policy "signal_events_select_own"
on public.signal_events for select
to authenticated
using (user_id = auth.uid());


-- 3) REFUERZO DE RPC insert_signal_event (Stricter validation)
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
    v_tier text;
    v_completeness int;
    v_already_voted boolean;
begin
    -- 1. IDENTIDAD OBLIGATORIA
    v_user_id := auth.uid();
    if v_user_id is null then
        raise exception 'Acceso denegado: Se requiere sesión activa para votar.';
    end if;

    -- 2. RESOLVER INSTANCIA
    select id into v_instance_id
    from public.battle_instances
    where battle_id = p_battle_id
      and (
        (starts_at is null and ends_at is null)
        or (now() between starts_at and ends_at)
      )
    order by version desc, created_at desc
    limit 1;

    if v_instance_id is null then
        raise exception 'Batalla no disponible: No hay una instancia activa.';
    end if;

    -- 3. VALIDAR VOTO ÚNICO (Doble check preventivo)
    select exists (
        select 1 from public.signal_events 
        where user_id = v_user_id and battle_instance_id = v_instance_id
    ) into v_already_voted;

    if v_already_voted then
        raise exception 'Ya has participado en esta batalla.';
    end if;

    -- 4. CONTEXTO DE USUARIO
    select signal_weight into v_weight
    from public.user_stats
    where user_id = v_user_id;

    select tier, profile_completeness into v_tier, v_completeness
    from public.user_profiles
    where user_id = v_user_id;

    -- 5. INSERT
    insert into public.signal_events (
        user_id, battle_id, battle_instance_id, option_id,
        signal_weight, user_tier, profile_completeness,
        source_type, created_at
    )
    values (
        v_user_id, p_battle_id, v_instance_id, p_option_id,
        coalesce(v_weight, 1.0), coalesce(v_tier, 'registered'), coalesce(v_completeness, 0),
        'versus', now()
    );

    -- 6. ACTUALIZAR STATS (Transactional)
    insert into public.user_stats (user_id, total_signals, weighted_score, last_signal_at)
    values (v_user_id, 1, coalesce(v_weight, 1.0), now())
    on conflict (user_id) do update set
        total_signals = user_stats.total_signals + 1,
        weighted_score = user_stats.weighted_score + excluded.weighted_score,
        last_signal_at = now(),
        updated_at = now();

    -- 7. RECALCULAR NIVEL
    update public.user_stats
    set
        level = floor(total_signals / 10) + 1,
        signal_weight = 1 + (floor(total_signals / 10) * 0.1)
    where user_id = v_user_id;

end;
$$;

-- 4) PERMISOS FINALES Y CIERRE ANÓNIMO
grant execute on function public.insert_signal_event to authenticated;
revoke execute on function public.insert_signal_event from anon;

-- Revocar acceso a KPIs para anónimos (Eliminar acceso anónimo real)
revoke execute on function public.kpi_share_of_preference from anon;
revoke execute on function public.kpi_trend_velocity from anon;
revoke execute on function public.kpi_engagement_quality from anon;

-- Restringir lectura de catálogo a usuarios autenticados (opcional, pero siguiendo "eliminar cualquier acceso")
-- Nota: Si se desea que el catálogo sea público para "gancho", comentar estas líneas.
drop policy if exists "battles_select_public" on public.battles;
create policy "battles_select_authenticated" on public.battles for select to authenticated using (true);

drop policy if exists "battle_options_select_public" on public.battle_options;
create policy "battle_options_select_authenticated" on public.battle_options for select to authenticated using (true);
