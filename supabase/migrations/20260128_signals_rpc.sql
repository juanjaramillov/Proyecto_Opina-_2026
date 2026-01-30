-- =========================
-- A) Vista: instancia activa por battle_id
-- Regla: "activa" = (starts_at null o <= now) y (ends_at null o > now)
-- Si hay varias, toma la más nueva.
-- =========================
create or replace view public.v_active_battle_instance as
select distinct on (bi.battle_id)
  bi.battle_id,
  bi.id as battle_instance_id,
  bi.version,
  bi.starts_at,
  bi.ends_at
from public.battle_instances bi
where (bi.starts_at is null or bi.starts_at <= now())
  and (bi.ends_at   is null or bi.ends_at   >  now())
order by bi.battle_id, bi.starts_at desc nulls last, bi.created_at desc;

-- =========================
-- B) RPC: dado un battle_slug devuelve contexto completo
-- Incluye: battle_id, battle_instance_id, options
-- =========================
drop function if exists public.get_battle_context(text);

create function public.get_battle_context(battle_slug text)
returns jsonb
language plpgsql
stable
as $$
declare
  b record;
  inst record;
  opts jsonb;
begin
  select * into b
  from public.battles
  where slug = battle_slug
  limit 1;

  if b is null then
    return jsonb_build_object(
      'ok', false,
      'error', 'BATTLE_NOT_FOUND'
    );
  end if;

  select * into inst
  from public.v_active_battle_instance
  where battle_id = b.id
  limit 1;

  -- Si no existe instancia activa, devolvemos ok=false para forzar seed (no auto-crear por RLS).
  if inst is null then
    return jsonb_build_object(
      'ok', false,
      'error', 'NO_ACTIVE_INSTANCE',
      'battle_id', b.id,
      'battle_slug', b.slug
    );
  end if;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', bo.id,
      'label', bo.label,
      'image_url', bo.image_url,
      'sort_order', bo.sort_order
    ) order by bo.sort_order asc
  ), '[]'::jsonb)
  into opts
  from public.battle_options bo
  where bo.battle_id = b.id;

  return jsonb_build_object(
    'ok', true,
    'battle_id', b.id,
    'battle_instance_id', inst.battle_instance_id,
    'battle_slug', b.slug,
    'title', b.title,
    'options', opts
  );
end $$;

-- =========================
-- C) Permisos: permitir ejecutar RPC para anon/auth
-- =========================
grant execute on function public.get_battle_context(text) to anon, authenticated;
