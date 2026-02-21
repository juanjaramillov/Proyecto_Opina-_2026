create or replace function public.get_or_create_anon_id()
returns text
language plpgsql
security definer
as $$
declare
  v_user uuid;
  v_anon text;
begin
  v_user := auth.uid();

  if v_user is null then
    raise exception 'User not authenticated';
  end if;

  select anon_id into v_anon
  from public.anonymous_identities
  where user_id = v_user;

  if v_anon is not null then
    return v_anon;
  end if;

  -- Generación de anon_id persistente pero irreversible basado en user_id y un secreto
  -- Nota: postgres no tiene digest por defecto, se asume pgcrypto habilitado o uso de encode/sha
  v_anon := encode(digest(v_user::text || current_setting('app.settings.jwt_secret'), 'sha256'), 'hex');

  insert into public.anonymous_identities (user_id, anon_id)
  values (v_user, v_anon);

  return v_anon;
end;
$$;

grant execute on function public.get_or_create_anon_id() to authenticated;
