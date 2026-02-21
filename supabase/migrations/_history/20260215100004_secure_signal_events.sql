-- 1. Create secure insert function
create or replace function insert_signal_event(
    p_user_id uuid,
    p_battle_id uuid,
    p_option_id uuid
)
returns void
language plpgsql
security definer
as $$
declare
    v_exists boolean;
begin
    -- Validar duplicado
    select exists(
        select 1
        from signal_events
        where user_id = p_user_id
        and battle_id = p_battle_id
    ) into v_exists;

    if v_exists then
        raise exception 'User already voted in this battle';
    end if;

    -- Insertar señal
    insert into signal_events (user_id, battle_id, option_id)
    values (p_user_id, p_battle_id, p_option_id);
end;
$$;

-- 2. Revoke direct insert permission
revoke insert on signal_events from authenticated;
revoke insert on signal_events from anon;
