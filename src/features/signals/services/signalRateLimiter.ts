/**
 * Client-side rate limiter for signal persistence (DEBT-006).
 *
 * Protects `insert_signal_event` from client-side bursts (repeated clicks,
 * automated scripts, accidental double-submits) by enforcing:
 *   1. A minimum cooldown between consecutive submits per module.
 *   2. A sliding-window cap of submits per minute per module.
 *
 * This is a *first line of defense*. Backend throttling (edge / RPC policies)
 * remains the authoritative gate — this layer just prevents wasting network
 * round-trips and reduces load.
 */

type ModuleKey = string;

interface WindowState {
    timestamps: number[];
    lastAt: number;
}

const MIN_INTERVAL_MS = 250;         // 4 signals/second hard ceiling per module
const WINDOW_MS = 60_000;            // 1 minute sliding window
const MAX_PER_WINDOW_DEFAULT = 60;   // 60 signals/min per module (very generous)
const MAX_PER_WINDOW_PER_MODULE: Record<string, number> = {
    // Heavier modules get smaller caps. Depth and News use multi-response flows
    // so allow more; Versus is one-click so stricter.
    versus: 40,
    progressive: 40,
    depth: 100,
    news: 100,
    pulse: 40
};

const state = new Map<ModuleKey, WindowState>();

export class SignalRateLimitError extends Error {
    readonly code = 'RATE_LIMITED';
    readonly retryAfterMs: number;
    constructor(retryAfterMs: number, module: string) {
        super(`RATE_LIMITED: module=${module} retry_after=${retryAfterMs}ms`);
        this.name = 'SignalRateLimitError';
        this.retryAfterMs = retryAfterMs;
    }
}

function pruneWindow(ws: WindowState, now: number): void {
    const cutoff = now - WINDOW_MS;
    // Remove old timestamps without allocating a new array when possible.
    while (ws.timestamps.length > 0 && ws.timestamps[0] < cutoff) {
        ws.timestamps.shift();
    }
}

/**
 * Check whether a signal submit is allowed for `moduleType` right now.
 * Throws `SignalRateLimitError` if the caller should back off.
 *
 * Successful calls record the attempt in the sliding window.
 */
export function checkSignalRateLimit(moduleType: string): void {
    const key = moduleType || 'unknown';
    const now = Date.now();
    const ws = state.get(key) ?? { timestamps: [], lastAt: 0 };

    // 1. Enforce minimum interval (burst protection).
    const sinceLast = now - ws.lastAt;
    if (sinceLast < MIN_INTERVAL_MS) {
        throw new SignalRateLimitError(MIN_INTERVAL_MS - sinceLast, key);
    }

    // 2. Enforce sliding window cap.
    pruneWindow(ws, now);
    const cap = MAX_PER_WINDOW_PER_MODULE[key] ?? MAX_PER_WINDOW_DEFAULT;
    if (ws.timestamps.length >= cap) {
        const oldest = ws.timestamps[0];
        const retryAfterMs = WINDOW_MS - (now - oldest);
        throw new SignalRateLimitError(Math.max(retryAfterMs, MIN_INTERVAL_MS), key);
    }

    ws.timestamps.push(now);
    ws.lastAt = now;
    state.set(key, ws);
}

/** Test-only: clear all counters. */
export function _resetSignalRateLimiter(): void {
    state.clear();
}
