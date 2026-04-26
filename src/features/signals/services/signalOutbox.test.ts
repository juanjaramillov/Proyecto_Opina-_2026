import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import 'fake-indexeddb/auto';

// Mock del cliente Supabase
vi.mock('../../../supabase/client', () => ({
    supabase: {
        rpc: vi.fn(async () => ({ error: null })),
    },
}));

// Logger queda silenciado
vi.mock('../../../lib/logger', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

import {
    backoffMs,
    enqueueInsertSignalEvent,
    flushSignalOutbox,
    getOutboxStats,
    getQueuedVotesForSession,
    isNonRetriableSignalErrorMessage,
    removeOutboxJob,
    __clearOutboxForTests,
} from './signalOutbox';
import { supabase } from '../../../supabase/client';

type MockRpc = ReturnType<typeof vi.fn>;

function mockRpc(): MockRpc {
    return supabase.rpc as unknown as MockRpc;
}

describe('signalOutbox', () => {
    beforeEach(async () => {
        // Vaciamos la DB utilizando nuestro test helper para evitar bloqueos
        await __clearOutboxForTests();

        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(new Date('2026-04-21T10:00:00Z'));
        mockRpc().mockReset();
        mockRpc().mockImplementation(async () => ({ error: null }));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('isNonRetriableSignalErrorMessage', () => {
        it('reconoce errores terminales del backend', () => {
            expect(isNonRetriableSignalErrorMessage('RATE_LIMITED')).toBe(true);
            expect(isNonRetriableSignalErrorMessage('SIGNAL_LIMIT_REACHED')).toBe(true);
            expect(isNonRetriableSignalErrorMessage('PROFILE_MISSING')).toBe(true);
            expect(isNonRetriableSignalErrorMessage('COOLDOWN_ACTIVE')).toBe(true);
            expect(isNonRetriableSignalErrorMessage('invalid signal payload')).toBe(true);
        });

        it('no marca errores genéricos como no-reintentables', () => {
            expect(isNonRetriableSignalErrorMessage('Network error')).toBe(false);
            expect(isNonRetriableSignalErrorMessage('Timeout')).toBe(false);
            expect(isNonRetriableSignalErrorMessage('Internal Server Error')).toBe(false);
        });
    });

    describe('backoffMs', () => {
        it('arranca en ~3s y escala exponencialmente', () => {
            const a0 = backoffMs(0);
            expect(a0).toBeGreaterThanOrEqual(3000);
            expect(a0).toBeLessThan(3000 + 750);

            const a3 = backoffMs(3);
            expect(a3).toBeGreaterThanOrEqual(24_000);
            expect(a3).toBeLessThan(24_000 + 5000);
        });

        it('tope máximo de 1 hora (+ jitter)', () => {
            const huge = backoffMs(100);
            expect(huge).toBeGreaterThanOrEqual(60 * 60 * 1000);
            expect(huge).toBeLessThan(60 * 60 * 1000 + 5000);
        });

        it('aplica jitter (dos llamadas consecutivas no son idénticas)', () => {
            const samples = new Set<number>();
            for (let i = 0; i < 20; i++) samples.add(backoffMs(5));
            expect(samples.size).toBeGreaterThan(1);
        });
    });

    describe('enqueueInsertSignalEvent', () => {
        it('dedupe por p_client_event_id: segundo enqueue devuelve deduped', async () => {
            const first = await enqueueInsertSignalEvent({ p_client_event_id: 'abc-123', p_option_id: 'o1' });
            const second = await enqueueInsertSignalEvent({ p_client_event_id: 'abc-123', p_option_id: 'o1' });

            expect(first.status).toBe('queued');
            expect(second.status).toBe('deduped');
            expect(first.id).toBe('abc-123');
            expect(second.id).toBe('abc-123');

            const stats = await getOutboxStats();
            expect(stats.total).toBe(1);
        });

        it('genera UUID si no se pasa p_client_event_id', async () => {
            const r = await enqueueInsertSignalEvent({ p_option_id: 'o1' });
            expect(r.status).toBe('queued');
            expect(r.id).toMatch(/[0-9a-f-]+/i);
            const stats = await getOutboxStats();
            expect(stats.total).toBe(1);
        });
    });

    describe('getQueuedVotesForSession', () => {
        it('filtra por sessionId y devuelve option ids en orden', async () => {
            await enqueueInsertSignalEvent({ p_client_event_id: '1', p_session_id: 'S1', p_option_id: 'o1' });
            await enqueueInsertSignalEvent({ p_client_event_id: '2', p_session_id: 'S2', p_option_id: 'o2' });
            await enqueueInsertSignalEvent({ p_client_event_id: '3', p_session_id: 'S1', p_option_id: 'o3' });

            const votes = await getQueuedVotesForSession('S1');
            expect(votes).toHaveLength(2);
            expect(votes).toContain('o1');
            expect(votes).toContain('o3');
        });
    });

    describe('removeOutboxJob', () => {
        it('elimina el job y el resto queda intacto', async () => {
            await enqueueInsertSignalEvent({ p_client_event_id: 'a', p_option_id: 'o1' });
            await enqueueInsertSignalEvent({ p_client_event_id: 'b', p_option_id: 'o2' });
            await removeOutboxJob('a');

            const stats = await getOutboxStats();
            expect(stats.total).toBe(1);
        });
    });

    describe('flushSignalOutbox', () => {
        it('envía los jobs exitosamente y vacía el queue', async () => {
            await enqueueInsertSignalEvent({ p_client_event_id: 'x', p_option_id: 'o1' });
            await enqueueInsertSignalEvent({ p_client_event_id: 'y', p_option_id: 'o2' });

            const res = await flushSignalOutbox();
            expect(res.sent).toBe(2);
            expect(res.failed).toBe(0);
            expect(res.remaining).toBe(0);

            const stats = await getOutboxStats();
            expect(stats.total).toBe(0);
        });

        it('dropea el job cuando el backend devuelve error no-reintentable', async () => {
            mockRpc().mockImplementation(async () => ({ error: { message: 'RATE_LIMITED' } }));
            await enqueueInsertSignalEvent({ p_client_event_id: 'z', p_option_id: 'o1' });

            const res = await flushSignalOutbox();
            expect(res.sent).toBe(0);
            expect(res.failed).toBe(1);
            expect(res.remaining).toBe(0);
        });

        it('reprograma el retry con backoff cuando el error es transitorio', async () => {
            mockRpc().mockImplementation(async () => {
                throw new Error('Network timeout');
            });
            await enqueueInsertSignalEvent({ p_client_event_id: 'w', p_option_id: 'o1' });

            const res = await flushSignalOutbox();
            expect(res.sent).toBe(0);
            expect(res.failed).toBe(1);

            const stats = await getOutboxStats();
            expect(stats.total).toBe(1);
            expect(stats.nextAttemptAt).toBeGreaterThan(Date.now());
        });

        it('no procesa jobs cuyo nextAttemptAt aún no venció', async () => {
            mockRpc().mockImplementation(async () => { throw new Error('Network'); });
            await enqueueInsertSignalEvent({ p_client_event_id: 'future', p_option_id: 'o1' });
            await flushSignalOutbox();

            mockRpc().mockClear();
            mockRpc().mockImplementation(async () => ({ error: null }));
            const res = await flushSignalOutbox();
            expect(mockRpc()).not.toHaveBeenCalled();
            expect(res.sent).toBe(0);
            expect(res.remaining).toBe(1);
        });
    });

    describe('getOutboxStats', () => {
        it('reporta ceros cuando el queue está vacío', async () => {
            const stats = await getOutboxStats();
            expect(stats).toEqual({
                total: 0,
                retriable: 0,
                nonRetriable: 0,
                oldestCreatedAt: null,
                nextAttemptAt: null,
            });
        });
    });
});
