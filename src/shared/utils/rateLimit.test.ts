import { describe, it, expect, beforeEach, vi } from 'vitest';
import { rateLimit } from './rateLimit';

describe('rateLimit', () => {
    beforeEach(() => {
        // Limpiamos localStorage entre tests para no contaminar.
        localStorage.clear();
    });

    describe('hasSent', () => {
        it('returns false when key does not exist', () => {
            expect(rateLimit.hasSent('any-key')).toBe(false);
        });

        it('returns true when non-daily key has any value', () => {
            localStorage.setItem('signal:abc', 'true');
            expect(rateLimit.hasSent('signal:abc')).toBe(true);
        });

        it('returns true for daily key when value matches today', () => {
            const today = new Date().toISOString().split('T')[0];
            localStorage.setItem('signal:daily:vote', today);
            expect(rateLimit.hasSent('signal:daily:vote')).toBe(true);
        });

        it('returns false for daily key when value is from a previous day', () => {
            const yesterday = '2024-01-01';
            localStorage.setItem('signal:daily:vote', yesterday);
            expect(rateLimit.hasSent('signal:daily:vote')).toBe(false);
        });
    });

    describe('markSent', () => {
        it('sets value to "true" for non-daily key', () => {
            rateLimit.markSent('signal:once');
            expect(localStorage.getItem('signal:once')).toBe('true');
        });

        it('sets value to today ISO date for daily key', () => {
            // Congelamos el reloj para hacer el test determinista.
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2026-04-28T12:00:00Z'));

            rateLimit.markSent('signal:daily:vote');
            expect(localStorage.getItem('signal:daily:vote')).toBe('2026-04-28');

            vi.useRealTimers();
        });
    });

    describe('roundtrip — markSent + hasSent', () => {
        it('non-daily: hasSent returns true after markSent', () => {
            expect(rateLimit.hasSent('signal:roundtrip')).toBe(false);
            rateLimit.markSent('signal:roundtrip');
            expect(rateLimit.hasSent('signal:roundtrip')).toBe(true);
        });

        it('daily: hasSent returns true after markSent within same day', () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2026-04-28T08:00:00Z'));
            rateLimit.markSent('signal:daily:test');
            // Avanzamos el reloj 6 horas — sigue siendo el mismo día.
            vi.setSystemTime(new Date('2026-04-28T14:00:00Z'));
            expect(rateLimit.hasSent('signal:daily:test')).toBe(true);
            vi.useRealTimers();
        });

        it('daily: hasSent returns false the next day', () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2026-04-28T08:00:00Z'));
            rateLimit.markSent('signal:daily:test');
            // Avanzamos al día siguiente.
            vi.setSystemTime(new Date('2026-04-29T08:00:00Z'));
            expect(rateLimit.hasSent('signal:daily:test')).toBe(false);
            vi.useRealTimers();
        });
    });
});
