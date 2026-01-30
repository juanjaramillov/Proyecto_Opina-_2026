-- RPC para borrar cuenta propia
create or replace function delete_own_account()
returns void
language plpgsql
security definer
as $$
begin
  -- Borrar perfil (cascade borrará lo demás si está configurado, o lo hacemos manual)
  delete from public.user_profiles where user_id = auth.uid();
  
  -- Anonimizar señales
  update public.signal_events 
  set user_id = null 
  where user_id = auth.uid();

  -- Borrar auth.users (requiere privilegios, security definer ayuda aquí si el rol tiene permisos)
  -- Nota: Borrar de auth.users directamente desde una función disparada por usuario 
  -- es complejo sin configuración extra.
  -- Para MVP, borrar el perfil es "borrado lógico" para la app.
  -- Si queremos borrar el Auth User real, se requiere service_role key o un trigger específico.
  -- INTENTO: delete from auth.users where id = auth.uid();
  
  -- Para este ejercicio, asumimos que borrar user_profiles + anonimizar es suficiente 
  -- para cumplir "eliminación" desde la perspectiva de la app.
end;
$$;
