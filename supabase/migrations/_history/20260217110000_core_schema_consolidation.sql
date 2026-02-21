-- ==========================================
-- Core Schema Consolidation
-- Extracted from src/supabase/migrations legacy blocks
-- ==========================================

-- 1) user_profiles
create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  tier text not null default 'guest',
  profile_completeness int not null default 0,
  has_ci boolean not null default false,
  display_name text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_user_profiles_tier on public.user_profiles(tier);

-- handle_new_user trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_created') then
    create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();
  end if;
end $$;

-- 2) subscriptions
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  plan text not null, -- 'pro_user' | 'enterprise'
  status text not null, -- 'active' | 'inactive'
  created_at timestamp with time zone default now()
);

create index if not exists idx_subscriptions_user on public.subscriptions(user_id);

-- 3) delete_own_account RPC
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
as $$
begin
  -- Borrar perfil (cascade borrará lo demás si está configurado)
  delete from public.user_profiles where user_id = auth.uid();
  
  -- Anonimizar señales
  update public.signal_events 
  set user_id = null 
  where user_id = auth.uid();
  
  -- Nota: El borrado de auth.users requiere permisos de service_role normalmente.
  -- Por ahora el borrado de user_profiles es el borrado lógico en la app.
end;
$$;

grant execute on function public.delete_own_account() to authenticated;
