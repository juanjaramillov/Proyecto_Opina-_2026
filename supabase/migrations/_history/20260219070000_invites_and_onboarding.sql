-- =========================================================
-- BLOQUE 1: Invitaciones y Perfil Obligatorio
-- =========================================================

-- 1. Tabla de Invitaciones
create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  created_by uuid references auth.users(id) on delete set null,
  channel text default 'general', -- e.g., 'whatsapp', 'instagram', 'direct'
  max_uses int default 1,
  used_count int default 0,
  expires_at timestamptz not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 2. Extensión de Profiles para Onboarding Estricto
alter table public.profiles 
  add column if not exists is_profile_complete boolean default false,
  add column if not exists profile_completed_at timestamptz,
  add column if not exists profile_version int default 1,
  add column if not exists age_bracket text, -- '18–29', '30–45', '46–60', '60+'
  add column if not exists gender_identity text, -- 'female', 'male', 'other'
  add column if not exists comuna text, -- Santiago communes
  add column if not exists health_system text, -- 'isapre', 'fonasa'
  add column if not exists clinical_attention_12m boolean default false;

-- 3. RLS para Invites (Lectura pública para validación previo a registro)
alter table public.invites enable row level security;

create policy "Invitaciones son consultables por anon"
  on public.invites for select
  to anon, authenticated
  using (is_active = true and used_count < max_uses and expires_at > now());

-- 4. Función para Validar Invitación (RPC)
create or replace function public.validate_invite_code(p_code text)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_invite record;
begin
  select * into v_invite 
  from public.invites 
  where code = p_code 
    and is_active = true 
    and used_count < max_uses 
    and expires_at > now();

  if not found then
    return jsonb_build_object('valid', false, 'message', 'Código inválido o expirado.');
  end if;

  return jsonb_build_object('valid', true, 'code', v_invite.code, 'channel', v_invite.channel);
end;
$$;

-- 5. Función para Consumir Invitación (Safe execution)
create or replace function public.consume_invite_code(p_code text)
returns boolean
language plpgsql
security definer
as $$
begin
  update public.invites 
  set used_count = used_count + 1
  where code = p_code 
    and is_active = true 
    and used_count < max_uses 
    and expires_at > now();

  return found;
end;
$$;
