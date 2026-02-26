begin;

-- Cierra el "temp open". Ahora B2B = solo roles permitidos.
-- Ajuste: por defecto permitimos 'admin' y 'b2b'. Si no existe 'b2b', no pasa nada (solo dará false).
create or replace function public.is_b2b_user()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.users u
    where u.user_id = auth.uid()
      and u.role in ('admin', 'b2b')
  );
$$;

-- Hardening de permisos sobre la función
revoke all on function public.is_b2b_user() from public;
grant execute on function public.is_b2b_user() to authenticated;

commit;
