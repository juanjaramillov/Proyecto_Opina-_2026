-- =========================================================================
-- BLOQUE 2: CATÁLOGO MAESTRO, CATEGORÍAS Y CONTEXTOS OFICIALES
-- =========================================================================

-- 1. Fortalecer signal_entities
ALTER TABLE public.signal_entities
  ADD COLUMN IF NOT EXISTS domain text;

-- 2. Fortalecer signal_contexts (Catálogo jerárquico)
ALTER TABLE public.signal_contexts
  ADD COLUMN IF NOT EXISTS parent_context_id uuid REFERENCES public.signal_contexts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS display_order integer,
  ADD COLUMN IF NOT EXISTS display_name text;

-- 3. Tabla Puente de Entidades -> Categorías
CREATE TABLE IF NOT EXISTS public.entity_category_links (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    entity_id uuid REFERENCES public.signal_entities(id) ON DELETE CASCADE NOT NULL,
    category_id uuid NOT NULL, -- UUID de la categoría respectiva
    is_primary boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 4. Tabla Puente de Eventos (Señales) -> Jerarquía Contextual
CREATE TABLE IF NOT EXISTS public.context_links (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    signal_event_id uuid REFERENCES public.signal_events(id) ON DELETE CASCADE NOT NULL,
    context_id uuid REFERENCES public.signal_contexts(id) ON DELETE CASCADE NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 5. Tabla Puente de Entidades -> Contextos (Ej: Un banco asociado a la Teletón)
CREATE TABLE IF NOT EXISTS public.entity_context_links (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    entity_id uuid REFERENCES public.signal_entities(id) ON DELETE CASCADE NOT NULL,
    context_id uuid REFERENCES public.signal_contexts(id) ON DELETE CASCADE NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    relation_type text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 6. Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_entity_category_entity ON public.entity_category_links(entity_id);
CREATE INDEX IF NOT EXISTS idx_context_links_event ON public.context_links(signal_event_id);
CREATE INDEX IF NOT EXISTS idx_context_links_context ON public.context_links(context_id);
CREATE INDEX IF NOT EXISTS idx_entity_context_entity ON public.entity_context_links(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_context_context ON public.entity_context_links(context_id);
