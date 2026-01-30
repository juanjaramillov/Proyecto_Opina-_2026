import { supabase } from '../supabase/client';
import { Database } from '../types/database.types';

export type DbCategory = Database['public']['Tables']['categories']['Row'];
export type DbSignal = Database['public']['Tables']['signals']['Row'];

// View rows
export type TrendingRow24h = Database['public']['Views']['trending_signals_24h']['Row'];

export type TrendingSignal = {
    id: string;
    title: string;
    responses24h: number;
    lastActivityAt: string | null;
    category: {
        id: string | null;
        slug: string | null;
        name: string | null;
        emoji: string | null;
        coverUrl: string | null;
    };
    options: Array<{ label: string }>;
};

// --- NEW DATA MODEL TYPES ---
export type SignalEventPayload = {
    // Legacy (se mantiene para no romper llamadas existentes)
    source_type: 'versus' | 'review';
    source_id: string; // id lógico de la fuente (por ejemplo signal_id o slug)
    title: string;
    choice_label?: string;

    // Context/History (UUIDs en DB; en TS llegan como string)
    battle_id?: string;
    battle_instance_id?: string;
    option_id?: string;

    // Quality Metrics (legacy; ya no se persiste directo en DB)
    signal_weight: number; // 0.1 - 1.0

    // NEW: valor de señal (+1 / -1)
    signal_value?: 1 | -1;

    // User Snapshot
    user_tier?: string;
    profile_completeness?: number;

    // Segmentation (Optional for now)
    country?: string;
    city?: string;

    meta?: Record<string, unknown>;
};

export type BattleContextResponse = {
    ok: boolean;
    error?: string;

    // UUIDs en DB; en TS llegan como string
    battle_id?: string;
    battle_instance_id?: string;

    battle_slug?: string;
    title?: string;
    options?: Array<{
        id: string; // option_id uuid como string
        label: string;
        image_url: string;
        sort_order: number;
    }>;
};

// KPI types (por battle_instance_id)
export type ShareOfPreferenceRow = {
    option_id: string;
    signals: number;
    share_pct: number;
};

export type TrendVelocityRow = {
    option_id: string;
    delta_signals: number;
};

export type EngagementQualityRow = {
    option_id: string;
    weighted_signals: number;
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
    }>;
};

function hasSupabaseEnv(): boolean {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return Boolean(url && key);
}

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
    try {
        return await fn();
    } catch {
        return fallback;
    }
}

export const signalService = {
    // =========================
    // REAL DATA (Supabase)
    // =========================
    getCategories: async (): Promise<DbCategory[]> => {
        if (!hasSupabaseEnv()) return [];
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return data ?? [];
    },

    getSignals: async (): Promise<DbSignal[]> => {
        if (!hasSupabaseEnv()) return [];
        const { data, error } = await supabase
            .from('signals')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data ?? [];
    },

    getTrending24h: async (): Promise<TrendingSignal[]> => {
        if (!hasSupabaseEnv()) return [];

        const rows = await safe(async () => {
            const { data, error } = await supabase.from('trending_signals_24h').select('*');
            if (error) throw error;
            return (data ?? []) as TrendingRow24h[];
        }, [] as TrendingRow24h[]);

        if (rows.length === 0) return [];

        const { data: categories } = await supabase
            .from('categories')
            .select('id, slug, name, emoji, cover_url');

        const catById = new Map((categories ?? []).map((c) => [c.id, c]));

        const signals = await safe(async () => {
            const ids = rows.map((r) => r.signal_id);
            const { data, error } = await supabase
                .from('signals')
                .select('id, options')
                .in('id', ids);

            if (error) throw error;
            return data ?? [];
        }, [] as Array<{ id: string; options: any }>); // options is Json in DB types

        const optionsById = new Map(signals.map((s) => [s.id, Array.isArray(s.options) ? s.options : []]));

        return rows.map((r) => {
            const cat = r.category_id ? catById.get(r.category_id) : null;
            const rawOpts = optionsById.get(r.signal_id) ?? [];
            return {
                id: r.signal_id,
                title: r.title,
                responses24h: r.responses_24h,
                lastActivityAt: r.last_activity_at,
                category: {
                    id: cat?.id ?? null,
                    slug: cat?.slug ?? null,
                    name: cat?.name ?? null,
                    emoji: cat?.emoji ?? null,
                    coverUrl: cat?.cover_url ?? null,
                },
                options: rawOpts.map((o: any) => ({ label: o.label ?? '' })),
            };
        });
    },

    // =========================
    // STEP 2: RICH SIGNAL EVENTS
    // =========================
    saveSignalEvent: async (payload: SignalEventPayload): Promise<void> => {
        if (!hasSupabaseEnv()) {
            console.log('[Mock] Saving Signal Event:', payload);
            return;
        }

        const { data: auth } = await supabase.auth.getUser();

        // 1. STRICT VALIDATION (Audit Requirement)
        if (payload.source_type === 'versus') {
            if (!payload.battle_id || !payload.battle_instance_id) {
                console.error('[SignalService] CRITICAL INVALID EVENT: Versus signal missing battle context.', payload);
                return; // Do not save invalid data
            }
        }

        const { error } = await supabase.from('signal_events').insert({
            // Core Identity
            user_id: auth?.user?.id ?? null,

            // Source Context
            source_type: payload.source_type,
            source_id: payload.source_id,
            signal_id: payload.source_id, // Usamos source_id como identificador de la señal
            event_type: 'vote',           // Por defecto es un voto
            title: payload.title,
            choice_label: payload.choice_label ?? null,

            // Battle Context
            battle_id: payload.battle_id ?? null,
            battle_instance_id: payload.battle_instance_id ?? null,
            option_id: payload.option_id ?? null,

            // Values & Quality
            signal_weight: payload.signal_weight ?? 1.0,

            // User Snapshot
            user_tier: payload.user_tier ?? 'free',
            profile_completeness: payload.profile_completeness ?? 0,

            // Segmentation
            country: payload.country ?? null,
            city: payload.city ?? null,

            // Meta
            meta: (payload.meta as any) ?? {}, // Json type in DB

            created_at: new Date().toISOString(),
        });

        if (error) {
            console.error('Error saving signal event:', error);
        }
    },

    vote: async (_signalId: string, _optionIndex: number): Promise<void> => {
        // Legacy fallback to satisfy interface if any but removed usage
        return Promise.resolve();
    },

    calculateQualityScore: (startTime: number, now: number): number => {
        const diff = now - startTime;
        if (diff < 500) return 0.5;
        if (diff < 1500) return 0.8;
        return 1.0;
    },

    // =========================
    // STEP 3: CONTEXT RESOLUTION (RPC)
    // =========================
    resolveBattleContext: async (battleSlug: string): Promise<BattleContextResponse> => {
        if (!hasSupabaseEnv()) return { ok: false, error: 'Missing Supabase env' };

        const { data, error } = await supabase.rpc('resolve_battle_context', {
            p_battle_slug: battleSlug,
        });

        if (error) return { ok: false, error: error.message };
        // Validar shape si es necesario, por ahora cast
        return data as unknown as BattleContextResponse;
    },

    // =========================
    // STEP 4: KPI READS (RPC)
    // =========================
    getShareOfPreference: async (
        battleId: string,
        startDate?: string,
        endDate?: string
    ): Promise<ShareOfPreferenceRow[]> => {
        if (!hasSupabaseEnv()) return [];

        const { data, error } = await supabase.rpc('kpi_share_of_preference', {
            p_battle_id: battleId,
            p_start_date: startDate ?? null,
            p_end_date: endDate ?? null,
        });

        if (error) {
            console.error('[KPI Share] Error:', error);
            return [];
        }
        return (data ?? []) as unknown as ShareOfPreferenceRow[];
    },

    getTrendVelocity: async (
        battleId: string,
        bucket: 'hour' | 'day' | 'week' = 'day',
        startDate?: string,
        endDate?: string
    ): Promise<TrendVelocityRow[]> => {
        if (!hasSupabaseEnv()) return [];

        const { data, error } = await supabase.rpc('kpi_trend_velocity', {
            p_battle_id: battleId,
            p_bucket: bucket,
            p_start_date: startDate ?? null,
            p_end_date: endDate ?? null,
        });

        if (error) {
            console.error('[KPI Trend] Error:', error);
            return [];
        }

        // RPC returns { option_id, delta_signals }
        return (data ?? []) as unknown as TrendVelocityRow[];
    },

    getEngagementQuality: async (
        battleId: string,
        startDate?: string,
        endDate?: string
    ): Promise<EngagementQualityRow[]> => {
        if (!hasSupabaseEnv()) return [];

        const { data, error } = await supabase.rpc('kpi_engagement_quality', {
            p_battle_id: battleId,
            p_start_date: startDate ?? null,
            p_end_date: endDate ?? null,
        });

        if (error) {
            console.error('[KPI Quality] Error:', error);
            return [];
        }

        // RPC returns { option_id, weighted_signals }
        return (data ?? []) as unknown as EngagementQualityRow[];
    },

    // =========================
    // STEP 5: ACTIVE BATTLES (HUB)
    // =========================
    getActiveBattles: async (): Promise<ActiveBattle[]> => {
        if (!hasSupabaseEnv()) return [];

        const { data, error } = await supabase.rpc('get_active_battles');

        if (error) {
            console.error('[Active Battles] Error:', error);
            return [];
        }
        return (data ?? []) as unknown as ActiveBattle[];
    },
};
