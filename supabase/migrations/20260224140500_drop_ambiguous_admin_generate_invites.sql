BEGIN;

-- Elimina la versión antigua de 2 parámetros que está causando ambigüedad
DROP FUNCTION IF EXISTS public.admin_generate_invites(integer, text);

-- (Opcional defensivo: algunos entornos quedan con alias int/text)
DROP FUNCTION IF EXISTS public.admin_generate_invites(int, text);

COMMIT;
