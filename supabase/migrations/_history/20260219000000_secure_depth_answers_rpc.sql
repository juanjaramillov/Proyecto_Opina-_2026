-- =========================================================
-- Secure Depth Answers RPC (Bloque Analítica Profunda)
-- Objetivo: Permitir inserción de respuestas de profundidad 
--           manteniendo el anonimato irreversible.
-- =========================================================

create or replace function public.insert_depth_answers(
  p_option_id uuid,
  p_answers jsonb -- Array de {question_key, answer_value}
)
returns void
language plpgsql
security definer
as $$
declare
  v_anon_id text;
  v_gender text;
  v_age_bucket text;
  v_region text;
  v_answer record;
begin
  if auth.uid() is null then
    raise exception 'User not authenticated';
  end if;

  -- 1) Obtener anon_id y segmentación del perfil real
  v_anon_id := public.get_or_create_anon_id();

  select p.gender, p.age_bucket, p.region
    into v_gender, v_age_bucket, v_region
  from public.profiles p
  where p.id = auth.uid()
  limit 1;

  -- 2) Insertar cada respuesta del JSONB
  -- Se asume p_answers es un array de objetos
  for v_answer in select * from jsonb_to_recordset(p_answers) as x(question_key text, answer_value text)
  loop
    insert into public.depth_answers_structured (
      anon_id, option_id, question_key, answer_value,
      gender, age_bucket, region, created_at
    )
    values (
      v_anon_id, p_option_id, v_answer.question_key, v_answer.answer_value,
      v_gender, v_age_bucket, v_region, now()
    );
  end loop;

end;
$$;

grant execute on function public.insert_depth_answers(uuid, jsonb) to authenticated;

-- Revocar inserts directos para forzar el uso del RPC (Seguridad)
revoke insert on table public.depth_answers_structured from anon;
revoke insert on table public.depth_answers_structured from authenticated;
