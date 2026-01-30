-- RPC: resolve_battle_context
-- Implementa Regla A: Instancia Única Continua.
-- Si no hay instancia activa para la batalla, crea una nueva.

drop function if exists resolve_battle_context(text);

create or replace function resolve_battle_context(p_battle_slug text)
returns jsonb
language plpgsql
security definer -- Para poder insertar en battle_instances sin que el usuario anon necesite permisos directos de escritura (opcional según RLS)
as $$
declare
  v_battle_id uuid;
  v_title text;
  v_instance_id uuid;
  v_options jsonb;
begin
  -- 1. Obtener ID de la batalla por slug
  -- Asumimos que la tabla battles tiene columna slug. Si falla, el usuario nos avisará.
  select id, title into v_battle_id, v_title
  from battles
  where slug = p_battle_slug
  limit 1;

  if v_battle_id is null then
    return jsonb_build_object('ok', false, 'error', 'Battle not found for slug: ' || p_battle_slug);
  end if;

  -- 2. Buscar instancia activa (Regla A)
  -- Activa = starts_at ya pasó y (ends_at es null o futuro)
  select id into v_instance_id
  from battle_instances
  where battle_id = v_battle_id
    and starts_at <= now()
    and (ends_at is null or ends_at > now())
  order by starts_at desc
  limit 1;

  -- 3. Si no existe, crearla
  if v_instance_id is null then
    insert into battle_instances (battle_id, starts_at, version, context)
    values (v_battle_id, now(), 1, '{}') 
    returning id into v_instance_id;
  end if;

  -- 4. Obtener opciones de la batalla
  select jsonb_agg(
    jsonb_build_object(
      'id', id,
      'label', label,
      'image_url', image_url,
      'sort_order', sort_order
    ) order by sort_order asc
  ) into v_options
  from battle_options
  where battle_id = v_battle_id;

  -- 5. Retornar todo empaquetado
  return jsonb_build_object(
    'ok', true,
    'battle_id', v_battle_id,
    'battle_slug', p_battle_slug,
    'battle_instance_id', v_instance_id,
    'title', v_title,
    'options', coalesce(v_options, '[]'::jsonb)
  );
end;
$$;
