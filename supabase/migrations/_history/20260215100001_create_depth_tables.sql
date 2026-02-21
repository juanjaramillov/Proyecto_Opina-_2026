-- 1. Crear tabla depth_surveys
create table if not exists depth_surveys (
    id uuid primary key default gen_random_uuid(),
    option_id uuid references battle_options(id) on delete cascade,
    title text not null,
    description text,
    is_active boolean default true,
    created_at timestamp with time zone default now()
);

-- 2. Crear tabla depth_questions
create table if not exists depth_questions (
    id uuid primary key default gen_random_uuid(),
    survey_id uuid references depth_surveys(id) on delete cascade,
    question_text text not null,
    question_type text not null,
    position integer not null,
    created_at timestamp with time zone default now()
);

-- 3. Crear tabla depth_answers
create table if not exists depth_answers (
    id uuid primary key default gen_random_uuid(),
    question_id uuid references depth_questions(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    answer_value text not null,
    created_at timestamp with time zone default now()
);

-- Índices recomendados
create index if not exists idx_depth_surveys_option on depth_surveys(option_id);
create index if not exists idx_depth_questions_survey on depth_questions(survey_id);
create index if not exists idx_depth_answers_question on depth_answers(question_id);
create index if not exists idx_depth_answers_user on depth_answers(user_id);
