begin;

-- 1) Asegurar que exista la tabla depth_definitions (por si la borraste al limpiar)
create table if not exists public.depth_definitions (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid references public.entities(id) on delete cascade,
  category_slug text,
  question_key text not null,
  question_text text not null,
  question_type text default 'scale',
  options jsonb default '[]'::jsonb,
  position int default 0,
  is_required boolean default true,
  created_at timestamptz default now(),
  unique(entity_id, question_key)
);

-- 2) Asegurar que exista fn_ensure_entity_depth (si no existe, créala)
--    (si ya existe, la dejamos tal cual)
do $$
begin
  if not exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where p.proname = 'fn_ensure_entity_depth'
      and n.nspname = 'public'
  ) then
    execute $fn$
      create function public.fn_ensure_entity_depth(p_entity_id uuid)
      returns void as $body$
      declare
        v_name text;
        v_cat text;
      begin
        select name, category into v_name, v_cat from public.entities where id = p_entity_id;

        insert into public.depth_definitions (entity_id, question_key, question_text, question_type, position)
        values (p_entity_id, 'nota_general', '¿Qué nota le das a ' || v_name || ' del 0 al 10?', 'scale', 1)
        on conflict do nothing;

        insert into public.depth_definitions (entity_id, question_key, question_text, question_type, position, options)
        values
          (p_entity_id, 'frecuencia', '¿Con qué frecuencia eliges esta opción?', 'choice', 2, '["Diariamente","Semanalmente","Mensualmente","Ocasionalmente"]'),
          (p_entity_id, 'recomendacion', '¿Qué tan probable es que recomiendes esta opción a un amigo?', 'scale', 3, '[]'),
          (p_entity_id, 'valor', '¿Cómo calificas la relación calidad-precio? (1-5)', 'scale', 4, '[]'),
          (p_entity_id, 'innovacion', '¿Qué tan innovadora consideras que es esta opción? (1-5)', 'scale', 5, '[]'),
          (p_entity_id, 'proposito', '¿Sientes que esta marca aporta un valor real a la sociedad?', 'choice', 6, '["Sí, totalmente","Parcialmente","Es indiferente","No"]')
        on conflict do nothing;
      end;
      $body$ language plpgsql;
    $fn$;
  end if;
end $$;

-- 3) Seleccionar las 10 entidades Salud V1 y asegurar mínimo 6 preguntas base
do $$
declare
  r record;
begin
  for r in
    select id, slug, category
    from public.entities
    where slug in (
      'clinica-alemana',
      'clinica-las-condes',
      'clinica-santa-maria',
      'clinica-universidad-de-los-andes',
      'clinica-indisa',
      'clinica-davila',
      'clinica-vespucio',
      'farmacia-cruz-verde',
      'farmacia-salcobrand',
      'farmacia-ahumada'
    )
  loop
    perform public.fn_ensure_entity_depth(r.id);

    -- Guardar el category_slug (para trazabilidad) si está vacío
    update public.depth_definitions
      set category_slug = coalesce(category_slug, r.category)
    where entity_id = r.id;
  end loop;
end $$;

-- 4) Pack específico: CLÍNICAS (5 preguntas)
-- Keys estables (no chocan con las genéricas)
insert into public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options, is_required)
select
  e.id,
  e.category,
  q.question_key,
  q.question_text,
  'scale',
  q.position,
  '[]'::jsonb,
  true
from public.entities e
join (
  values
    ('clinics_quality','¿Cómo evalúas la calidad de la atención? (1-5)', 10),
    ('clinics_wait','¿Cómo evalúas los tiempos de espera? (1-5)', 11),
    ('clinics_experience','¿Cómo evalúas el trato y la experiencia? (1-5)', 12),
    ('clinics_value','¿Qué tan justa es la relación precio/servicio? (1-5)', 13),
    ('clinics_trust','¿Qué tanto confías en esta clínica? (1-5)', 14)
) as q(question_key, question_text, position) on true
where e.slug in (
  'clinica-alemana',
  'clinica-las-condes',
  'clinica-santa-maria',
  'clinica-universidad-de-los-andes',
  'clinica-indisa',
  'clinica-davila',
  'clinica-vespucio'
)
on conflict (entity_id, question_key) do update set
  question_text = excluded.question_text,
  position = excluded.position,
  category_slug = excluded.category_slug;

-- 5) Pack específico: FARMACIAS (5 preguntas)
insert into public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options, is_required)
select
  e.id,
  e.category,
  q.question_key,
  q.question_text,
  'scale',
  q.position,
  '[]'::jsonb,
  true
from public.entities e
join (
  values
    ('pharm_price','¿Cómo evalúas los precios? (1-5)', 10),
    ('pharm_stock','¿Cómo evalúas la disponibilidad de stock? (1-5)', 11),
    ('pharm_speed','¿Cómo evalúas la rapidez (compra/atención)? (1-5)', 12),
    ('pharm_service','¿Cómo evalúas la atención del personal? (1-5)', 13),
    ('pharm_trust','¿Qué tanto confías en esta farmacia? (1-5)', 14)
) as q(question_key, question_text, position) on true
where e.slug in ('farmacia-cruz-verde','farmacia-salcobrand','farmacia-ahumada')
on conflict (entity_id, question_key) do update set
  question_text = excluded.question_text,
  position = excluded.position,
  category_slug = excluded.category_slug;

commit;
