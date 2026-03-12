BEGIN;

UPDATE public.battles
SET title = REPLACE(title, 'Enfrentamiento', 'Preferencias')
WHERE title LIKE '%Enfrentamiento%';

COMMIT;
