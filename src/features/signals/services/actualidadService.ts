import { supabase } from '../../../supabase/client';
import { logger } from '../../../lib/logger';

export interface TopicQuestion {
    id: string;
    set_id?: string;
    question_order: number;
    question_text: string;
    answer_type: string;
    options_json: any;
}

export interface ActualidadTopic {
    id: string;
    slug: string;
    title: string;
    short_summary: string;
    category: string;
    status: string;
    impact_quote?: string | null;
    published_at: string | null;
    tags?: string[] | null;
    actors?: string[] | null;
    intensity?: number | null;
    relevance_chile?: number | null;
    confidence_score?: number | null;
    event_stage?: string | null;
    topic_duration?: string | null;
    opinion_maturity?: string | null;
    source_domain?: string | null;
    source_title?: string | null;
    source_published_at?: string | null;
    cluster_id?: string | null;
    created_by_ai?: boolean | null;
    admin_edited?: boolean | null;
    archived_at?: string | null;
    metadata?: Record<string, any>;
    stats?: {
        total_participants: number | null;
        total_signals: number | null;
    };
    has_answered?: boolean;
}

export interface ActualidadTopicDetail extends ActualidadTopic {
    questions: TopicQuestion[];
    user_answers?: any[];
}

export const actualidadService = {
    /**
     * Fetch all published topics along with their stats.
     */
    async getPublishedTopics(): Promise<ActualidadTopic[]> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            // 1. Get published topics
            const { data: topics, error: topicsError } = await supabase
                .from('current_topics')
                .select('*')
                .eq('status', 'published')
                .order('published_at', { ascending: false });

            if (topicsError || !topics) {
                logger.error('Error fetching published topics', { error: topicsError });
                return [];
            }

            // 2. Get stats view
            const { data: statsData, error: statsError } = await supabase
                .from('actualidad_stats_view')
                .select('*');

            const statsMap = new Map();
            if (!statsError && statsData) {
                statsData.forEach(s => {
                    if (s.topic_id) statsMap.set(s.topic_id, s);
                });
            }

            // 3. Get user answers if logged in to calculate "has_answered"
            const answeredTopicIds = new Set<string>();
            if (user) {
                const { data: answers, error: ansError } = await supabase
                    .from('topic_answers')
                    .select('topic_id')
                    .eq('user_id', user.id);
                if (!ansError && answers) {
                    answers.forEach(a => {
                        if (a.topic_id) answeredTopicIds.add(a.topic_id);
                    });
                }
            }

            return topics.map(t => ({
                id: t.id,
                slug: t.slug,
                title: t.title,
                short_summary: t.short_summary,
                category: t.category,
                status: t.status,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                impact_quote: (t as any).impact_quote,
                published_at: t.published_at,
                tags: t.tags,
                actors: t.actors,
                intensity: t.intensity,
                relevance_chile: t.relevance_chile,
                confidence_score: t.confidence_score,
                event_stage: t.event_stage,
                topic_duration: t.topic_duration,
                opinion_maturity: t.opinion_maturity,
                source_domain: t.source_domain,
                source_title: t.source_title,
                source_published_at: t.source_published_at,
                cluster_id: t.cluster_id,
                created_by_ai: t.created_by_ai,
                admin_edited: t.admin_edited,
                archived_at: t.archived_at,
                metadata: t.metadata as Record<string, any> || undefined,
                stats: statsMap.get(t.id) || { total_participants: 0, total_signals: 0 },
                has_answered: answeredTopicIds.has(t.id)
            }));
        } catch (error) {
            logger.error('Unexpected error fetching topics', { error });
            return [];
        }
    },

    /**
     * Get a single topic detail, including its questions and user answers.
     */
    async getTopicDetail(topicId: string): Promise<ActualidadTopicDetail | null> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // 1. Get topic
            const { data: topic, error: topicError } = await supabase
                .from('current_topics')
                .select('*')
                .eq('id', topicId)
                .single();

            if (topicError || !topic) return null;

            // 2. Get set and questions
            const { data: set } = await supabase
                .from('topic_question_sets')
                .select('id')
                .eq('topic_id', topicId)
                .single();

            let questions: TopicQuestion[] = [];
            if (set) {
                const { data: qData } = await supabase
                    .from('topic_questions')
                    .select('*')
                    .eq('set_id', set.id)
                    .order('question_order', { ascending: true });
                if (qData) {
                    questions = qData as unknown as TopicQuestion[];
                }
            }

            // 3. Get User answers
            let userAnswers: any[] = [];
            if (user) {
                const { data: ans } = await supabase
                    .from('topic_answers')
                    .select('*')
                    .eq('topic_id', topicId)
                    .eq('user_id', user.id);
                if (ans) {
                    userAnswers = ans;
                }
            }

            // 4. Get stats
            let stats = { total_participants: 0, total_signals: 0 };
            const { data: statData } = await supabase
                .from('actualidad_stats_view')
                .select('*')
                .eq('topic_id', topicId)
                .single();
            if (statData) {
                stats = {
                    total_participants: statData.total_participants || 0,
                    total_signals: statData.total_signals || 0
                };
            }

            return {
                id: topic.id,
                slug: topic.slug,
                title: topic.title,
                short_summary: topic.short_summary,
                category: topic.category,
                status: topic.status,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                impact_quote: (topic as any).impact_quote,
                published_at: topic.published_at,
                tags: topic.tags,
                actors: topic.actors,
                intensity: topic.intensity,
                relevance_chile: topic.relevance_chile,
                confidence_score: topic.confidence_score,
                event_stage: topic.event_stage,
                topic_duration: topic.topic_duration,
                opinion_maturity: topic.opinion_maturity,
                source_domain: topic.source_domain,
                source_title: topic.source_title,
                source_published_at: topic.source_published_at,
                cluster_id: topic.cluster_id,
                created_by_ai: topic.created_by_ai,
                admin_edited: topic.admin_edited,
                archived_at: topic.archived_at,
                stats,
                questions,
                user_answers: userAnswers,
                has_answered: userAnswers.length > 0
            };

        } catch (error) {
            logger.error('Unexpected error fetching topic detail', { error });
            return null;
        }
    },

    /**
     * Submit multiple answers for a topic.
     * answers parameter should be: { question_id: string, answer_value: string }[]
     */
    async submitAnswers(topicId: string, answers: { question_id: string, answer_value: string }[], temporalMode: string = 'live'): Promise<boolean> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return false;

            const inserts = answers.map(a => ({
                topic_id: topicId,
                question_id: a.question_id,
                user_id: user.id,
                answer_value: a.answer_value,
                temporal_mode: temporalMode
            }));

            const { error } = await supabase
                .from('topic_answers')
                .insert(inserts);

            if (error) {
                logger.error('Error inserting topic answers', { error });
                return false;
            }

            return true;
        } catch (error) {
            logger.error('Unexpected error submitting answers', { error });
            return false;
        }
    }
};
