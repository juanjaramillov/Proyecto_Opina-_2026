-- ==========================================
-- Add RLS Policies to profiles
-- Fixes HTTP 500 errors on profile fetch and upsert
-- ==========================================

-- Enable RLS on the new profiles table
alter table if exists public.profiles enable row level security;

-- Drop existing policies if they exist to prevent conflicts on rerun
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;

-- Create policies for profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update their own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- Optional: If profiles need to be public for rankings
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

-- Ensure the trigger also inserts into profiles if it isn't already
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Insert into legacy user_profiles
  insert into public.user_profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  -- Insert into new profiles
  insert into public.profiles (id, full_name, display_name)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'display_name')
  on conflict (id) do nothing;
  
  return new;
end;
$$ language plpgsql security definer;
