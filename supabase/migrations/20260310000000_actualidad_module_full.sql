-- Migration: Actualidad Module Full
-- Description: Creates tables for the new Actualidad feature, including sources, articles, topics, questions, and tracking.

-- 1. news_sources
CREATE TABLE IF NOT EXISTS public.news_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    domain TEXT NOT NULL,
    country TEXT,
    source_type TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. news_articles
CREATE TABLE IF NOT EXISTS public.news_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES public.news_sources(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    published_at TIMESTAMPTZ,
    raw_content TEXT,
    language TEXT DEFAULT 'es',
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. current_topics
CREATE TABLE IF NOT EXISTS public.current_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    short_summary TEXT NOT NULL,
    category TEXT NOT NULL, -- País, Economía, Ciudad / Vida diaria, Marcas y Consumo, Deportes y Cultura, Tendencias y Sociedad
    status TEXT NOT NULL DEFAULT 'draft', -- draft, in_review, published, archived, rejected
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT false,
    event_date TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. topic_articles
CREATE TABLE IF NOT EXISTS public.topic_articles (
    topic_id UUID REFERENCES public.current_topics(id) ON DELETE CASCADE,
    article_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE,
    relevance_score NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (topic_id, article_id)
);

-- 5. topic_question_sets
CREATE TABLE IF NOT EXISTS public.topic_question_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID REFERENCES public.current_topics(id) ON DELETE CASCADE UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. topic_questions
CREATE TABLE IF NOT EXISTS public.topic_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    set_id UUID REFERENCES public.topic_question_sets(id) ON DELETE CASCADE,
    question_order INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    answer_type TEXT NOT NULL, -- yes_no, single_choice, single_choice_polar, scale_5, scale_0_10
    options_json JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. topic_answers
CREATE TABLE IF NOT EXISTS public.topic_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID REFERENCES public.current_topics(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.topic_questions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    answer_value TEXT NOT NULL,
    temporal_mode TEXT NOT NULL DEFAULT 'live', -- live, late, archival
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, question_id)
);

-- RLS Policies

-- Enable RLS
ALTER TABLE public.news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.current_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_question_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_answers ENABLE ROW LEVEL SECURITY;

-- Read Access: Anyone (or just authenticated users depending on site config)
-- For Opina+, read access to published/archived topics is public or authenticated.
-- We use authenticated for the MVP.
CREATE POLICY "Published topics are public" 
ON public.current_topics FOR SELECT 
TO authenticated 
USING (status IN ('published', 'archived'));

CREATE POLICY "Admins can view all topics" 
ON public.current_topics FOR SELECT 
TO authenticated 
USING ( (SELECT role FROM public.profiles WHERE public.profiles.user_id = auth.uid()) = 'admin' );

CREATE POLICY "Questions are viewable by authenticated users" 
ON public.topic_questions FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Question sets are viewable by authenticated users" 
ON public.topic_question_sets FOR SELECT 
TO authenticated 
USING (true);

-- Answers
CREATE POLICY "Users can insert their own answers" 
ON public.topic_answers FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own answers" 
ON public.topic_answers FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all answers" 
ON public.topic_answers FOR SELECT 
TO authenticated 
USING ( (SELECT role FROM public.profiles WHERE public.profiles.user_id = auth.uid()) = 'admin' );

-- Admins can do everything
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('news_sources', 'news_articles', 'current_topics', 'topic_articles', 'topic_question_sets', 'topic_questions')
    LOOP
        EXECUTE format('CREATE POLICY "Admins full access on %I" ON public.%I FOR ALL TO authenticated USING ((SELECT role FROM public.profiles WHERE public.profiles.user_id = auth.uid()) = ''admin'') WITH CHECK ((SELECT role FROM public.profiles WHERE public.profiles.user_id = auth.uid()) = ''admin'')', tbl, tbl);
    END LOOP;
END
$$;

-- Create view for aggregate stats
CREATE OR REPLACE VIEW public.actualidad_stats_view AS
SELECT 
    t.id AS topic_id,
    COUNT(DISTINCT a.user_id) AS total_participants,
    COUNT(a.id) AS total_signals
FROM public.current_topics t
LEFT JOIN public.topic_answers a ON t.id = a.topic_id
GROUP BY t.id;
