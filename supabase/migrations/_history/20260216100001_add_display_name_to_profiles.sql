-- Add display_name to user_profiles
alter table if exists public.user_profiles 
add column if not exists display_name text;

-- Update handle_new_user to use raw_user_meta_data if available
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (user_id, display_name)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name')
  )
  on conflict (user_id) do update
  set display_name = coalesce(excluded.display_name, user_profiles.display_name);
  return new;
end;
$$ language plpgsql security definer;

-- Ensure RLS allows the user to update their own display_name
create policy "Users can update their own display_name"
  on user_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
