create extension if not exists pgcrypto;

create table if not exists public.access_gate_tokens (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique,
  label text null,
  is_active boolean not null default true,
  expires_at timestamptz null,

  uses_count int not null default 0,
  first_used_at timestamptz null,
  last_used_at timestamptz null,

  created_at timestamptz not null default now()
);

comment on table public.access_gate_tokens is
'Tokens de acceso para piloto cerrado. Guardar SOLO hash (sha256) del codigo, nunca el codigo en claro.';

create or replace function public.consume_access_gate_code(p_code text)
returns table(token_id uuid)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_hash text;
begin
  if p_code is null or length(trim(p_code)) < 6 then
    raise exception 'Código inválido';
  end if;

  v_hash := encode(digest(trim(p_code), 'sha256'), 'hex');

  update public.access_gate_tokens
     set uses_count   = uses_count + 1,
         first_used_at = coalesce(first_used_at, now()),
         last_used_at  = now()
   where code_hash = v_hash
     and is_active = true
     and (expires_at is null or expires_at > now())
  returning id into token_id;

  if token_id is null then
    raise exception 'Código no válido, revocado o expirado';
  end if;

  return query select token_id;
end;
$$;

revoke all on function public.consume_access_gate_code(text) from public;
grant execute on function public.consume_access_gate_code(text) to anon, authenticated;

alter table public.access_gate_tokens enable row level security;

create policy "no_select_access_gate_tokens"
on public.access_gate_tokens
for select
to anon, authenticated
using (false);

create policy "no_write_access_gate_tokens"
on public.access_gate_tokens
for all
to anon, authenticated
using (false)
with check (false);
