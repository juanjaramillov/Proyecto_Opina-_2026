-- GRANT capabilities to supabase_auth_admin so the trigger can insert into public tables

GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO supabase_auth_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO supabase_auth_admin;

-- Ensure the trigger function always runs with elevated privileges
ALTER FUNCTION public.handle_new_user() SECURITY DEFINER SET search_path = public;
