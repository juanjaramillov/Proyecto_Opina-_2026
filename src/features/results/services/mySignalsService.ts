import { supabase } from '../../../supabase/client'
import { logger } from '../../../lib/logger'
import { getQueuedRecentVersusSignals, PendingMySignalRow } from '../../signals/services/signalOutbox'

export type MyRecentSignalRow = {
    created_at: string
    battle_id: string | null
    battle_title: string | null
    option_id: string | null
    option_label: string | null
    entity_id: string | null
    entity_name: string | null
    image_url: string | null
    category_slug: string | null
    pending?: boolean
}

export const mySignalsService = {
    async getMyRecentVersusSignals(limit: number = 12): Promise<MyRecentSignalRow[]> {
        const pending = getQueuedRecentVersusSignals(limit) as unknown as PendingMySignalRow[];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.rpc as any)('get_my_recent_versus_signals', {
            p_limit: limit,
        });

        const serverRows = (!error ? ((data as unknown as MyRecentSignalRow[]) || []) : []);

        if (error) {
            logger.error('get_my_recent_versus_signals error:', error);
        }

        // 1) Enriquecer pendientes con lookup masivo por option_id
        const pendingOptionIds = Array.from(
            new Set(
                pending
                    .map((p) => p.option_id)
                    .filter((x): x is string => typeof x === 'string' && x.length > 0)
            )
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ctxMap = new Map<string, any>();

        if (pendingOptionIds.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ctx = await (supabase.rpc as any)('lookup_battle_options_context', {
                p_option_ids: pendingOptionIds,
            });

            if (ctx.error) {
                logger.error('lookup_battle_options_context error:', ctx.error);
            } else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const rows = (ctx.data as any[]) || [];
                for (const r of rows) {
                    if (r?.option_id) ctxMap.set(String(r.option_id), r);
                }
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const enrichedPending: MyRecentSignalRow[] = pending.map((p: any) => {
            const ctx = p.option_id ? ctxMap.get(String(p.option_id)) : null;

            return {
                ...p,
                pending: true,
                // si hay ctx, rellenar; si no, mantener nulls
                battle_id: ctx?.battle_id || p.battle_id || null,
                battle_title: ctx?.battle_title || p.battle_title || null,
                option_label: ctx?.option_label || p.option_label || null,
                entity_id: ctx?.entity_id || p.entity_id || null,
                entity_name: ctx?.entity_name || p.entity_name || null,
                image_url: ctx?.image_url || p.image_url || null,
                category_slug: ctx?.category_slug || p.category_slug || null,
            } as MyRecentSignalRow;
        });

        // 2) Dedupe: si existe en server la misma battle_id+option_id cerca en el tiempo, ocultar pending
        const DEDUPE_WINDOW_MS = 3 * 60 * 1000; // 3 min

        const serverKeyTimes = new Map<string, number[]>();
        for (const s of serverRows) {
            const b = s.battle_id || '';
            const o = s.option_id || '';
            if (!b || !o) continue;

            const key = `${b}::${o}`;
            const t = new Date(s.created_at).getTime();

            const arr = serverKeyTimes.get(key) || [];
            arr.push(t);
            serverKeyTimes.set(key, arr);
        }

        const filteredPending = enrichedPending.filter((p) => {
            const b = p.battle_id || '';
            const o = p.option_id || '';
            if (!b || !o) return true;

            const key = `${b}::${o}`;
            const serverTimes = serverKeyTimes.get(key);
            if (!serverTimes || serverTimes.length === 0) return true;

            const pt = new Date(p.created_at).getTime();
            // Si hay un server row en +- ventana, esconder pending
            return !serverTimes.some((st) => Math.abs(st - pt) <= DEDUPE_WINDOW_MS);
        });

        // 3) Merge final (pendings filtrados + server)
        const merged: MyRecentSignalRow[] = [
            ...filteredPending.map((p) => ({ ...p, pending: true })),
            ...serverRows.map((s) => ({ ...s, pending: false })),
        ];

        // 4) Orden y recorte
        merged.sort((a, b) => {
            const da = new Date(a.created_at).getTime();
            const db = new Date(b.created_at).getTime();
            return db - da;
        });

        return merged.slice(0, Math.min(limit, 50));
    },

    async getAggLastRefreshedAt(categorySlug?: string): Promise<string | null> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.rpc as any)('get_agg_last_refreshed_at', {
            p_category_slug: categorySlug ?? null,
        })

        if (error) {
            logger.error('get_agg_last_refreshed_at error:', error)
            return null
        }

        return (data as string) || null
    },
}
