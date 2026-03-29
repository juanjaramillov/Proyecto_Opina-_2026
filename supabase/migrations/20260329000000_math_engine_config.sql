-- Migración para la configuración del Math Engine (Bloque 5)

-- 1. Crear tabla de configuración paramétrica
CREATE TABLE IF NOT EXISTS public.analytics_engine_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  decay_half_life_days float NOT NULL DEFAULT 30.0,
  wilson_confidence_level float NOT NULL DEFAULT 0.95,
  entropy_base float NOT NULL DEFAULT 2.0,
  min_sample_size int NOT NULL DEFAULT 10,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Asegurar que sólo haya una fila (singleton)
CREATE UNIQUE INDEX IF NOT EXISTS analytics_engine_config_single_row 
ON public.analytics_engine_config((true));

-- 2. Insertar fila por defecto si está vacía
INSERT INTO public.analytics_engine_config (id, decay_half_life_days, wilson_confidence_level, entropy_base, min_sample_size)
SELECT '00000000-0000-0000-0000-000000000001', 30.0, 0.95, 2.0, 10
WHERE NOT EXISTS (SELECT 1 FROM public.analytics_engine_config);

-- 3. Habilitar RLS
ALTER TABLE public.analytics_engine_config ENABLE ROW LEVEL SECURITY;

-- 4. Políticas Base: 
-- Todos los autenticados pueden leer (para que los RPCs no fallen cuando sean llamados por usuarios)
CREATE POLICY select_engine_config ON public.analytics_engine_config
  FOR SELECT TO authenticated USING (true);

-- Solo admins pueden modificar
CREATE POLICY update_engine_config ON public.analytics_engine_config
  FOR UPDATE TO authenticated USING (public.is_admin_user() = true);

-- Las inserciones y borrados directos no son permitidos en singleton, salvo vía Admin panel que usa Update.
