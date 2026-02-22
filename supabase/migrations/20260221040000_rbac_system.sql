-- OPINA+ V12 — FIX 11: ROLE BASED ACCESS CONTROL (RBAC)

-- 1. Añadir columna role a la tabla perfiles
-- Ya existe de baseline pero por seguridad:
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 2. Añadir constraint para valores de roles válidos
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'profiles_role_check'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_role_check 
        CHECK (role IN ('user', 'verified', 'admin', 'enterprise'));
    END IF;
END $$;

-- 3. Habilitar RLS en tablas de analíticas (por si no estaban ya habilitadas)
ALTER TABLE ranking_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE depth_aggregates ENABLE ROW LEVEL SECURITY;

-- 4. Eliminar políticas existentes para evitar duplicados
DROP POLICY IF EXISTS "enterprise_can_view_snapshots" ON ranking_snapshots;
DROP POLICY IF EXISTS "enterprise_can_view_depth" ON depth_aggregates;

-- 5. Crear políticas RLS basadas en el rol del usuario

-- Para ranking_snapshots
CREATE POLICY "enterprise_can_view_snapshots"
ON ranking_snapshots
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE public.profiles.id = auth.uid()
    AND public.profiles.role IN ('admin', 'enterprise')
  )
);

-- Para depth_aggregates
CREATE POLICY "enterprise_can_view_depth"
ON depth_aggregates
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE public.profiles.id = auth.uid()
    AND public.profiles.role IN ('admin', 'enterprise')
  )
);

-- Nota: Como administrador, podrías querer dar un permiso inicial
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'tu_email@ejemplo.com';
