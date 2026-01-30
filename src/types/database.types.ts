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
                    id?: string
                    slug: string
                    name: string
                    emoji?: string | null
                    cover_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    slug?: string
                    name?: string
                    emoji?: string | null
                    cover_url?: string | null
                    created_at?: string
                }
                Relationships: []
            }
            battles: {
                Row: {
                    id: string
                    slug: string
                    title: string
                    description: string | null
                    category_id: string | null
                    status: 'active' | 'archived' | 'draft'
                    is_public: boolean
                    created_at: string
                    starts_at: string | null
                    ends_at: string | null
                }
                Insert: {
                    id?: string
                    slug: string
                    title: string
                    description?: string | null
                    category_id?: string | null
                    status?: 'active' | 'archived' | 'draft'
                    is_public?: boolean
                    created_at?: string
                    starts_at?: string | null
                    ends_at?: string | null
                }
                Update: {
                    id?: string
                    slug?: string
                    title?: string
                    description?: string | null
                    category_id?: string | null
                    status?: 'active' | 'archived' | 'draft'
                    is_public?: boolean
                    created_at?: string
                    starts_at?: string | null
                    ends_at?: string | null
                }
                Relationships: []
            }
            battle_options: {
                Row: {
                    id: string
                    battle_id: string
                    label: string
                    image_url: string | null
                    sort_order: number
                }
                Insert: {
                    id?: string
                    battle_id: string
                    label: string
                    image_url?: string | null
                    sort_order?: number
                }
                Update: {
                    id?: string
                    battle_id?: string
                    label?: string
                    image_url?: string | null
                    sort_order?: number
                }
                Relationships: []
            }
            signal_events: {
                Row: {
                    id: string
                    user_id: string | null
                    source_type: string
                    source_id: string
                    signal_id: string
                    event_type: string
                    title: string
                    choice_label: string | null
                    battle_id: string | null
                    battle_instance_id: string | null
                    option_id: string | null
                    signal_weight: number
                    user_tier: string
                    profile_completeness: number
                    country: string | null
                    city: string | null
                    meta: Json
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    source_type: string
                    source_id: string
                    signal_id: string
                    event_type?: string
                    title: string
                    choice_label?: string | null
                    battle_id?: string | null
                    battle_instance_id?: string | null
                    option_id?: string | null
                    signal_weight?: number
                    user_tier?: string
                    profile_completeness?: number
                    country?: string | null
                    city?: string | null
                    meta?: Json
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    source_type?: string
                    source_id?: string
                    signal_id?: string
                    event_type?: string
                    title?: string
                    choice_label?: string | null
                    battle_id?: string | null
                    battle_instance_id?: string | null
                    option_id?: string | null
                    signal_weight?: number
                    user_tier?: string
                    profile_completeness?: number
                    country?: string | null
                    city?: string | null
                    meta?: Json
                    created_at?: string
                }
                Relationships: []
            }
            signals: {
                Row: {
                    id: string
                    signal_key: string
                    signal_type: 'versus' | 'core' | 'dynamic'
                    question: string
                    scale_type: 'emoji' | 'numeric' | 'binary' | 'choice' | 'versus'
                    options: Json
                    is_active: boolean
                    created_at: string
                    category_id: string | null
                }
                Insert: {
                    id?: string
                    signal_key: string
                    signal_type: 'versus' | 'core' | 'dynamic'
                    question: string
                    scale_type: 'emoji' | 'numeric' | 'binary' | 'choice' | 'versus'
                    options: Json
                    is_active: boolean
                    created_at?: string
                    category_id?: string | null
                }
                Update: {
                    id?: string
                    signal_key?: string
                    signal_type?: 'versus' | 'core' | 'dynamic'
                    question?: string
                    scale_type?: 'emoji' | 'numeric' | 'binary' | 'choice' | 'versus'
                    options?: Json
                    is_active?: boolean
                    created_at?: string
                    category_id?: string | null
                }
                Relationships: []
            }
            user_profiles: {
                Row: {
                    user_id: string
                    tier: 'guest' | 'verified_basic' | 'verified_full_ci'
                    profile_completeness: number
                    has_ci: boolean
                    created_at: string
                    updated_at: string | null
                }
                Insert: {
                    user_id: string
                    tier?: 'guest' | 'verified_basic' | 'verified_full_ci'
                    profile_completeness?: number
                    has_ci?: boolean
                    created_at?: string
                    updated_at?: string | null
                }
                Update: {
                    user_id?: string
                    tier?: 'guest' | 'verified_basic' | 'verified_full_ci'
                    profile_completeness?: number
                    has_ci?: boolean
                    created_at?: string
                    updated_at?: string | null
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
            signal_responses: {
                Row: {
                    id: string
                    signal_id: string
                    user_id: string | null
                    option_value: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    signal_id: string
                    user_id?: string | null
                    option_value: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    signal_id?: string
                    user_id?: string | null
                    option_value?: string
                    created_at?: string
                }
                Relationships: []
            }
        }
        Views: {
            trending_signals_24h: {
                Row: {
                    signal_id: string
                    title: string
                    category_id: string | null
                    responses_24h: number
                    last_activity_at: string | null
                }
                Relationships: []
            }
        }
        Functions: {
            resolve_battle_context: {
                Args: { p_battle_slug: string }
                Returns: Json
            }
            get_active_battles: {
                Args: Record<string, never>
                Returns: Json
            }
            kpi_share_of_preference: {
                Args: { p_battle_id: string; p_start_date?: string | null; p_end_date?: string | null }
                Returns: Json
            }
            kpi_trend_velocity: {
                Args: { p_battle_id: string }
                Returns: Json
            }
            kpi_engagement_quality: {
                Args: { p_battle_id: string }
                Returns: Json
            }
            delete_own_account: {
                Args: Record<string, never>
                Returns: void
            }
        }
        Enums: {
            [_ in never]: never
        }
    }
}
