create or replace function resolve_battle_context(p_battle_slug text)
returns json
language plpgsql
security definer
as $$
declare
  b record;
begin
  select *
  into b
  from battles
  where lower(title) = lower(p_battle_slug)
  limit 1;

  if b.id is null then
    return json_build_object(
      'ok', false,
      'error', 'Battle not found'
    );
  end if;

  return json_build_object(
    'ok', true,
    'battle_id', b.id,
    'battle_instance_id', b.id, -- ✅ alias para compatibilidad
    'battle_slug', p_battle_slug,
    'title', b.title,
    'options', json_build_array(
      json_build_object('id', null, 'label', b.option_a, 'image_url', null, 'sort_order', 1),
      json_build_object('id', null, 'label', b.option_b, 'image_url', null, 'sort_order', 2)
    )
  );
end;
$$;

grant execute on function resolve_battle_context(text) to anon, authenticated;
