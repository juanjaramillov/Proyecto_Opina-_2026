import { supabase } from '../../../supabase/client';
import { Database } from '../../../supabase/database.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { getAssetPathForOption } from '../config/brandAssets';
import { logger } from '../../../lib/logger';
import {
    enqueueInsertSignalEvent,
    flushSignalOutbox,
    isNonRetriableSignalErrorMessage,
    removeOutboxJob
} from './signalOutbox';
import { track } from "../../telemetry/track";

const sb = supabase as unknown as SupabaseClient<Database>;

export type DbCategory = Database['public']['Tables']['categories']['Row'];

// --- NEW DATA MODEL TYPES ---
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
    }>;
};

function hasSupabaseEnv(): boolean {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return Boolean(url && key);
}



export const signalService = {
    // =========================
    // REAL DATA (Supabase)
    // =========================
    getCategories: async (): Promise<DbCategory[]> => {
        if (!hasSupabaseEnv()) return [];
        const { data, error } = await sb
            .from('categories')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return data ?? [];
    },

    // Legacy getSignals & getTrending24h removed

    // =========================
    // STEP 2: RICH SIGNAL EVENTS
    // =========================
    saveSignalEvent: async (payload: SignalEventPayload): Promise<void> => {
        // 1. VALIDACIÓN ESTRICTA RELAJADA (Depende del módulo)
        const isBattleFlow = !payload.meta?.source || payload.meta?.source === 'versus' || payload.meta?.source === 'progressive';
        if (isBattleFlow && (!payload.battle_id || !payload.option_id)) {
            logger.error('[SignalService] INVALID SIGNAL PAYLOAD: Missing battle_id or option_id for battle flow', payload);
            throw new Error('Invalid signal payload: missing battle_id or option_id');
        }
        if (!isBattleFlow) {
            if (!payload.entity_id && !payload.battle_id) {
                logger.error('[SignalService] INVALID SIGNAL PAYLOAD: Missing entity_id for non-battle flow', payload);
                throw new Error('Invalid signal payload: missing entity_id');
            }
            if ((payload.meta?.source === 'depth' || payload.meta?.source === 'news' || payload.meta?.source === 'actualidad') && !payload.context_id) {
                logger.error('[SignalService] INVALID SIGNAL PAYLOAD: Missing context_id for multi-response non-battle flow', payload);
                throw new Error('Invalid signal payload: missing context_id for multi-response signal');
            }
        }

        // Lógica Device Hash
        let deviceHash = localStorage.getItem('opina_device_hash');
        if (!deviceHash) {
            deviceHash = crypto.randomUUID();
            localStorage.setItem('opina_device_hash', deviceHash);
        }

        let signalTypeCode = 'VERSUS_SIGNAL';
        let moduleType = 'versus';
        if (payload.meta?.source === 'progressive') {
            signalTypeCode = 'PROGRESSIVE_SIGNAL';
            moduleType = 'progressive';
        } else if (payload.meta?.source === 'depth') {
            signalTypeCode = 'DEPTH_SIGNAL';
            moduleType = 'depth';
        } else if (payload.meta?.source === 'actualidad' || payload.meta?.source === 'news') {
            signalTypeCode = 'CONTEXT_SIGNAL';
            moduleType = 'news';
        } else if (payload.meta?.source === 'pulse') {
            signalTypeCode = 'PERSONAL_PULSE_SIGNAL';
            moduleType = 'pulse';
        }

        const args = {
            p_battle_id: payload.battle_id || undefined,
            p_option_id: payload.option_id || undefined,
            p_session_id: payload.session_id || undefined,
            p_attribute_id: payload.attribute_id || undefined,
            p_entity_id: payload.entity_id || undefined,
            p_entity_type: payload.entity_type || undefined,
            p_context_id: payload.context_id || undefined,
            p_value_numeric: payload.value_numeric ?? undefined,
            p_value_text: payload.value_text || undefined,
            p_device_hash: deviceHash,
            p_value_json: (payload.meta as Database['public']['Tables']['signal_events']['Row']['value_json']) || {},
            p_signal_type_code: signalTypeCode,
            p_module_type: moduleType
        };

        // 3. ENCOLAR SIEMPRE
        const { id } = enqueueInsertSignalEvent(args);

        // 4. UI REFRESH INMEDIATO (optimistic)
        try {
            window.dispatchEvent(new CustomEvent('opina:signal_emitted'));
        } catch {
            // noop
        }

        // 5. INTENTO INMEDIATO BEST-EFFORT
        try {
            let res = await sb.rpc('insert_signal_event', {
                ...args,
                p_client_event_id: id
            } as any);

            // Si falla por p_device_hash, reintento sin ese campo (fallback)
            if (res.error && String(res.error.message).includes('p_device_hash')) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { p_device_hash: _, ...fallbackArgs } = { ...args, p_client_event_id: id };
                res = await sb.rpc('insert_signal_event', (fallbackArgs as unknown) as Database['public']['Functions']['insert_signal_event']['Args']);
            }

            const { error } = res;

            if (error) {
                const eMsg = String((error as { message?: string })?.message || error);

                // DG-A01: Convertir gating en flujo guiado
                const msg = (error as { message?: string }).message?.toUpperCase() || '';
                const code = (error as { code?: string })?.code ? String((error as { code?: string }).code).toUpperCase() : '';

                const isInviteRequired =
                    msg.includes('INVITE_REQUIRED') || code.includes('INVITE_REQUIRED');

                const isProfileMissing =
                    msg.includes('PROFILE_MISSING') || code.includes('PROFILE_MISSING');

                const isProfileIncomplete =
                    msg.includes('PROFILE_INCOMPLETE') || code.includes('PROFILE_INCOMPLETE');

                if (isInviteRequired) {
                    track("signal_blocked_invite_required", "warn", { battle_id: payload.battle_id });
                    const next = encodeURIComponent(window.location.pathname + window.location.search);
                    window.dispatchEvent(
                        new CustomEvent('opina:navigate', { detail: { to: `/access?next=${next}` } })
                    );
                    throw error;
                }

                if (isProfileMissing || isProfileIncomplete) {
                    // Redirigir a ProfileWizard (mínimos)
                    track("signal_blocked_profile_required", "warn", { battle_id: payload.battle_id });
                    window.dispatchEvent(new CustomEvent('opina:navigate', { detail: { to: '/complete-profile' } }));
                    throw error;
                }

                if (isNonRetriableSignalErrorMessage(eMsg)) {
                    removeOutboxJob(id);
                    track("signal_emit_non_retriable_error", "error", { message: String(eMsg).slice(0, 160) }, id);
                    try {
                        window.dispatchEvent(new CustomEvent('opina:signal_emitted'));
                    } catch {
                        // noop
                    }
                    throw error;
                }

                logger.warn('[SignalService] RPC insert_signal_event failed (transient)', eMsg);
            } else {
                removeOutboxJob(id);
                track("signal_saved", "info", { battle_id: payload.battle_id, option_id: payload.option_id }, id);
            }
        } catch (err: unknown) {
            // Re-throw if it was already explicitly thrown for business rules
            logger.warn('[SignalService] Submitting signal failed natively. Kept in Outbox', err);
            throw err; // ALWAYS THROW for temporary debugging
        }

        // 6. FIRE AND FORGET
        flushSignalOutbox(25).catch(err => {
            logger.warn('[SignalService] Async Background flush warning', err);
        });
    },

    saveVersusSignal: async (args: {
        battle_uuid: string; // The actual UUID for signal_events schema
        battle_id: string;   // the slug or id for legacy bridging
        battle_title: string;
        selected_option_id: string;
        loser_option_id: string;
        selected_option_name: string;
        loser_option_name: string;
        subcategory?: string;
    }): Promise<void> => {
        return signalService.saveSignalEvent({
            battle_id: args.battle_uuid,
            option_id: args.selected_option_id,
            meta: {
                source: 'versus',
                loser_option_id: args.loser_option_id,
                subcategory: args.subcategory
            }
        });
    },

    saveTorneoSignal: async (args: {
        battle_uuid: string; // UUID for signal_events
        battle_id: string;   // Context id / slug
        instance_id: string; // For progressive
        title: string;
        selected_option_id: string;
        loser_option_id: string;
        selected_option_name: string;
        loser_option_name: string;
        subcategory?: string;
        stage?: number;
    }): Promise<void> => {
        return signalService.saveSignalEvent({
            battle_id: args.battle_uuid,
            option_id: args.selected_option_id,
            meta: {
                source: 'progressive',
                loser_option_id: args.loser_option_id,
                subcategory: args.subcategory,
                stage: args.stage
            }
        });
    },


    // =========================
    // STEP 3: CONTEXT RESOLUTION (RPC)
    // =========================
    resolveBattleContext: async (battleSlug: string): Promise<BattleContextResponse> => {
        if (!hasSupabaseEnv()) return { ok: false, error: 'Missing Supabase env' };

        const { data, error } = await sb.rpc('resolve_battle_context', {
            p_battle_slug: battleSlug,
        });

        if (error) return { ok: false, error: error.message };
        return data as BattleContextResponse;
    },

    // =========================
    // STEP 5: ACTIVE BATTLES (HUB)
    // =========================
    getHubLiveStats24h: async (): Promise<{
        active_users_24h: number;
        signals_24h: number;
        depth_answers_24h: number;
        active_battles: number;
        entities_elo: number;
    }> => {
        if (!hasSupabaseEnv()) return { active_users_24h: 0, signals_24h: 0, depth_answers_24h: 0, active_battles: 0, entities_elo: 0 };

        const { data, error } = await sb.rpc('get_hub_live_stats_24h');
        if (error) {
            logger.error('[Hub Live Stats] Error:', error);
            return { active_users_24h: 0, signals_24h: 0, depth_answers_24h: 0, active_battles: 0, entities_elo: 0 };
        }
        return (data as unknown as {
            active_users_24h: number;
            signals_24h: number;
            depth_answers_24h: number;
            active_battles: number;
            entities_elo: number;
        }) ?? { active_users_24h: 0, signals_24h: 0, depth_answers_24h: 0, active_battles: 0, entities_elo: 0 };
    },

    getHubSignalTimeseries24h: async (): Promise<Array<{
        bucket_start: string;
        label: string;
        signals: number;
        depth: number;
    }>> => {
        if (!hasSupabaseEnv()) return [];

        const { data, error } = await sb.rpc('get_hub_signal_timeseries_24h');
        if (error) {
            logger.error('[Hub Timeseries 24h] Error:', error);
            return [];
        }

        return (data as unknown as Array<{
            bucket_start: string;
            label: string;
            signals: number;
            depth: number;
        }>) ?? [];
    },

    getHubTopNow24h: async (): Promise<{
        top_versus: { slug: string; title: string; signals_24h: number } | null;
        top_tournament: { slug: string; title: string; signals_24h: number } | null;
    }> => {
        if (!hasSupabaseEnv()) return { top_versus: null, top_tournament: null };

        const { data, error } = await sb.rpc('get_hub_top_now_24h');

        if (error) {
            logger.error('[Hub Top Now] Error:', error);
            return { top_versus: null, top_tournament: null };
        }

        return (data as unknown as {
            top_versus: { slug: string; title: string; signals_24h: number } | null;
            top_tournament: { slug: string; title: string; signals_24h: number } | null;
        }) ?? { top_versus: null, top_tournament: null };
    },

    getActiveBattles: async (): Promise<ActiveBattle[]> => {
        if (!hasSupabaseEnv()) return [];

        const { data: page1, error: err1 } = await sb.rpc('get_active_battles').range(0, 999);
        if (err1) {
            logger.error('[Active Battles] Error fetching page 1:', err1);
            return [];
        }

        const { data: page2, error: err2 } = await sb.rpc('get_active_battles').range(1000, 1999);
        if (err2) {
            logger.error('[Active Battles] Error fetching page 2:', err2);
        }

        const rawData = [
            ...((page1 as unknown as ActiveBattle[]) || []),
            ...((page2 as unknown as ActiveBattle[]) || [])
        ];

        return rawData.map((b) => ({
            id: b.id,
            slug: b.slug,
            title: b.title,
            description: b.description || null,
            created_at: b.created_at,
            category: b.category || null,
            options: (b.options || []).map((opt) => ({
                id: opt.id,
                label: opt.label,
                image_url: getAssetPathForOption(opt.label, opt.image_url),
                brand_domain: opt.brand_domain || null,
                category: (opt as { category?: string | null }).category || null,
                type: 'brand',
                imageFit: 'contain'
            }))
        })) as ActiveBattle[];
    },

    getUserStats: async (): Promise<Database['public']['Tables']['user_stats']['Row'] | null> => {
        if (!hasSupabaseEnv()) return null;

        const { data: { session } } = await sb.auth.getSession();
        if (!session) return null;

        const { data, error } = await sb
            .from('user_stats')
            .select('*')
            .single();

        if (error) {
            if (error.code !== 'PGRST116') { // Ignore "no rows returned"
                logger.error('[User Stats] Error:', error);
            }
            return null;
        }
        return data;
    },
};
