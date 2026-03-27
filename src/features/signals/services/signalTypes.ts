import { Database } from '../../../supabase/database.types';

export type DbCategory = Database['public']['Tables']['categories']['Row'];

export type SignalEventPayload = {
    battle_id?: string;
    option_id?: string;
    session_id?: string;
    attribute_id?: string;
    entity_id?: string;
    entity_type?: string;
    context_id?: string;
    value_numeric?: number;
    value_text?: string;
    meta?: Record<string, unknown>;
    
    // V14 Enriched Properties
    left_entity_id?: string;
    right_entity_id?: string;
    selected_entity_id?: string;
    response_time_ms?: number;
    event_status?: string;
    content_snapshot_id?: string;
    interaction_outcome?: string;
    question_id?: string;
    question_version?: number;
    sequence_id?: string;
    sequence_order?: number;
    origin_module?: string;
    origin_element?: string;
    display_order?: number;
};

export type BattleContextResponse = {
    ok: boolean;
    error?: string;
    battle_id?: string;
    battle_instance_id?: string;
    battle_slug?: string;
    title?: string;
    options?: Array<{
        id: string;
        label: string;
        image_url: string;
        brand_domain?: string | null;
        sort_order: number;
    }>;
};

export type ActiveBattle = {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    created_at: string;
    category: {
        slug: string;
        name: string;
        emoji: string;
        cover_url: string | null;
    } | null;
    options: Array<{
        id: string;
        label: string;
        image_url: string | null;
        brand_domain?: string | null;
        is_active_versus?: boolean;
        is_active_torneo?: boolean;
    }>;
};
