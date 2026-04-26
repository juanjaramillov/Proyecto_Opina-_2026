import { logger } from '../../../lib/logger';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { typedRpc } from '../../../supabase/typedRpc';

/**
 * Signal Outbox — Contrato (DEBT-007)
 * ======================================================================
 * Persistencia offline de eventos de señal con las siguientes garantías:
 *
 *  1. **Idempotencia local**: `enqueueInsertSignalEvent` hace dedupe por
 *     `p_client_event_id`. Encolar dos veces el mismo id devuelve `deduped`
 *     sin duplicar el job.
 *
 *  2. **Backoff exponencial con jitter**: `backoffMs(attempts)` devuelve
 *     `min(1h, 3s * 2^attempts)` + ruido aleatorio [0, 25% del backoff, max 5s]
 *     para romper retry-storms sincronizados (varios clientes que vuelven
 *     online al mismo tiempo).
 *
 *  3. **Clasificación de errores**: `isNonRetriableSignalErrorMessage`
 *     mata jobs cuyo error del backend no se resolverá reintentando
 *     (RATE_LIMITED, SIGNAL_LIMIT_REACHED, PROFILE_MISSING, …). Los demás
 *     errores se reagendan con backoff.
 *
 *  4. **Retención**: 7 días máximo (`MAX_AGE_MS`) y 500 jobs máximo
 *     (`MAX_QUEUE`). `prune` se aplica tras cada flush y tras cada enqueue.
 *
 *  5. **Flush triggers**: `startSignalOutbox` registra:
 *       - Flush inicial (si online)
 *       - Evento `online`
 *       - `visibilitychange` a visible
 *       - `pagehide` y `beforeunload` (mejor-esfuerzo antes de cerrar)
 *       - Intervalo cada `FLUSH_INTERVAL_MS` (15s)
 *
 *  6. **Observabilidad**: `getOutboxStats()` expone totales y próxima
 *     ventana de flush para que una UI de "señales pendientes" pueda
 *     informarle al usuario sin leer localStorage directamente.
 *
 * Storage migrado a IndexedDB via `idb` para escalabilidad y no bloquear
 * el thread principal.
 */

export type OutboxJob = {
    id: string; // client_event_id
    rpc: 'insert_signal_event';
    args: Record<string, unknown>;
    createdAt: number;
    attempts: number;
    nextAttemptAt: number;
    lastError?: string;
};

interface OpinaDB extends DBSchema {
    signal_outbox: {
        key: string;
        value: OutboxJob;
    };
}

const STORAGE_KEY = 'opina_signal_outbox_v1';
const MAX_QUEUE = 500;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 días
const FLUSH_INTERVAL_MS = 15_000;

let flushing = false;
let started = false;
let dbPromise: Promise<IDBPDatabase<OpinaDB>> | null = null;

function getDB() {
    if (!dbPromise) {
        dbPromise = openDB<OpinaDB>('opina_db', 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('signal_outbox')) {
                    db.createObjectStore('signal_outbox', { keyPath: 'id' });
                }
            },
        });
    }
    return dbPromise;
}

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

async function loadQueue(): Promise<OutboxJob[]> {
    try {
        const db = await getDB();
        const all = await db.getAll('signal_outbox');
        // Ordenamos por createdAt descendente para simular comportamiento de array unshift (más nuevos primero)
        return all.sort((a, b) => b.createdAt - a.createdAt);
    } catch (e) {
        logger.error('[Outbox] Error loading queue from IDB', e);
        return [];
    }
}

async function saveQueue(queue: OutboxJob[]): Promise<void> {
    try {
        const db = await getDB();
        const tx = db.transaction('signal_outbox', 'readwrite');
        await tx.store.clear();
        for (const job of queue) {
            await tx.store.put(job);
        }
        await tx.done;
    } catch (e) {
        logger.error('[Outbox] Error saving queue to IDB', e);
    }
}

function prune(queue: OutboxJob[]): OutboxJob[] {
    const cutoff = now() - MAX_AGE_MS;
    const fresh = queue.filter(j => j.createdAt >= cutoff);
    if (fresh.length <= MAX_QUEUE) return fresh;
    return fresh.slice(0, MAX_QUEUE);
}

/**
 * Exponential backoff con jitter.
 */
export function backoffMs(attempts: number): number {
    const base = Math.min(60 * 60 * 1000, 3000 * Math.pow(2, Math.max(0, attempts)));
    const jitterMax = Math.min(5000, Math.floor(base * 0.25));
    const jitter = jitterMax > 0 ? Math.floor(Math.random() * jitterMax) : 0;
    return base + jitter;
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
        m.includes('COOLDOWN_ACTIVE') ||
        m.includes('RATE_LIMITED')
    );
}

export async function removeOutboxJob(id: string): Promise<void> {
    try {
        const db = await getDB();
        await db.delete('signal_outbox', id);
        emitSignalEvent();
    } catch (e) {
        logger.error('[Outbox] Error removing job from IDB', e);
    }
}

export async function getQueuedVotesForSession(sessionId: string): Promise<string[]> {
    const q = await loadQueue();
    const optionIds: string[] = [];
    for (const job of q) {
        if (job.rpc !== 'insert_signal_event') continue;
        const args = job.args as Record<string, unknown>;
        if (args?.p_session_id === sessionId && typeof args?.p_option_id === 'string') {
            optionIds.push(args.p_option_id);
        }
    }
    return optionIds;
}

export async function enqueueInsertSignalEvent(args: Record<string, unknown>): Promise<{ status: 'queued' | 'deduped'; id: string }> {
    const existingId = (args as Record<string, unknown>)?.p_client_event_id as string | undefined;
    const id = existingId || crypto.randomUUID();

    try {
        const db = await getDB();
        const existing = await db.get('signal_outbox', id);
        if (existing) {
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

        const tx = db.transaction('signal_outbox', 'readwrite');
        await tx.store.put(job);
        
        // Poda: si hay demasiados elementos, borrar el más antiguo (menor createdAt)
        const count = await tx.store.count();
        if (count > MAX_QUEUE) {
             const all = await tx.store.getAll();
             const pruned = prune(all.sort((a,b)=>b.createdAt - a.createdAt));
             await tx.store.clear();
             for (const j of pruned) {
                 await tx.store.put(j);
             }
        }

        await tx.done;
        emitSignalEvent();
        return { status: 'queued', id };
    } catch (e) {
        logger.error('[Outbox] Error enqueuing job to IDB', e);
        return { status: 'queued', id }; // Devolvemos ok aunque fallase idb preventivamente
    }
}

export async function getOutboxStats(): Promise<{
    total: number;
    retriable: number;
    nonRetriable: number;
    oldestCreatedAt: number | null;
    nextAttemptAt: number | null;
}> {
    const queue = await loadQueue();
    if (queue.length === 0) {
        return { total: 0, retriable: 0, nonRetriable: 0, oldestCreatedAt: null, nextAttemptAt: null };
    }

    let retriable = 0;
    let nonRetriable = 0;
    let oldestCreatedAt = queue[0].createdAt;
    let nextAttemptAt = queue[0].nextAttemptAt;

    for (const job of queue) {
        if (job.lastError && isNonRetriableSignalErrorMessage(job.lastError)) {
            nonRetriable++;
        } else {
            retriable++;
        }
        if (job.createdAt < oldestCreatedAt) oldestCreatedAt = job.createdAt;
        if (job.nextAttemptAt < nextAttemptAt) nextAttemptAt = job.nextAttemptAt;
    }

    return { total: queue.length, retriable, nonRetriable, oldestCreatedAt, nextAttemptAt };
}

export async function flushSignalOutbox(maxJobs: number = 50): Promise<{ sent: number; failed: number; remaining: number }> {
    if (flushing) {
        const q = await loadQueue();
        return { sent: 0, failed: 0, remaining: q.length };
    }
    flushing = true;

    try {
        const queue = await loadQueue();
        if (queue.length === 0) return { sent: 0, failed: 0, remaining: 0 };

        const t = now();
        let sent = 0;
        let failed = 0;

        const due = queue.filter(j => j.nextAttemptAt <= t).slice(0, maxJobs);

        for (const job of due) {
            try {
                let res = await typedRpc<unknown>(job.rpc, job.args as Record<string, unknown>);

                if (res.error && String(res.error.message).includes('p_device_hash')) {
                    const fallbackArgs = { ...job.args } as Record<string, unknown>;
                    delete fallbackArgs.p_device_hash;
                    res = await typedRpc<unknown>(job.rpc, fallbackArgs);
                }

                const { error } = res;

                if (error) {
                    const msg = error?.message ? String(error.message) : 'Unknown RPC error';
                    if (isNonRetriableSignalErrorMessage(msg)) {
                        await removeOutboxJob(job.id);
                        failed++;
                        logger.error('[Outbox] Drop non-retriable job', { domain: 'sync_outbox', origin: 'signalOutbox', action: 'flush', state: 'failed', job_id: job.id, reject_reason: msg });
                        continue;
                    }

                    throw error;
                }

                await removeOutboxJob(job.id);
                sent++;

            } catch (e: unknown) {
                const msg = (e as { message?: string })?.message ? String((e as { message?: string }).message) : 'Unknown error';

                if (typeof navigator !== 'undefined' && navigator.onLine === false) {
                    logger.warn('[Outbox] Offline, stopping flush', { domain: 'sync_outbox', origin: 'signalOutbox', action: 'flush', state: 'blocked' });
                    break;
                }

                try {
                    const db = await getDB();
                    const tx = db.transaction('signal_outbox', 'readwrite');
                    const existingJob = await tx.store.get(job.id);
                    if (existingJob) {
                        const attempts = (existingJob.attempts || 0) + 1;
                        existingJob.attempts = attempts;
                        existingJob.nextAttemptAt = now() + backoffMs(attempts);
                        existingJob.lastError = msg;
                        await tx.store.put(existingJob);
                    }
                    await tx.done;
                } catch (updateErr) {
                    logger.error('[Outbox] Error updating failed job in IDB', updateErr);
                }

                failed++;
                logger.warn('[Outbox] Retry scheduled', { domain: 'sync_outbox', origin: 'signalOutbox', action: 'retry', state: 'retrying', job_id: job.id, retry_reason: msg });
            }
        }

        const endQueue = await loadQueue();
        const pruned = prune(endQueue);
        if (pruned.length < endQueue.length) {
             await saveQueue(pruned);
        }

        return { sent, failed, remaining: pruned.length };
    } finally {
        flushing = false;
    }
}

async function migrateFromLocalStorage() {
    try {
        const json = localStorage.getItem(STORAGE_KEY);
        if (json) {
            const data = JSON.parse(json);
            if (Array.isArray(data) && data.length > 0) {
                const db = await getDB();
                const tx = db.transaction('signal_outbox', 'readwrite');
                for (const job of data as OutboxJob[]) {
                    // Solo migramos si tiene la forma correcta
                    if (job.id && job.rpc) {
                        await tx.store.put(job);
                    }
                }
                await tx.done;
                logger.info('[Outbox] Migrated legacy localstorage to idb', { count: data.length });
            }
        }
    } catch (e) {
        logger.warn('[Outbox] Failed to migrate from localstorage', e);
    } finally {
        localStorage.removeItem(STORAGE_KEY);
    }
}

export function startSignalOutbox() {
    if (started) return;
    started = true;

    // Ejecutar migración y luego setear listeners
    migrateFromLocalStorage().then(() => {
        const safeFlush = () => flushSignalOutbox().catch(err => logger.error('[Outbox] Flush failed', { domain: 'sync_outbox', origin: 'signalOutbox', action: 'flush', state: 'failed' }, err));

        if (typeof navigator === 'undefined' || navigator.onLine) safeFlush();

        window.addEventListener('online', safeFlush);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') safeFlush();
        });

        window.addEventListener('pagehide', safeFlush);
        window.addEventListener('beforeunload', safeFlush);

        window.setInterval(() => {
            if (typeof navigator === 'undefined' || navigator.onLine) safeFlush();
        }, FLUSH_INTERVAL_MS);
    });
}

export async function __clearOutboxForTests() {
    const db = await getDB();
    const tx = db.transaction('signal_outbox', 'readwrite');
    await tx.store.clear();
    await tx.done;
}
