-- Paso 1: Definir tabla de perfil
create table if not exists user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  tier text not null default 'guest',
  profile_completeness int not null default 0,
  has_ci boolean not null default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_user_profiles_tier on user_profiles(tier);

-- Paso 5: Crear perfil automático al registrarse
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
