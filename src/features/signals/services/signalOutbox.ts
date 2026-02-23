import { supabase } from '../../../supabase/client';
import { logger } from '../../../lib/logger';

type OutboxJob = {
    id: string; // client_event_id
    rpc: 'insert_signal_event';
    args: Record<string, unknown>;
    createdAt: number;
    attempts: number;
    nextAttemptAt: number;
    lastError?: string;
};

const STORAGE_KEY = 'opina_signal_outbox_v1';
const MAX_QUEUE = 500;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 días
const FLUSH_INTERVAL_MS = 15_000;

let flushing = false;
let started = false;
let intervalId: number | null = null;

function now() {
    return Date.now();
}

function emitSignalEvent() {
    try {
        window.dispatchEvent(new CustomEvent('opina:signal_emitted'));
    } catch {
        // noop
    }
}

function safeParse(json: string | null): OutboxJob[] {
    if (!json) return [];
    try {
        const data = JSON.parse(json);
        return Array.isArray(data) ? (data as OutboxJob[]) : [];
    } catch {
        return [];
    }
}

function loadQueue(): OutboxJob[] {
    return safeParse(localStorage.getItem(STORAGE_KEY));
}

function saveQueue(queue: OutboxJob[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

function prune(queue: OutboxJob[]): OutboxJob[] {
    const cutoff = now() - MAX_AGE_MS;
    const fresh = queue.filter(j => j.createdAt >= cutoff);
    if (fresh.length <= MAX_QUEUE) return fresh;
    return fresh.slice(0, MAX_QUEUE);
}

function backoffMs(attempts: number): number {
    // 3s, 6s, 12s... max 1h
    const base = 3000 * Math.pow(2, Math.max(0, attempts));
    return Math.min(60 * 60 * 1000, base);
}

export function isNonRetriableSignalErrorMessage(msg: string): boolean {
    const m = msg.toUpperCase();
    return (
        m.includes('SIGNAL_LIMIT_REACHED') ||
        m.includes('PROFILE_MISSING') ||
        m.includes('BATTLE_NOT_ACTIVE') ||
        m.includes('INVALID SIGNAL PAYLOAD') ||
        m.includes('INVITE_REQUIRED') ||
        m.includes('PROFILE_INCOMPLETE') ||
        m.includes('COOLDOWN_ACTIVE')
    );
}

export function removeOutboxJob(id: string): void {
    const queue = loadQueue();
    const nextQueue = queue.filter(j => j.id !== id);
    saveQueue(nextQueue);
    emitSignalEvent();
}

export function getOutboxCount(): number {
    return loadQueue().length;
}

export function getQueuedVotesForSession(sessionId: string): string[] {
    const q = loadQueue();
    const optionIds: string[] = [];
    for (const job of q) {
        if (job.rpc !== 'insert_signal_event') continue;
        const args = job.args as any;
        if (args?.p_session_id === sessionId && typeof args?.p_option_id === 'string') {
            optionIds.push(args.p_option_id);
        }
    }
    return optionIds;
}

export function enqueueInsertSignalEvent(args: Record<string, unknown>): { status: 'queued' | 'deduped'; id: string } {
    const existingId = (args as any)?.p_client_event_id as string | undefined;
    const id = existingId || crypto.randomUUID();

    const queue = loadQueue();

    // Dedup por id (idempotencia local)
    if (queue.some(j => j.id === id)) {
        return { status: 'deduped', id };
    }

    const job: OutboxJob = {
        id,
        rpc: 'insert_signal_event',
        args: { ...args, p_client_event_id: id },
        createdAt: now(),
        attempts: 0,
        nextAttemptAt: now(),
    };

    queue.unshift(job);
    saveQueue(prune(queue));
    emitSignalEvent();
    return { status: 'queued', id };
}

export async function flushSignalOutbox(maxJobs: number = 50): Promise<{ sent: number; failed: number; remaining: number }> {
    if (flushing) {
        const q = loadQueue();
        return { sent: 0, failed: 0, remaining: q.length };
    }
    flushing = true;

    try {
        let queue = loadQueue();
        if (queue.length === 0) return { sent: 0, failed: 0, remaining: 0 };

        const t = now();
        let sent = 0;
        let failed = 0;

        // Procesa solo jobs “vencidos”
        const due = queue.filter(j => j.nextAttemptAt <= t).slice(0, maxJobs);

        for (const job of due) {
            try {
                let res = await (supabase.rpc as any)(job.rpc, job.args);

                if (res.error && String(res.error.message).includes('p_device_hash')) {
                    const fallbackArgs = { ...job.args } as Record<string, any>;
                    delete fallbackArgs.p_device_hash;
                    res = await (supabase.rpc as any)(job.rpc, fallbackArgs);
                }

                let { error } = res;

                if (error) {
                    const msg = error?.message ? String(error.message) : 'Unknown RPC error';
                    if (isNonRetriableSignalErrorMessage(msg)) {
                        // Drop definitivo
                        queue = queue.filter(j => j.id !== job.id);
                        saveQueue(queue);
                        emitSignalEvent();
                        failed++;
                        logger.error('[Outbox] Drop non-retriable job', { id: job.id, msg });
                        continue;
                    }

                    throw error;
                }

                // OK: remover job
                queue = queue.filter(j => j.id !== job.id);
                saveQueue(queue);
                sent++;

                // Notificar a la app que se sincronizó una señal pendiente
                emitSignalEvent();
            } catch (e: any) {
                const msg = e?.message ? String(e.message) : 'Unknown error';

                // Si no hay red, deja de intentar
                if (typeof navigator !== 'undefined' && navigator.onLine === false) {
                    logger.warn('[Outbox] Offline, stopping flush');
                    break;
                }

                // Reprogramar retry
                queue = queue.map(j => {
                    if (j.id !== job.id) return j;
                    const attempts = (j.attempts || 0) + 1;
                    return {
                        ...j,
                        attempts,
                        nextAttemptAt: now() + backoffMs(attempts),
                        lastError: msg,
                    };
                });

                saveQueue(queue);
                failed++;
                logger.warn('[Outbox] Retry scheduled', { id: job.id, msg });
            }
        }

        queue = prune(queue);
        saveQueue(queue);

        return { sent, failed, remaining: queue.length };
    } finally {
        flushing = false;
    }
}

export function startSignalOutbox() {
    if (started) return;
    started = true;

    const safeFlush = () => flushSignalOutbox().catch(err => logger.error('[Outbox] Flush failed', err));

    // Flush inicial
    if (typeof navigator === 'undefined' || navigator.onLine) safeFlush();

    window.addEventListener('online', safeFlush);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') safeFlush();
    });

    intervalId = window.setInterval(() => {
        if (typeof navigator === 'undefined' || navigator.onLine) safeFlush();
    }, FLUSH_INTERVAL_MS);
}

export function stopSignalOutbox() {
    if (!started) return;
    started = false;
    if (intervalId) window.clearInterval(intervalId);
    intervalId = null;
}

export type PendingMySignalRow = {
    created_at: string
    battle_id: string | null
    battle_title: string | null
    option_id: string | null
    option_label: string | null
    entity_id: string | null
    entity_name: string | null
    image_url: string | null
    category_slug: string | null
    pending: true
}

export function getQueuedRecentVersusSignals(limit: number = 12): PendingMySignalRow[] {
    const q = loadQueue();

    // Solo jobs de versus/progressive (insert_signal_event)
    const rows: PendingMySignalRow[] = [];

    for (const job of q) {
        if (job.rpc !== 'insert_signal_event') continue;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const args: any = job.args || {};
        const createdAtIso = new Date(job.createdAt).toISOString();

        rows.push({
            created_at: createdAtIso,
            battle_id: (args.p_battle_id as string) || null,
            battle_title: null, // no lo tenemos offline sin lookup extra
            option_id: (args.p_option_id as string) || null,
            option_label: null,
            entity_id: null,
            entity_name: null,
            image_url: null,
            category_slug: null,
            pending: true,
        });
    }

    rows.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    return rows.slice(0, Math.min(limit, 50));
}
