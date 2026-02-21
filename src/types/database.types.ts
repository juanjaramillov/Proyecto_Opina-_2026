export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            battle_instances: {
                Row: {
                    id: string
                    battle_id: string
                    version: number
                    starts_at: string | null
                    ends_at: string | null
                    context: Json
                    created_at: string
                }
                Insert: {
                    id?: string | null
                    battle_id?: string | null
                    version?: number | null
                    starts_at?: string | null
                    ends_at?: string | null
                    context?: any | null
                    created_at?: string | null
                }
                Update: {
                    id?: string | null
                    battle_id?: string | null
                    version?: number | null
                    starts_at?: string | null
                    ends_at?: string | null
                    context?: any | null
                    created_at?: string | null
                }
                Relationships: []
            }
            signal_events: {
                Row: {
                    id: string
                    signal_id: string
                    user_id: string | null
                    event_type: string
                    created_at: string
                    anon_id: string | null
                    entity_id: string | null
                    entity_type: string | null
                    module_type: string | null
                    context_id: string | null
                    value_text: string | null
                    value_numeric: number | null
                    meta: Json
                    battle_id: string | null
                    battle_instance_id: string | null
                    option_id: string | null
                    signal_weight: number
                    user_tier: string
                    profile_completeness: number
                    country: string | null
                    region: string | null
                    city: string | null
                    comuna: string | null
                    age_bucket: string | null
                    gender: string | null
                    algorithm_version: string | null
                    computed_weight: number | null
                    influence_level_snapshot: string | null
                }
                Insert: {
                    id?: string
                    signal_id?: string
                    user_id?: string | null
                    event_type?: string
                    created_at?: string
                    anon_id?: string | null
                    entity_id?: string | null
                    entity_type?: string | null
                    module_type?: string | null
                    context_id?: string | null
                    value_text?: string | null
                    value_numeric?: number | null
                    meta?: Json
                    battle_id?: string | null
                    battle_instance_id?: string | null
                    option_id?: string | null
                    signal_weight?: number
                    user_tier?: string
                    profile_completeness?: number
                    country?: string | null
                    region?: string | null
                    city?: string | null
                    comuna?: string | null
                    age_bucket?: string | null
                    gender?: string | null
                    algorithm_version?: string | null
                    computed_weight?: number | null
                    influence_level_snapshot?: string | null
                }
                Update: {
                    id?: string
                    signal_id?: string
                    user_id?: string | null
                    event_type?: string
                    created_at?: string
                    anon_id?: string | null
                    entity_id?: string | null
                    entity_type?: string | null
                    module_type?: string | null
                    context_id?: string | null
                    value_text?: string | null
                    value_numeric?: number | null
                    meta?: Json
                    battle_id?: string | null
                    battle_instance_id?: string | null
                    option_id?: string | null
                    signal_weight?: number
                    user_tier?: string
                    profile_completeness?: number
                    country?: string | null
                    region?: string | null
                    city?: string | null
                    comuna?: string | null
                    age_bucket?: string | null
                    gender?: string | null
                    algorithm_version?: string | null
                    computed_weight?: number | null
                    influence_level_snapshot?: string | null
                }
                Relationships: []
            }
            signal_hourly_aggs: {
                Row: {
                    id: string
                    battle_id: string | null
                    battle_instance_id: string | null
                    option_id: string | null
                    gender: string | null
                    age_bucket: string | null
                    region: string | null
                    hour_bucket: string
                    signals_count: number
                    weighted_sum: number
                }
                Insert: {
                    id?: string
                    battle_id?: string | null
                    battle_instance_id?: string | null
                    option_id?: string | null
                    gender?: string | null
                    age_bucket?: string | null
                    region?: string | null
                    hour_bucket: string
                    signals_count?: number
                    weighted_sum?: number
                }
                Update: {
                    id?: string
                    battle_id?: string | null
                    battle_instance_id?: string | null
                    option_id?: string | null
                    gender?: string | null
                    age_bucket?: string | null
                    region?: string | null
                    hour_bucket?: string
                    signals_count?: number
                    weighted_sum?: number
                }
                Relationships: []
            }
            signal_responses: {
                Row: {
                    id: string
                    signal_id: string
                    option_value: string
                    user_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string | null
                    signal_id?: string | null
                    option_value?: string | null
                    user_id?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string | null
                    signal_id?: string | null
                    option_value?: string | null
                    user_id?: string | null
                    created_at?: string | null
                }
                Relationships: []
            }
            user_state_logs: {
                Row: {
                    id: string
                    anon_id: string
                    mood_score: number | null
                    economic_score: number | null
                    job_score: number | null
                    happiness_score: number | null
                    gender: string | null
                    age_bucket: string | null
                    region: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    anon_id: string
                    mood_score?: number | null
                    economic_score?: number | null
                    job_score?: number | null
                    happiness_score?: number | null
                    gender?: string | null
                    age_bucket?: string | null
                    region?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    anon_id?: string
                    mood_score?: number | null
                    economic_score?: number | null
                    job_score?: number | null
                    happiness_score?: number | null
                    gender?: string | null
                    age_bucket?: string | null
                    region?: string | null
                    created_at?: string
                }
                Relationships: []
            }
            subscriptions: {
                Row: {
                    user_id: string
                    plan: 'free' | 'pro_user' | 'enterprise'
                    status: 'active' | 'inactive' | 'cancelled' | 'past_due'
                    created_at: string
                    ends_at: string | null
                }
                Insert: {
                    user_id: string
                    plan?: 'free' | 'pro_user' | 'enterprise'
                    status?: 'active' | 'inactive' | 'cancelled' | 'past_due'
                    created_at?: string
                    ends_at?: string | null
                }
                Update: {
                    user_id?: string
                    plan?: 'free' | 'pro_user' | 'enterprise'
                    status?: 'active' | 'inactive' | 'cancelled' | 'past_due'
                    created_at?: string
                    ends_at?: string | null
                }
                Relationships: []
            }
            attributes: {
                Row: {
                    id: string
                    slug: string
                    name: string
                    description: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    slug: string
                    name: string
                    description?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    slug?: string
                    name?: string
                    description?: string | null
                    created_at?: string
                }
                Relationships: []
            }
            public_rank_snapshots: {
                Row: {
                    attribute_id: string
                    segment_hash: string
                    segment_filters: Json
                    ranking: Json
                    total_signals: number
                    snapshot_at: string
                }
                Insert: {
                    attribute_id: string
                    segment_hash: string
                    segment_filters?: Json
                    ranking: Json
                    total_signals: number
                    snapshot_at?: string
                }
                Update: {
                    attribute_id?: string
                    segment_hash?: string
                    segment_filters?: Json
                    ranking?: Json
                    total_signals?: number
                    snapshot_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "public_rank_snapshots_attribute_id_fkey"
                        columns: ["attribute_id"]
                        referencedRelation: "attributes"
                        referencedColumns: ["id"]
                    }
                ]
            }
            user_sessions: {
                Row: {
                    id: string
                    user_id: string | null
                    attributes_shown: string[] | null
                    attributes_completed: string[] | null
                    dominant_clinic_id: string | null
                    depth_completed: boolean
                    created_at: string
                    finished_at: string | null
                    meta: Json
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    attributes_shown?: string[] | null
                    attributes_completed?: string[] | null
                    dominant_clinic_id?: string | null
                    depth_completed?: boolean
                    created_at?: string
                    finished_at?: string | null
                    meta?: Json
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    attributes_shown?: string[] | null
                    attributes_completed?: string[] | null
                    dominant_clinic_id?: string | null
                    depth_completed?: boolean
                    created_at?: string
                    finished_at?: string | null
                    meta?: Json
                }
                Relationships: [
                    {
                        foreignKeyName: "user_sessions_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            survey_responses: {
                Row: {
                    id: string
                    created_at: string
                    user_id: string
                    survey_id: string
                    answers: Json
                    anon_id: string | null
                    question_id: string | null
                    option_id: string | null
                }
                Insert: {
                    id?: string | null
                    created_at?: string | null
                    user_id?: string | null
                    survey_id?: string | null
                    answers?: any | null
                    anon_id?: string | null
                    question_id?: string | null
                    option_id?: string | null
                }
                Update: {
                    id?: string | null
                    created_at?: string | null
                    user_id?: string | null
                    survey_id?: string | null
                    answers?: any | null
                    anon_id?: string | null
                    question_id?: string | null
                    option_id?: string | null
                }
                Relationships: []
            }
            trend_bev_cross_24h: {
                Row: {
                    insight_id: string | null
                    computed_at: string | null
                    coca_preference_pct: number | null
                    coca_preference_n: number | null
                    sugarfree_pct: number | null
                    sugarfree_n: number | null
                    headline: string | null
                    supporting_line: string | null
                }
                Insert: {
                    insight_id?: string | null
                    computed_at?: string | null
                    coca_preference_pct?: number | null
                    coca_preference_n?: number | null
                    sugarfree_pct?: number | null
                    sugarfree_n?: number | null
                    headline?: string | null
                    supporting_line?: string | null
                }
                Update: {
                    insight_id?: string | null
                    computed_at?: string | null
                    coca_preference_pct?: number | null
                    coca_preference_n?: number | null
                    sugarfree_pct?: number | null
                    sugarfree_n?: number | null
                    headline?: string | null
                    supporting_line?: string | null
                }
                Relationships: []
            }
            questions: {
                Row: {
                    id: string
                    survey_id: string | null
                    slug: string | null
                    type: string
                    label: string
                    min_val: number | null
                    max_val: number | null
                    options: any | null
                    created_at: string
                }
                Insert: {
                    id?: string | null
                    survey_id?: string | null
                    slug?: string | null
                    type?: string | null
                    label?: string | null
                    min_val?: number | null
                    max_val?: number | null
                    options?: any | null
                    created_at?: string | null
                }
                Update: {
                    id?: string | null
                    survey_id?: string | null
                    slug?: string | null
                    type?: string | null
                    label?: string | null
                    min_val?: number | null
                    max_val?: number | null
                    options?: any | null
                    created_at?: string | null
                }
                Relationships: []
            }
            depth_answers: {
                Row: {
                    id: string
                    question_id: string | null
                    user_id: string | null
                    answer_value: string
                    created_at: string | null
                }
                Insert: {
                    id?: string | null
                    question_id?: string | null
                    user_id?: string | null
                    answer_value?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string | null
                    question_id?: string | null
                    user_id?: string | null
                    answer_value?: string | null
                    created_at?: string | null
                }
                Relationships: []
            }
            profiles: {
                Row: {
                    id: string
                    updated_at: string | null
                    username: string | null
                    full_name: string | null
                    avatar_url: string | null
                    age: number | null
                    gender: string | null
                    commune: string | null
                    education: string | null
                    occupation: string | null
                    income: string | null
                    civil_status: string | null
                    household_size: string | null
                    interest: string | null
                    shopping_preference: string | null
                    brand_affinity: string | null
                    social_media: string | null
                    politics_interest: string | null
                    voting_frequency: string | null
                    points: number | null
                    role: string | null
                    tier: 'guest' | 'verified_basic' | 'verified_full_ci' | null
                    profile_completeness: number | null
                    profile_completed: boolean | null
                    health_system: string | null
                    clinical_attention_12m: boolean | null
                    has_ci: boolean | null
                    display_name: string | null
                }
                Insert: {
                    id?: string | null
                    updated_at?: string | null
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    age?: number | null
                    gender?: string | null
                    commune?: string | null
                    education?: string | null
                    occupation?: string | null
                    income?: string | null
                    civil_status?: string | null
                    household_size?: string | null
                    interest?: string | null
                    shopping_preference?: string | null
                    brand_affinity?: string | null
                    social_media?: string | null
                    politics_interest?: string | null
                    voting_frequency?: string | null
                    points?: number | null
                    role?: string | null
                    profile_completed?: boolean | null
                    health_system?: string | null
                    clinical_attention_12m?: boolean | null
                }
                Update: {
                    id?: string | null
                    updated_at?: string | null
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    age?: number | null
                    gender?: string | null
                    commune?: string | null
                    education?: string | null
                    occupation?: string | null
                    income?: string | null
                    civil_status?: string | null
                    household_size?: string | null
                    interest?: string | null
                    shopping_preference?: string | null
                    brand_affinity?: string | null
                    social_media?: string | null
                    politics_interest?: string | null
                    voting_frequency?: string | null
                    points?: number | null
                    role?: string | null
                    profile_completed?: boolean | null
                    health_system?: string | null
                    clinical_attention_12m?: boolean | null
                }
                Relationships: []
            }
            battle_options: {
                Row: {
                    id: string
                    battle_id: string
                    label: string
                    brand_id: string | null
                    image_url: string | null
                    sort_order: number
                    created_at: string
                }
                Insert: {
                    id?: string | null
                    battle_id?: string | null
                    label?: string | null
                    brand_id?: string | null
                    image_url?: string | null
                    sort_order?: number | null
                    created_at?: string | null
                }
                Update: {
                    id?: string | null
                    battle_id?: string | null
                    label?: string | null
                    brand_id?: string | null
                    image_url?: string | null
                    sort_order?: number | null
                    created_at?: string | null
                }
                Relationships: []
            }
            entities: {
                Row: {
                    id: string
                    type: string
                    name: string
                    slug: string
                    category: string | null
                    created_at: string
                }
                Insert: {
                    id?: string | null
                    type?: string | null
                    name?: string | null
                    slug?: string | null
                    category?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string | null
                    type?: string | null
                    name?: string | null
                    slug?: string | null
                    category?: string | null
                    created_at?: string | null
                }
                Relationships: []
            }
            brand_insights_candidates_24h: {
                Row: {
                    insight_id: string | null
                    insight_type: string | null
                    insight_key: string | null
                    computed_at: string | null
                    primary_brand_slug: string | null
                    primary_brand_name: string | null
                    secondary_brand_slug: string | null
                    secondary_brand_name: string | null
                    metric_value: number | null
                    sample_size: number | null
                    headline: string | null
                    supporting_line: string | null
                }
                Insert: {
                    insight_id?: string | null
                    insight_type?: string | null
                    insight_key?: string | null
                    computed_at?: string | null
                    primary_brand_slug?: string | null
                    primary_brand_name?: string | null
                    secondary_brand_slug?: string | null
                    secondary_brand_name?: string | null
                    metric_value?: number | null
                    sample_size?: number | null
                    headline?: string | null
                    supporting_line?: string | null
                }
                Update: {
                    insight_id?: string | null
                    insight_type?: string | null
                    insight_key?: string | null
                    computed_at?: string | null
                    primary_brand_slug?: string | null
                    primary_brand_name?: string | null
                    secondary_brand_slug?: string | null
                    secondary_brand_name?: string | null
                    metric_value?: number | null
                    sample_size?: number | null
                    headline?: string | null
                    supporting_line?: string | null
                }
                Relationships: []
            }
            surveys: {
                Row: {
                    id: string
                    slug: string
                    title: string
                    description: string | null
                    icon_name: string | null
                    category: string | null
                    created_at: string
                    is_active: boolean | null
                    points_reward: number | null
                }
                Insert: {
                    id?: string | null
                    slug?: string | null
                    title?: string | null
                    description?: string | null
                    icon_name?: string | null
                    category?: string | null
                    created_at?: string | null
                    is_active?: boolean | null
                    points_reward?: number | null
                }
                Update: {
                    id?: string | null
                    slug?: string | null
                    title?: string | null
                    description?: string | null
                    icon_name?: string | null
                    category?: string | null
                    created_at?: string | null
                    is_active?: boolean | null
                    points_reward?: number | null
                }
                Relationships: []
            }
            signal_entities: {
                Row: {
                    signal_id: string
                    entity_id: string
                    role: string
                }
                Insert: {
                    signal_id?: string | null
                    entity_id?: string | null
                    role?: string | null
                }
                Update: {
                    signal_id?: string | null
                    entity_id?: string | null
                    role?: string | null
                }
                Relationships: []
            }
            brand_24h_stats: {
                Row: {
                    entity_id: string | null
                    brand_slug: string | null
                    brand_name: string | null
                    vs_wins_24h: number | null
                    trust_answers_24h: number | null
                    trust_pos_24h: number | null
                    trust_neg_24h: number | null
                }
                Insert: {
                    entity_id?: string | null
                    brand_slug?: string | null
                    brand_name?: string | null
                    vs_wins_24h?: number | null
                    trust_answers_24h?: number | null
                    trust_pos_24h?: number | null
                    trust_neg_24h?: number | null
                }
                Update: {
                    entity_id?: string | null
                    brand_slug?: string | null
                    brand_name?: string | null
                    vs_wins_24h?: number | null
                    trust_answers_24h?: number | null
                    trust_pos_24h?: number | null
                    trust_neg_24h?: number | null
                }
                Relationships: []
            }
            signals_trending_24h: {
                Row: {
                    signal_id: string | null
                    answers_24h: number | null
                    last_activity_at: string | null
                }
                Insert: {
                    signal_id?: string | null
                    answers_24h?: number | null
                    last_activity_at?: string | null
                }
                Update: {
                    signal_id?: string | null
                    answers_24h?: number | null
                    last_activity_at?: string | null
                }
                Relationships: []
            }
            categories: {
                Row: {
                    id: string
                    slug: string
                    name: string
                    emoji: string | null
                    cover_url: string | null
                    created_at: string
                }
                Insert: {
                    id?: string | null
                    slug?: string | null
                    name?: string | null
                    emoji?: string | null
                    cover_url?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string | null
                    slug?: string | null
                    name?: string | null
                    emoji?: string | null
                    cover_url?: string | null
                    created_at?: string | null
                }
                Relationships: []
            }
            signals: {
                Row: {
                    id: string
                    signal_key: string
                    signal_type: string
                    question: string
                    scale_type: string
                    options: any
                    is_active: boolean
                    created_at: string
                    category_id: string | null
                    title: string | null
                    description: string | null
                    cover_url: string | null
                    status: string | null
                    published_at: string | null
                }
                Insert: {
                    id?: string | null
                    signal_key?: string | null
                    signal_type?: string | null
                    question?: string | null
                    scale_type?: string | null
                    options?: any | null
                    is_active?: boolean | null
                    created_at?: string | null
                    category_id?: string | null
                    title?: string | null
                    description?: string | null
                    cover_url?: string | null
                    status?: string | null
                    published_at?: string | null
                }
                Update: {
                    id?: string | null
                    signal_key?: string | null
                    signal_type?: string | null
                    question?: string | null
                    scale_type?: string | null
                    options?: any | null
                    is_active?: boolean | null
                    created_at?: string | null
                    category_id?: string | null
                    title?: string | null
                    description?: string | null
                    cover_url?: string | null
                    status?: string | null
                    published_at?: string | null
                }
                Relationships: []
            }
            user_stats: {
                Row: {
                    user_id: string
                    total_signals: number
                    last_signal_at: string | null
                    signal_weight: number | null
                }
                Insert: {
                    user_id: string
                    total_signals?: number | null
                    last_signal_at?: string | null
                    signal_weight?: number | null
                }
                Update: {
                    user_id?: string
                    total_signals?: number | null
                    last_signal_at?: string | null
                    signal_weight?: number | null
                }
                Relationships: []
            }
        }
        Views: {
            v_trending_signals_24h: {
                Row: {
                    signal_id: string | null
                    title: string | null
                    category_id: string | null
                    responses_24h: number | null
                    last_activity_at: string | null
                }
                Relationships: []
            }
            v_active_battle_instance: {
                Row: {
                    battle_id: string | null
                    battle_instance_id: string | null
                    version: number | null
                    starts_at: string | null
                    ends_at: string | null
                }
                Relationships: []
            }
            v_signal_counts_daily: {
                Row: {
                    day: string | null
                    module_type: string | null
                    battle_id: string | null
                    battle_instance_id: string | null
                    option_id: string | null
                    signals: number | null
                    weighted_signals: number | null
                }
                Relationships: []
            }
        }
        Functions: {
            get_depth_comparison: {
                Args: {
                    p_option_a: string;
                    p_option_b: string;
                    p_gender?: string | null;
                    p_age_bucket?: string | null;
                    p_region?: string | null;
                };
                Returns: {
                    option_id: string;
                    question_key: string;
                    avg_value: number | null;
                    total_responses: number;
                }[];
            };
            get_depth_multi_option: {
                Args: {
                    p_option_ids: string[];
                    p_gender?: string | null;
                    p_age_bucket?: string | null;
                    p_region?: string | null;
                };
                Returns: {
                    option_id: string;
                    question_key: string;
                    avg_value: number | null;
                    total_responses: number;
                }[];
            };
            get_depth_analytics: {
                Args: {
                    p_option_id: string;
                    p_gender?: string | null;
                    p_age_bucket?: string | null;
                    p_region?: string | null;
                };
                Returns: {
                    question_key: string;
                    avg_value: number | null;
                    total_responses: number;
                }[];
            };
            get_or_create_anon_id: {
                Args: Record<string, never>;
                Returns: string;
            };
            calculate_rank_snapshot: {
                Args: {
                    p_attribute_id: string;
                    p_filters: Json;
                };
                Returns: Json;
            };
            get_live_platform_stats: {
                Args: Record<string, never>;
                Returns: {
                    signals_24h: number;
                    trending_title: string;
                    active_region: string;
                    active_users: number;
                    captured_at: string;
                }[];
            };
            get_recent_signal_activity: {
                Args: Record<string, never>;
                Returns: {
                    signals_last_3h: number;
                    verified_signals_last_3h: number;
                    unique_users_last_3h: number;
                }[];
            };
            get_trending_feed_grouped: {
                Args: Record<string, never>;
                Returns: Json;
            };
            is_admin: {
                Args: Record<string, never>;
                Returns: boolean;
            }
            insert_signal_event: {
                Args: {
                    p_battle_id: string;
                    p_option_id: string;
                }
                Returns: void
            }
            insert_depth_answers: {
                Args: {
                    p_option_id: string;
                    p_answers: Json;
                }
                Returns: void
            }
            kpi_trend_velocity: {
                Args: { p_battle_id: string }
                Returns: Json
            }
            increment_points: {
                Args: Record<string, never>;
                Returns: number;
            }
            get_share_of_preference: {
                Args: Record<string, never>;
                Returns: Json
            }
            get_survey_results_counts: {
                Args: Record<string, never>;
                Returns: Json
            }
            get_trend_velocity: {
                Args: Record<string, never>;
                Returns: Json
            }
            get_active_battles: {
                Args: Record<string, never>;
                Returns: Json
            }
            resolve_battle_context: {
                Args: { p_battle_slug: string }
                Returns: Json
            }
            can_anon_answer_today: {
                Args: Record<string, never>;
                Returns: boolean;
            }
            get_engagement_quality: {
                Args: Record<string, never>;
                Returns: Json
            }
            kpi_share_of_preference: {
                Args: { p_battle_id: string; p_start_date?: string; p_end_date?: string }
                Returns: Json
            }
            kpi_engagement_quality: {
                Args: { p_battle_id: string }
                Returns: Json
            }
            get_depth_trend: {
                Args: {
                    p_option_id: string;
                    p_question_key: string;
                    p_bucket?: string | null;
                    p_gender?: string | null;
                    p_age_bucket?: string | null;
                    p_region?: string | null;
                }
                Returns: {
                    time_bucket: string;
                    avg_value: number | null;
                    total_responses: number;
                }[]
            }
            get_state_benchmarks: {
                Args: Record<string, never>;
                Returns: Json
            }
            insert_user_state: {
                Args: {
                    p_mood_score: number;
                    p_economic_score: number;
                    p_job_score: number;
                    p_happiness_score: number;
                }
                Returns: void
            }
            get_battle_context: {
                Args: Record<string, never>;
                Returns: Json
            }
        }
        Enums: {
            [_ in never]: never
        }
    }
}
