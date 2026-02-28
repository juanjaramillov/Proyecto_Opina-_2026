-- Drop the overloaded function created for WhatsApp feature that causes ambiguity
DROP FUNCTION IF EXISTS public.admin_generate_invites(integer, text, text);
