import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    checkSignalRateLimit,
    SignalRateLimitError,
    _resetSignalRateLimiter
} from './signalRateLimiter';

describe('signalRateLimiter', () => {
    beforeEach(() => {
        _resetSignalRateLimiter();
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-04-21T10:00:00Z'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('allows the first submit for a fresh module', () => {
        expect(() => checkSignalRateLimit('versus')).not.toThrow();
    });

    it('blocks a burst within the minimum interval', () => {
        checkSignalRateLimit('versus');
        expect(() => checkSignalRateLimit('versus')).toThrow(SignalRateLimitError);
    });

    it('allows a second submit once the minimum interval elapses', () => {
        checkSignalRateLimit('versus');
        vi.advanceTimersByTime(260);
        expect(() => checkSignalRateLimit('versus')).not.toThrow();
    });

    it('isolates counters per module', () => {
        checkSignalRateLimit('versus');
        // Different module, should have its own bucket.
        expect(() => checkSignalRateLimit('depth')).not.toThrow();
    });

    it('enforces the sliding window cap for versus (40/min)', () => {
        // 40 submits spaced 260ms apart should all succeed.
        for (let i = 0; i < 40; i++) {
            expect(() => checkSignalRateLimit('versus')).not.toThrow();
            vi.advanceTimersByTime(260);
        }
        // 41st within the same window should be rejected.
        expect(() => checkSignalRateLimit('versus')).toThrow(SignalRateLimitError);
    });

    it('recovers after the sliding window rolls forward', () => {
        for (let i = 0; i < 40; i++) {
            checkSignalRateLimit('versus');
            vi.advanceTimersByTime(260);
        }
        // Jump past the 60s window and we should be allowed again.
        vi.advanceTimersByTime(61_000);
        expect(() => checkSignalRateLimit('versus')).not.toThrow();
    });

    it('surfaces retryAfterMs on the error for UX handling', () => {
        checkSignalRateLimit('versus');
        try {
            checkSignalRateLimit('versus');
            throw new Error('expected rate limit throw');
        } catch (e) {
            expect(e).toBeInstanceOf(SignalRateLimitError);
            const err = e as SignalRateLimitError;
            expect(err.code).toBe('RATE_LIMITED');
            expect(err.retryAfterMs).toBeGreaterThan(0);
            expect(err.retryAfterMs).toBeLessThanOrEqual(250);
        }
    });
});
