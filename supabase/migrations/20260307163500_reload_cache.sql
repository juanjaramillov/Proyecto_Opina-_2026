-- Forzar recarga del caché de esquema en PostgREST
NOTIFY pgrst, 'reload schema';
