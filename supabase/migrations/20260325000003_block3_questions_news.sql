-- =========================================================================
-- BLOQUE 3: PREGUNTAS MÓVILES, NOTICIAS (ACTUALIDAD) Y SNAPSHOTS DE CONTENIDO
-- =========================================================================

-- 1. Catálogo Maestro de Preguntas Versionadas
CREATE TABLE IF NOT EXISTS public.question_catalog (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    question_code text NOT NULL,
    module_type text NOT NULL,
    question_type text NOT NULL,
    text text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. Sets de Preguntas / Cuestionarios
CREATE TABLE IF NOT EXISTS public.question_set_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    set_code text NOT NULL,
    question_id uuid REFERENCES public.question_catalog(id) ON DELETE CASCADE NOT NULL,
    display_order integer NOT NULL,
    category_id uuid,
    entity_type_id bigint, -- Referencia simbólica a entity_types
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. Histórico Congelado de Entornos (Qué vio el usuario exactamente)
CREATE TABLE IF NOT EXISTS public.content_snapshots (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    news_article_id uuid REFERENCES public.news_articles(id) ON DELETE SET NULL,
    title_snapshot text,
    source_name_snapshot text,
    source_domain_snapshot text,
    url_snapshot text,
    published_at_snapshot timestamp with time zone,
    summary_snapshot text,
    captured_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 4. Puente Noticias -> Entidades Focus
CREATE TABLE IF NOT EXISTS public.news_entity_links (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    news_article_id uuid REFERENCES public.news_articles(id) ON DELETE CASCADE NOT NULL,
    entity_id uuid REFERENCES public.signal_entities(id) ON DELETE CASCADE NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 5. Puente Noticias -> Contextos/Temas Oficiales
CREATE TABLE IF NOT EXISTS public.news_context_links (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    news_article_id uuid REFERENCES public.news_articles(id) ON DELETE CASCADE NOT NULL,
    context_id uuid REFERENCES public.signal_contexts(id) ON DELETE CASCADE NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 6. Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_question_set_set_code ON public.question_set_items(set_code);
CREATE INDEX IF NOT EXISTS idx_content_snapshots_news_id ON public.content_snapshots(news_article_id);
CREATE INDEX IF NOT EXISTS idx_news_entity_news_id ON public.news_entity_links(news_article_id);
CREATE INDEX IF NOT EXISTS idx_news_entity_entity_id ON public.news_entity_links(entity_id);
CREATE INDEX IF NOT EXISTS idx_news_context_news_id ON public.news_context_links(news_article_id);
CREATE INDEX IF NOT EXISTS idx_news_context_context_id ON public.news_context_links(context_id);
